// Kiểm thử các hàm thuần của lf.js. Chạy: node lf.test.mjs
// Trọng tâm là putBlock — nó là chỗ duy nhất có thể xóa chữ người dùng viết.

import {
  parseRef, putBlock, humanPart, SECTIONS, GATES,
  parseWorkTree, restoreStatus, statusOf, pickStale, pickRescue, workTree, flatTree,
} from "./lf.js";

let pass = 0;
const fails = [];

function eq(name, got, want) {
  if (got === want) {
    pass++;
  } else {
    fails.push(`${name}\n    got:  ${JSON.stringify(got)}\n    want: ${JSON.stringify(want)}`);
  }
}
function ok(name, cond) {
  cond ? pass++ : fails.push(name);
}

// ---------- parseRef ----------

const LINK = "https://lynkflow.vercel.app/boards/323fe580-e26b-43c4-8673-25255c1285c7?card=11111111-2222-3333-4444-555555555555";
eq("parseRef: link → cardId", parseRef(LINK).cardId, "11111111-2222-3333-4444-555555555555");
eq("parseRef: LF-42", parseRef("LF-42").seq, "42");
eq("parseRef: lf-42 thường", parseRef("lf-42").seq, "42");
eq("parseRef: số trần", parseRef("42").seq, "42");
eq("parseRef: uuid trần", parseRef("11111111-2222-3333-4444-555555555555").cardId, "11111111-2222-3333-4444-555555555555");
ok("parseRef: link có tham số khác trước card=", parseRef(LINK + "&x=1").cardId.length === 36);
eq(
  "parseRef: link dạng ?a=1&card=...",
  parseRef("https://x/boards/abc?a=1&card=11111111-2222-3333-4444-555555555555").cardId,
  "11111111-2222-3333-4444-555555555555",
);

// ---------- putBlock: KHÔNG được đụng chữ người dùng ----------

const HUMAN = `Lọc ngày bị sai khi ca qua đêm.

## Request (verbatim)
> ca đêm bị tính sang hôm sau

## Open questions
1. Múi giờ nào là chuẩn?`;

const afterSpec = putBlock(HUMAN, "spec", "## Spec\nSửa ở TimeSheetService.");
ok("putBlock: giữ nguyên toàn bộ chữ người dùng", afterSpec.startsWith(HUMAN));
ok("putBlock: khối nằm SAU chữ người dùng", afterSpec.indexOf("<!-- flow:spec -->") > HUMAN.length - 1);
ok("putBlock: có marker đóng", afterSpec.includes("<!-- /flow:spec -->"));

// Nối thêm khối thứ hai — khối đầu phải còn nguyên
const afterBuild = putBlock(afterSpec, "build", "## Build log\n3 file.");
ok("putBlock: khối spec còn nguyên sau khi thêm build", afterBuild.includes("Sửa ở TimeSheetService."));
ok("putBlock: chữ người dùng vẫn còn", afterBuild.startsWith(HUMAN));
ok("putBlock: có đủ hai khối", afterBuild.includes("<!-- flow:spec -->") && afterBuild.includes("<!-- flow:build -->"));

// Ghi đè khối đã có — KHÔNG được nhân đôi
const rewritten = putBlock(afterBuild, "spec", "## Spec\nĐổi sang TimeZoneResolver.");
eq("putBlock: chỉ còn MỘT khối spec", (rewritten.match(/<!-- flow:spec -->/g) || []).length, 1);
ok("putBlock: nội dung spec cũ đã biến mất", !rewritten.includes("Sửa ở TimeSheetService."));
ok("putBlock: nội dung spec mới có mặt", rewritten.includes("Đổi sang TimeZoneResolver."));
ok("putBlock: khối build không bị ảnh hưởng", rewritten.includes("## Build log"));
ok("putBlock: chữ người dùng vẫn nguyên", rewritten.startsWith(HUMAN));

// Idempotent — chạy hai lần cùng nội dung phải ra y hệt
eq(
  "putBlock: chạy lại cùng nội dung → không đổi",
  putBlock(rewritten, "spec", "## Spec\nĐổi sang TimeZoneResolver."),
  rewritten,
);

