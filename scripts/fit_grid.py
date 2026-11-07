"""Fit a 546 m (300 ken) grid to present-day roads in the Tokachi plain.

Input : data/raw/osm_roads.json (Overpass API output, see fetch_osm.sh)
Output: web/data/tiles.geojson  - analysis tiles with fitted angle and share
        web/data/grid.geojson   - fitted grid lines, clipped to each tile
        web/data/roads.geojson  - road pieces flagged on / off the grid
        web/data/summary.json   - totals and parameters

Method (per tile of TILE_M x TILE_M metres):
  1. Roads are densified to points every STEP_M metres, each with a direction.
  2. Orientation: length-weighted histogram of road directions folded to
     0-90 degrees; the peak is the grid orientation.
  3. Offset and pitch: for each of the two line families, the position of
     the lines and their spacing (searched from 545.5 m = 300 ken up to
     PITCH_MAX_M) are chosen so that the length of parallel road lying within
     TOL_M of a line is maximised. A run with the spacing fixed at 545.5 m is
     also reported in summary.json.
  4. Share: a road point counts as "on the grid" when it lies within TOL_M of
     a fitted line and runs within ANGLE_TOL_DEG of that line's direction.
"""

import json
import math
import random
from pathlib import Path

import numpy as np
from pyproj import Transformer
from shapely.geometry import LineString, box, mapping
from shapely import affinity

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw" / "osm_roads.json"
OUT = ROOT / "web" / "data"

SPACING_M = 545.45  # 300 ken (1 ken = 1.818 m)
PITCH_MAX_M = 570.0
PITCH_STEP_M = 0.5
TOL_M = 15.0
ANGLE_TOL_DEG = 15.0
STEP_M = 5.0
TILE_M = 4000.0
ROAD_CLASSES = {
    "motorway", "trunk", "primary", "secondary", "tertiary", "unclassified",
    "residential", "motorway_link", "trunk_link", "primary_link",
    "secondary_link", "tertiary_link",
}
# Tiles are kept only if they look like open farmland with a road net.
MIN_DENSITY = 2.0      # km of road per km2
MAX_DENSITY = 6.5
MAX_RESIDENTIAL = 0.30  # share of road length tagged highway=residential
MIN_ROAD_KM = 20.0
# Town centres excluded regardless of the density test (lon, lat, radius m)
TOWN_CENTRES = [
    (143.196, 42.924, 4500),  # Obihiro
    (143.051, 42.912, 1800),  # Memuro
    (143.134, 42.698, 1200),  # Nakasatsunai
    (143.192, 42.639, 1200),  # Sarabetsu
    (143.160, 42.803, 1000),  # Taisho (Obihiro)
]

LON0, LAT0 = 143.12, 42.76
PROJ = f"+proj=tmerc +lat_0={LAT0} +lon_0={LON0} +k=1 +x_0=0 +y_0=0 +ellps=GRS80 +units=m"
fwd = Transformer.from_crs("EPSG:4326", PROJ, always_xy=True)
inv = Transformer.from_crs(PROJ, "EPSG:4326", always_xy=True)


def densify(xy):
    """Return points every STEP_M along a polyline with direction (radians, clockwise from grid north)."""
    pts, dirs = [], []
    for (x0, y0), (x1, y1) in zip(xy[:-1], xy[1:]):
        dx, dy = x1 - x0, y1 - y0
        L = math.hypot(dx, dy)
        if L == 0:
            continue
        n = max(1, int(round(L / STEP_M)))
        t = (np.arange(n) + 0.5) / n
        pts.append(np.column_stack([x0 + dx * t, y0 + dy * t]))
        dirs.append(np.full(n, math.atan2(dx, dy)))
        # weights: each point represents L/n metres
    if not pts:
        return None
    return np.vstack(pts), np.concatenate(dirs)


