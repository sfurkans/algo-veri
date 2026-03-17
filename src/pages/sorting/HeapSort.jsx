import { useState } from "react";
import { useHeapSort, HEAPSORT_PRESETS } from "../../visualizers/sorting/useHeapSort";
import "./SortingPage.css";
import "../data-structures/DataStructuresPage.css";
import "./HeapSort.css";

const NODE_R = 17;

/* ── Pseudocode ───────────────────────────────────────────────────────────── */
const PSEUDO = [
  { text: "HeapSort(A, n):", header: true },          // 0
  { text: "  // Aşama 1: Max Heap oluştur" },         // 1
  { text: "  for i = ⌊n/2⌋-1 downto 0:" },           // 2
  { text: "    siftDown(A, i, n)" },                   // 3
  { sep: true },                                       // 4
  { text: "  // Aşama 2: Sıralama" },                 // 5
  { text: "  for i = n-1 downto 1:" },                // 6
  { text: "    takas(A[0], A[i])" },                   // 7
  { text: "    siftDown(A, 0, i)" },                   // 8
  { sep: true },                                       // 9
  { text: "siftDown(A, kök, boyut):", header: true },  // 10
  { text: "  en_büyük ← kök" },                       // 11
  { text: "  if sol < boyut ∧ A[sol] > A[en_büyük]: en_büyük ← sol" }, // 12
  { text: "  if sağ < boyut ∧ A[sağ] > A[en_büyük]: en_büyük ← sağ" }, // 13
  { text: "  if en_büyük ≠ kök:" },                   // 14
  { text: "    takas(A[kök], A[en_büyük])" },          // 15
  { text: "    siftDown(A, en_büyük, boyut)" },        // 16
];

const LINE_MAP = {
  0:  1,   // "// Aşama 1"
  1:  2,   // for i = ⌊n/2⌋-1
  3:  3,   // siftDown call (build)
  4:  11,  // siftDown içi: en_büyük ← kök + karşılaştırma (her iki aşama)
  5:  15,  // siftDown içi: takas (her iki aşama)
  6:  3,   // heap hazır
  7:  5,   // "// Aşama 2"
  8:  7,   // takas(A[0], A[i])
  9:  6,   // for i = n-1
  10: 8,   // siftDown(A, 0, i) çağrısı
  11: 8,   // done
};

/* ── Ağaç düğüm konumu ────────────────────────────────────────────────────── */
function treePos(idx, n) {
  const level       = Math.floor(Math.log2(idx + 1));
  const maxLevel    = n > 1 ? Math.floor(Math.log2(n)) : 0;
  const levelStart  = (1 << level) - 1;
  const posInLevel  = idx - levelStart;
  const nodesAtLevel       = 1 << level;
  const maxNodesAtBottom   = 1 << maxLevel;
  const svgW   = 560;
  const padX   = 18;
  const slotW  = (svgW - padX * 2) / maxNodesAtBottom;
  const slotsPerNode = maxNodesAtBottom / nodesAtLevel;
  const x = padX + slotW * (posInLevel * slotsPerNode + slotsPerNode / 2);
  const y = 36 + level * 68;
  return { x, y };
}

