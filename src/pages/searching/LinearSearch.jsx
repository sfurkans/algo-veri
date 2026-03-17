import { useState } from "react";
import { useLinearSearch, generateArray } from "../../visualizers/searching/useLinearSearch";
import "../../pages/sorting/SortingPage.css";
import "./SearchingPage.css";
import LinearSearchPlayground from "../../components/LinearSearchPlayground";
import "../../components/LinearSearchPlayground.css";

/* ── Complexity badges ─────────────────────────────────────────── */
const COMPLEXITY_DATA = [
  { label: "En İyi",    value: "O(n)",   color: "yellow" },
  { label: "Ortalama",  value: "O(n)",   color: "yellow" },
  { label: "En Kötü",   value: "O(n)",   color: "red"    },
  { label: "Bellek",    value: "O(1)",   color: "blue"   },
];

/* ── Pseudocode ─────────────────────────────────────────────────── */
const PSEUDO = [
  { n: 1, text: "linearSearch(dizi, hedef):" },
  { n: 2, text: "  sonuçlar ← []" },
  { n: 3, text: "  i ← 0'dan dizi.uzunluğu-1'e:" },
  { n: 4, text: "    eğer dizi[i] === hedef:" },
  { n: 5, text: "      sonuçlar'a i ekle" },
  { n: 6, text: "  ──────────────────────────" },
  { n: 7, text: "  sonuçlar'ı döndür" },
];

const SIZE     = 14;
const MIN_SIZE = 6;
const MAX_SIZE = 30;

const PLAYGROUND_ARRAY = [38, 15, 63, 38, 27, 82, 15, 44, 63, 71];

/* ── Preset array generators ───────────────────────────────────── */
function genStartArray(size = SIZE) {
  const arr = generateArray(size);
  const target = arr[0]; // first element is target
  return { arr, target };
}

function genEndArray(size = SIZE) {
  const arr = generateArray(size);
  const target = arr[size - 1]; // last element is target
  return { arr, target };
}

function genNotFoundArray(size = SIZE) {
  const arr = generateArray(size);
  // pick a number guaranteed not in array
  let target = 999;
  while (arr.includes(target)) target--;
  return { arr, target };
}

function genRandomArray(size = SIZE) {
  const arr = generateArray(size);
  const target = arr[Math.floor(Math.random() * size)];
  return { arr, target };
}

/* ── Box state ─────────────────────────────────────────────────── */
function getBoxState(idx, step) {
  if (!step) return "default";
  const { current, found, phase } = step;
  const done = phase === "done_found" || phase === "done_notfound";
  if (found.includes(idx)) return "found";
  if (idx === current && phase === "comparing") return "checking";
  if (done || idx < current) return "checked";
  return "default";
}

