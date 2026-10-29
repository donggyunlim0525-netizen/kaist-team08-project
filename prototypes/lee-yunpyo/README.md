# 원치 않는 성분 거르기 — 프로토타입 (이윤표)

스펙: [docs/specs/lee-yunpyo-ingredient-filter.md](../../docs/specs/lee-yunpyo-ingredient-filter.md)

## 여는 법
`index.html`을 브라우저로 연다. 설치할 것 없음.

## 파일
| 파일 | 역할 |
|---|---|
| `index.html` | 화면 (모바일 우선) |
| `filter.js` | 판정 로직 (원재료 항목 단위 매칭, 예외 단어) |
| `data/dictionary.js` | 약사 동의어 사전. 오판은 여기만 고친다 |
| `data/demo-products.js` | 데모 데이터. **전부 가상 제품** |
| `scripts/fetch_c002.py` | 식품안전나라 C002 실제 데이터 → `data/products.js` (키는 `.env`) |
| `checks.test.js` | 스펙 9장 확인 3개 자동 점검: `node checks.test.js` |

`data/products.js`가 있으면 화면은 데모 대신 그 파일을 읽는다.
