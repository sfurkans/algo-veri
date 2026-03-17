import { useState } from "react";
import { useQuickSort } from "../../visualizers/sorting/useQuickSort";
import CodePlayground from "../../components/CodePlayground";
import "../../components/CodePlayground.css";
import "./SortingPage.css";

/* ── Complexity badges ───────────────────────────────────────── */
const COMPLEXITY_DATA = [
  { label: "En İyi Durum",   value: "O(n log n)", color: "green"  },
  { label: "Ortalama Durum", value: "O(n log n)", color: "yellow" },
  { label: "En Kötü Durum",  value: "O(n²)",      color: "red"    },
  { label: "Bellek",         value: "O(log n)",    color: "blue"   },
];

/* ── Pseudocode ──────────────────────────────────────────────── */
const PSEUDOCODE_LINES = [
  { n: 1,  text: "quickSort(dizi, sol, sağ):" },
  { n: 2,  text: "  eğer sol ≥ sağ: döndür" },
  { n: 3,  text: "  p = bölme(dizi, sol, sağ)" },
  { n: 4,  text: "  quickSort(dizi, sol, p-1)" },
  { n: 5,  text: "  quickSort(dizi, p+1, sağ)" },
  { n: 6,  text: "──────────────────────────────────" },
  { n: 7,  text: "bölme(dizi, sol, sağ):" },
  { n: 8,  text: "  pivot = dizi[sağ]" },
  { n: 9,  text: "  i = sol - 1" },
  { n: 10, text: "  for j = sol to sağ-1:" },
  { n: 11, text: "    eğer dizi[j] ≤ pivot:" },
  { n: 12, text: "      i++" },
  { n: 13, text: "      takas(dizi[i], dizi[j])" },
  { n: 14, text: "  takas(dizi[i+1], dizi[sağ])" },
  { n: 15, text: "  döndür i+1" },
];

/* ── Playground ──────────────────────────────────────────────── */
const PLAYGROUND_ARRAY = [38, 27, 43, 3, 9, 82, 10, 1];

const QUICK_SORT_CODE = `// Hızlı Sıralama (Quick Sort) — Lomuto bölme şeması
// compare(i, j) → arr[i] > arr[j] ise pozitif döner
// swap(i, j)    → arr[i] ile arr[j] yer değiştirir

function partition(left, right) {
  let i = left - 1;
  for (let j = left; j < right; j++) {
    if (compare(j, right) <= 0) {
      i++;
      if (i !== j) swap(i, j);
    }
  }
  swap(i + 1, right);
  return i + 1;
}

function quickSort(left, right) {
  if (left >= right) return;
  const p = partition(left, right);
  quickSort(left, p - 1);
  quickSort(p + 1, right);
}

quickSort(0, arr.length - 1);`;

/* ── Preset generators ───────────────────────────────────────── */
const SIZE = 14;

function generateSortedArray(size) {
  return Array.from({ length: size }, (_, i) => 10 + Math.round((85 / (size - 1)) * i));
}

function generateReversedArray(size) {
  return generateSortedArray(size).reverse();
}

function generateNearlySortedArray(size) {
  const arr = generateSortedArray(size);
  [[1, 3], [5, 7], [9, 11]].forEach(([a, b]) => {
    if (b < size) [arr[a], arr[b]] = [arr[b], arr[a]];
  });
  return arr;
}

/* ── Bar state ───────────────────────────────────────────────── */
function getBarState(idx, step, isDone) {
  if (!step) return "default";
  const { partitionRange, boundary, scanning, pivotIdx, placed, swapping, sorted } = step;

  if (isDone || sorted?.includes(idx)) return "sorted";
  if (swapping?.includes(idx)) return "swapping";
  if (placed?.includes(idx)) return "placed";
  if (idx === pivotIdx && pivotIdx >= 0) return "pivot";
  if (idx === scanning && scanning >= 0) return "scanning";

  if (!partitionRange) return "default";
  const [left, right] = partitionRange;

  if (idx < left || idx > right) return "outside";
  if (boundary >= left && idx <= boundary) return "small";
  if (scanning >= 0 && idx > boundary && idx < scanning) return "large";
  return "unscanned";
}