def seg_weights(xy):
    w = []
    for (x0, y0), (x1, y1) in zip(xy[:-1], xy[1:]):
        L = math.hypot(x1 - x0, y1 - y0)
        if L == 0:
            continue
        n = max(1, int(round(L / STEP_M)))
        w.append(np.full(n, L / n))
    return np.concatenate(w)


def fit_orientation(dirs, w):
    deg = np.degrees(dirs) % 90.0
    bins = np.arange(0, 90.25, 0.25)
    h, _ = np.histogram(deg, bins=bins, weights=w)
    # circular gaussian smoothing, sigma 1 degree
    k = np.exp(-0.5 * (np.arange(-12, 13) * 0.25 / 1.0) ** 2)
    hp = np.concatenate([h[-12:], h, h[:12]])
    hs = np.convolve(hp, k, mode="same")[12:-12]
    peak = (np.argmax(hs) + 0.5) * 0.25
    # refine: weighted circular mean within +-3 degrees (period 90)
    d = (deg - peak + 45) % 90 - 45
    m = np.abs(d) <= 3
    peak = peak + np.average(d[m], weights=w[m])
    return ((peak + 45) % 90) - 45  # (-45, 45]


def residual(c, off, sp):
    return (c - off + sp / 2) % sp - sp / 2


def fit_offset(c, w, pitches):
    """(offset, pitch) maximising road weight with |residual| <= TOL."""
    best = (0.0, SPACING_M, -1.0)
    half = int(TOL_M)
    for sp in pitches:
        nb = int(math.ceil(sp))
        r = np.floor(c % sp).astype(int) % nb
        h = np.bincount(r, weights=w, minlength=nb)
        hp = np.concatenate([h[-half:], h, h[:half]])
        cs = np.concatenate([[0], np.cumsum(hp)])
        win = cs[2 * half + 1:] - cs[:-2 * half - 1]  # window centred on each bin
        k = int(np.argmax(win))
        if win[k] > best[2]:
            best = (k + 0.5, sp, win[k])
    off, sp, _ = best
    r = residual(c, off, sp)
    m = np.abs(r) <= TOL_M
    if m.any():
        off = (off + np.average(r[m], weights=w[m])) % sp
    return off, sp


def classify(P, D, theta_deg, a, b, spa=SPACING_M, spb=SPACING_M):
    t = math.radians(theta_deg)
    d1 = np.array([math.sin(t), math.cos(t)])   # "north-south" family direction
    d2 = np.array([math.cos(t), -math.sin(t)])  # "east-west" family direction
    c2 = P @ d2  # position across NS lines
    c1 = P @ d1  # position across EW lines
    rel = (np.degrees(D) - theta_deg) % 180.0
    par1 = np.minimum(rel, 180 - rel) <= ANGLE_TOL_DEG                 # parallel to d1
    rel2 = (rel - 90) % 180.0
    par2 = np.minimum(rel2, 180 - rel2) <= ANGLE_TOL_DEG              # parallel to d2
    on = (par1 & (np.abs(residual(c2, a, spa)) <= TOL_M)) | (par2 & (np.abs(residual(c1, b, spb)) <= TOL_M))
    return on, c1, c2, par1, par2


def to_lonlat(coords):
    xs, ys = zip(*coords)
    lon, lat = inv.transform(xs, ys)
    return [[round(x, 5), round(y, 5)] for x, y in zip(lon, lat)]


