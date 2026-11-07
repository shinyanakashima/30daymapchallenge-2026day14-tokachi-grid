"""Tag each analysis tile with the municipality at its centre.

Uses the GSI reverse geocoder (https://mreversegeocoder.gsi.go.jp/).
Run after fit_grid.py.
"""

import json
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TILES = ROOT / "web" / "data" / "tiles.geojson"
URL = "https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat={lat}&lon={lon}"

# JIS municipality codes in Tokachi subprefecture
NAMES = {
    "01207": ("Obihiro", "帯広市"), "01631": ("Otofuke", "音更町"),
    "01632": ("Shihoro", "士幌町"), "01633": ("Kamishihoro", "上士幌町"),
    "01634": ("Shikaoi", "鹿追町"), "01635": ("Shintoku", "新得町"),
    "01636": ("Shimizu", "清水町"), "01637": ("Memuro", "芽室町"),
    "01638": ("Nakasatsunai", "中札内村"), "01639": ("Sarabetsu", "更別村"),
    "01641": ("Taiki", "大樹町"), "01642": ("Hiroo", "広尾町"),
    "01643": ("Makubetsu", "幕別町"), "01644": ("Ikeda", "池田町"),
    "01645": ("Toyokoro", "豊頃町"), "01646": ("Honbetsu", "本別町"),
    "01647": ("Ashoro", "足寄町"), "01648": ("Rikubetsu", "陸別町"),
    "01649": ("Urahoro", "浦幌町"),
}

fc = json.loads(TILES.read_text())
for f in fc["features"]:
    ring = f["geometry"]["coordinates"][0][:4]
    lon = sum(p[0] for p in ring) / 4
    lat = sum(p[1] for p in ring) / 4
    with urllib.request.urlopen(URL.format(lat=lat, lon=lon), timeout=30) as r:
        code = json.load(r)["results"]["muniCd"]
    en, ja = NAMES.get(code, ("", ""))
    f["properties"].update({"muni_en": en, "muni_ja": ja})
    print(f["properties"]["id"], code, en)
    time.sleep(0.3)
TILES.write_text(json.dumps(fc, ensure_ascii=False, separators=(",", ":")))