/* ── PivotBox ────────────────────────────────────────────────── */
function PivotBox({ compareValues, compareOp }) {
  if (!compareValues) {
    return (
      <div className="pvt-box pvt-box-idle">
        <span className="pvt-idle-text">Pivot karşılaştırması bekleniyor…</span>
      </div>
    );
  }
  const isSmall = compareOp === "≤";
  return (
    <div className="pvt-box">
      <div className={`pvt-side pvt-side-scan ${isSmall ? "pvt-winner" : ""}`}>
        <span className="pvt-label">Eleman</span>
        <span className="pvt-val">{compareValues[0]}</span>
      </div>
      <div className="pvt-op">{compareOp}</div>
      <div className={`pvt-side pvt-side-pivot ${!isSmall ? "pvt-winner" : ""}`}>
        <span className="pvt-label">Pivot</span>
        <span className="pvt-val">{compareValues[1]}</span>
      </div>
    </div>
  );
}

/* ── PartitionStrip ──────────────────────────────────────────── */
function PartitionStrip({ step, isDone }) {
  if (isDone || !step?.partitionRange) {
    return (
      <div className="partition-strip-idle">
        <span className="ps-idle-text">Bölme başlayınca bölge dağılımı burada görünür</span>
      </div>
    );
  }

  const { array, partitionRange, boundary, scanning, pivotIdx } = step;
  const [left, right] = partitionRange;
  const pivotVal = array[pivotIdx];

  const smallCount = boundary >= left ? boundary - left + 1 : 0;
  const largeCount = scanning >= 0
    ? Math.max(0, scanning - 1 - boundary)
    : Math.max(0, pivotIdx - 1 - boundary);
  const unscanCount = scanning >= 0 ? Math.max(0, right - 1 - scanning) : 0;

  return (
    <div className="partition-strip">
      {smallCount > 0 && (
        <div className="ps-zone ps-zone-small" style={{ flex: smallCount }}>
          <span className="ps-lbl">≤ pivot</span>
          <span className="ps-cnt">{smallCount}</span>
        </div>
      )}
      {largeCount > 0 && (
        <div className="ps-zone ps-zone-large" style={{ flex: largeCount }}>
          <span className="ps-lbl">&gt; pivot</span>
          <span className="ps-cnt">{largeCount}</span>
        </div>
      )}
      {unscanCount > 0 && (
        <div className="ps-zone ps-zone-unscan" style={{ flex: unscanCount }}>
          <span className="ps-lbl">?</span>
          <span className="ps-cnt">{unscanCount}</span>
        </div>
      )}
      <div className="ps-zone ps-zone-pivot">
        <span className="ps-lbl">pivot</span>
        <span className="ps-cnt">{pivotVal}</span>
      </div>
    </div>
  );
}

/* ── PartitionChart ──────────────────────────────────────────── */
function PartitionChart({ completedPartitions }) {
  if (!completedPartitions?.length) {
    return <p className="chart-empty">Bölmeler tamamlandıkça grafik burada görünecek</p>;
  }
  const maxComp = Math.max(...completedPartitions.map(p => p.comparisons), 1);
  return (
    <div className="partition-chart">
      {completedPartitions.map((p, idx) => (
        <div
          key={idx}
          className="pchart-bar-wrap"
          title={`Bölme ${idx + 1}: ${p.comparisons} karşılaştırma`}
        >
          <div
            className="pchart-bar-fill"
            style={{ height: `${(p.comparisons / maxComp) * 100}%` }}
          />
        </div>
      ))}
    </div>
  );
}

