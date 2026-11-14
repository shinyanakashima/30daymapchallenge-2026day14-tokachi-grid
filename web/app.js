(() => {
  "use strict";

  const STR = {
    en: {
      kicker: "#30DayMapChallenge 2026 · Day 14 · Borgesian map",
      title: "Where the map came first",
      borges: "Borges wrote of a map that copied the land exactly. This work shows the opposite: Tokachi, where the map was drawn first and the land was cleared to fit it.",
      history: "Under the 1897 law for opening up state-owned wild land, each 300-ken square was split into six lots of 150 × 100 ken, and one lot (5 chōbu, about 5 ha) went to one household. The settlement survey went on until 1946.",
      mapEnd: "Map",
      landEnd: "Land",
      roadsToggle: "Colour the roads",
      onGrid: "on the grid",
      offGrid: "off the grid",
      clickHint: "Tap a block to see its grid.",
      blockIn: "Block in {muni}",
      angle: "Grid angle",
      share: "Roads on the grid",
      length: "Road length",
      spacing: "Line spacing",
      statText: "of roads run along survey lines drawn before settlement.",
      statSub: "{tiles} farmland blocks, {km} km of road, counted within ±{tol} m of the estimated lines. A grid placed at random gives {base}%.",
      notesTitle: "Notes and sources",
      note1: "The grid is estimated from present-day roads. It is not the original survey plan.",
      note2: "A road counts as on the grid when it runs within ±{tol} m of a fitted line and within {atol}° of its direction. The share depends on this threshold.",
      note3: "Road centrelines here repeat a little wider than 546 m (median {pitch} m), so the fit searches spacings from 545.5 to 570 m. With the spacing fixed at 545.5 m, the overall share is {fixed}%.",
      note4: "Study area: farmland blocks in Obihiro, Memuro, Makubetsu, Sarabetsu, Nakasatsunai, Shimizu and Taiki. Town centres, forests and hills are left out. Roads: OpenStreetMap as of {date}.",
      sources: 'Aerial photos: <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">GSI Japan</a>, seamless aerial photos. Roads: © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a> (ODbL). History: <a href="https://www.maff.go.jp/j/nousin/sekkei/museum/m_siki/07_tokati_heiya/index.html" target="_blank" rel="noopener">MAFF, Tokachi Plain</a>; <a href="https://www.hkd.mlit.go.jp/ob/tisui/kds/pamphlet/tabi/pdf/03-04-06-kaitaku-p143.pdf" target="_blank" rel="noopener">Hokkaido Regional Development Bureau, Obihiro (PDF)</a>. <a href="https://github.com/shinyanakashima/30daymapchallenge-2026day14-tokachi-grid" target="_blank" rel="noopener">Code and method</a>.',
      langBtn: "日本語",
      play: "Play: fade in the aerial photo",
      pause: "Pause",
      langLabel: "日本語に切り替え",
      north: "N {a}° {d}",
      east: "E",
      west: "W",
    },
    ja: {
      kicker: "#30DayMapChallenge 2026 · Day 14 · Borgesian map",
      title: "地図が先に来た場所",
      borges: "ボルヘスが描いたのは現実をそのまま写す地図でしたが、この作品ではその逆に、先に地図が作られ、それに合わせて土地が開かれた十勝を取り上げました。",
      history: "1897年の北海道国有未開地処分法のもとで、300間四方の中区画は150間×100間の小区画6つに分けられ、小区画1つ（5町歩）が1戸に割り当てられた。殖民地選定事業は1946年まで続いた。",
      mapEnd: "地図",
      landEnd: "土地",
      roadsToggle: "道路を色分けする",
      onGrid: "格子の上",
      offGrid: "格子から外れる",
      clickHint: "区画をタップすると、その格子の情報が出ます。",
      blockIn: "{muni}の区画",
      angle: "格子の向き",
      share: "格子の上を走る道路",
      length: "道路の長さ",
      spacing: "線の間隔",
      statText: "入植前に引かれた区画線の上を走る道路の割合",
      statSub: "農地{tiles}区画・道路{km}kmのうち、推定した線から±{tol}m以内の道路。格子の位置をランダムにすると{base}%。",
      notesTitle: "注記と出典",
      note1: "格子は現在の道路から推定したもので、当時の区画図そのものではありません。",
      note2: "推定した線から±{tol}m以内を、線の向きと{atol}°以内の向きで走る道路を「格子の上」として数えています。割合はこのしきい値によって変わります。",
      note3: "ここでの道路の中心線の間隔は546mより少し広く（中央値{pitch}m）、間隔は545.5〜570mの範囲で合わせています。間隔を545.5mに固定した場合の全体の割合は{fixed}%です。",
      note4: "対象範囲：帯広市、芽室町、幕別町、更別村、中札内村、清水町、大樹町の農地の区画。市街地、森林、山地は除いています。道路：OpenStreetMap（{date}時点）。",
      sources: '航空写真：<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">国土地理院</a> シームレス空中写真。道路：© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>（ODbL）。歴史：<a href="https://www.maff.go.jp/j/nousin/sekkei/museum/m_siki/07_tokati_heiya/index.html" target="_blank" rel="noopener">農林水産省「十勝平野」</a>、<a href="https://www.hkd.mlit.go.jp/ob/tisui/kds/pamphlet/tabi/pdf/03-04-06-kaitaku-p143.pdf" target="_blank" rel="noopener">国土交通省 北海道開発局 帯広開発建設部（PDF）</a>。<a href="https://github.com/shinyanakashima/30daymapchallenge-2026day14-tokachi-grid" target="_blank" rel="noopener">コードと方法</a>。',
      langBtn: "English",
      play: "再生：航空写真を徐々に表示",
      pause: "一時停止",
      langLabel: "Switch to English",
      north: "北から{d}へ{a}°",
      east: "東",
      west: "西",
    },
  };

  let lang = "en";
  try {
    const saved = localStorage.getItem("lang");
    if (saved === "ja" || saved === "en") lang = saved;
  } catch (e) { /* storage unavailable */ }

  let summary = null;
  let selected = null;

  const $ = (id) => document.getElementById(id);
  const fill = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => (v[k] !== undefined ? v[k] : ""));
  const pct = (x) => (x * 100).toFixed(0);

  function vars() {
    if (!summary) return {};
    const p = summary.params;
    return {
      tiles: summary.tiles,
      km: Math.round(summary.road_km).toLocaleString(lang === "ja" ? "ja-JP" : "en-US"),
      tol: p.tolerance_m,
      atol: p.angle_tolerance_deg,
      base: pct(summary.baseline_share),
      fixed: pct(summary.share_fixed_546),
      pitch: summary.pitch_median,
      date: summary.osm_timestamp.slice(0, 10),
    };
  }

  function applyLang() {
    const t = STR[lang];
    const v = vars();
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      el.innerHTML = fill(t[key], v);
    });
    const btn = $("lang");
    btn.textContent = t.langBtn;
    btn.setAttribute("aria-label", t.langLabel);
    const play = $("play");
    if (play) play.setAttribute("aria-label", play.classList.contains("is-playing") ? t.pause : t.play);
    $("blend").setAttribute("aria-label", t.mapEnd + " / " + t.landEnd);
    document.title = (lang === "ja" ? "地図が先に来た場所" : "Where the map came first") + " — Tokachi grid";
    renderInfo();
  }

  function angleText(a) {
    const t = STR[lang];
    return fill(t.north, { a: Math.abs(a).toFixed(1), d: a >= 0 ? t.east : t.west });
  }

  function renderInfo() {
    const box = $("info");
    const t = STR[lang];
    if (!selected) {
      box.innerHTML = `<p class="muted">${t.clickHint}</p>`;
      return;
    }
    const p = selected;
    const muni = lang === "ja" ? p.muni_ja : p.muni_en;
    const pitch = typeof p.pitch === "string" ? JSON.parse(p.pitch) : p.pitch;
    box.innerHTML = `
      <h2>${fill(t.blockIn, { muni })}</h2>
      <dl>
        <dt>${t.angle}</dt><dd>${angleText(p.angle)}</dd>
        <dt>${t.share}</dt><dd>${pct(p.share)}% (${p.on_km} / ${p.road_km} km)</dd>
        <dt>${t.spacing}</dt><dd>${pitch[0]} m × ${pitch[1]} m</dd>
      </dl>`;
  }

  $("lang").addEventListener("click", () => {
    lang = lang === "en" ? "ja" : "en";
    try { localStorage.setItem("lang", lang); } catch (e) { /* ignore */ }
    applyLang();
  });
  applyLang();

  const map = new maplibregl.Map({
    container: "map",
    center: [143.08, 42.79],
    zoom: window.innerWidth < 760 ? 10.4 : 11.2,
    minZoom: 9,
    maxZoom: 17,
    maxBounds: [[142.4, 42.3], [143.9, 43.2]],
    attributionControl: false,
    style: {
      version: 8,
      sources: {
        photo: {
          type: "raster",
          tiles: ["https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg"],
          tileSize: 256,
          maxzoom: 18,
          attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">出典：国土地理院 / GSI Japan</a>',
        },
        tiles: { type: "geojson", data: "data/tiles.geojson" },
        grid: { type: "geojson", data: "data/grid.geojson" },
        roads: {
          type: "geojson",
          data: "data/roads.geojson",
          attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>',
        },
      },
      layers: [
        { id: "paper", type: "background", paint: { "background-color": "#f2eee4" } },
        {
          id: "photo", type: "raster", source: "photo",
          paint: { "raster-opacity": 0, "raster-opacity-transition": { duration: 0 }, "raster-saturation": -0.15 },
        },
        { id: "tiles-fill", type: "fill", source: "tiles", paint: { "fill-color": "#000", "fill-opacity": 0 } },
        {
          id: "tiles-line", type: "line", source: "tiles",
          paint: { "line-color": "#8a7f70", "line-width": 0.6, "line-dasharray": [3, 3], "line-opacity": 0.6 },
        },
        {
          id: "roads", type: "line", source: "roads",
          layout: { "line-cap": "round" },
          paint: {
            "line-color": ["match", ["get", "on"], 1, "#e8552c", "#39a7e0"],
            "line-width": ["interpolate", ["linear"], ["zoom"], 10, 1, 14, 2.5, 17, 5],
          },
        },
        {
          id: "grid-dark", type: "line", source: "grid",
          paint: {
            "line-color": "#2f2a24",
            "line-width": ["interpolate", ["linear"], ["zoom"], 9, 0.4, 13, 1, 16, 1.6],
            "line-opacity": 0.9,
            "line-opacity-transition": { duration: 0 },
          },
        },
        {
          id: "grid-light", type: "line", source: "grid",
          paint: {
            "line-color": "#fff6dc",
            "line-width": ["interpolate", ["linear"], ["zoom"], 9, 0.4, 13, 1, 16, 1.6],
            "line-opacity": 0,
            "line-opacity-transition": { duration: 0 },
          },
        },
        {
          id: "tile-selected", type: "line", source: "tiles",
          filter: ["==", ["get", "id"], -1],
          paint: { "line-color": "#e8552c", "line-width": 2.5 },
        },
      ],
    },
  });

  function fitPadding() {
    const wide = window.innerWidth > 760;
    map.setPadding(wide ? { left: 412, top: 0, right: 0, bottom: 0 } : { left: 0, top: 0, right: 0, bottom: Math.round(window.innerHeight * 0.46) });
  }
  fitPadding();
  window.addEventListener("resize", fitPadding);

  map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
  const blendEl = $("blend-ctrl");
  map.addControl({ onAdd: () => blendEl, onRemove: () => blendEl.remove() }, "top-right");

  function setBlend(v, duration) {
    const t = Math.max(0, Math.min(1, v / 100));
    const tr = { duration: duration || 0, delay: 0 };
    map.setPaintProperty("photo", "raster-opacity-transition", tr);
    map.setPaintProperty("grid-dark", "line-opacity-transition", tr);
    map.setPaintProperty("grid-light", "line-opacity-transition", tr);
    map.setPaintProperty("photo", "raster-opacity", t);
    map.setPaintProperty("grid-dark", "line-opacity", 0.9 * Math.max(0, 1 - t * 2));
    map.setPaintProperty("grid-light", "line-opacity", t < 0.5 ? t * 1.8 : 0.9 - (t - 0.5) * 0.8);
    map.setPaintProperty("tiles-line", "line-color", t > 0.5 ? "#f6efe0" : "#8a7f70");
  }

  const INITIAL_BLEND = 70;
  map.on("load", () => setBlend(INITIAL_BLEND, 0));

  // Play: move the slider from the map (0) to the land (100)
  const PLAY_MS = 6000;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let raf = null;

  function stopPlay() {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    $("play").classList.remove("is-playing");
    $("play").setAttribute("aria-label", STR[lang].play);
  }

  function startPlay() {
    const slider = $("blend");
    let from = Number(slider.value);
    if (from >= 100) from = 0;
    if (reduceMotion) {
      slider.value = 100;
      setBlend(100, 0);
      return;
    }
    $("play").classList.add("is-playing");
    $("play").setAttribute("aria-label", STR[lang].pause);
    const t0 = performance.now() - (from / 100) * PLAY_MS;
    const step = (now) => {
      const v = Math.max(0, Math.min(100, ((now - t0) / PLAY_MS) * 100));
      slider.value = v;
      setBlend(v, 0);
      if (v < 100) raf = requestAnimationFrame(step);
      else stopPlay();
    };
    raf = requestAnimationFrame(step);
  }

  $("play").addEventListener("click", () => (raf ? stopPlay() : startPlay()));
  $("blend").addEventListener("input", (e) => { stopPlay(); setBlend(Number(e.target.value), 0); });

  $("roads").addEventListener("change", (e) => {
    const on = e.target.checked;
    map.setLayoutProperty("roads", "visibility", on ? "visible" : "none");
    $("legend").hidden = !on;
  });

  map.on("click", "tiles-fill", (e) => {
    const f = e.features && e.features[0];
    if (!f) return;
    selected = f.properties;
    map.setFilter("tile-selected", ["==", ["get", "id"], selected.id]);
    renderInfo();
  });
  map.on("mouseenter", "tiles-fill", () => { map.getCanvas().style.cursor = "pointer"; });
  map.on("mouseleave", "tiles-fill", () => { map.getCanvas().style.cursor = ""; });

  fetch("data/summary.json")
    .then((r) => r.json())
    .then((s) => {
      summary = s;
      $("stat-value").textContent = pct(s.share);
      applyLang();
    });

  window.__tokachi = { map, startPlay };
})();
