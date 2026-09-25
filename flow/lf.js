#!/usr/bin/env node
/**
 * lf.js — giao thức LynkFlow cho chuỗi /intake → /p → /s → /c → /ship.
 *
 * Card trên board LÀ ticket. Trạng thái = cột card đang đứng. Không còn file
 * frontmatter nào nữa. Ổ đĩa chỉ giữ ảnh chụp và log gate.
 *
 * Cách dùng:
 *   node lf.js board   <project>                     → boardId (tạo nếu chưa có)
 *   node lf.js new     <project> --title T [--desc-file F] [--column C]
 *                      [--labels a,b] [--points N] [--priority HIGH] [--due D]
 *   node lf.js get     <ref> [--json]                → tóm tắt + lưu description ra .md
 *   node lf.js section <ref> <key> --file F          → ghi ĐÈ đúng khối <key>
 *   node lf.js move    <ref> <column>
 *   node lf.js label   <ref> a,b                     → GỘP nhãn, không thay
 *   node lf.js tick    <ref> <gate>                  → Spec|Build|Verify|Ship
 *   node lf.js work    <ref> --file F          → đọc markdown lồng, đánh số, THAY cây việc
 *   node lf.js work    <ref> --list            → in cây theo thứ tự số
 *   node lf.js work    <ref> --done N          → tick mục số N (vd 1.2), tìm theo SỐ
 *   node lf.js work    <ref> --defer "T"       → nối mục "+ T" cho /c, không ai xóa
 *   node lf.js comment <ref> (--file F | --text T)
 *   node lf.js assign  <ref> <email>
 *   node lf.js points  <ref> <n>
 *   node lf.js ls      [project] [--column C]
 *   node lf.js member  <project> <email>
 *
 * <ref> nhận: link đầy đủ (…/boards/<id>?card=<id>), "LF-42", hoặc uuid.
 *
 * QUY TẮC BẤT BIẾN — vi phạm là mất dữ liệu của người khác:
 *   1. Chữ người dùng tự viết nằm NGOÀI mọi marker và không lệnh nào được đụng
 *      vào. Khối của lệnh luôn nối vào CUỐI, không bao giờ chèn lên đầu — vì
 *      board hiển thị description dạng chữ thô, clamp 2 dòng (CardItem.tsx:107),
 *      nên marker đặt ở đầu sẽ hiện nguyên văn trên mặt card.
 *   2. Nhãn luôn GỘP. PATCH /cards kèm labels xóa sạch rồi chèn lại
 *      (api/index.ts:474-492), nên "thay" đồng nghĩa với xóa nhãn của đồng đội.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CFG_PATH = path.join(HERE, "board.json");
const ENV_PATH = path.join(HERE, ".env");

const GATES = ["Spec", "Build", "Verify", "Ship"];
const SECTIONS = ["meta", "spec", "build", "verify", "release"];
const FIB = [1, 2, 3, 5, 8, 13, 21];

/** Ném ra để thoát sạch. Node 24 trên Windows bắn "Assertion failed:
 *  UV_HANDLE_CLOSING" nếu gọi process.exit() khi socket keep-alive của fetch
 *  còn mở — nên phải unwind rồi để vòng lặp sự kiện tự kết thúc. */
class FlowExit extends Error {}

function die(msg) {
  console.error(msg);
  process.exitCode = 1;
  throw new FlowExit(msg);
}

// ---------- cấu hình ----------

