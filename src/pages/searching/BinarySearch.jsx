import { useState, useRef, useEffect } from "react";
import { useBinarySearch, generateSortedArray } from "../../visualizers/searching/useBinarySearch";
import BinarySearchPlayground from "../../components/BinarySearchPlayground";
import "../../components/BinarySearchPlayground.css";
import "../../pages/sorting/SortingPage.css";
import "./SearchingPage.css";
import "./BinarySearchPage.css";

/* ── Complexity badges ── */
const COMPLEXITY_DATA = [
  { label: "En İyi",   value: "O(1)",     color: "green"  },
  { label: "Ortalama", value: "O(log n)", color: "yellow" },
  { label: "En Kötü",  value: "O(log n)", color: "red"    },
  { label: "Bellek",   value: "O(1)",     color: "blue"   },
];

/* ── Pseudocode ── */
const PSEUDO = [
  { n: 1,  text: "binarySearch(dizi, hedef):" },
  { n: 2,  text: "  low ← 0  ;  high ← n − 1" },
  { n: 3,  text: "  while low ≤ high:" },
  { n: 4,  text: "    mid ← ⌊(low + high) / 2⌋" },
  { n: 5,  text: "    eğer dizi[mid] === hedef → bul" },
  { n: 6,  text: "    eğer dizi[mid] < hedef:" },
  { n: 7,  text: "      low ← mid + 1" },
  { n: 8,  text: "    değilse:" },
  { n: 9,  text: "      high ← mid − 1" },
  { n: 10, text: "  hedef bulunamadı" },
];

const ACTIVE_MAP = { 3: 4, 4: 5, 6: 7, 8: 9, 10: 10 };

const SIZE = 16;
const PLAYGROUND_ARRAY = [7, 13, 21, 28, 34, 42, 55, 61, 67, 74, 83, 91];

const LOG_PRESETS = [8, 16, 32, 64, 128, 256, 1024, 1000000];