def main():
    raw = json.loads(RAW.read_text())
    osm_base = raw["osm3s"]["timestamp_osm_base"]
    ways = []
    for e in raw["elements"]:
        hw = e.get("tags", {}).get("highway")
        if hw not in ROAD_CLASSES or "geometry" not in e:
            continue
        lon = [g["lon"] for g in e["geometry"]]
        lat = [g["lat"] for g in e["geometry"]]
        x, y = fwd.transform(lon, lat)
        xy = list(zip(x, y))
        r = densify(xy)
        if r is None:
            continue
        ways.append({"id": e["id"], "hw": hw, "xy": xy, "P": r[0], "D": r[1], "W": seg_weights(xy)})

    P = np.vstack([w["P"] for w in ways])
    D = np.concatenate([w["D"] for w in ways])
    W = np.concatenate([w["W"] for w in ways])
    RES = np.concatenate([np.full(len(w["P"]), w["hw"] == "residential") for w in ways])
    WID = np.concatenate([np.full(len(w["P"]), i) for i, w in enumerate(ways)])

    # study area bbox in projected metres
    bx, by = fwd.transform([142.90, 143.34], [42.55, 42.98])
    x0, x1 = bx
    y0, y1 = by
    nx = int((x1 - x0) // TILE_M)
    ny = int((y1 - y0) // TILE_M)
    ix = np.floor((P[:, 0] - x0) / TILE_M).astype(int)
    iy = np.floor((P[:, 1] - y0) / TILE_M).astype(int)
    inside = (ix >= 0) & (ix < nx) & (iy >= 0) & (iy < ny)
    tile_of = np.where(inside, iy * nx + ix, -1)

    towns = []
    for lon, lat, rad in TOWN_CENTRES:
        tx, ty = fwd.transform(lon, lat)
        towns.append((tx, ty, rad))

    on_all = np.zeros(len(P), dtype=bool)
    used = np.zeros(len(P), dtype=bool)
    tiles, grid_feats = [], []
    rng = random.Random(14)
    base_on, base_tot, fixed_on = 0.0, 0.0, 0.0
    PITCHES = np.arange(SPACING_M, PITCH_MAX_M + 1e-9, PITCH_STEP_M)

    for j in range(ny):
        for i in range(nx):
            tid = j * nx + i
            m = tile_of == tid
            tx0, ty0 = x0 + i * TILE_M, y0 + j * TILE_M
            tb = box(tx0, ty0, tx0 + TILE_M, ty0 + TILE_M)
            road_km = W[m].sum() / 1000
            density = road_km / (TILE_M / 1000) ** 2
            res_share = W[m & RES].sum() / max(W[m].sum(), 1)
            near_town = any(tb.distance(box(tx - r, ty - r, tx + r, ty + r)) == 0 for tx, ty, r in towns)
            if (near_town or road_km < MIN_ROAD_KM or density < MIN_DENSITY
                    or density > MAX_DENSITY or res_share > MAX_RESIDENTIAL):
                continue
            Pm, Dm, Wm = P[m], D[m], W[m]
            theta = fit_orientation(Dm, Wm)
            t = math.radians(theta)
            d1 = np.array([math.sin(t), math.cos(t)])
            d2 = np.array([math.cos(t), -math.sin(t)])
            _, c1, c2, par1, par2 = classify(Pm, Dm, theta, 0, 0)
            a0, _ = fit_offset(c2[par1], Wm[par1], [SPACING_M])
            b0, _ = fit_offset(c1[par2], Wm[par2], [SPACING_M])
            on0, *_ = classify(Pm, Dm, theta, a0, b0)
            fixed_on += Wm[on0].sum()
            a, spa = fit_offset(c2[par1], Wm[par1], PITCHES)
            b, spb = fit_offset(c1[par2], Wm[par2], PITCHES)
            on, *_ = classify(Pm, Dm, theta, a, b, spa, spb)
            on_all[m] = on
            used[m] = True
            share = Wm[on].sum() / Wm.sum()
            # chance baseline: same orientation, random offsets
            bs = []
            for _ in range(20):
                o, *_ = classify(Pm, Dm, theta, rng.uniform(0, spa), rng.uniform(0, spb), spa, spb)
                bs.append(Wm[o].sum())
            base_on += float(np.mean(bs))
            base_tot += Wm.sum()

            # convert angle to true north: meridian convergence of the tmerc grid
            cx, cy = tx0 + TILE_M / 2, ty0 + TILE_M / 2
            clon, clat = inv.transform(cx, cy)
            gamma = (clon - LON0) * math.sin(math.radians(clat))
            theta_true = theta + gamma
            theta_true = ((theta_true + 45) % 90) - 45

            tiles.append({
                "type": "Feature",
                "properties": {
                    "id": tid,
                    "angle": round(theta_true, 1),
                    "share": round(float(share), 4),
                    "road_km": round(float(road_km), 1),
                    "on_km": round(float(Wm[on].sum() / 1000), 1),
                    "pitch": [round(float(spa), 1), round(float(spb), 1)],
                    "share_546": round(float(Wm[on0].sum() / Wm.sum()), 4),
                },
                "geometry": {"type": "Polygon", "coordinates": [to_lonlat(list(tb.exterior.coords))]},
            })
            # grid lines clipped to the tile
            half = TILE_M
            for fam, d_line, d_perp, off, sp in ((1, d1, d2, a, spa), (2, d2, d1, b, spb)):
                c_center = np.array([cx, cy]) @ d_perp
                k0 = math.floor((c_center - half - off) / sp)
                k1 = math.ceil((c_center + half - off) / sp)
                for k in range(k0, k1 + 1):
                    c = off + k * sp
                    base = d_perp * c + d_line * (np.array([cx, cy]) @ d_line)
                    ln = LineString([base - d_line * half * 1.5, base + d_line * half * 1.5]).intersection(tb)
                    if ln.is_empty or ln.length < 1:
                        continue
                    grid_feats.append({
                        "type": "Feature",
                        "properties": {"t": tid},
                        "geometry": {"type": "LineString", "coordinates": to_lonlat(list(ln.coords))},
                    })

    # road pieces
    road_feats = []
    start = 0
    for wi, w in enumerate(ways):
        n = len(w["P"])
        u = used[start:start + n]
        o = on_all[start:start + n]
        pts = w["P"]
        start += n
        if not u.any():
            continue
        state = np.where(u, o.astype(int), -1)
        k = 0
        while k < n:
            s = state[k]
            e = k
            while e + 1 < n and state[e + 1] == s:
                e += 1
            if s >= 0 and e > k:
                seg = LineString(pts[k:e + 1]).simplify(1.0)
                road_feats.append({
                    "type": "Feature",
                    "properties": {"on": int(s)},
                    "geometry": {"type": "LineString", "coordinates": to_lonlat(list(seg.coords))},
                })
            k = e + 1

    total = W[used].sum()
    on_len = W[used & on_all].sum()
    angles = [f["properties"]["angle"] for f in tiles]
    shares = [f["properties"]["share"] for f in tiles]
    pitches = [p for f in tiles for p in f["properties"]["pitch"]]
    summary = {
        "share": round(float(on_len / total), 4),
        "baseline_share": round(base_on / base_tot, 4),
        "share_fixed_546": round(float(fixed_on / base_tot), 4),
        "pitch_min": min(pitches), "pitch_max": max(pitches),
        "pitch_median": round(float(np.median(pitches)), 1),
        "road_km": round(float(total / 1000), 1),
        "on_km": round(float(on_len / 1000), 1),
        "tiles": len(tiles),
        "angle_min": min(angles), "angle_max": max(angles),
        "share_min": min(shares), "share_max": max(shares),
        "share_median": round(float(np.median(shares)), 4),
        "params": {
            "spacing_m": SPACING_M, "pitch_search_m": [SPACING_M, PITCH_MAX_M, PITCH_STEP_M], "tolerance_m": TOL_M, "angle_tolerance_deg": ANGLE_TOL_DEG,
            "tile_m": TILE_M, "sample_step_m": STEP_M, "road_classes": sorted(ROAD_CLASSES),
        },
        "osm_timestamp": osm_base,
        "bbox": [142.90, 42.55, 143.34, 42.98],
    }
    OUT.mkdir(parents=True, exist_ok=True)
    for name, feats in (("tiles", tiles), ("grid", grid_feats), ("roads", road_feats)):
        (OUT / f"{name}.geojson").write_text(json.dumps({"type": "FeatureCollection", "features": feats}, separators=(",", ":")))
    (OUT / "summary.json").write_text(json.dumps(summary, indent=2))
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