/* ── Main Component ─────────────────────────────────────────────── */
export default function LinearSearch() {
  const {
    array, target, setTarget,
    current, stepIndex, totalSteps,
    isPlaying, isDone, speed, setSpeed,
    reset, resetWith, togglePlay, stepForward, stepBackward,
  } = useLinearSearch(SIZE);

  const [inputVal, setInputVal]     = useState("");
  const [activePreset, setActivePreset] = useState("random");
  const [vizSize, setVizSize]       = useState(SIZE);

  /* ── Value counts for quick-pick ── */
  const valCounts = {};
  array.forEach((v) => { valCounts[v] = (valCounts[v] || 0) + 1; });
  const uniqueVals = [...new Set(array)].sort((a, b) => a - b);

  /* ── Target handlers ── */
  function handleSearch() {
    const n = parseInt(inputVal, 10);
    if (!isNaN(n)) {
      setTarget(n);
      setActivePreset("");
    }
  }

  function handleQuickPick(v) {
    setTarget(v);
    setInputVal(String(v));
    setActivePreset("");
  }

  function handleAdj(delta) {
    const base = parseInt(inputVal, 10);
    const next = isNaN(base) ? delta > 0 ? 10 : 99 : base + delta;
    setInputVal(String(next));
  }

  /* ── Preset handlers ── */
  function handlePreset(key) {
    setActivePreset(key);
    let result;
    if (key === "start")         result = genStartArray(vizSize);
    else if (key === "end")      result = genEndArray(vizSize);
    else if (key === "notfound") result = genNotFoundArray(vizSize);
    else                         result = genRandomArray(vizSize);
    resetWith(result.arr, result.target);
    setInputVal(String(result.target));
  }

  function handleReset() {
    resetWith(generateArray(vizSize), null);
    setInputVal("");
    setActivePreset("random");
  }

  function handleSizeChange(newSize) {
    setVizSize(newSize);
    resetWith(generateArray(newSize), null);
    setInputVal("");
    setActivePreset("");
  }

  /* ── Scan progress ── */
  const scanned = current
    ? current.phase === "done_found" || current.phase === "done_notfound"
      ? array.length
      : current.current + 1
    : 0;
  const scanPct = Math.round((scanned / array.length) * 100);

  /* ── Play button label ── */
  const playLabel = isPlaying
    ? "⏸ Durdur"
    : isDone
    ? "↺ Yeniden"
    : "▶ Oynat";

  const canPlay = totalSteps > 0;

  /* ── Result info ── */
  const phase = current?.phase ?? null;
  const foundIndices = current?.found ?? [];
  const isDoneFinal = phase === "done_found" || phase === "done_notfound";

  return (
    <div className="sorting-page">
      <div className="page-container">

        {/* ── Header ── */}
        <div className="page-header">
          <div>
            <div className="page-tag">Arama Algoritması</div>
            <h1 className="page-title">Doğrusal Arama</h1>
            <p className="page-subtitle">
              Diziyi baştan sona tara, hedef sayıyı bul — en basit arama yöntemi.
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
              <div className="ts-divider">Diziden hızlı seç:</div>
              <div className="ts-quickpick">
                {uniqueVals.map((v) => (
                  <button
                    key={v}
                    className={`ts-quick-btn ${target === v ? "ts-quick-active" : ""}`}
                    onClick={() => handleQuickPick(v)}
                  >
                    {v}
                    {valCounts[v] > 1 && (
                      <span className="ts-dup-badge">×{valCounts[v]}</span>
                    )}
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
                min={MIN_SIZE}
                max={MAX_SIZE}
                step="1"
                value={vizSize}
                onChange={(e) => handleSizeChange(Number(e.target.value))}
                className="bs-size-slider"
              />
              <span className="bs-size-ends">{MAX_SIZE}</span>
            </div>

            {/* Tarama ilerleme çubuğu */}
            {canPlay && (
              <div className="scan-progress">
                <span className="sp-label">Taranan</span>
                <div className="sp-track">
                  <div className="sp-fill" style={{ width: `${scanPct}%` }} />
                </div>
                <span className="sp-pct">{scanned}/{array.length}</span>
              </div>
            )}

            {/* Sonuç banner */}
            {isDoneFinal && (
              <div className={`result-banner ${phase === "done_found" ? "rb-found" : "rb-notfound"}`}>
                <span className="rb-icon">{phase === "done_found" ? "✓" : "✗"}</span>
                <div>
                  <div className="rb-main">
                    {phase === "done_found"
                      ? `${foundIndices.length} eşleşme bulundu`
                      : `${target} dizide bulunamadı`}
                  </div>
                  <div className="rb-detail">
                    {phase === "done_found"
                      ? `${array.length} elemandan ${current.comparisons} karşılaştırma yapıldı.`
                      : `Tüm ${array.length} eleman kontrol edildi, ${current.comparisons} karşılaştırma yapıldı.`}
                  </div>
                  {phase === "done_found" && (
                    <div className="rb-indices">
                      {foundIndices.map((i) => (
                        <span key={i} className="rb-idx-pill">i={i}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Kutu grid */}
            <div className="search-boxes">
              {array.map((val, idx) => {
                const state = getBoxState(idx, current);
                return (
                  <div key={idx} className={`search-box sb-${state}`}>
                    <span className="sb-val">{val}</span>
                    <span className="sb-idx">{idx}</span>
                  </div>
                );
              })}
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
              {current?.detail && (
                <div className="step-detail">{current.detail}</div>
              )}
            </div>

            {/* Kontroller */}
            <div className="controls">
              <div className="ctrl-group">
                <button
                  className="ctrl-btn ctrl-icon"
                  onClick={stepBackward}
                  disabled={!current || stepIndex <= 0}
                >◀◀</button>
                <button
                  className={`ctrl-btn ctrl-play ${isPlaying ? "is-playing" : ""}`}
                  onClick={togglePlay}
                  disabled={!canPlay}
                >
                  {playLabel}
                </button>
                <button
                  className="ctrl-btn ctrl-icon"
                  onClick={stepForward}
                  disabled={isDone || !canPlay}
                >▶▶</button>
              </div>
              <div className="ctrl-group">
                <span className="speed-label">Hız</span>
                {[800, 400, 200, 80].map((ms) => (
                  <button
                    key={ms}
                    className={`ctrl-btn ctrl-secondary ${speed === ms ? "speed-active" : ""}`}
                    onClick={() => setSpeed(ms)}
                  >
                    {ms === 800 ? "×1" : ms === 400 ? "×2" : ms === 200 ? "×4" : "×8"}
                  </button>
                ))}
              </div>
              <button className="ctrl-btn ctrl-secondary" onClick={handleReset}>↺ Yenile</button>
            </div>

            {/* Meta bilgiler */}
            <div className="search-meta">
              <div className="sm-stat">
                <span className="sm-val" style={{ color: "var(--primary)" }}>
                  {current?.current >= 0 ? current.current : "—"}
                </span>
                <span className="sm-label">Mevcut İndeks</span>
              </div>
              <div className="sm-divider" />
              <div className="sm-stat">
                <span className="sm-val">{current?.comparisons ?? 0}</span>
                <span className="sm-label">Karşılaştırma</span>
              </div>
              <div className="sm-divider" />
              <div className="sm-stat">
                <span className="sm-val" style={{ color: "#22c55e" }}>
                  {current?.found?.length ?? 0}
                </span>
                <span className="sm-label">Eşleşme</span>
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
                  { key: "start",    label: "Başta Bul",    tooltip: "En iyi durum — O(1), ilk karşılaştırmada bulunur" },
                  { key: "end",      label: "Sonda Bul",    tooltip: "En kötü durum (bulundu) — O(n), son elemana kadar tarar" },
                  { key: "notfound", label: "Bulunamadı",   tooltip: "En kötü durum — O(n), tüm dizi taranır" },
                  { key: "random",   label: "Rastgele",     tooltip: "Ortalama durum — O(n/2), ortada bir yerde bulunur" },
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

            {/* Kendi Kodunu Dene */}
            <div className="section-divider">Kendi Kodunu Dene</div>
            <LinearSearchPlayground initialArray={PLAYGROUND_ARRAY} />

          </div>

          {/* ══ Sağ: Bilgi paneli ══ */}
          <div className="info-section">

            <div className="section-divider">Algoritma</div>

            <div className="info-card">
              <h3 className="info-card-title">Nasıl Çalışır?</h3>
              <p className="info-card-text" style={{ marginBottom: 16 }}>
                Dizi başından itibaren <strong>her eleman sırasıyla</strong> hedef sayıyla
                karşılaştırılır. Eşleşen her eleman sonuç listesine eklenir. Dizi
                sonuna kadar tarama <strong>durmaz</strong> — bu sayede tüm eşleşmeler bulunur.
              </p>
              <div className="pseudocode">
                {(() => {
                  let lineNum = 0;
                  return PSEUDO.map(({ n, text }) => {
                    const isSep = n === 6;
                    if (!isSep) lineNum++;
                    return (
                      <div
                        key={n}
                        className={`pseudo-line
                          ${isSep ? "pseudo-separator" : ""}
                          ${current?.activeLine === n ? "pseudo-active" : ""}`}
                      >
                        <span className="pseudo-num">{isSep ? "" : lineNum}</span>
                        <span className="pseudo-code">{text}</span>
                        {current?.activeLine === n && (
                          <span className="pseudo-arrow">← şu an</span>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            <div className="section-divider">Karmaşıklık</div>

            <div className="info-card">
              <h3 className="info-card-title">Karmaşıklık Analizi</h3>
              <div className="complexity-list">
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-yellow">En İyi — O(n)</div>
                  <p className="complexity-row-desc">
                    Bu uygulama <strong>tüm eşleşmeleri</strong> bulduğundan diziyi
                    her zaman baştan sona tarar — eleman ilk sırada bile olsa n adım yapılır.
                  </p>
                </div>
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-yellow">Ortalama — O(n)</div>
                  <p className="complexity-row-desc">
                    Eleman rastgele bir konumdaysa <strong>ortalama n/2</strong> karşılaştırma yapılır.
                    Tüm eşleşmeleri bulmak için yine de n'e kadar devam edilir.
                  </p>
                </div>
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-red">En Kötü — O(n)</div>
                  <p className="complexity-row-desc">
                    Eleman dizinin <strong>sonunda</strong> ya da <strong>hiç yok</strong>sa
                    tüm n eleman kontrol edilir. "Sonda Bul" ve "Bulunamadı" presetleri bu durumu gösterir.
                  </p>
                </div>
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-blue">Bellek — O(1)</div>
                  <p className="complexity-row-desc">
                    Dizi boyutundan bağımsız olarak <strong>sabit miktarda bellek</strong> kullanır —
                    sadece birkaç değişken yeterlidir.
                  </p>
                </div>
              </div>
            </div>

            <div className="section-divider">Avantajlar &amp; Sınırlar</div>

            <div className="info-card">
              <h3 className="info-card-title">Avantajlar &amp; Sınırlar</h3>
              <ul className="feature-list">
                <li><span className="feature-icon feature-check">✓</span><span><strong>Sırasız dizilerde çalışır</strong> — Binary Search'ün aksine ön koşul yok</span></li>
                <li><span className="feature-icon feature-check">✓</span><span><strong>Tüm eşleşmeleri bulur</strong> — İlk eşleşmede durmuyor</span></li>
                <li><span className="feature-icon feature-check">✓</span><span><strong>O(1) bellek</strong> — Ekstra veri yapısı gerekmez</span></li>
                <li><span className="feature-icon feature-check">✓</span><span><strong>Basit uygulama</strong> — Tek döngü yeterlidir</span></li>
                <li><span className="feature-icon feature-x">✗</span><span><strong>Büyük dizilerde yavaş</strong> — n=1.000.000 için en kötü 1M karşılaştırma</span></li>
                <li><span className="feature-icon feature-x">✗</span><span><strong>Tekrarlı aramalarda verimsiz</strong> — Her sorguda yeniden tarar</span></li>
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
                <div className="vs-row">
                  <div className="vs-cell">Dizi şartı</div>
                  <div className="vs-cell vs-pro">Sırasız olabilir</div>
                  <div className="vs-cell vs-con">Sıralı olmalı</div>
                </div>
                <div className="vs-row">
                  <div className="vs-cell">En kötü durum</div>
                  <div className="vs-cell vs-con">O(n)</div>
                  <div className="vs-cell vs-pro">O(log n)</div>
                </div>
                <div className="vs-row">
                  <div className="vs-cell">En iyi durum</div>
                  <div className="vs-cell vs-con">O(n)</div>
                  <div className="vs-cell vs-pro">O(1)</div>
                </div>
                <div className="vs-row">
                  <div className="vs-cell">Bellek</div>
                  <div className="vs-cell">O(1)</div>
                  <div className="vs-cell">O(1)</div>
                </div>
                <div className="vs-row">
                  <div className="vs-cell">Tüm eşleşmeler</div>
                  <div className="vs-cell vs-pro">Kolayca bulur</div>
                  <div className="vs-cell vs-con">Ekstra mantık gerekir</div>
                </div>
                <div className="vs-row">
                  <div className="vs-cell">Ne zaman kullan?</div>
                  <div className="vs-cell">Küçük/sırasız dizi</div>
                  <div className="vs-cell">Büyük sıralı dizi</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