/* ── Op Banner ────────────────────────────────────────────────────────────── */
function OpBanner({ current }) {
  if (!current) return null;
  const { phase, description, detail } = current;

  const isSwap     = description?.includes("↔");
  const isSettle   = description?.includes("yerine oturdu");
  const isInPlace  = description?.includes("yerinde");
  const isDone     = phase === "done";
  const isHeapDone = description?.includes("Max Heap hazır");
  const isCompare  = description?.includes("karşılaştırılıyor");
  const isSortStart = description?.includes("Sıralama aşaması");

  const cls = isDone       ? "hs-banner-done"
            : isSettle     ? "hs-banner-settle"
            : isSwap       ? "hs-banner-swap"
            : isHeapDone   ? "hs-banner-heapdone"
            : isInPlace    ? "hs-banner-inplace"
            : isCompare    ? "hs-banner-check"
            : isSortStart  ? "hs-banner-sortstart"
            : "hs-banner-idle";

  const icon = isDone      ? "✓"
             : isSettle    ? "✓"
             : isSwap      ? "↕"
             : isHeapDone  ? "✓"
             : isInPlace   ? "="
             : isCompare   ? "?"
             : isSortStart ? "▼"
             : "●";

  return (
    <div className={`hs-banner ${cls}`}>
      <span className="hs-banner-icon">{icon}</span>
      <div className="hs-banner-body">
        <div className="hs-banner-op">{description}</div>
        {detail && <div className="hs-banner-sub">{detail}</div>}
      </div>
    </div>
  );
}

/* ── Aşama Göstergesi ─────────────────────────────────────────────────────── */
function PhaseIndicator({ phase, heapSize, totalSize }) {
  const isBuild = phase === "build";
  const isSort  = phase === "sort";
  const isDone  = phase === "done";
  return (
    <div className="hs-phases">
      <div className={`hs-phase ${isBuild ? "hs-phase-active-build" : (isSort || isDone) ? "hs-phase-done" : ""}`}>
        <span className="hs-phase-num">{isSort || isDone ? "✓" : "1"}</span>
        <span>Max Heap Oluştur</span>
      </div>
      <div className="hs-phase-arrow">→</div>
      <div className={`hs-phase ${isSort ? "hs-phase-active-sort" : isDone ? "hs-phase-done" : "hs-phase-inactive"}`}>
        <span className="hs-phase-num">{isDone ? "✓" : "2"}</span>
        <span>Sırala</span>
      </div>
      {(isSort || isDone) && (
        <div className="hs-heapsize-badge">
          <span className="hs-heapsize-label">Heap</span>
          <span className="hs-heapsize-val">{heapSize}/{totalSize}</span>
        </div>
      )}
    </div>
  );
}

/* ── Heap Ağacı SVG ───────────────────────────────────────────────────────── */
const NODE_COLORS = {
  default:   { fill: "#f8fafc", stroke: "#94a3b8" },
  active:    { fill: "#fef3c7", stroke: "#f59e0b" },
  comparing: { fill: "#fff7ed", stroke: "#fb923c" },
  swapped:   { fill: "#fde68a", stroke: "#d97706" },
  sorted:    { fill: "#dcfce7", stroke: "#22c55e" },
};

