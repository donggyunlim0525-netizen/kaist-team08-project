// 성분 비교 계산. 화면과 분리한 순수 함수 모음 (AI 모델을 쓰지 않는다).
// 모든 수치는 "1회 제공량 기준"으로 비교한다.
// 데이터의 칼로리·당류는 100ml 값이므로 제공량(ml)을 곱해 환산한다 (per100: true).
(function (root) {
  var MAX_COMPARE = 3;

  // best: 'min' = 가장 낮은 값에 표시, 'max' = 가장 높은 값에 표시
  var ROWS = [
    { key: "kcal",     label: "칼로리", unit: "kcal", best: "min", per100: true },
    { key: "sugar",    label: "당류",   unit: "g",    best: "min", per100: true },
    { key: "protein",  label: "단백질", unit: "g",    best: "max", per100: false },
    { key: "caffeine", label: "카페인", unit: "mg",   best: "min", per100: false }
  ];

  function isNum(v) { return typeof v === "number" && isFinite(v); }
  function round1(n) { return Math.round(n * 10) / 10; }

  // 한 제품의 한 행 값을 1회 제공량 기준으로 돌려준다. 값이 없으면 null.
  function valueOf(product, row) {
    var v = product[row.key];
    if (!isNum(v)) return null;
    if (row.per100) {
      if (!isNum(product.servingMl)) return null;
      return round1(v * product.servingMl / 100);
    }
    return v;
  }

  // 비교에 담기. 이미 있으면 그대로, 4번째면 거절한다.
  function addToCompare(selected, id) {
    if (selected.indexOf(id) !== -1) return { ok: true, selected: selected.slice() };
    if (selected.length >= MAX_COMPARE) {
      return { ok: false, selected: selected.slice(), reason: "최대 " + MAX_COMPARE + "개까지 비교할 수 있어요" };
    }
    return { ok: true, selected: selected.concat([id]) };
  }

  function removeFromCompare(selected, id) {
    return selected.filter(function (x) { return x !== id; });
  }

  // 한 행을 비교한다. 값이 없는(null) 칸은 계산에서 뺀다.
  function compareRow(products, row) {
    var cells = products.map(function (p) {
      var v = valueOf(p, row);
      return { id: p.id, value: v, missing: v === null, mark: null };
    });
    var nums = cells.filter(function (c) { return !c.missing; }).map(function (c) { return c.value; });
    if (nums.length < 2) return { row: row, cells: cells, status: "insufficient", summary: null };

    var min = Math.min.apply(null, nums);
    var max = Math.max.apply(null, nums);

    if (min === max) {
      cells.forEach(function (c) { if (!c.missing) c.mark = "same"; });
      return { row: row, cells: cells, status: "same", summary: row.label + ": 모두 같아요 (" + min + row.unit + ")" };
    }

    var target = row.best === "min" ? min : max;
    var markName = row.best === "min" ? "lowest" : "highest";
    var names = [];
    cells.forEach(function (c, i) {
      if (!c.missing && c.value === target) { c.mark = markName; names.push(products[i].name); }
    });
    var word = row.best === "min" ? "가장 낮아요" : "가장 높아요";
    var other = row.best === "min" ? "가장 높은" : "가장 낮은";
    var summary = row.label + ": " + names.join(", ") + " 쪽이 " + word +
      " (" + other + " 제품과 " + round1(max - min) + row.unit + " 차이)";
    return { row: row, cells: cells, status: "differs", summary: summary };
  }

  function compareProducts(products) {
    return ROWS.map(function (row) { return compareRow(products, row); });
  }

  var api = {
    MAX_COMPARE: MAX_COMPARE,
    ROWS: ROWS,
    valueOf: valueOf,
    addToCompare: addToCompare,
    removeFromCompare: removeFromCompare,
    compareRow: compareRow,
    compareProducts: compareProducts
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Compare = api;
})(typeof window !== "undefined" ? window : this);