function loadEnvFile() {
  if (!fs.existsSync(ENV_PATH)) return;
  for (const line of fs.readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    if (!process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

let _cfg = null;
function cfg() {
  if (_cfg) return _cfg;
  loadEnvFile();
  if (!fs.existsSync(CFG_PATH)) die(`Thiếu ${CFG_PATH}`);
  _cfg = JSON.parse(fs.readFileSync(CFG_PATH, "utf8"));
  _cfg.boards ??= {};
  if (!_cfg.apiUrl) die("board.json thiếu apiUrl");
  if (!_cfg.owner) die("board.json thiếu owner (email profile)");
  const key = process.env.MANAGETASK_API_KEY || process.env.LYNKFLOW_API_KEY;
  if (!key) die(`Thiếu MANAGETASK_API_KEY — đặt trong ${ENV_PATH}`);
  _cfg.key = key;
  return _cfg;
}

function saveCfg() {
  const copy = { ...(_cfg ?? {}) };
  delete copy.key;
  fs.writeFileSync(CFG_PATH, JSON.stringify(copy, null, 2) + "\n");
}

// ---------- HTTP ----------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Trần là 60 request/phút/key (auth.ts:4). Giữ dưới 55 để không bao giờ chạm 429
// trong lúc chuyển hàng loạt — chờ chủ động rẻ hơn là bị từ chối rồi thử lại.
const RATE_MAX = 55;
const recent = [];
async function throttle() {
  const now = Date.now();
  while (recent.length && now - recent[0] > 60_000) recent.shift();
  if (recent.length >= RATE_MAX) {
    await sleep(60_000 - (now - recent[0]) + 250);
    return throttle();
  }
  recent.push(Date.now());
}

async function api(method, p, body, attempt = 0) {
  const c = cfg();
  await throttle();
  const res = await fetch(`${c.apiUrl}${p}`, {
    method,
    headers: { "Content-Type": "application/json", "x-api-key": c.key },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  // 60 request/phút/key (auth.ts:4). Migration hàng loạt sẽ chạm trần.
  if (res.status === 429 && attempt < 5) {
    await sleep(3000 * (attempt + 1));
    return api(method, p, body, attempt + 1);
  }
  if (!res.ok) die(`API ${method} ${p} → ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

// ---------- tham chiếu card ----------

/** Link đầy đủ, "LF-42", hoặc uuid → { cardId } hoặc { seq } */
function parseRef(ref) {
  if (!ref) die("Thiếu tham chiếu card (link, LF-N hoặc uuid)");
  const fromLink = ref.match(/[?&]card=([0-9a-fA-F-]{36})/);
  if (fromLink) return { cardId: fromLink[1] };
  const lf = ref.match(/^(?:[Ll][Ff]-)?(\d+)$/);
  if (lf) return { seq: lf[1] };
  if (/^[0-9a-fA-F-]{36}$/.test(ref)) return { cardId: ref };
  die(`Không đọc được tham chiếu "${ref}" — cần link, LF-N hoặc uuid`);
}

async function fetchCard(ref) {
  const r = parseRef(ref);
  const p = r.seq ? `/cards/seq/${r.seq}` : `/cards/${r.cardId}`;
  const out = await api("GET", p);
  if (!out || !out.card) die(`Không tìm thấy card cho "${ref}"`);
  return out;
}

function labelNames(card) {
  return (card.card_labels ?? []).map((x) => x.labels && x.labels.name).filter(Boolean);
}

function cardLink(card) {
  const base = cfg().appBaseUrl;
  if (!base) return "(đặt appBaseUrl trong board.json để in link)";
  return `${base.replace(/\/+$/, "")}/boards/${card.board_id}?card=${card.id}`;
}

// ---------- board ----------

async function ensureBoard(project) {
  const c = cfg();
  if (c.boards[project]) return c.boards[project];
  const { boards } = await api("GET", "/boards");
  const found = (boards ?? []).find((b) => b.name.toLowerCase() === project.toLowerCase());
  let id;
  if (found) {
    id = found.id;
  } else {
    // workspaceId gom mọi board của flow vào một chỗ. Thiếu nó thì board mới
    // rơi ra ngoài workspace và phải kéo vào bằng tay.
    const out = await api("POST", "/boards", {
      name: project,
      owner: c.owner,
      workspaceId: c.workspaceId ?? null,
    });
    id = out.board.id;
    console.error(`Đã tạo board "${project}" kèm 5 cột mặc định.`);
  }
  c.boards[project] = id;
  saveCfg();
  return id;
}

async function columnId(boardId, name) {
  const { columns } = await api("GET", `/boards/${boardId}/columns`);
  const f = (columns ?? []).find((x) => x.name.toLowerCase() === String(name).toLowerCase());
  if (!f) die(`Board không có cột "${name}" — đang có: ${columns.map((x) => x.name).join(", ")}`);
  return f.id;
}

// ---------- khối description ----------

function blockRe(key) {
  return new RegExp(`\\n*<!-- flow:${key} -->[\\s\\S]*?<!-- /flow:${key} -->`);
}

/**
 * Thay đúng khối <key>, giữ nguyên mọi thứ khác. Khối chưa có thì NỐI VÀO CUỐI —
 * không bao giờ chèn lên đầu, để board preview vẫn hiện lời người dùng viết.
 */
function putBlock(desc, key, md) {
  // Nội dung có thể trích dẫn chính cú pháp marker — CONVENTIONS §1 làm đúng thế.
  // Để nguyên thì marker đóng lọt vào giữa khối và khối vỡ; vô hiệu hóa trước khi ghi.
  //
  // CHỈ chạm đúng năm khối section. Marker khác — nhất là `flow:src:<thư mục>` mà
  // migrate.mjs dùng làm khóa đối chiếu — phải đi qua nguyên vẹn. Bản đầu vô hiệu
  // hóa mọi `<!-- flow:` và đã tạo ra 33 card trùng trước khi bị chặn.
  const secRe = new RegExp(`<!--(\\s*/?\\s*flow:(?:${SECTIONS.join("|")})\\s*)-->`, "g");
  const safe = md.trim().replace(secRe, "<!‑-$1-->");
  const body = `\n\n<!-- flow:${key} -->\n${safe}\n<!-- /flow:${key} -->`;
  const re = blockRe(key);
  if (re.test(desc ?? "")) return (desc ?? "").replace(re, body);
  return (desc ?? "").replace(/\s+$/, "") + body;
}

/** Bỏ mọi khối của lệnh; phần còn lại là chữ người dùng viết. */
function humanPart(desc) {
  let out = desc ?? "";
  for (const k of SECTIONS) out = out.replace(blockRe(k), "");
  return out.trim();
}

// ---------- nhãn ----------

async function mergeLabels(card, add) {
  const want = [...new Set([...labelNames(card), ...add])];
  for (const name of want) {
    await api("POST", `/boards/${card.board_id}/labels`, { name });
  }
  const out = await api("PATCH", `/cards/${card.id}`, { labels: want });
  if (out && out.skippedLabels && out.skippedLabels.length) {
    console.error(`Nhãn không gắn được: ${out.skippedLabels.join(", ")}`);
  }
  return want;
}

// ---------- checklist ----------

async function ensureGates(card) {
  const have = new Set((card.checklist_items ?? []).map((i) => i.text));
  for (const g of GATES) {
    if (!have.has(g)) {
      await api("POST", `/cards/${card.id}/checklist`, { text: g, status: "todo", kind: "gate" });
    }
  }
}

// ---------- cây việc ----------
//
// Ba loại mục cùng sống trong checklist của một card, phân biệt bằng KÝ TỰ ĐẦU:
//
//   Spec | Build | Verify | Ship     gate      — ensureGates ghi, không ai xóa
//   1 · 1.1 · 1.2 · 2 …              workitem  — /intake và /p ghi, `work --file` thay cả khối
//   + Sửa so sánh hạn ở CardItem     để sau    — /c ghi, không lệnh nào xóa
//
// Một biểu thức `^\d` tách sạch ba loại, nên `get` (lọc gate theo tên) và `tick`
// (tìm gate theo tên) chạy đúng như cũ mà không phải sửa gì. Nguyên tắc giống
// putBlock: lệnh chỉ xóa đúng thứ nó tự ghi ra.

/**
 * Markdown danh sách lồng → phẳng kèm độ sâu. Tab tính bằng 2 dấu cách; dòng
 * không phải mục danh sách bị bỏ qua, nên chú thích xen giữa không làm lệch cây.
 */
function parseWorkTree(md) {
  const out = [];
  for (const raw of String(md ?? "").split(/\r?\n/)) {
    const line = raw.replace(/\t/g, "  ");
    const m = /^(\s*)[-*]\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const title = m[2].trim();
    // Gạch đầu dòng rỗng sinh mục "2 ", API cắt khoảng trắng thành "2", và
    // Mục rỗng thì không có gì để hiển thị mà vẫn chiếm một hàng trong DB.
    if (!title) continue;
    out.push({ depth: Math.floor(m[1].length / 2), title });
  }
  return out;
}

/**
 * Dựng cây từ `parent_id` và gán đường dẫn hiển thị ("1.2") LÚC ĐỌC.
 *
 * Con số không còn được lưu — nó là hàm của vị trí trong cây. Nhờ vậy giao diện
 * dòng lệnh không đổi: `--done 1.2` vẫn chạy y như trước.
 *
 * Chặn vòng cha–con: `parent_id` tự tham chiếu nên Postgres không cấm được
 * A→B→A, và đi xuống mà không nhớ đã thăm ai là đệ quy vô tận.
 */
function workTree(items) {
  const all = [...(items ?? [])].sort((a, b) => a.order - b.order);
  const ids = new Set(all.map((i) => i.id));
  const kids = new Map();
  for (const i of all) {
    const key = i.parent_id && ids.has(i.parent_id) ? i.parent_id : null;
    if (!kids.has(key)) kids.set(key, []);
    kids.get(key).push(i);
  }
  const seen = new Set();
  const build = (parent, depth, prefix) =>
    (kids.get(parent) ?? [])
      .filter((i) => !seen.has(i.id))
      .map((i, idx) => {
        seen.add(i.id);
        const path = prefix ? `${prefix}.${idx + 1}` : String(idx + 1);
        return { item: i, depth, path, children: build(i.id, depth + 1, path) };
      });
  const roots = build(null, 0, "");
  for (const i of all) {
    if (!seen.has(i.id)) {
      seen.add(i.id);
      roots.push({ item: i, depth: 0, path: String(roots.length + 1), children: [] });
    }
  }
  return roots;
}

/** Cây → danh sách phẳng theo đúng thứ tự hiển thị. */
function flatTree(nodes) {
  const out = [];
  const walk = (list) => list.forEach((n) => (out.push(n), walk(n.children)));
  walk(nodes);
  return out;
}

/**
 * Cây mới thừa hưởng dấu tick của cây cũ, đối chiếu theo TIÊU ĐỀ — đánh số lại
 * là đúng việc `--file` làm nên số không dùng đối chiếu được.
 *
 * ĐẾM chứ không đánh dấu có/không: hai mục cùng tiêu đề là chuyện bình thường
 * trong một cây ("wc -l tất cả" ở hai nhánh). Nếu chỉ hỏi "tiêu đề này từng
 * xong chưa" thì một mục đã xong sẽ làm MỌI mục trùng tên hiện là xong — kể cả
 * mục vừa thêm mà chưa ai động tới. Khôi phục nhiều nhất đúng bằng số đã xong.
 */
/**
 * Những dòng mà `work --file` ĐƯỢC PHÉP xóa — và chỉ những dòng đó.
 *
 * Lọc theo cột `kind`, không đoán theo ký tự đầu như bản LF-95. Dòng thiếu
 * `kind` (API cũ chưa trả cột, hoặc dữ liệu trước migration) rơi về `user`,
 * tức là KHÔNG xóa. Hướng hỏng là bỏ sót, không phải xóa nhầm.
 */
function pickStale(items) {
  return (items ?? []).filter((i) => (i.kind ?? "user") === "work");
}

/**
 * Những dòng KHÔNG thuộc lệnh mà đang nằm dưới một dòng thuộc lệnh — phải gỡ
 * ra trước khi xóa, nếu không khóa ngoại `on delete cascade` sẽ cuốn chúng đi.
 *
 * Cascade không biết tới `kind`. Người dùng bấm "+" trên một mục việc là tạo
 * một dòng `user` nằm dưới nó; bản trước xóa gốc rồi để cascade lo, và ghi chú
 * của họ biến mất không một lời. Đã dựng lại được trên dữ liệu thật trước khi sửa.
 */
function pickRescue(items) {
  const doomed = new Set(pickStale(items).map((i) => i.id));
  return (items ?? []).filter(
    (i) => i.parent_id && doomed.has(i.parent_id) && !doomed.has(i.id),
  );
}

/**
 * Trang thai that cua mot muc. `status` la nguon su that (migration 00012);
 * mot ban ghi tu API cu chua co cot do thi suy ra tu `is_done`.
 * Cung luat voi `statusOf()` ben `src/lib/checklistTree.ts`.
 */
const STATUSES = ["todo", "doing", "done"];
function statusOf(i) {
  return STATUSES.includes(i?.status) ? i.status : i?.is_done ? "done" : "todo";
}
const MARK = { todo: " ", doing: "~", done: "x" };

/**
 * Giu lai tien do khi `/p` ghi de cay viec giua chung.
 *
 * Giu ca ba muc, khong chi giu boolean: `/s` danh dau mot muc dang lam, roi
 * `/p` chay lai va muc do quay ve `todo` thi dau vet viec do bien mat. Dem
 * theo BOI SO tieu de — hai nhanh trung ten la chuyen binh thuong, va mot
 * `Map<title, bool>` tung lam moi muc trung ten deu thanh xong.
 */
function restoreStatus(oldItems, newTitles) {
  const left = new Map();
  for (const i of oldItems ?? []) {
    const st = statusOf(i);
    if (st === "todo") continue;
    const bucket = left.get(i.text) ?? [];
    bucket.push(st);
    left.set(i.text, bucket);
  }
  return (newTitles ?? []).map((t) => {
    const bucket = left.get(t);
    if (!bucket || !bucket.length) return "todo";
    // `done` truoc `doing`: mat mot dau "dang lam" nhe hon mat mot dau "xong".
    const i = bucket.indexOf("done");
    return bucket.splice(i >= 0 ? i : 0, 1)[0];
  });
}

// ---------- tiện ích CLI ----------

const argv = process.argv.slice(2);
const cmd = argv[0];

function opt(name, dflt) {
  const i = argv.indexOf(`--${name}`);
  if (i >= 0 && argv[i + 1] !== undefined && !argv[i + 1].startsWith("--")) return argv[i + 1];
  return dflt;
}
const has = (name) => argv.includes(`--${name}`);

function readArg(fileOpt, textOpt) {
  const f = opt(fileOpt);
  if (f) return fs.readFileSync(f, "utf8");
  return opt(textOpt, null);
}

function tmpFile(name) {
  const dir = path.join(HERE, "tmp");
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, name);
}

function need(v, msg) {
  if (!v) die(msg);
  return v;
}

// ---------- lệnh ----------

async function main() {
  switch (cmd) {
    case "board": {
      console.log(await ensureBoard(need(argv[1], "Thiếu <project>")));
      break;
    }

    case "member": {
      const project = need(argv[1], "Cách dùng: member <project> <email>");
      const email = need(argv[2], "Cách dùng: member <project> <email>");
      const boardId = await ensureBoard(project);
      await api("POST", `/boards/${boardId}/members`, { email });
      console.log(`Đã thêm ${email} vào board ${project}.`);
      break;
    }

    case "new": {
      const project = need(argv[1], "Thiếu <project>");
      const title = need(opt("title"), "--title là bắt buộc");
      // Board không cắt title (CardItem.tsx:95-103) — title dài kéo card cao cả chục dòng.
      if (title.length > 80) die(`Title dài ${title.length} ký tự — giữ ≤80, chi tiết để trong mô tả.`);
      const boardId = await ensureBoard(project);
      const out = await api("POST", "/cards", {
        boardId,
        columnName: opt("column", "Backlog"),
        title,
        description: readArg("desc-file", "desc") ?? undefined,
        priority: opt("priority"),
        storyPoints: opt("points") ? Number(opt("points")) : undefined,
        dueDate: opt("due"),
        // Mặc định giao cho chính người chạy lệnh (owner trong board.json).
        // Phiếu mới mà không có ai cầm thì không ai thấy nó trong "Task của tôi",
        // và cả trang báo cáo đếm nó vào ô "chưa giao". `--assignee ""` để trống.
        assignee: (opt("assignee") ?? cfg().owner) || undefined,
      });
      const full = await fetchCard(out.card.id);
      const labels = opt("labels");
      if (labels) await mergeLabels(full.card, labels.split(",").map((x) => x.trim()).filter(Boolean));
      await ensureGates(full.card);
      console.log(`LF-${out.card.seq} — ${out.card.title}`);
      console.log(cardLink(out.card));
      break;
    }

    case "get": {
      const { card, parent, children } = await fetchCard(argv[1]);
      if (has("json")) {
        console.log(JSON.stringify({ card, parent, children }, null, 2));
        break;
      }
      const { columns } = await api("GET", `/boards/${card.board_id}/columns`);
      const col = (columns.find((c) => c.id === card.column_id) || {}).name || "?";
      const f = tmpFile(`LF-${card.seq}.md`);
      fs.writeFileSync(f, card.description ?? "");
      const human = tmpFile(`LF-${card.seq}.request.md`);
      fs.writeFileSync(human, humanPart(card.description));
      console.log(`LF-${card.seq} — ${card.title}`);
      console.log(`Cột: ${col} | Priority: ${card.priority ?? "-"} | Points: ${card.story_points ?? "-"}`);
      console.log(`Nhãn: ${labelNames(card).join(", ") || "-"}`);
      const gates = (card.checklist_items ?? [])
        .filter((i) => GATES.includes(i.text))
        .sort((a, b) => GATES.indexOf(a.text) - GATES.indexOf(b.text))
        .map((i) => `${MARK[statusOf(i)]} ${i.text}`);
      if (gates.length) console.log(`Gate: ${gates.join(" | ")}`);
      console.log(`Link: ${cardLink(card)}`);
      console.log(`Toàn bộ mô tả  → ${f}`);
      console.log(`Chỉ phần yêu cầu → ${human}`);
      break;
    }

    case "section": {
      const key = need(argv[2], `Thiếu <key> — một trong: ${SECTIONS.join(", ")}`);
      if (!SECTIONS.includes(key)) die(`key phải là một trong: ${SECTIONS.join(", ")}`);
      const md = need(readArg("file", "text"), "Cần --file hoặc --text");
      const { card } = await fetchCard(argv[1]);
      const next = putBlock(card.description ?? "", key, md);
      if (next === (card.description ?? "")) {
        console.log(`LF-${card.seq}: khối "${key}" không đổi.`);
        break;
      }
      await api("PATCH", `/cards/${card.id}`, { description: next });
      console.log(`LF-${card.seq}: đã ghi khối "${key}" (${md.trim().length} ký tự).`);
      break;
    }

    case "move": {
      const colName = need(argv[2], "Thiếu <column>");
      const { card } = await fetchCard(argv[1]);
      const cid = await columnId(card.board_id, colName);
      if (cid === card.column_id) {
        console.log(`LF-${card.seq}: đã ở "${colName}".`);
        break;
      }
      await api("PATCH", `/cards/${card.id}`, { columnId: cid });
      console.log(`LF-${card.seq} → ${colName}`);
      break;
    }

    case "label": {
      const names = String(argv[2] ?? "").split(",").map((x) => x.trim()).filter(Boolean);
      if (!names.length) die("Thiếu danh sách nhãn (vd: bug,high)");
      const { card } = await fetchCard(argv[1]);
      const all = await mergeLabels(card, names);
      console.log(`LF-${card.seq}: nhãn = ${all.join(", ")}`);
      break;
    }

    case "tick": {
      const gate = need(argv[2], `Thiếu <gate> — một trong: ${GATES.join(", ")}`);
      if (!GATES.includes(gate)) die(`gate phải là một trong: ${GATES.join(", ")}`);
      const { card } = await fetchCard(argv[1]);
      await ensureGates(card);
      const fresh = await fetchCard(card.id);
      const item = (fresh.card.checklist_items ?? []).find((i) => i.text === gate);
      if (!item) die(`Không tạo được mục checklist "${gate}".`);
      await api("PATCH", `/checklist/${item.id}`, { status: "done" });
      console.log(`LF-${card.seq}: gate ${gate} xong`);
      break;
    }

    case "work": {
      // Cờ mâu thuẫn thì DỪNG, đừng âm thầm chọn một cái. `--done 1.2 --list`
      // trước đây in cây rồi thoát 0 mà không tick gì — người gọi tưởng xong.
      const modes = ["file", "text", "defer", "done", "start"].filter(has);
      if (modes.length > 1) die(`Chỉ được một trong --${modes.join(" / --")}.`);
      if (has("list") && modes.length) die(`--list chỉ để đọc, bỏ --${modes[0]} đi.`);

      const { card } = await fetchCard(argv[1]);
      const rows = card.checklist_items ?? [];
      const work = pickStale(rows);
      const defer = rows.filter((i) => (i.kind ?? "user") === "defer");

      // --list: dựng cây từ parent_id, đường dẫn sinh lúc đọc.
      if (has("list") || !modes.length) {
        const flat = flatTree(workTree(work));
        if (!flat.length && !defer.length) console.log(`LF-${card.seq}: cây việc còn trống.`);
        for (const n of flat) {
          const pad = "  ".repeat(n.depth);
          console.log(`  ${pad}[${MARK[statusOf(n.item)]}] ${n.path} ${n.item.text}`);
        }
        for (const i of defer) console.log(`  [${MARK[statusOf(i)]}] + ${i.text}`);
        break;
      }

      // --done N: tìm theo ĐƯỜNG DẪN trong cây. Hai nhánh có thể trùng tiêu đề,
      // không bao giờ trùng đường dẫn — đây là lý do đường dẫn tồn tại.
      // --done N / --start N: tìm theo ĐƯỜNG DẪN trong cây. Hai nhánh có thể
      // trùng tiêu đề, không bao giờ trùng đường dẫn.
      if (has("done") || has("start")) {
        const flag = has("done") ? "done" : "start";
        const status = flag === "done" ? "done" : "doing";
        const want = need(opt(flag), `Thiếu số mục, vd --${flag} 1.2`);
        const hit = flatTree(workTree(work)).find((n) => n.path === want);
        if (!hit) die(`Không có mục số "${want}" trên LF-${card.seq}.`);
        await api("PATCH", `/checklist/${hit.item.id}`, { status });
        const verb = status === "done" ? "xong" : "đang làm";
        console.log(`LF-${card.seq}: ${verb} ${hit.path} ${hit.item.text}`);
        break;
      }

      // --defer: /c ghi lỗi ngoài phạm vi vào đây thay vì mở card mới.
      if (has("defer")) {
        const t = need(opt("defer"), "Thiếu nội dung, vd --defer \"Sửa X\"");
        await api("POST", `/cards/${card.id}/checklist`, {
          text: t,
          status: "todo",
          kind: "defer",
        });
        console.log(`LF-${card.seq}: ghi để sau — ${t}`);
        break;
      }

      // --file: thay TOÀN BỘ mục kind='work'. Gate, mục để-sau và mục người
      // dùng tự gõ không bao giờ bị đụng — cùng nguyên tắc với putBlock, lệnh
      // chỉ xóa đúng thứ nó tự ghi ra.
      const md = need(readArg("file", "text"), "Cần --file hoặc --text");
      const nodes = parseWorkTree(md);
      if (!nodes.length) die("Không đọc được mục nào — cần danh sách markdown (- hoặc *).");

      // /p chạy lại giữa chừng không được xóa tiến độ /s đã tick — xem restoreStatus.
      const keepStatus = restoreStatus(work, nodes.map((n) => n.title));
      const doneCount = keepStatus.filter((st) => st !== "todo").length;

      // GHI TRƯỚC, XÓA SAU — hỏng giữa chừng để lại mục TRÙNG (nhìn thấy được,
      // chạy lại là sạch) thay vì một lỗ hổng im lặng. Mất dữ liệu nặng hơn thừa.
      //
      // Cha phải tồn tại trước con, nên POST tuần tự theo thứ tự đã đánh số và
      // nhớ id vừa tạo ở từng cấp.
      const parentAt = [];
      for (let k = 0; k < nodes.length; k++) {
        const depth = Math.min(nodes[k].depth, parentAt.length);
        const out = await api("POST", `/cards/${card.id}/checklist`, {
          text: nodes[k].title,
          status: keepStatus[k],
          kind: "work",
          parentId: depth > 0 ? parentAt[depth - 1] : null,
        });
        parentAt.length = depth;
        parentAt.push(out.item.id);
      }
      // Cascade KHÔNG biết tới `kind` — nó cuốn theo MỌI đời con. Người dùng
      // bấm nút "+" trên một mục việc là tạo ra một mục `user` nằm dưới nó, và
      // bản trước xóa gốc rồi để cascade lo phần còn lại: ghi chú của họ biến
      // mất không một lời. Đã dựng lại được trên dữ liệu thật.
      //
      // Nên: GỠ mọi đời con không phải `work` ra khỏi nhánh trước, rồi xóa
      // từng mục `work` một. Xóa từng cái cũng gỡ luôn chuyện mục nằm trong
      // vòng cha–con không bao giờ bị xóa và nhân đôi mỗi lần chạy.
      const rescued = pickRescue(rows);
      for (const i of rescued) {
        await api("PATCH", `/checklist/${i.id}`, { parentId: null });
      }
      // Xóa từ LÁ LÊN. Xóa cha trước thì cascade cuốn luôn con `work`, và vòng
      // lặp gặp lại chúng sẽ ăn 404 — đã thấy thật. `workTree` kéo cả mục trong
      // vòng cha–con lên gốc nên mọi mục xuất hiện đúng một lần trong danh sách.
      for (const n of flatTree(workTree(work)).reverse()) {
        await api("DELETE", `/checklist/${n.item.id}`);
      }
      if (rescued.length) {
        console.log(`  gỡ ${rescued.length} mục không thuộc lệnh ra khỏi nhánh trước khi xóa.`);
      }
      console.log(
        `LF-${card.seq}: ghi ${nodes.length} mục (xóa ${work.length}, giữ ${rows.length - work.length}).`,
      );
      if (doneCount) console.log(`  giữ lại ${doneCount} mục đã tick.`);
      break;
    }

    case "comment": {
      const content = need(readArg("file", "text"), "Cần --file hoặc --text");
      const { card } = await fetchCard(argv[1]);
      await api("POST", `/cards/${card.id}/comments`, { content, author: cfg().owner });
      console.log(`LF-${card.seq}: đã thêm bình luận.`);
      break;
    }

    case "assign": {
      const email = need(argv[2], "Thiếu <email>");
      const { card } = await fetchCard(argv[1]);
      await api("PATCH", `/cards/${card.id}`, { assignee: email });
      console.log(`LF-${card.seq}: giao cho ${email}`);
      break;
    }

    case "points": {
      const n = Number(argv[2]);
      if (!FIB.includes(n)) die(`points phải là Fibonacci ${FIB.join("/")}`);
      const { card } = await fetchCard(argv[1]);
      await api("PATCH", `/cards/${card.id}`, { storyPoints: n });
      console.log(`LF-${card.seq}: ${n} points`);
      break;
    }

    case "ls": {
      const project = argv[1] && !argv[1].startsWith("--") ? argv[1] : null;
      const targets = project ? [project] : Object.keys(cfg().boards);
      if (!targets.length) die("board.json chưa có board nào — chạy `lf.js board <project>` trước.");
      const filter = opt("column");
      for (const p of targets) {
        const boardId = await ensureBoard(p);
        const [{ cards }, { columns }] = await Promise.all([
          api("GET", `/boards/${boardId}/cards`),
          api("GET", `/boards/${boardId}/columns`),
        ]);
        console.log(`\n== ${p} ==`);
        for (const c of columns) {
          if (filter && c.name.toLowerCase() !== filter.toLowerCase()) continue;
          const list = cards.filter((x) => x.column_id === c.id);
          if (!list.length) continue;
          console.log(`  ${c.name} (${list.length})`);
          for (const x of list) console.log(`    LF-${x.seq}  ${x.title}`);
        }
      }
      break;
    }

    default: {
      const src = fs.readFileSync(fileURLToPath(import.meta.url), "utf8");
      console.log(src.slice(src.indexOf("/**"), src.indexOf("*/") + 2));
      process.exit(cmd ? 1 : 0);
    }
  }
}

export {
  parseRef, putBlock, humanPart, blockRe, GATES, SECTIONS, api, cfg, ensureBoard, columnId,
  parseWorkTree, restoreStatus, statusOf, pickStale, pickRescue, workTree, flatTree,
};

// Chỉ chạy khi được gọi trực tiếp, để test import được các hàm thuần.
const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main().catch((e) => {
    if (e instanceof FlowExit) return; // thông báo đã in trong die()
    console.error(String((e && e.stack) || e));
    process.exitCode = 1;
  });
}
