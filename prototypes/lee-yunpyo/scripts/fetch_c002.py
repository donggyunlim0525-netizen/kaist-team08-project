"""식품안전나라 C002(품목제조보고)에서 음료류만 받아 data/products.js 로 저장한다.

실행 (노트북에서 한 번):
  1) prototypes/lee-yunpyo/.env 파일에 한 줄:  FOODSAFETY_API_KEY=발급받은키
  2) python scripts/fetch_c002.py --max 20000
.env 는 .gitignore 에 있다. 키는 이 스크립트 밖으로 나가지 않는다.
"""
import argparse, json, os, sys, time, urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
BEVERAGE_TYPES = {"탄산음료", "혼합음료", "과·채음료", "과·채주스", "액상차", "커피",
                  "두유류", "발효음료류", "기타음료", "탄산수", "가공두유", "원액두유"}

def load_key():
    env = HERE / ".env"
    if env.exists():
        for line in env.read_text(encoding="utf-8").splitlines():
            if line.startswith("FOODSAFETY_API_KEY="):
                return line.split("=", 1)[1].strip()
    return os.environ.get("FOODSAFETY_API_KEY")

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--max", type=int, default=20000)
    a = ap.parse_args()
    key = load_key()
    if not key:
        sys.exit("FOODSAFETY_API_KEY 가 없습니다. .env 를 만드세요.")
    out, step = [], 1000
    for start in range(1, a.max + 1, step):
        url = f"http://openapi.foodsafetykorea.go.kr/api/{key}/C002/json/{start}/{start + step - 1}"
        try:
            with urllib.request.urlopen(url, timeout=30) as r:
                rows = json.load(r).get("C002", {}).get("row", [])
        except Exception as e:  # API 실패: 받은 데까지만 저장하고 멈춘다
            print(f"요청 실패({start}~): {type(e).__name__}. 받은 데까지 저장합니다.")
            break
        if not rows:
            break
        for x in rows:
            if (x.get("PRDLST_DCNM") or "").strip() in BEVERAGE_TYPES:
                out.append({"name": x.get("PRDLST_NM", ""), "maker": x.get("BSSH_NM", ""),
                            "type": x.get("PRDLST_DCNM", ""), "raw": x.get("RAWMTRL_NM", "") or ""})
        print(f"{start + len(rows) - 1}건 확인, 음료 {len(out)}건")
        time.sleep(0.3)
    dest = HERE / "data" / "products.js"
    dest.write_text("// 식품안전나라 C002 스냅샷 (자동 생성)\nwindow.PRODUCTS = "
                    + json.dumps(out, ensure_ascii=False) + ";\n", encoding="utf-8")
    print(f"저장: {dest} ({len(out)}건)")

if __name__ == "__main__":
    main()
