#!/usr/bin/env node
/**
 * migrate.mjs — chuyển các ticket REQ cũ dưới D:\Agent-Projects thành card trên board.
 *
 * Chạy MỘT LẦN, sau khi board và API key đã sẵn sàng:
 *   node C:\Users\VNT\.claude\flow\migrate.mjs --dry     # xem trước, không gọi API
 *   node C:\Users\VNT\.claude\flow\migrate.mjs           # chạy thật
 *   node ... migrate.mjs --project HR_APP                # một dự án
 *   node ... migrate.mjs --no-gates                      # bỏ checklist, nhanh hơn ~8 lần
 *
 * Idempotent: card đã có marker của thư mục nào thì bỏ qua thư mục đó, nên chạy lại
 * an toàn — kể cả khi lần trước dừng giữa chừng.
 */

import fs from "node:fs";
import path from "node:path";
import { api, ensureBoard, columnId, putBlock } from "./lf.js";

const ROOT = "D:\\Agent-Projects";
const argv = process.argv.slice(2);
const has = (f) => argv.includes(`--${f}`);
const opt = (f) => {
  const i = argv.indexOf(`--${f}`);
  return i >= 0 ? argv[i + 1] : null;
};
const DRY = has("dry");
const GATES_ON = !has("no-gates");

// status cũ → cột mới. superseded không lên board (quyết định của chủ dự án).
const COLUMN = {
  intake: "Backlog",
  spec: "Todo",
  build: "In progress",
  verify: "Review",
  done: "Done",
};
const POINTS = { S: 2, M: 5, L: 8 };
const PRIORITY = { urgent: "HIGH", high: "HIGH", normal: "MEDIUM", low: "LOW" };

/**
 * Frontmatter thật KHÔNG phải YAML sạch: giá trị mang comment đuôi, và comment
 * tràn sang cả dòng sau. Ví dụ có thật:
 *   status: done   # CLOSED WITHOUT A FIX (wontfix), owner decision 2026-09-22
 * Chỉ nhận dòng khớp `key: value` ở cột 0; dòng thụt vào là phần tràn, bỏ qua.
 */
function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return { fields: {}, raw: "" };
  const fields = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-z_]+):[ \t]*(.*)$/);
    if (!kv) continue;
    fields[kv[1]] = kv[2].replace(/\s+#.*$/, "").trim();
  }
  return { fields, raw: m[1] };
}

const body = (text) => text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").trim();
const readIf = (p) => (fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null);

function collect() {
  const only = opt("project");
  const out = [];
  for (const project of fs.readdirSync(ROOT)) {
    if (only && project !== only) continue;
    const pdir = path.join(ROOT, project);
    if (!fs.statSync(pdir).isDirectory()) continue;
    for (const folder of fs.readdirSync(pdir)) {
      if (!folder.startsWith("REQ-")) continue;
      const dir = path.join(pdir, folder);
      const req = path.join(dir, "00-request.md");
      if (!fs.existsSync(req)) {
        console.log(`  bỏ qua ${project}/${folder} — không có 00-request.md`);
        continue;
      }
      out.push({ project, folder, dir, text: fs.readFileSync(req, "utf8") });
    }
  }
  return out;
}

function buildDescription(t, fm) {
  const marker = `<!-- flow:src:${t.folder} -->`;
  // Nửa của người yêu cầu: nguyên văn 00-request.md, không khối nào chèn lên trên.
  let desc = body(t.text);
  desc = putBlock(desc, "meta", [
    `Chuyển từ \`${t.dir}\` ngày ${new Date().toISOString().slice(0, 10)}.`,
    `Ảnh và log gate vẫn ở thư mục đó.`,
    "",
    "```",
    fm.raw,
    "```",
    marker,
  ].join("\n"));

  const spec = readIf(path.join(t.dir, "01-spec.md"));
  if (spec) desc = putBlock(desc, "spec", body(spec));
  const build = readIf(path.join(t.dir, "02-build-log.md"));
  if (build) desc = putBlock(desc, "build", body(build));
  const verify = readIf(path.join(t.dir, "03-verify", "report.md"));
  if (verify) desc = putBlock(desc, "verify", body(verify));
  return { desc, marker, gates: { Spec: !!spec, Build: !!build, Verify: !!verify } };
}

