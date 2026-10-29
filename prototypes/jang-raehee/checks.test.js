// 스펙 6장의 손 확인 4개를 그대로 옮긴 자동 점검. 실행: node checks.test.js
// (계산 로직만 확인한다. 화면 동작은 스펙 6장대로 직접 눌러서 확인한다.)
const fs = require("fs"), vm = require("vm");
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname + "/data.js", "utf8"), ctx);
const P = ctx.window.PRODUCTS;
const C = require("./compare.js");
const by = name => P.find(p => p.name === name);
let fail = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };
const row = (res, key) => res.find(x => x.row.key === key);
const cell = (res, key, name) => row(res, key).cells.find(c => c.id === by(name).id);

// 데이터 조건: 샘플 12개, null 제품 2개 이상, 모든 값이 같은 쌍 1개 이상
ok(P.length === 12, "0a 샘플 제품은 12개");
ok(P.filter(p => [p.kcal, p.sugar, p.protein, p.caffeine].includes(null)).length >= 2, "0b 값이 없는 제품이 2개 이상");

// 1 비교 계산 (모두 1회 제공량 기준)
let res = C.compareProducts([by("카카오 프로틴 라떼"), by("오트 바닐라 프로틴"), by("단백질 요거트 드링크")]);
ok(cell(res, "sugar", "카카오 프로틴 라떼").value === 10 && cell(res, "sugar", "오트 바닐라 프로틴").value === 15 && cell(res, "sugar", "단백질 요거트 드링크").value === 22.4, "1a 당류 환산 10 / 15 / 22.4g");
ok(cell(res, "sugar", "카카오 프로틴 라떼").mark === "lowest", "1b 당류는 카카오 프로틴 라떼가 가장 낮음");
ok(cell(res, "protein", "카카오 프로틴 라떼").mark === "highest", "1c 단백질 20/15/18g -> 카카오 프로틴 라떼가 가장 높음");
ok(cell(res, "caffeine", "오트 바닐라 프로틴").mark === "lowest" && cell(res, "caffeine", "단백질 요거트 드링크").mark === "lowest" && cell(res, "caffeine", "카카오 프로틴 라떼").mark === null, "1d 카페인 10/0/0mg -> 0mg 둘 다 가장 낮음 (동점 모두 표시)");
ok(row(res, "sugar").summary.includes("12.4g 차이"), "1e 당류 요약에 12.4g 차이 (22.4-10)");

// 2 정보 없음 처리
res = C.compareProducts([by("레몬 전해질 워터"), by("사과 식초 스파클링"), by("카카오 프로틴 라떼")]);
ok(cell(res, "protein", "레몬 전해질 워터").missing === true && cell(res, "protein", "레몬 전해질 워터").mark === null, "2a 단백질 null 칸은 missing, 표시 없음");
ok(cell(res, "sugar", "사과 식초 스파클링").missing === true, "2b 사과 식초의 당류는 missing");
ok(cell(res, "sugar", "레몬 전해질 워터").value === 5 && cell(res, "sugar", "레몬 전해질 워터").mark === "lowest", "2c 당류는 null을 빼고 5g vs 10g -> 레몬이 가장 낮음");
ok(cell(res, "protein", "카카오 프로틴 라떼").mark === "highest", "2d 단백질은 null을 빼고 0 vs 20 -> 카카오가 가장 높음");
ok(!row(res, "sugar").summary.includes("사과 식초"), "2e 요약에 값이 없는 제품이 나오지 않음");
let two = C.compareProducts([by("레몬 전해질 워터"), by("사과 식초 스파클링")]);
ok(row(two, "sugar").status === "insufficient" && row(two, "sugar").summary === null, "2f 비교할 값이 1개뿐이면 표시와 요약 없음");

// 3 동일 값과 3개 제한
res = C.compareProducts([by("라임 제로 스파클링"), by("보리차 제로")]);
ok(res.every(r => r.status === "same" && r.cells.every(c => c.mark === "same")), "3a 모든 값이 같으면 전 행이 동일");
let sel = [];
for (const id of [1, 2, 3]) sel = C.addToCompare(sel, id).selected;
const fourth = C.addToCompare(sel, 4);
ok(sel.length === 3, "3b 3개까지 담김");
ok(fourth.ok === false && fourth.selected.length === 3 && /3개/.test(fourth.reason), "3c 4번째는 거절되고 안내 문구가 나옴");
ok(C.removeFromCompare(sel, 2).length === 2, "3d 빼면 2개");

// 4 1회 제공량 환산: 100ml 값은 다르지만(3 vs 6) 한 병 기준으로는 같다 (15g)
res = C.compareProducts([by("석류 비타 워터"), by("오트 바닐라 프로틴")]);
ok(by("석류 비타 워터").sugar !== by("오트 바닐라 프로틴").sugar, "4a 100ml 기준 당류는 서로 다르다 (3 vs 6)");
ok(row(res, "sugar").status === "same" && cell(res, "sugar", "석류 비타 워터").value === 15, "4b 1회 제공량 기준 당류는 둘 다 15g이라 '동일'");

process.exit(fail ? 1 : 0);