// Mô tả rỗng
ok("putBlock: desc rỗng vẫn chạy", putBlock("", "spec", "x").includes("<!-- flow:spec -->"));
ok("putBlock: desc null vẫn chạy", putBlock(null, "spec", "x").includes("<!-- flow:spec -->"));

// Chạy hết năm khối, kiểm tra không cái nào đè cái nào
let all = HUMAN;
for (const k of SECTIONS) all = putBlock(all, k, `noi dung ${k}`);
for (const k of SECTIONS) {
  eq(`putBlock: đúng một khối "${k}" sau khi ghi cả năm`, (all.match(new RegExp(`<!-- flow:${k} -->`, "g")) || []).length, 1);
}
ok("putBlock: chữ người dùng sống sót qua cả năm khối", all.startsWith(HUMAN));

// ---------- humanPart ----------

eq("humanPart: gỡ hết khối, trả lại đúng chữ người dùng", humanPart(all), HUMAN);
eq("humanPart: mô tả không có khối nào", humanPart(HUMAN), HUMAN);
eq("humanPart: mô tả rỗng", humanPart(""), "");

// Người dùng viết markdown có dấu ngoặc nhọn — không được vỡ
const TRICKY = "Cần sửa `<input type=date>` và thẻ <br> trong mail.";
eq("humanPart: giữ nguyên HTML người dùng viết", humanPart(putBlock(TRICKY, "spec", "x")), TRICKY);

// ---------- nội dung trích dẫn chính cú pháp marker ----------

// Dựng marker bằng ghép chuỗi: một dòng mở đầu bằng "<!--" là lỗi cú pháp trong ES module.
const OPEN = "<" + "!-- flow:spec -->";
const CLOSE = "<" + "!-- /flow:spec -->";
const QUOTES_MARKER = `Khối ghi như sau:\n${OPEN}\nnội dung\n${CLOSE}`;

const guarded = putBlock(HUMAN, "spec", QUOTES_MARKER);
eq("putBlock: marker trong nội dung không tạo khối thật", guarded.split(OPEN).length - 1, 1);
eq("putBlock: marker đóng vẫn đúng một cái", guarded.split(CLOSE).length - 1, 1);
ok("putBlock: vẫn ghi đè được khối đó", putBlock(guarded, "spec", "binh thuong").includes("binh thuong"));
eq("humanPart: vẫn tách lại được chữ người dùng", humanPart(guarded), HUMAN);
ok("putBlock: nội dung trích dẫn vẫn đọc được", guarded.includes("Khối ghi như sau:"));

// Marker KHÔNG phải section (vd khóa đối chiếu của migrate.mjs) phải đi qua NGUYÊN VẸN.
// Bản rào đầu tiên vô hiệu hóa mọi "<!-- flow:" và đã tạo 33 card trùng trước khi bị chặn.
const SRC = "<" + "!-- flow:src:REQ-2026-08-24-01-positions -->";
const withSrc = putBlock("Yeu cau cua nguoi dung", "meta", `Ghi chu\n${SRC}`);
ok("putBlock: marker flow:src: KHÔNG bị vô hiệu hóa", withSrc.includes(SRC));
ok(
  "putBlock: khóa đối chiếu vẫn dò lại được",
  /<!-- flow:src:([^>]+?) -->/.exec(withSrc)?.[1] === "REQ-2026-08-24-01-positions",
);

// ---------- cây việc ----------
// Ba loại mục dùng chung một bảng checklist; nếu phân loại sai thì `work --file`
// sẽ xóa gate, xóa mục "để sau", hoặc xóa việc người dùng tự gõ. Đây là rủi ro
// cùng loại với sự cố putBlock từng sinh 33 card trùng.
//
// Từ LF-99 việc phân loại KHÔNG còn đoán theo ký tự đầu mà đọc cột `kind`.