async function main() {
  const tickets = collect();
  const skipped = [];
  const todo = [];
  for (const t of tickets) {
    const { fields } = parseFrontmatter(t.text);
    const status = (fields.status || "").trim();
    if (status === "superseded") {
      skipped.push(`${t.project}/${t.folder} — superseded`);
      continue;
    }
    const column = COLUMN[status];
    if (!column) {
      skipped.push(`${t.project}/${t.folder} — status lạ: "${status}"`);
      continue;
    }
    todo.push({ ...t, fields, status, column });
  }

  console.log(`${tickets.length} thư mục · ${todo.length} sẽ lên board · ${skipped.length} bỏ qua`);
  for (const s of skipped) console.log(`  - ${s}`);

  const byProject = {};
  for (const t of todo) (byProject[t.project] ??= []).push(t);
  for (const [p, list] of Object.entries(byProject)) {
    const counts = {};
    for (const t of list) counts[t.column] = (counts[t.column] ?? 0) + 1;
    console.log(`  ${p}: ${list.length} — ${Object.entries(counts).map(([c, n]) => `${c} ${n}`).join(", ")}`);
  }

  if (DRY) {
    console.log("\n--dry: không gọi API. Bỏ cờ này để chạy thật.");
    return;
  }

  let made = 0;
  let already = 0;
  for (const [project, list] of Object.entries(byProject)) {
    const boardId = await ensureBoard(project);
    const { cards } = await api("GET", `/boards/${boardId}/cards`);
    const existing = new Set();
    for (const c of cards) {
      const m = (c.description || "").match(/<!-- flow:src:([^>]+?) -->/);
      if (m) existing.add(m[1].trim());
    }

    // Nhãn tạo một lần cho cả board, không phải mỗi card.
    const names = new Set();
    for (const t of list) {
      if (t.fields.type) names.add(t.fields.type);
      if (t.fields.priority) names.add(t.fields.priority);
    }
    for (const n of names) await api("POST", `/boards/${boardId}/labels`, { name: n });

    for (const t of list) {
      if (existing.has(t.folder)) {
        already++;
        console.log(`  = ${t.project}/${t.folder} — đã có card`);
        continue;
      }
      const { desc, gates } = buildDescription(t, parseFrontmatter(t.text));
      let title = (t.fields.title || t.folder).replace(/\s+/g, " ").trim();
      if (title.length > 80) title = title.slice(0, 77) + "...";

      const labels = [t.fields.type, t.fields.priority].filter(Boolean);
      const out = await api("POST", "/cards", {
        boardId,
        columnName: t.column,
        title,
        description: desc,
        priority: PRIORITY[t.fields.priority] ?? "MEDIUM",
        storyPoints: POINTS[t.fields.size] ?? undefined,
        dueDate: t.fields.deadline && t.fields.deadline !== "null" ? t.fields.deadline : undefined,
        labels,
      });
      const card = out.card;

      if (GATES_ON) {
        for (const g of ["Spec", "Build", "Verify", "Ship"]) {
          const done = g === "Ship" ? t.status === "done" : gates[g];
          await api("POST", `/cards/${card.id}/checklist`, { text: g, isDone: !!done });
        }
      }
      made++;
      console.log(`  + LF-${card.seq}  ${t.column.padEnd(12)} ${t.project}/${t.folder}`);
    }
  }
  console.log(`\nXong: ${made} card mới, ${already} đã có sẵn, ${skipped.length} bỏ qua.`);
}

main().catch((e) => {
  console.error(String(e?.stack || e));
  process.exit(1);
});