/* ── RecursionTree ───────────────────────────────────────────── */
function buildNode(left, right, doneMap, activeRange) {
  if (left > right) return null;
  const key = `${left}-${right}`;
  const done = doneMap.get(key);
  const isActive = activeRange && activeRange[0] === left && activeRange[1] === right;

  if (left === right) {
    return { left, right, size: 1, pivotFinalIdx: left, status: "placed", children: [] };
  }
  if (!done) {
    return {
      left, right, size: right - left + 1,
      status: isActive ? "active" : "pending",
      pivotFinalIdx: null, children: [],
    };
  }
  const { pivotFinalIdx } = done;
  return {
    left, right, size: right - left + 1, status: "done", pivotFinalIdx,
    children: [
      buildNode(left, pivotFinalIdx - 1, doneMap, activeRange),
      buildNode(pivotFinalIdx + 1, right, doneMap, activeRange),
    ].filter(Boolean),
  };
}

function RecursionTree({ completedPartitions, current, n }) {
  const doneMap = new Map();
  (completedPartitions || []).forEach(p => doneMap.set(`${p.left}-${p.right}`, p));

  const activeRange = current?.partitionRange ?? null;
  const root = buildNode(0, n - 1, doneMap, activeRange);

  // BFS → levels
  const levels = [];
  let queue = [root];
  while (queue.length > 0) {
    levels.push(queue);
    const next = [];
    for (const node of queue) {
      if (node.status === "done") node.children.forEach(c => next.push(c));
    }
    queue = next;
  }

  function renderLevel(levelNodes) {
    const sorted = [...levelNodes].sort((a, b) => a.left - b.left);
    const items = [];
    let cursor = 0;

    for (const node of sorted) {
      for (let g = cursor; g < node.left; g++) {
        items.push(<div key={`g${g}`} className="rtree-gap" style={{ flex: 1 }} />);
      }
      const isActive = activeRange && activeRange[0] === node.left && activeRange[1] === node.right;
      const statusCls = isActive
        ? "rtree-active"
        : node.status === "placed"
        ? "rtree-placed"
        : node.status === "done"
        ? "rtree-done"
        : "rtree-pending";

      items.push(
        <div
          key={`${node.left}-${node.right}`}
          className={`rtree-block ${statusCls}`}
          style={{ flex: node.size }}
          title={`[${node.left}–${node.right}]`}
        >
          {node.status === "done" && node.pivotFinalIdx !== null && (
            <div
              className="rtree-pivot-mark"
              style={{ left: `${((node.pivotFinalIdx - node.left + 0.5) / node.size) * 100}%` }}
            />
          )}
        </div>
      );
      cursor = node.right + 1;
    }
    for (let g = cursor; g < n; g++) {
      items.push(<div key={`g${g}`} className="rtree-gap" style={{ flex: 1 }} />);
    }
    return items;
  }

  if (!root) return null;

  return (
    <div className="recursion-tree">
      {levels.map((levelNodes, depth) => (
        <div key={depth} className="rtree-level">
          <span className="rtree-depth-label">d{depth}</span>
          <div className="rtree-row">{renderLevel(levelNodes)}</div>
        </div>
      ))}
      <div className="rtree-legend">
        <span className="rtree-leg rtree-leg-active">Aktif bölme</span>
        <span className="rtree-leg rtree-leg-done">Pivotu yerleşti</span>
        <span className="rtree-leg rtree-leg-pending">Bekleyen</span>
        <span className="rtree-leg rtree-leg-placed">Tek eleman</span>
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────── */
export default function QuickSort() {
  const {
    array, current, stepIndex, totalSteps,
    isPlaying, isDone, speed, setSpeed,
    reset, resetWith, togglePlay, stepForward, stepBackward,
  } = useQuickSort(SIZE);

  const [activePreset, setActivePreset] = useState("random");

  function handlePreset(key) {
    setActivePreset(key);
    if (key === "random")   reset();
    if (key === "sorted")   resetWith(generateSortedArray(SIZE));
    if (key === "reversed") resetWith(generateReversedArray(SIZE));
    if (key === "nearly")   resetWith(generateNearlySortedArray(SIZE));
  }

  const displayArray = current?.array ?? array;
  const maxVal = Math.max(...displayArray, 1);

  return (
    <div className="sorting-page">
      <div className="page-container">

        {/* ── Header ── */}
        <div className="page-header">
          <div>
            <div className="page-tag">Sıralama Algoritması</div>
            <h1 className="page-title">Hızlı Sıralama</h1>
            <p className="page-subtitle">
              Pivot seç, küçükleri sola büyükleri sağa böl — pratikte en hızlı sıralama algoritması.
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

          {/* ── Sol: Görselleştirici ── */}
          <div className="visualizer-col">

            {/* Bars */}
            <div className="bars-container">
              {displayArray.map((val, idx) => {
                const state = getBarState(idx, current, isDone);
                return (
                  <div key={idx} className="bar-wrapper">
                    <div
                      className={`bar-fill bar-${state}`}
                      style={{ height: `${(val / maxVal) * 100}%` }}
                    />
                    <div className="bar-label">{val}</div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="legend">
              <div className="legend-item"><div className="legend-dot dot-pivot" />Pivot</div>
              <div className="legend-item"><div className="legend-dot dot-scanning" />Taranan</div>
              <div className="legend-item"><div className="legend-dot dot-small" />≤ pivot</div>
              <div className="legend-item"><div className="legend-dot dot-large" />&gt; pivot</div>
              <div className="legend-item"><div className="legend-dot dot-swapping" />Yer değiştiriyor</div>
              <div className="legend-item"><div className="legend-dot dot-placed" />Yerleşti (kalıcı)</div>
            </div>

            {/* Controls */}
            <div className="controls">
              <div className="ctrl-group">
                <button className="ctrl-btn ctrl-icon" onClick={stepBackward} disabled={!current || stepIndex <= 0}>◀◀</button>
                <button className={`ctrl-btn ctrl-play ${isPlaying ? "is-playing" : ""}`} onClick={togglePlay}>
                  {isPlaying ? "⏸ Durdur" : isDone ? "↺ Yeniden" : "▶ Oynat"}
                </button>
                <button className="ctrl-btn ctrl-icon" onClick={stepForward} disabled={isDone}>▶▶</button>
              </div>
              <div className="ctrl-group">
                <span className="speed-label">Hız</span>
                {[600, 300, 150, 60].map(ms => (
                  <button
                    key={ms}
                    className={`ctrl-btn ctrl-secondary ${speed === ms ? "speed-active" : ""}`}
                    onClick={() => setSpeed(ms)}
                  >
                    {ms === 600 ? "×1" : ms === 300 ? "×2" : ms === 150 ? "×4" : "×8"}
                  </button>
                ))}
              </div>
              <button className="ctrl-btn ctrl-secondary" onClick={() => handlePreset("random")}>↺ Yenile</button>
            </div>

            {/* Meta row */}
            <div className="meta-row">
              <div className="meta-left">
                <div className="meta-pill pill-round">
                  {current
                    ? `Derinlik ${current.depth} · Bölme ${current.completedPartitions?.length ?? 0}`
                    : "Derinlik — · Bölme —"}
                </div>
                <div className="meta-counters">
                  <div className="counter">
                    <span className="counter-icon">⇄</span>
                    <span className="counter-val">{current?.comparisons ?? 0}</span>
                    <span className="counter-label">Karşılaştırma</span>
                  </div>
                  <div className="counter">
                    <span className="counter-icon">⇌</span>
                    <span className="counter-val">{current?.swaps ?? 0}</span>
                    <span className="counter-label">Takas</span>
                  </div>
                </div>
              </div>
              <div className="step-progress">{stepIndex + 1} / {totalSteps}</div>
            </div>

            {/* Preset bar */}
            <div className="preset-bar">
              <span className="preset-label">Senaryo</span>
              <div className="preset-group">
                {[
                  { key: "random",   label: "Rastgele",      tooltip: "Ortalama durum — dengeli bölünme" },
                  { key: "sorted",   label: "Sıralı ↑",      tooltip: "⚠ En kötü durum! O(n²) — her pivot en büyük" },
                  { key: "reversed", label: "Ters Sıralı ↓", tooltip: "⚠ En kötü durum! O(n²) — her pivot en küçük" },
                  { key: "nearly",   label: "Az Karışık ≈",  tooltip: "Neredeyse sıralı — yine O(n²)'ye yakın" },
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

            {/* PivotBox */}
            <PivotBox compareValues={current?.compareValues} compareOp={current?.compareOp} />

            {/* Step explanation */}
            <div className={`step-explanation ${isDone ? "step-done" : current ? "step-active" : "step-idle"}`}>
              <div className="step-main">
                {current ? current.description : "▶ Play'e bas veya adım adım ilerle"}
              </div>
              {current?.detail && <div className="step-detail">{current.detail}</div>}
            </div>

            <div className="section-divider">Bölme Şeridi</div>

            <PartitionStrip step={current} isDone={isDone} />

            <div className="section-divider">Özyineleme Ağacı</div>

            <div className="info-card">
              <h3 className="info-card-title">Bölünme Derinliği</h3>
              <RecursionTree
                completedPartitions={current?.completedPartitions ?? []}
                current={current}
                n={array.length}
              />
              <p className="chart-desc">
                Her satır bir özyineleme derinliğini gösterir. Turuncu çizgi aktif bölmeyi,
                mavi bloklar pivotu kalıcı yerine oturtulmuş aralıkları, gri bloklar
                henüz işlenmeyen aralıkları temsil eder.
                <br />
                <strong>Rastgele</strong> girdide ağaç dengeli ve kısa — <strong>Sıralı ↑</strong>
                seçince n uzunluğunda zincire dönüştüğünü gör.
              </p>
            </div>

            <div className="section-divider">Bölme Geçmişi</div>

            <div className="info-card">
              <h3 className="info-card-title">Bölme Başına Karşılaştırma</h3>
              <PartitionChart completedPartitions={current?.completedPartitions ?? []} />
              <p className="chart-desc">
                Her çubuk bir bölme işlemini temsil eder.
                <br />
                <strong>Rastgele</strong> girdide çubuklar küçük ve dengeli —
                <strong> Sıralı ↑</strong> seçince n-1, n-2, n-3... azalan büyük çubuklar oluşur.
                Bu O(n²) paterninin görsel kanıtıdır.
              </p>
            </div>

            <div className="section-divider">Kendi Kodunu Dene</div>

            <CodePlayground
              initialArray={PLAYGROUND_ARRAY}
              defaultCode={QUICK_SORT_CODE}
              subtitle={
                <>
                  Hazır gelen Lomuto şemalı Quick Sort'u incele ya da kendi pivot stratejini yaz.{" "}
                  <strong>compare(j, pivot)</strong> ile elemanı pivotla karşılaştır,{" "}
                  <strong>swap(i, j)</strong> ile takas et.{" "}
                  İstersen Hoare şemasını veya farklı pivot seçimini deneyebilirsin.{" "}
                  <strong>Çalıştır</strong>'a bastığında her bölme adımı görselleştirilir.
                </>
              }
            />
          </div>

          {/* ── Sağ: Bilgi paneli ── */}
          <div className="info-section">

            <div className="info-card">
              <h3 className="info-card-title">Nasıl Çalışır?</h3>
              <ol className="how-list">
                <li>Son elemanı <strong>pivot</strong> olarak seç</li>
                <li>i = sol−1 (sol bölgenin sağ sınırı başlangıçta boş)</li>
                <li>j sol'dan sağ−1'e tara: her elemanı pivotla karşılaştır</li>
                <li>eleman ≤ pivot ise i++ ve arr[i] ile arr[j]'yi yer değiştir</li>
                <li>Tarama bitince pivot'u i+1. konuma taşı — pivot <strong>kalıcı yerine</strong> oturdu</li>
                <li>Sol [sol, p−1] ve sağ [p+1, sağ] alt dizileri özyinelemeli sırala</li>
              </ol>
            </div>

            <div className="section-divider">Kod</div>

            <div className="info-card">
              <h3 className="info-card-title">Pseudocode</h3>
              <div className="pseudocode">
                {(() => {
                  let lineNum = 0;
                  return PSEUDOCODE_LINES.map(({ n, text }) => {
                    const isSep = n === 6;
                    if (!isSep) lineNum++;
                    return (
                      <div
                        key={n}
                        className={`pseudo-line ${isSep ? "pseudo-separator" : ""} ${current?.activeLine === n ? "pseudo-active" : ""}`}
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
                  <div className="complexity-row-badge badge-green">En İyi / Ortalama — O(n log n)</div>
                  <p className="complexity-row-desc">
                    Pivot her seferinde diziyi yaklaşık ikiye böldüğünde log₂n derinlikte
                    özyineleme oluşur, her derinlikte toplam n karşılaştırma yapılır.
                    Rastgele girdide bu durum büyük olasılıkla gerçekleşir. Önbellek dostu
                    ardışık bellek erişimi sayesinde pratikte <strong>Merge Sort'tan genellikle daha hızlıdır</strong>.
                  </p>
                </div>
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-red">En Kötü Durum — O(n²)</div>
                  <p className="complexity-row-desc">
                    Pivot her seferinde en küçük veya en büyük eleman olursa bölünme tamamen
                    dengesizdir: bir taraf n-1, diğer taraf 0 eleman alır.
                    <strong> Sıralı ↑ preset</strong>'ini dene — grafikte azalan merdiven paternini ve
                    91 karşılaştırmayı bizzat göreceksin.
                  </p>
                </div>
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-blue">Bellek — O(log n)</div>
                  <p className="complexity-row-desc">
                    Merge Sort'un aksine ekstra dizi gerekmez — yerinde (in-place) sıralar.
                    Yalnızca özyinelemeli çağrı yığını O(log n) yer kullanır.
                    En kötü durumda yığın O(n)'e çıkabilir.
                  </p>
                </div>
              </div>
            </div>

            <div className="section-divider">Pivot Seçimi</div>

            <div className="info-card">
              <h3 className="info-card-title">Pivot Seçimi Sorunu</h3>
              <p className="info-card-desc">
                Quick Sort'un performansı tamamen pivot seçimine bağlıdır.
              </p>
              <div className="pivot-table">
                <div className="pivot-row pivot-header">
                  <span>Strateji</span>
                  <span>Avantaj</span>
                  <span>Risk</span>
                </div>
                <div className="pivot-row">
                  <span>Son eleman <span className="pivot-tag">bizim</span></span>
                  <span className="prow-pro">Basit</span>
                  <span className="prow-con">Sıralı → O(n²)</span>
                </div>
                <div className="pivot-row">
                  <span>Rastgele</span>
                  <span className="prow-pro">O(n²) yok</span>
                  <span className="prow-con">Tahmin edilemez</span>
                </div>
                <div className="pivot-row">
                  <span>Ortanca-3</span>
                  <span className="prow-pro">Dengeli bölünme</span>
                  <span className="prow-con">Ek karşılaştırma</span>
                </div>
                <div className="pivot-row">
                  <span>İntrosort <span className="pivot-tag pivot-tag-real">gerçek</span></span>
                  <span className="prow-pro">Her zaman hızlı</span>
                  <span className="prow-con">Karmaşık</span>
                </div>
              </div>
              <p className="scenario-note">
                <strong>Gerçek dünyada:</strong> GCC/Clang <code>std::sort()</code> ve Rust
                standart kütüphanesi <strong>introsort</strong> kullanır: derinlik artınca
                Quick Sort'tan Heap Sort'a geçer, küçük dizilerde Insertion Sort kullanır.
              </p>
            </div>

            <div className="section-divider">Senaryo Karşılaştırması</div>

            <div className="info-card">
              <h3 className="info-card-title">Girdiye Göre Davranış (n = 14, son eleman pivot)</h3>
              <div className="scenario-table">
                <div className="scenario-header">
                  <span>Senaryo</span>
                  <span>Karşılaştırma</span>
                  <span>Takas</span>
                </div>
                <div className="scenario-row">
                  <span>Rastgele</span>
                  <span>~35–55</span>
                  <span>~10–25</span>
                </div>
                <div className="scenario-row">
                  <span>Sıralı ↑ ⚠</span>
                  <span>91 (n²/2)</span>
                  <span>13</span>
                </div>
                <div className="scenario-row">
                  <span>Ters Sıralı ↓ ⚠</span>
                  <span>91 (n²/2)</span>
                  <span>0</span>
                </div>
              </div>
              <p className="scenario-note">
                Sıralı girdide son eleman her seferinde en büyük pivot olur — bölünme tamamen dengesiz.
                Merge Sort aynı n=14 için her zaman ~47 karşılaştırma yapar.
              </p>
            </div>

            <div className="section-divider">Özellikler</div>

            <div className="info-card">
              <h3 className="info-card-title">Özellikler</h3>
              <ul className="feature-list">
                <li><span className="feature-icon feature-check">✓</span>Yerinde sıralama — O(1) ekstra bellek (yığın hariç)</li>
                <li><span className="feature-icon feature-check">✓</span>Önbellek dostu — ardışık bellek erişimi</li>
                <li><span className="feature-icon feature-check">✓</span>Pratikte Merge Sort'tan sık sık daha hızlı</li>
                <li><span className="feature-icon feature-check">✓</span>Her pivot kalıcı konumuna oturur</li>
                <li><span className="feature-icon feature-x">✗</span>Kararsız (unstable) — eşit elemanların sırası bozulabilir</li>
                <li><span className="feature-icon feature-x">✗</span>Kötü pivot seçiminde O(n²) en kötü durum</li>
              </ul>
            </div>

            <div className="section-divider">Analiz</div>

            <div className="info-card">
              <h3 className="info-card-title">Sayaçlar Ne Söyler?</h3>
              <div className="metric-block">
                <div>
                  <div className="metric-name">Karşılaştırma Sayısı</div>
                  <p className="metric-desc">
                    Her bölmede partition aralığındaki tüm elemanlar pivotla karşılaştırılır.
                    Dengeli bölünme → ~35–55. Sıralı giriş → 91 (n²/2).
                  </p>
                </div>
                <div>
                  <div className="metric-name">Takas Sayısı</div>
                  <p className="metric-desc">
                    Yalnızca pivottan küçük elemanlar yer değiştirir. Ters sıralı girdide
                    hiçbir eleman ≤ pivot olmadığından takas 0'a düşer —
                    ama karşılaştırma yine de 91 yapılır.
                  </p>
                </div>
              </div>
              <div className="metric-insight">
                <div className="insight-row">
                  <span className="insight-label">Karşılaştırma ~35–55</span>
                  <span className="insight-tag tag-green">Dengeli — O(n log n)</span>
                </div>
                <div className="insight-row">
                  <span className="insight-label">Karşılaştırma = 91</span>
                  <span className="insight-tag tag-red">Sıralı/ters sıralı — O(n²)</span>
                </div>
                <div className="insight-row">
                  <span className="insight-label">Takas = 0</span>
                  <span className="insight-tag tag-yellow">Ters sıralı — yine de O(n²)</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