// --- parseWorkTree: đọc markdown lồng ---
const TREE = `
- lf.js
  - compareWorkNum
  - parseWorkItem
- lf.test.mjs
`;
const nodes = parseWorkTree(TREE);
eq("parseWorkTree: đúng số mục", nodes.length, 4);
eq("parseWorkTree: cấp 0", nodes[0].depth, 0);
eq("parseWorkTree: cấp 1", nodes[1].depth, 1);
eq("parseWorkTree: bỏ dòng trống", parseWorkTree("\n\n- a\n\n").length, 1);
ok("parseWorkTree: bỏ dòng không phải mục", parseWorkTree("chú thích\n- a").length === 1);
eq("parseWorkTree: nhận dấu *", parseWorkTree("* a\n  * b")[1].depth, 1);
eq("parseWorkTree: tab = 2 dấu cách", parseWorkTree("- a\n\t- b")[1].depth, 1);
eq("parseWorkTree: gạch đầu dòng rỗng bị bỏ", parseWorkTree("- a\n-  \n- b").length, 2);

// --- statusOf: cùng luật suy ra với src/lib/checklistTree.ts ---
eq("statusOf: đọc status khi có", statusOf({ status: "doing", is_done: false }), "doing");
eq("statusOf: API cũ, is_done true", statusOf({ is_done: true }), "done");
eq("statusOf: API cũ, is_done false", statusOf({ is_done: false }), "todo");
eq("statusOf: mâu thuẫn thì status thắng", statusOf({ status: "todo", is_done: true }), "todo");
eq("statusOf: status rác bị bỏ qua", statusOf({ status: "xyz", is_done: true }), "done");

// --- restoreStatus: /p chạy lại không được xóa, cũng không được BỊA tiến độ ---
const R = (rows, titles) => restoreStatus(rows, titles).join(",");
const row = (text, status) => ({ text, status, is_done: status === "done" });

eq(
  "restoreStatus: giữ đúng mục đã xong",
  R([row("a", "done"), row("b", "done")], ["a", "b", "c"]),
  "done,done,todo",
);
eq(
  "restoreStatus: GIỮ cả mục đang làm — đây là điều boolean không làm được",
  R([row("a", "doing")], ["a", "b"]),
  "doing,todo",
);
eq(
  "restoreStatus: mục trùng tiêu đề vừa thêm KHÔNG được ăn theo",
  R([row("wc -l", "done")], ["wc -l", "wc -l"]),
  "done,todo",
);
eq(
  "restoreStatus: hai mục cùng tên cùng xong thì giữ cả hai",
  R([row("wc -l", "done"), row("wc -l", "done")], ["wc -l", "wc -l"]),
  "done,done",
);
eq(
  "restoreStatus: cùng tên, một xong một đang làm — done được phát trước",
  R([row("x", "doing"), row("x", "done")], ["x", "x"]),
  "done,doing",
);
eq("restoreStatus: chưa mục nào động tới", R([], ["a", "b"]), "todo,todo");
eq("restoreStatus: cây mới rỗng", restoreStatus([row("a", "done")], []).length, 0);
eq(
  "restoreStatus: bản ghi API cũ (chỉ is_done) vẫn khôi phục được",
  R([{ text: "a", is_done: true }], ["a"]),
  "done",
);

// --- CAM KẾT: --file xóa cái gì. Nay theo cột `kind`, không đoán theo chữ. ---
const ROWS = [
  { id: "g1", text: "Spec", kind: "gate" },
  { id: "g2", text: "Build", kind: "gate" },
  { id: "w1", text: "Dựng khung", kind: "work" },
  { id: "w2", text: "Hàm thuần", kind: "work" },
  { id: "d1", text: "Sửa sau", kind: "defer" },
  { id: "u1", text: "Ghi chú của tôi", kind: "user" },
  { id: "o1", text: "Dòng từ API cũ" },
];
const stale = pickStale(ROWS).map((i) => i.id);
eq("pickStale: chỉ lấy kind=work", stale.join(","), "w1,w2");
ok("pickStale: KHÔNG lấy gate", !stale.includes("g1") && !stale.includes("g2"));
ok("pickStale: KHÔNG lấy mục để-sau", !stale.includes("d1"));
ok("pickStale: KHÔNG lấy việc người dùng tự gõ", !stale.includes("u1"));
ok("pickStale: dòng THIẾU kind (API cũ) rơi về user, không xóa", !stale.includes("o1"));
eq("pickStale: danh sách rỗng", pickStale([]).length, 0);
eq("pickStale: undefined", pickStale(undefined).length, 0);