function HeapTreeSVG({ array, current }) {
  const n          = array.length;
  const nodeStates = current?.nodeStates ?? new Array(n).fill("default");
  const heapSize   = current?.heapSize  ?? n;
  const maxLevel   = n > 1 ? Math.floor(Math.log2(n)) : 0;
  const svgH       = 36 + maxLevel * 68 + 40;

  return (
    <div className="hs-tree-wrap">
      <svg
        viewBox={`0 0 596 ${svgH}`}
        className="hs-tree-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Kenarlar */}
        {array.map((_, i) => {
          if (i === 0) return null;
          const parent = Math.floor((i - 1) / 2);
          const pos    = treePos(i, n);
          const pPos   = treePos(parent, n);
          const inHeap = i < heapSize;
          return (
            <line
              key={`e${i}`}
              x1={pPos.x} y1={pPos.y}
              x2={pos.x}  y2={pos.y}
              stroke={inHeap ? "#cbd5e1" : "#e2e8f0"}
              strokeWidth={inHeap ? 2 : 1}
              strokeDasharray={inHeap ? undefined : "4 3"}
            />
          );
        })}

        {/* Düğümler */}
        {array.map((val, i) => {
          const pos     = treePos(i, n);
          const state   = nodeStates[i] ?? "default";
          const colors  = NODE_COLORS[state] ?? NODE_COLORS.default;
          const inHeap  = i < heapSize;
          const isActive = state !== "default";
          return (
            <g key={`n${i}`} opacity={inHeap ? 1 : 0.75}>
              <circle
                cx={pos.x} cy={pos.y} r={NODE_R}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth={isActive ? 2.5 : 1.5}
                style={{ transition: "fill 0.2s, stroke 0.2s" }}
              />
              {/* Değer */}
              <text
                x={pos.x} y={pos.y}
                textAnchor="middle" dominantBaseline="middle"
                className="hs-node-val"
              >
                {val}
              </text>
              {/* İndeks */}
              <text
                x={pos.x} y={pos.y + NODE_R + 9}
                textAnchor="middle"
                className="hs-node-idx"
              >
                [{i}]
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Bar Grafiği ──────────────────────────────────────────────────────────── */
const BAR_COLOR = {
  default:   "#94a3b8",
  active:    "#f59e0b",
  comparing: "#fb923c",
  swapped:   "#d97706",
  sorted:    "#22c55e",
};

function BarChart({ array, current }) {
  const n          = array.length;
  const nodeStates = current?.nodeStates ?? new Array(n).fill("default");
  const heapSize   = current?.heapSize  ?? n;
  const max        = Math.max(...array);

  return (
    <div className="hs-bars-wrap">
      {array.map((val, i) => {
        const state = nodeStates[i] ?? "default";
        const color = BAR_COLOR[state] ?? BAR_COLOR.default;
        const inHeap = i < heapSize;
        return (
          <div key={i} className={`hs-bar-col ${!inHeap ? "hs-bar-out" : ""}`}>
            <div
              className="hs-bar"
              style={{
                height: `${(val / max) * 100}%`,
                background: color,
                opacity: inHeap ? 1 : 0.85,
                transition: "height 0.15s, background 0.2s",
              }}
            />
            <span className="hs-bar-val">{val}</span>
            <span className="hs-bar-idx">[{i}]</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Renk Açıklaması ──────────────────────────────────────────────────────── */
function Legend() {
  const items = [
    { cls: "hleg-default",   label: "Normal" },
    { cls: "hleg-active",    label: "İnceleniyor" },
    { cls: "hleg-comparing", label: "Karşılaştırılıyor" },
    { cls: "hleg-swapped",   label: "Takas" },
    { cls: "hleg-sorted",    label: "Yerleşti" },
  ];
  return (
    <div className="hs-legend">
      {items.map((item) => (
        <div key={item.cls} className="hs-legend-item">
          <span className={`hs-legend-dot ${item.cls}`} />
          <span className="hs-legend-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Accordion ────────────────────────────────────────────────────────────── */
function AccordionSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`hs-accordion ${open ? "hs-acc-open" : ""}`}>
      <button className="hs-acc-header" onClick={() => setOpen((v) => !v)}>
        <span className="hs-acc-title">{title}</span>
        <svg className="hs-acc-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="hs-acc-body">{children}</div>}
    </div>
  );
}

/* ── Ana Bileşen ──────────────────────────────────────────────────────────── */
export default function HeapSort() {
  const {
    array,
    current, stepIndex, totalSteps, isDone,
    isPlaying, speed, setSpeed,
    activePreset, loadPreset,
    togglePlay, stepForward, stepBackward,
  } = useHeapSort();

  const activePseudoLine = current?.activeLine != null
    ? LINE_MAP[current.activeLine] ?? null
    : null;

  return (
    <div className="sorting-page">
      <div className="page-container">

        {/* ── Header ── */}
        <div className="page-header">
          <div>
            <div className="page-tag">Sıralama Algoritması</div>
            <h1 className="page-title">Heap Sort</h1>
            <p className="page-subtitle">
              Max-heap veri yapısını kullanarak diziyi yerinde, O(n log n) garantisiyle sıralar.
              İki aşamadan oluşur: heap oluşturma ve ardışık maksimum çıkarma.
            </p>
          </div>
        </div>

        <div className="page-body">

          {/* ══════════ SOL: Görselleştirici ══════════ */}
          <div className="visualizer-col">

            <OpBanner current={current} />

            <PhaseIndicator
              phase={current?.phase}
              heapSize={current?.heapSize ?? array.length}
              totalSize={array.length}
            />

            {/* Heap Ağacı */}
            <HeapTreeSVG array={array} current={current} />

            {/* Bar Grafiği */}
            <BarChart array={array} current={current} />

            <Legend />

            {/* İlerleme */}
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${totalSteps > 1 ? (stepIndex / (totalSteps - 1)) * 100 : 0}%` }}
              />
            </div>

            {/* Kontroller */}
            <div className="controls">
              <div className="ctrl-group">
                <button className="ctrl-btn ctrl-icon" onClick={stepBackward} disabled={stepIndex <= 0}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/>
                  </svg>
                </button>
                <button className={`ctrl-btn ctrl-play ${isPlaying ? "is-playing" : ""}`} onClick={togglePlay}>
                  {isPlaying ? (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                    </svg>
                  ) : isDone ? (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
                    </svg>
                  ) : (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  )}
                </button>
                <button className="ctrl-btn ctrl-icon" onClick={stepForward} disabled={isDone}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>
                  </svg>
                </button>
              </div>
              <div className="speed-control">
                <span className="speed-label">🐢</span>
                <input
                  type="range" min="100" max="900" step="100"
                  value={900 - speed + 100}
                  onChange={(e) => setSpeed(900 - Number(e.target.value) + 100)}
                  className="speed-slider"
                />
                <span className="speed-label">🐇</span>
              </div>
            </div>

            <div className="meta-row">
              <div className="step-progress">{stepIndex + 1} / {totalSteps}</div>
            </div>

            {/* Preset Seçici */}
            <div className="preset-bar">
              <span className="preset-label">Senaryo</span>
              <div className="preset-group">
                {Object.entries(HEAPSORT_PRESETS).map(([key, p]) => (
                  <button
                    key={key}
                    className={`preset-btn ${activePreset === key ? "preset-active" : ""}`}
                    onClick={() => loadPreset(key)}
                    data-tooltip={p.tooltip}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* ══════════ SAĞ: Bilgi Paneli ══════════ */}
          <div className="info-section">

            <AccordionSection title="Nasıl Çalışır?" defaultOpen={true}>
              <ol className="hs-how-list">
                <li>
                  <strong>Max Heap Oluştur:</strong> Dizinin ortasındaki son yaprak-olmayan
                  düğümden başlayarak geriye doğru her düğüme <em>siftDown</em> uygulanır.
                  Sonuçta kök, dizinin en büyük elemanını tutar.
                </li>
                <li>
                  <strong>Maksimumu Çıkar:</strong> Kök (en büyük) ile dizinin son elemanı takas edilir.
                  Son eleman artık sıralı bölgede — bir daha dokunulmaz.
                </li>
                <li>
                  <strong>Heap'i Küçült:</strong> Heap boyutu 1 azaltılır; takas edilen eleman
                  heap dışına alınmış olur.
                </li>
                <li>
                  <strong>SiftDown:</strong> Yeni kök, iki çocuğundan büyük değilse
                  en büyük çocukla takas edilerek doğru yerine iner. Bu işlem
                  heap özelliği yeniden sağlanana kadar devam eder.
                </li>
                <li>
                  <strong>Tekrarla:</strong> Heap boşalana kadar 2–4. adımlar yinelenir.
                  Her turda bir eleman daha sıralı bölgeye eklenir.
                </li>
              </ol>
            </AccordionSection>

            <AccordionSection title="Pseudocode" defaultOpen={true}>
              <div className="pseudocode">
                {(() => {
                  let lineNum = 0;
                  return PSEUDO.map((p, i) => {
                    if (p.sep) return <div key={i} className="pseudo-line pseudo-separator" />;
                    if (!p.header) lineNum++;
                    const isActive = activePseudoLine === i;
                    return (
                      <div key={i} className={`pseudo-line ${p.header ? "pseudo-header-line" : ""} ${isActive ? "pseudo-active" : ""}`}>
                        {!p.header && <span className="pseudo-num">{lineNum}</span>}
                        <span className="pseudo-text" style={{ paddingLeft: p.header ? 0 : undefined }}>
                          {p.text}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            </AccordionSection>

            <AccordionSection title="Heap Özelliği" defaultOpen={true}>
              <p className="hs-prop-intro">
                Bir <strong>max-heap</strong>'te her düğümün değeri kendi çocuklarının
                değerinden büyük ya da eşittir. Dizi indekslerini kullanarak heap
                ilişkileri şu formüllerle ifade edilir:
              </p>
              <div className="hs-formulas">
                <div className="hs-formula-row">
                  <span className="hs-formula-label">Ebeveyn</span>
                  <code className="hs-formula-code">⌊(i − 1) / 2⌋</code>
                </div>
                <div className="hs-formula-row">
                  <span className="hs-formula-label">Sol çocuk</span>
                  <code className="hs-formula-code">2·i + 1</code>
                </div>
                <div className="hs-formula-row">
                  <span className="hs-formula-label">Sağ çocuk</span>
                  <code className="hs-formula-code">2·i + 2</code>
                </div>
              </div>
              <p className="hs-prop-note">
                Ağaç yapısı hiçbir zaman bellekte ayrı saklanmaz — bu indeks
                formülleri sayesinde dizi doğrudan heap olarak kullanılır.
              </p>
            </AccordionSection>

            <AccordionSection title="Karmaşıklık Analizi" defaultOpen={true}>
              <div className="hs-cmplx-grid">
                <div className="hs-cmplx-cell cmplx-build">
                  <span className="hs-cmplx-op">Heap Oluşturma</span>
                  <span className="hs-cmplx-val">O(n)</span>
                  <span className="hs-cmplx-sub">amortize analiz</span>
                </div>
                <div className="hs-cmplx-cell cmplx-sort">
                  <span className="hs-cmplx-op">Sıralama</span>
                  <span className="hs-cmplx-val">O(n log n)</span>
                  <span className="hs-cmplx-sub">n kez extractMax</span>
                </div>
                <div className="hs-cmplx-cell cmplx-total">
                  <span className="hs-cmplx-op">Toplam</span>
                  <span className="hs-cmplx-val">O(n log n)</span>
                  <span className="hs-cmplx-sub">en iyi · ortalama · en kötü</span>
                </div>
                <div className="hs-cmplx-cell cmplx-space">
                  <span className="hs-cmplx-op">Alan</span>
                  <span className="hs-cmplx-val">O(1)</span>
                  <span className="hs-cmplx-sub">yerinde sıralama</span>
                </div>
              </div>
              <div className="hs-on-box">
                <div className="hs-on-title">Neden heap oluşturma O(n)?</div>
                <p className="hs-on-body">
                  İlk bakışta <em>n/2 düğüm × O(log n)</em> = O(n log n) gibi görünür.
                  Ancak ağacın alt seviyelerindeki düğümler çok az iş yapar —
                  yapraklar hiç, bir üst seviye en fazla 1 adım, iki üst seviye en
                  fazla 2 adım iner. Bu yükseklik-ağırlıklı toplamın kapalı formu
                  <strong>O(n)</strong>'e eşittir.
                </p>
              </div>
              <div className="complexity-list" style={{ marginTop: 12 }}>
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-green">Güçlü yön</div>
                  <p className="complexity-row-desc">
                    Her durumda (en iyi, ortalama, en kötü) O(n log n) garanti eder.
                    Quick Sort'un aksine kötü durum yoktur.
                  </p>
                </div>
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-yellow">Zayıf yön</div>
                  <p className="complexity-row-desc">
                    Cache dostu değildir: bellek erişimleri ağaç boyunca atlar.
                    Bu yüzden Quick Sort pratikte genellikle daha hızlıdır.
                  </p>
                </div>
              </div>
            </AccordionSection>

            <AccordionSection title="Heap Sort vs Diğerleri">
              <div className="scenario-table">
                <div className="scenario-header">
                  <span>Özellik</span>
                  <span>Heap Sort</span>
                  <span>Quick Sort</span>
                  <span style={{ fontSize: "0.75rem" }}>Merge Sort</span>
                </div>
                <div className="scenario-row">
                  <span>Ortalama</span>
                  <span className="scenario-val">O(n log n)</span>
                  <span className="scenario-val good">O(n log n)</span>
                  <span className="scenario-val">O(n log n)</span>
                </div>
                <div className="scenario-row">
                  <span>En kötü</span>
                  <span className="scenario-val good">O(n log n) ✓</span>
                  <span className="scenario-val">O(n²) ✗</span>
                  <span className="scenario-val good">O(n log n) ✓</span>
                </div>
                <div className="scenario-row">
                  <span>Alan</span>
                  <span className="scenario-val good">O(1) ✓</span>
                  <span className="scenario-val">O(log n)</span>
                  <span className="scenario-val">O(n) ✗</span>
                </div>
                <div className="scenario-row">
                  <span>Kararlı mı?</span>
                  <span className="scenario-val">Hayır ✗</span>
                  <span className="scenario-val">Hayır ✗</span>
                  <span className="scenario-val good">Evet ✓</span>
                </div>
                <div className="scenario-row">
                  <span>Cache</span>
                  <span className="scenario-val">Zayıf ✗</span>
                  <span className="scenario-val good">İyi ✓</span>
                  <span className="scenario-val">Orta</span>
                </div>
              </div>
              <p className="scenario-note" style={{ marginTop: 8 }}>
                Heap Sort, <strong>sabit bellek</strong> ve <strong>en kötü durum garantisi</strong>
                gerektiren sistemlerde tercih edilir. Pratikte Quick Sort daha hızlı çalışır.
              </p>
            </AccordionSection>

            <AccordionSection title="Gerçek Hayatta">
              <ul className="hs-usage-list">
                <li className="hs-usage-item">
                  <span className="hs-usage-icon">⚙️</span>
                  <span className="hs-usage-text">
                    <strong>İşletim Sistemleri</strong> — Linux çekirdeğinin bazı zamanlayıcıları
                    heap tabanlı öncelik kuyruğu kullanır; heap sort bu yapının temelidir.
                  </span>
                </li>
                <li className="hs-usage-item">
                  <span className="hs-usage-icon">📊</span>
                  <span className="hs-usage-text">
                    <strong>K-yollu Birleştirme</strong> — Büyük veri kümelerini k parçadan
                    birleştirirken min-heap her seferinde en küçük elemanı O(log k)'da bulur.
                  </span>
                </li>
                <li className="hs-usage-item">
                  <span className="hs-usage-icon">🎯</span>
                  <span className="hs-usage-text">
                    <strong>En Büyük K Eleman</strong> — n elemanlı dizide en büyük k elemanı
                    bulmak için min-heap O(n log k) ile en verimli çözümü sunar.
                  </span>
                </li>
                <li className="hs-usage-item">
                  <span className="hs-usage-icon">🔗</span>
                  <span className="hs-usage-text">
                    <strong>Dijkstra / Prim</strong> — Graf algoritmalarının öncelik kuyruğu
                    heap ile implementasyonu O((V+E) log V) karmaşıklık sağlar.
                  </span>
                </li>
              </ul>
            </AccordionSection>

          </div>
        </div>
      </div>
    </div>
  );
}
