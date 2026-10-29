// 판정 로직 (spec 4장). 브라우저와 Node 테스트가 같이 쓴다.
(function (root) {
  // 원재료를 쉼표·괄호로 나눈 "항목" 단위로 본다. 항목 안의 공백은 지운다.
  // 예외 단어가 든 항목(예: 디카페인커피추출액)은 그 그룹에서 통째로 세지 않는다.
  function items(raw) {
    return raw.split(/[,()\[\]·]/).map(t => t.replace(/\s+/g, "")).filter(Boolean);
  }
  function hits(raw, group) {
    const found = new Set();
    for (const it of items(raw)) {
      if (group.except.some(ex => it.includes(ex))) continue;
      for (const w of group.match) if (it.includes(w)) found.add(w);
    }
    return [...found];
  }
  function classify(products, dictionary, selectedIds) {
    const groups = dictionary.filter(g => selectedIds.includes(g.id));
    const kept = [], excluded = [], noInfo = [];
    for (const p of products) {
      if (!p.raw || !p.raw.trim()) { noInfo.push(p); continue; }
      const reasons = [];
      for (const g of groups) {
        const words = hits(p.raw, g);
        if (words.length) reasons.push({ group: g.label, words });
      }
      if (reasons.length) excluded.push({ product: p, reasons }); else kept.push(p);
    }
    return { kept, excluded, noInfo };
  }
  const api = { classify, hits };
  if (typeof module !== "undefined") module.exports = api; else root.Filter = api;
})(this);