// --- CAM KẾT 2: cascade không được cuốn theo dòng của người khác ---
// Loi nay da XAY RA THAT: ghi chu nguoi dung nam duoi mot muc viec bi xoa sach
// khi /p chay lai, va lenh con bao "giu 5". Dung lai duoc tren du lieu that.
const MIX = [
  { id: "w1", kind: "work", parent_id: null },
  { id: "w2", kind: "work", parent_id: "w1" },
  { id: "u1", kind: "user", parent_id: "w1" },   // nguoi dung bam "+" tren w1
  { id: "d1", kind: "defer", parent_id: "w2" },
  { id: "g1", kind: "gate", parent_id: null },
  { id: "u2", kind: "user", parent_id: null },
];
const rescue = pickRescue(MIX).map((i) => i.id).sort();
eq("pickRescue: gỡ mục user và defer nằm dưới mục việc", rescue.join(","), "d1,u1");
ok("pickRescue: KHÔNG gỡ mục việc (chúng sẽ bị xóa)", !rescue.includes("w2"));
ok("pickRescue: KHÔNG động tới mục ở gốc", !rescue.includes("u2") && !rescue.includes("g1"));
eq("pickRescue: không có mục việc nào → không gỡ gì", pickRescue([{ id: "a", kind: "user" }]).length, 0);
eq("pickRescue: rỗng", pickRescue([]).length, 0);
// Bat bien: moi dong KHONG phai work ma co cha la work deu phai duoc go ra
const notWork = MIX.filter((i) => i.kind !== "work" && i.parent_id);
ok(
  "pickRescue: bất biến — mọi dòng không-phải-work có cha là work đều được gỡ",
  notWork.every((i) => rescue.includes(i.id)),
);

// --- workTree: thứ bậc từ parent_id, đường dẫn sinh lúc đọc ---
const wi = (id, order, parent_id) => ({ id, text: id, order, parent_id: parent_id ?? null });
const pathsOf = (rows) => flatTree(workTree(rows)).map((n) => n.path).join(" ");
eq("workTree: ba gốc", pathsOf([wi("a", 1), wi("b", 2), wi("c", 3)]), "1 2 3");
eq("workTree: lồng hai cấp", pathsOf([wi("a", 1), wi("b", 2, "a"), wi("c", 3, "a")]), "1 1.1 1.2");
eq("workTree: sắp theo order, không theo thứ tự mảng", pathsOf([wi("b", 9), wi("a", 1)]), "1 2");
eq("workTree: cha không tồn tại → kéo lên gốc", pathsOf([wi("a", 1), wi("x", 2, "mất")]), "1 2");
eq(
  "workTree: VÒNG cha-con không treo, không mất mục",
  flatTree(workTree([wi("a", 1, "b"), wi("b", 2, "a")])).length,
  2,
);
eq("workTree: rỗng", flatTree(workTree([])).length, 0);
eq(
  "workTree: mục thứ 11 là 1.11, không phải 1.2",
  flatTree(workTree([wi("p", 1), ...Array.from({ length: 11 }, (_, i) => wi("k" + i, i + 2, "p"))]))
    .map((n) => n.path)
    .at(-1),
  "1.11",
);

// Phiếu này KHÔNG được thêm khối mô tả hay gate nào
eq("SECTIONS không đổi", SECTIONS.join(","), "meta,spec,build,verify,release");
eq("GATES không đổi", GATES.join(","), "Spec,Build,Verify,Ship");

// ---------- kết quả ----------

console.log(`\n${pass} pass, ${fails.length} fail`);
if (fails.length) {
  for (const f of fails) console.log("  FAIL " + f);
  process.exit(1);
}
