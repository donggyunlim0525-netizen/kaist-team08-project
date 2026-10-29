// spec 9장의 손 확인 3개를 그대로 옮긴 자동 점검. 실행: node checks.test.js
const fs = require("fs"), vm = require("vm");
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname + "/data/dictionary.js", "utf8"), ctx);
vm.runInContext(fs.readFileSync(__dirname + "/data/demo-products.js", "utf8"), ctx);
const { classify } = require("./filter.js");
const D = ctx.window.DICTIONARY, P = ctx.window.DEMO_PRODUCTS;
let fail = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };
const names = arr => arr.map(x => (x.product || x).name);

let r = classify(P, D, ["caffeine"]);
ok(names(r.excluded).includes("데모 블랙 커피"), "1a 커피 들어간 제품은 빠진다");
ok(names(r.kept).includes("데모 디카페인 라떼"), "1b 디카페인커피만 있는 제품은 남는다");
ok(r.excluded.every(e => e.reasons[0].words.length > 0), "1c 빠진 제품마다 걸린 단어가 있다");

r = classify(P, D, ["hfcs"]);
ok(names(r.excluded).includes("데모 복숭아 아이스티"), "2 '고과당 옥수수 시럽'만 있는 제품도 액상과당으로 빠진다");

r = classify(P, D, ["hfcs","caffeine","sweetener","polyol"]);
ok(!names(r.kept).some(n => n.includes("미입력")), "3a 원재료 없는 제품은 남은 목록에 없다");
ok(r.noInfo.length === 2, "3b 원재료 정보 없음 영역에 2개");
r = classify(P, D, []);
ok(r.excluded.length === 0 && r.kept.length + r.noInfo.length === P.length, "3c 칩을 다 끄면 제외 0개");
process.exit(fail ? 1 : 0);