function LogNCard() {
  const [logN, setLogN]   = useState(16);
  const [open, setOpen]   = useState(false);
  const dropRef           = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onOutside(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  const steps = [];
  let cur = logN;
  while (cur >= 1) { steps.push(cur); cur = Math.floor(cur / 2); }
  const maxSteps = Math.ceil(Math.log2(logN));

  const displayVal = (v) => v >= 1000000 ? "1.000.000" : v.toLocaleString("tr-TR");

  return (
    <div className="info-card">
      <h3 className="info-card-title">Her Adımda Yarıya İner</h3>
      <p className="info-card-text" style={{ marginBottom: 12 }}>
        n elemanlı dizide <strong>en fazla ⌈log₂ n⌉</strong> karşılaştırma yapılır.
        Eleman sayısını seçerek farkı gör:
      </p>

      <div className="bs-n-select-row">
        <span className="bs-n-select-label">n =</span>
        <div className="bs-custom-select" ref={dropRef}>
          <button
            className="bs-custom-select-btn"
            onClick={() => setOpen((o) => !o)}
            type="button"
          >
            {displayVal(logN)}
            <span className={`bs-select-arrow ${open ? "bs-arrow-up" : ""}`}>▾</span>
          </button>
          {open && (
            <ul className="bs-custom-select-list">
              {LOG_PRESETS.map((v) => (
                <li
                  key={v}
                  className={`bs-custom-select-item ${v === logN ? "bs-select-active" : ""}`}
                  onMouseDown={() => { setLogN(v); setOpen(false); }}
                >
                  {displayVal(v)}
                </li>
              ))}
            </ul>
          )}
        </div>
        <span className="bs-n-select-hint">eleman</span>
      </div>

      <div className="bs-logn-compare">
        <div className="bs-logn-side">
          <span className="bs-logn-algo">Linear</span>
          <span className="bs-logn-steps-bad">{logN >= 1000000 ? "1M" : logN}</span>
          <span className="bs-logn-unit">adım</span>
        </div>
        <div className="bs-logn-vs">VS</div>
        <div className="bs-logn-side">
          <span className="bs-logn-algo">Binary</span>
          <span className="bs-logn-steps-good">{maxSteps}</span>
          <span className="bs-logn-unit">adım</span>
        </div>
      </div>

      <div className="bs-halving">
        {steps.map((n, i) => (
          <div key={i} className="bs-halving-row">
            <span className="bs-halving-label">{i === 0 ? "Başlangıç" : `${i}. adım`}</span>
            <div className="bs-halving-track">
              <div className="bs-halving-fill" style={{ width: `${(n / logN) * 100}%` }} />
            </div>
            <span className="bs-halving-count">{n >= 1000000 ? "1M" : n} aday</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Box state ── */
function getBoxState(idx, step) {
  if (!step) return "candidate";
  const { low, high, mid, found, phase, elLeft, elRight } = step;
  if (elLeft.includes(idx) || elRight.includes(idx)) return "eliminated";
  if (found === idx && (phase === "found" || phase === "done_found")) return "found";
  if (idx === mid && phase !== "done_notfound") return "mid";
  if (idx >= low && idx <= high) return "candidate";
  return "eliminated";
}

/* ── Preset ── */
function genPreset(arr, type) {
  const n = arr.length;
  if (type === "center")   return arr[Math.floor(n / 2)];
  if (type === "left")     return arr[Math.floor(n / 4)];
  if (type === "right")    return arr[Math.floor((3 * n) / 4)];
  if (type === "notfound") {
    let t = arr[arr.length - 1] + 1;
    while (arr.includes(t)) t++;
    return t;
  }
  return arr[Math.floor(Math.random() * n)];
}

export default function BinarySearch() {
  const {
    array, target, setTarget,
    current, stepIndex, totalSteps,
    isPlaying, isDone, speed, setSpeed,
    reset, changeArray, togglePlay, stepForward, stepBackward,
  } = useBinarySearch(SIZE);

  const [inputVal, setInputVal]         = useState("");
  const [activePreset, setActivePreset] = useState("");
  const [vizSize, setVizSize]           = useState(SIZE);

  function handleSearch() {
    const n = parseInt(inputVal, 10);
    if (!isNaN(n)) { setTarget(n); setActivePreset(""); }
  }
  function handleQuickPick(v) {
    setTarget(v); setInputVal(String(v)); setActivePreset("");
  }
  function handleAdj(d) {
    const base = parseInt(inputVal, 10);
    setInputVal(String(isNaN(base) ? (d > 0 ? 10 : 99) : base + d));
  }
  function handlePreset(key) {
    setActivePreset(key);
    const tgt = genPreset(array, key);
    setTarget(tgt);
    setInputVal(String(tgt));
  }
  function handleReset() {
    reset(); setInputVal(""); setActivePreset("");
  }

  function handleSizeChange(newSize) {
    setVizSize(newSize);
    const newArr = generateSortedArray(newSize);
    changeArray(newArr);
    setInputVal("");
    setActivePreset("");
  }

  const phase      = current?.phase ?? null;
  const isDoneFinal = phase === "done_found" || phase === "done_notfound";
  const canPlay    = totalSteps > 0;
  const remaining  = current?.remaining ?? array.length;
  const remainPct  = Math.round((remaining / array.length) * 100);
  const activePseudo = current?.activeLine ?? null;
  const playLabel  = isPlaying ? "⏸ Durdur" : isDone ? "↺ Yeniden" : "▶ Oynat";

  return (
    <div className="sorting-page">
      <div className="page-container">

        {/* ── Header ── */}
        <div className="page-header">
          <div>
            <div className="page-tag">Arama Algoritması</div>
            <h1 className="page-title">İkili Arama</h1>
            <p className="page-subtitle">
              Sıralı dizide ortadan bölerek ara — her adımda arama alanı yarıya iner.
            </p>
          </div>
          <div className="complexity-badges">
            {COMPLEXITY_DATA.map(({ label, value, color }) => (
              <div key={label} className={`complexity-badge badge-${color}`}>
                <span className="badge-value">{value}</span>
                <span className="badge-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="page-body">

          {/* ══ Sol: Görselleştirici ══ */}
          <div className="visualizer-col">

            {/* Hedef seçici */}
            <div className="target-selector">
              <div className="ts-label">Aranacak Sayı</div>
              <div className="ts-row">
                <button className="ts-adj" onClick={() => handleAdj(-1)}>−</button>
                <input
                  className="ts-input"
                  type="number"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="?"
                />
                <button className="ts-adj" onClick={() => handleAdj(1)}>+</button>
                <button className="ts-search-btn" onClick={handleSearch}>Ara</button>
              </div>
              <div className="ts-divider">Diziden hızlı seç (sıralı):</div>
              <div className="ts-quickpick">
                {array.map((v) => (
                  <button
                    key={v}
                    className={`ts-quick-btn ${target === v ? "ts-quick-active" : ""}`}
                    onClick={() => handleQuickPick(v)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Boyut seçici */}
            <div className="bs-size-selector">
              <span className="bs-size-label">
                Eleman Sayısı: <strong>{vizSize}</strong>
              </span>
              <input
                type="range"
                min="8"
                max="100"
                step="1"
                value={vizSize}
                onChange={(e) => handleSizeChange(Number(e.target.value))}
                className="bs-size-slider"
              />
              <span className="bs-size-ends">100</span>
            </div>

            {/* Kalan aday çubuğu */}
            {canPlay && (
              <div className="scan-progress">
                <span className="sp-label">Kalan Aday</span>
                <div className="sp-track">
                  <div className="sp-fill bs-remaining-fill" style={{ width: `${remainPct}%` }} />
                </div>
                <span className="sp-pct">{remaining} / {array.length}</span>
              </div>
            )}

            {/* Sonuç banner */}
            {isDoneFinal && (
              <div className={`result-banner ${phase === "done_found" ? "rb-found" : "rb-notfound"}`}>
                <span className="rb-icon">{phase === "done_found" ? "✓" : "✗"}</span>
                <div>
                  <div className="rb-main">
                    {phase === "done_found"
                      ? `${target} bulundu — indeks ${current.found}`
                      : `${target} dizide bulunamadı`}
                  </div>
                  <div className="rb-detail">
                    {current.comparisons} karşılaştırmayla tamamlandı.
                    {phase === "done_found" && ` Linear search en fazla ${array.length} adım kullanırdı.`}
                  </div>
                </div>
              </div>
            )}

            {/* ── Kutu görselleştirici ── */}
            <div className="bs-viz-card">

              {/* Box row — pointers inside each box */}
              <div className="bs-box-row">
                {array.map((val, idx) => {
                  const state  = getBoxState(idx, current);
                  const isLow  = current && idx === current.low  && phase !== "done_notfound";
                  const isHigh = current && idx === current.high && phase !== "done_notfound";
                  const isMid  = current && idx === current.mid  && phase !== "done_notfound";
                  return (
                    <div key={idx} className={`bs-box bs-${state}`}>
                      <div className="bs-box-tags">
                        {isLow  && <span className="bs-tag bs-tag-low">L</span>}
                        {isMid  && <span className="bs-tag bs-tag-mid">M</span>}
                        {isHigh && <span className="bs-tag bs-tag-high">H</span>}
                      </div>
                      <span className="bs-val">{val}</span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="bs-legend">
                <span className="bs-leg"><span className="bs-leg-dot bs-leg-mid" />mid</span>
                <span className="bs-leg"><span className="bs-leg-dot bs-leg-found" />bulundu</span>
                <span className="bs-leg"><span className="bs-leg-dot bs-leg-candidate" />aday</span>
                <span className="bs-leg"><span className="bs-leg-dot bs-leg-eliminated" />elendi</span>
              </div>
            </div>

            {/* Adım açıklaması */}
            <div className={`step-explanation ${
              isDoneFinal
                ? phase === "done_found" ? "step-done" : "step-idle"
                : current ? "step-active" : "step-idle"
            }`}>
              <div className="step-main">
                {!canPlay && "Yukarıdan bir hedef sayı seçin veya girin"}
                {canPlay && !current && "▶ Oynat'a bas veya adım adım ilerle"}
                {current && current.description}
              </div>
              {current?.detail && <div className="step-detail">{current.detail}</div>}
            </div>

            {/* Kontroller */}
            <div className="controls">
              <div className="ctrl-group">
                <button className="ctrl-btn ctrl-icon" onClick={stepBackward} disabled={!current || stepIndex <= 0}>◀◀</button>
                <button
                  className={`ctrl-btn ctrl-play ${isPlaying ? "is-playing" : ""}`}
                  onClick={togglePlay}
                  disabled={!canPlay}
                >
                  {playLabel}
                </button>
                <button className="ctrl-btn ctrl-icon" onClick={stepForward} disabled={isDone || !canPlay}>▶▶</button>
              </div>
              <div className="ctrl-group">
                <span className="speed-label">Hız</span>
                {[1000, 600, 300, 100].map((ms) => (
                  <button
                    key={ms}
                    className={`ctrl-btn ctrl-secondary ${speed === ms ? "speed-active" : ""}`}
                    onClick={() => setSpeed(ms)}
                  >
                    {ms === 1000 ? "×1" : ms === 600 ? "×2" : ms === 300 ? "×4" : "×8"}
                  </button>
                ))}
              </div>
              <button className="ctrl-btn ctrl-secondary" onClick={handleReset}>↺ Yenile</button>
            </div>

            {/* Meta */}
            <div className="search-meta">
              <div className="sm-stat">
                <span className="sm-val" style={{ color: "var(--primary)" }}>
                  {current?.mid >= 0 ? current.mid : "—"}
                </span>
                <span className="sm-label">mid</span>
              </div>
              <div className="sm-divider" />
              <div className="sm-stat">
                <span className="sm-val">{current?.comparisons ?? 0}</span>
                <span className="sm-label">Karşılaştırma</span>
              </div>
              <div className="sm-divider" />
              <div className="sm-stat">
                <span className="sm-val" style={{ color: "#f59e0b" }}>{remaining}</span>
                <span className="sm-label">Kalan Aday</span>
              </div>
              <div className="sm-divider" />
              <div className="sm-stat">
                <span className="sm-val">{stepIndex + 1} / {totalSteps || "—"}</span>
                <span className="sm-label">Adım</span>
              </div>
            </div>

            {/* Preset bar */}
            <div className="preset-bar">
              <span className="preset-label">Senaryo</span>
              <div className="preset-group">
                {[
                  { key: "center",   label: "Ortada Bul", tooltip: "En iyi durum — ilk adımda bulunur" },
                  { key: "left",     label: "Sol Yarı",   tooltip: "Hedef sol çeyrekte — sağ yarılar elenir" },
                  { key: "right",    label: "Sağ Yarı",   tooltip: "Hedef sağ çeyrekte — sol yarılar elenir" },
                  { key: "notfound", label: "Bulunamadı", tooltip: "En kötü durum — tüm adaylar elenir" },
                ].map(({ key, label, tooltip }) => (
                  <button
                    key={key}
                    className={`preset-btn ${activePreset === key ? "preset-active" : ""}`}
                    onClick={() => handlePreset(key)}
                    data-tooltip={tooltip}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Playground */}
            <div className="section-divider">Kendi Kodunu Dene</div>
            <BinarySearchPlayground initialArray={PLAYGROUND_ARRAY} />

          </div>

          {/* ══ Sağ: Bilgi paneli ══ */}
          <div className="info-section">

            <div className="section-divider">Algoritma</div>

            <div className="info-card">
              <h3 className="info-card-title">Nasıl Çalışır?</h3>
              <p className="info-card-text" style={{ marginBottom: 16 }}>
                Dizi <strong>sıralı</strong> olduğu için ortadaki elemana bakılır. Hedef büyükse
                sol yarı, küçükse sağ yarı tamamen <strong>elenir</strong> ve işlem tekrar edilir.
                Her adımda arama alanı yarıya iner.
              </p>
              <div className="pseudocode">
                {PSEUDO.map(({ n, text }) => {
                  const isActive = activePseudo && ACTIVE_MAP[activePseudo] === n;
                  return (
                    <div key={n} className={`pseudo-line ${isActive ? "pseudo-active" : ""}`}>
                      <span className="pseudo-num">{n}</span>
                      <span className="pseudo-code">{text}</span>
                      {isActive && <span className="pseudo-arrow">← şu an</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="section-divider">Neden log n?</div>

            <LogNCard />

            <div className="section-divider">Karmaşıklık</div>

            <div className="info-card">
              <h3 className="info-card-title">Karmaşıklık Analizi</h3>
              <div className="complexity-list">
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-green">En İyi — O(1)</div>
                  <p className="complexity-row-desc">
                    Aranan eleman <strong>tam ortada</strong> ise ilk adımda bulunur. "Ortada Bul" presetini dene.
                  </p>
                </div>
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-yellow">Ortalama — O(log n)</div>
                  <p className="complexity-row-desc">
                    Ortalamada ⌈log₂ n⌉ adım gerekir. 16 elemanlı dizide <strong>en fazla 4</strong>,
                    1.000.000 elemanlı dizide <strong>en fazla 20</strong> adım.
                  </p>
                </div>
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-red">En Kötü — O(log n)</div>
                  <p className="complexity-row-desc">
                    Eleman bulunamasa bile en fazla ⌈log₂ n⌉ adım yapılır.
                    Linear Search'ün O(n) en kötü durumundan çok daha hızlı.
                  </p>
                </div>
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-blue">Bellek — O(1)</div>
                  <p className="complexity-row-desc">
                    Yalnızca <code>low</code>, <code>high</code>, <code>mid</code> değişkenleri kullanılır —
                    dizi büyüklüğünden bağımsız sabit bellek.
                  </p>
                </div>
              </div>
            </div>

            <div className="section-divider">Avantajlar &amp; Sınırlar</div>

            <div className="info-card">
              <h3 className="info-card-title">Avantajlar &amp; Sınırlar</h3>
              <ul className="feature-list">
                <li><span className="feature-icon feature-check">✓</span><span><strong>Çok hızlı</strong> — 1 milyar elemanda bile 30 adım yeterli</span></li>
                <li><span className="feature-icon feature-check">✓</span><span><strong>O(1) bellek</strong> — Ekstra veri yapısı gerekmez</span></li>
                <li><span className="feature-icon feature-check">✓</span><span><strong>Öngörülebilir</strong> — En kötü durumu da O(log n)'dir</span></li>
                <li><span className="feature-icon feature-x">✗</span><span><strong>Sıralı dizi şart</strong> — Sırasız dizide çalışmaz</span></li>
                <li><span className="feature-icon feature-x">✗</span><span><strong>Tüm eşleşmeleri bulmaz</strong> — Sadece bir indeks döner</span></li>
                <li><span className="feature-icon feature-x">✗</span><span><strong>Dinamik dizilerde pahalı</strong> — Her ekleme/silme yeniden sıralama gerektirir</span></li>
              </ul>
            </div>

            <div className="section-divider">Karşılaştırma</div>

            <div className="info-card">
              <h3 className="info-card-title">Linear vs Binary Search</h3>
              <div className="vs-table">
                <div className="vs-row vs-header">
                  <div className="vs-cell">Özellik</div>
                  <div className="vs-cell">Linear</div>
                  <div className="vs-cell">Binary</div>
                </div>
                {[
                  ["Dizi şartı",       "Sırasız olabilir",     "vs-pro", "Sıralı olmalı",         "vs-con"],
                  ["En kötü durum",    "O(n)",                 "vs-con", "O(log n)",              "vs-pro"],
                  ["En iyi durum",     "O(1)",                 "vs-pro", "O(1)",                  "vs-pro"],
                  ["Bellek",           "O(1)",                 "",       "O(1)",                  ""      ],
                  ["Tüm eşleşmeler",  "Kolayca bulur",        "vs-pro", "Ekstra mantık gerekir", "vs-con"],
                  ["Ne zaman kullan?", "Küçük / sırasız dizi", "",       "Büyük sıralı dizi",     ""      ],
                ].map(([label, lval, lcls, bval, bcls]) => (
                  <div key={label} className="vs-row">
                    <div className="vs-cell">{label}</div>
                    <div className={`vs-cell ${lcls}`}>{lval}</div>
                    <div className={`vs-cell ${bcls}`}>{bval}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
