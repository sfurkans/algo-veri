import { useState, useEffect } from "react";
import { useBinaryTree } from "../../visualizers/data-structures/useBinaryTree";
import "../../pages/sorting/SortingPage.css";
import "./DataStructuresPage.css";

/* ── Pseudocode ── */
const PSEUDO = [
  { n: 1,  text: "insert(val):",                   header: true },
  { n: 2,  text: "  current ← root"                             },
  { n: 3,  text: "  eğer root = NULL → root ← Node(val)"       },
  { n: 4,  text: "  while true:"                                },
  { n: 5,  text: "    eğer val = curr.val → dur (tekrar)"       },
  { n: 6,  text: "    eğer val < curr.val:"                     },
  { n: 7,  text: "      eğer curr.sol = NULL:"                  },
  { n: 8,  text: "        curr.sol ← Node(val); dur"            },
  { n: 9,  text: "      curr ← curr.sol"                        },
  { n: 10, text: "    eğer val > curr.val:"                     },
  { n: 11, text: "      eğer curr.sağ = NULL:"                  },
  { n: 12, text: "        curr.sağ ← Node(val); dur"            },
  { n: 13, text: "      curr ← curr.sağ"                        },
  { n: null, sep: true },
  { n: 15, text: "search(val):",                   header: true },
  { n: 16, text: "  current ← root"                             },
  { n: 17, text: "  while current ≠ NULL:"                      },
  { n: 18, text: "    eğer val = curr.val → döndür curr"        },
  { n: 19, text: "    eğer val < curr.val → curr ← curr.sol"   },
  { n: 20, text: "    yoksa curr ← curr.sağ"                    },
  { n: 21, text: "  döndür NULL (bulunamadı)"                   },
  { n: null, sep: true },
  { n: 23, text: "inorder(node):",                 header: true },
  { n: 24, text: "  inorder(node.sol)"                          },
  { n: 25, text: "  ziyaret(node)"                              },
  { n: 26, text: "  inorder(node.sağ)"                          },
  { n: null, sep: true },
  { n: 28, text: "preorder(node):",                header: true },
  { n: 29, text: "  ziyaret(node)"                              },
  { n: 30, text: "  preorder(node.sol)"                         },
  { n: 31, text: "  preorder(node.sağ)"                         },
  { n: null, sep: true },
  { n: 33, text: "postorder(node):",               header: true },
  { n: 34, text: "  postorder(node.sol/sağ)"                    },
  { n: 35, text: "  ziyaret(node)"                              },
  { n: null, sep: true },
  { n: 37, text: "delete(val):",                   header: true },
  { n: 38, text: "  current ← root; ara"                        },
  { n: 39, text: "  yaprak → sil"                               },
  { n: 40, text: "  tek çocuk → çocukla değiştir"               },
  { n: 41, text: "  iki çocuk: successor ← min(sağ)"            },
  { n: 42, text: "  node.val ← successor; sil successor"        },
];

/* ── Preset senaryolar ── */
const PRESETS = {
  klasik: {
    label: "Klasik BST",
    tooltip: "Dengeli BST — 11 düğüm, ekleme adımları",
    ops: [
      { op: "insert", val: 50 },
      { op: "insert", val: 30 },
      { op: "insert", val: 70 },
      { op: "insert", val: 20 },
      { op: "insert", val: 40 },
      { op: "insert", val: 60 },
      { op: "insert", val: 80 },
      { op: "insert", val: 10 },
      { op: "insert", val: 25 },
      { op: "insert", val: 45 },
      { op: "insert", val: 90 },
    ],
  },
  arama: {
    label: "BST Arama",
    tooltip: "Ağaç kur, sonra başarılı + başarısız arama yap",
    ops: [
      { op: "insert", val: 50 },
      { op: "insert", val: 30 },
      { op: "insert", val: 70 },
      { op: "insert", val: 20 },
      { op: "insert", val: 40 },
      { op: "insert", val: 60 },
      { op: "insert", val: 80 },
      { op: "insert", val: 25 },
      { op: "insert", val: 45 },
      { op: "search", val: 45 },
      { op: "search", val: 99 },
    ],
  },
  inorder: {
    label: "Inorder",
    tooltip: "Ağaç kur, inorder gezinmeyle sıralı çıktı al",
    ops: [
      { op: "insert", val: 50 },
      { op: "insert", val: 30 },
      { op: "insert", val: 70 },
      { op: "insert", val: 20 },
      { op: "insert", val: 40 },
      { op: "insert", val: 60 },
      { op: "insert", val: 80 },
      { op: "insert", val: 10 },
      { op: "insert", val: 25 },
      { op: "insert", val: 45 },
      { op: "insert", val: 90 },
      { op: "inorder" },
    ],
  },
  silme: {
    label: "Silme",
    tooltip: "3 silme durumu: yaprak, tek çocuk, iki çocuk",
    ops: [
      { op: "insert", val: 50 },
      { op: "insert", val: 30 },
      { op: "insert", val: 70 },
      { op: "insert", val: 20 },
      { op: "insert", val: 40 },
      { op: "insert", val: 60 },
      { op: "insert", val: 80 },
      { op: "delete", val: 20 },
      { op: "delete", val: 30 },
      { op: "delete", val: 70 },
    ],
  },
  dengesiz: {
    label: "Dengesiz",
    tooltip: "Sıralı ekleme — ağacın tek tarafa yayıldığını gör",
    ops: [
      { op: "insert", val: 10 },
      { op: "insert", val: 20 },
      { op: "insert", val: 30 },
      { op: "insert", val: 40 },
      { op: "insert", val: 50 },
      { op: "insert", val: 60 },
      { op: "insert", val: 70 },
    ],
  },
};

/* ── SVG sabitleri ── */
const SX = 76;    // yatay aralık (inorder)
const SY = 100;   // dikey aralık (derinlik)
const R  = 28;    // düğüm yarıçapı
const PX = 58;    // yatay dolgu
const PY = 52;    // dikey dolgu

/* ── Operation Banner ── */
function OperationBanner({ current }) {
  if (!current) {
    return (
      <div className="op-banner ob-idle">
        <span className="ob-icon">◎</span>
        <div className="ob-body">
          <span className="ob-label">Hazır</span>
          <span className="ob-sub">Preset seç veya manuel işlem yap</span>
        </div>
      </div>
    );
  }

  const { phase, description, detail } = current;

  const cfgs = {
    traverse_start:   { icon: "↓", cls: "ob-traverse"  },
    traverse_compare: { icon: "?", cls: "ob-peek"       },
    insert_done:      { icon: "+", cls: "ob-push"       },
    already_exists:   { icon: "=", cls: "ob-isempty"    },
    node_found:       { icon: "✓", cls: "ob-done"       },
    node_not_found:   { icon: "✗", cls: "ob-notfound"   },
    traverse_visit:       { icon: "●", cls: "ob-traverse"  },
    delete_leaf:          { icon: "✂", cls: "ob-pop"       },
    delete_one_child:     { icon: "↕", cls: "ob-pop"       },
    delete_two_children:  { icon: "↔", cls: "ob-peek"      },
    delete_done:          { icon: "✓", cls: "ob-done"      },
  };
  const cfg = cfgs[phase];
  if (!cfg) return null;
  return (
    <div className={`op-banner ${cfg.cls}`}>
      <span className="ob-icon">{cfg.icon}</span>
      <div className="ob-body">
        <span className="ob-label">{description}</span>
        {detail && <span className="ob-sub">{detail}</span>}
      </div>
    </div>
  );
}

/* ── Ağaç SVG görselleştirici ── */
function TreeViz({ current, settledNodes }) {
  const displayNodes = current ? current.nodes : settledNodes;
  const { phase, highlightId, compareId, newId, deleteId, traversalOrder = [] } = current ?? {};

  const isEmpty = displayNodes.length === 0;

  const maxX = isEmpty ? 0 : Math.max(...displayNodes.map(n => n.x));
  const maxY = isEmpty ? 0 : Math.max(...displayNodes.map(n => n.y));
  const svgW = Math.max(240, maxX * SX + PX * 2 + R);
  const svgH = Math.max(160, maxY * SY + PY * 2 + R);

  const cx = (n) => n.x * SX + PX;
  const cy = (n) => n.y * SY + PY;

  const nodeMap = {};
  displayNodes.forEach(n => { nodeMap[n.id] = n; });

  function getNodeStyle(n) {
    if (n.id === newId)
      return { fill: "#ede9fe", stroke: "#7c3aed", textFill: "#5b21b6", sw: 2.5 };
    if (n.id === deleteId && (phase === "delete_leaf" || phase === "delete_one_child" || phase === "delete_two_children"))
      return { fill: "#fee2e2", stroke: "#ef4444", textFill: "#991b1b", sw: 2.5 };
    if (n.id === compareId && (phase === "delete_one_child" || phase === "delete_two_children"))
      return { fill: "#dcfce7", stroke: "#16a34a", textFill: "#14532d", sw: 2.5 };
    if (n.id === compareId && phase === "traverse_compare")
      return { fill: "#fefce8", stroke: "#f59e0b", textFill: "#78350f", sw: 2.5 };
    if (n.id === highlightId && phase === "node_found")
      return { fill: "#dcfce7", stroke: "#16a34a", textFill: "#14532d", sw: 2.5 };
    if (n.id === highlightId && phase === "traverse_visit")
      return { fill: "#fef3c7", stroke: "#f59e0b", textFill: "#78350f", sw: 2.5 };
    if (traversalOrder.includes(n.id) && phase === "traverse_visit")
      return { fill: "#f0fdf4", stroke: "#86efac", textFill: "var(--text-primary)", sw: 1.5 };
    return { fill: "var(--bg-card)", stroke: "var(--border)", textFill: "var(--text-primary)", sw: 1.5 };
  }

  function getEdgeStroke(n) {
    if (n.id === newId) return "#7c3aed";
    if (traversalOrder.includes(n.id) && traversalOrder.includes(n.parentId)) return "#86efac";
    return "var(--border)";
  }

  return (
    <div className="tree-viz-card">
      <OperationBanner current={current} />

      <div className="tree-svg-scroll">
        {isEmpty ? (
          <div className="tree-empty-msg">— boş ağaç —</div>
        ) : (
          <svg
            width={svgW}
            height={svgH}
            style={{ display: "block", overflow: "visible" }}
          >
            {/* Kenarlar */}
            {displayNodes.filter(n => n.parentId !== null).map(n => {
              const p = nodeMap[n.parentId];
              if (!p) return null;
              return (
                <line
                  key={`e-${n.id}`}
                  x1={cx(p)} y1={cy(p)}
                  x2={cx(n)} y2={cy(n)}
                  stroke={getEdgeStroke(n)}
                  strokeWidth={1.8}
                  style={{ transition: "stroke 0.25s" }}
                />
              );
            })}

            {/* Düğümler */}
            {displayNodes.map(n => {
              const { fill, stroke, textFill, sw } = getNodeStyle(n);
              const isRoot = n.parentId === null;
              return (
                <g key={n.id}>
                  <circle
                    cx={cx(n)} cy={cy(n)} r={R}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={sw}
                    style={{ transition: "all 0.25s" }}
                  />
                  {/* Değer */}
                  <text
                    x={cx(n)} y={cy(n)}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={textFill}
                    fontSize={14}
                    fontWeight={800}
                    fontFamily="Courier New, monospace"
                    style={{ transition: "fill 0.25s", userSelect: "none" }}
                  >
                    {n.val}
                  </text>
                  {/* ROOT rozeti */}
                  {isRoot && (
                    <text
                      x={cx(n)} y={cy(n) - R - 7}
                      textAnchor="middle"
                      fill="var(--primary)"
                      fontSize={9}
                      fontWeight={800}
                      letterSpacing={1}
                      style={{ userSelect: "none" }}
                    >
                      ROOT
                    </text>
                  )}
                  {/* Sol/sağ etiketi */}
                  {!isRoot && (
                    <text
                      x={cx(n)} y={cy(n) + R + 11}
                      textAnchor="middle"
                      fill="var(--text-muted)"
                      fontSize={8}
                      fontWeight={700}
                      style={{ userSelect: "none" }}
                    >
                      {n.isLeft ? "L" : "R"}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Gezinme sırası bandı */}
      {traversalOrder.length > 0 && (
        <div className="traversal-order-strip">
          <span className="tos-label">Sıra:</span>
          {traversalOrder.map((v, i) => (
            <span key={i} className={`tos-node ${v === highlightId ? "tos-current" : ""}`}>
              {v}
            </span>
          ))}
        </div>
      )}

      {/* Meta şerit */}
      <div className="stack-meta-strip">
        <div className="sms-cell">
          <span className="sms-key">düğüm sayısı</span>
          <span className="sms-val" style={{ color: "var(--primary)" }}>{displayNodes.length}</span>
        </div>
        <div className="sms-div" />
        <div className="sms-cell">
          <span className="sms-key">derinlik</span>
          <span className="sms-val" style={{ color: "#7c3aed" }}>
            {displayNodes.length > 0 ? Math.max(...displayNodes.map(n => n.y)) : "—"}
          </span>
        </div>
        <div className="sms-div" />
        <div className="sms-cell">
          <span className="sms-key">ekleme</span>
          <span className="sms-val" style={{ color: "#059669" }}>{current?.stats.inserts ?? 0}</span>
        </div>
        <div className="sms-div" />
        <div className="sms-cell">
          <span className="sms-key">karşılaştırma</span>
          <span className="sms-val" style={{ color: "#f59e0b" }}>{current?.stats.comparisons ?? 0}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Manuel panel ── */
function ManualPanel({ busy, onInsert, onSearch, onDelete, onInorder, onPreorder, onPostorder }) {
  const [val,  setVal]  = useState("");
  const [mode, setMode] = useState("insert");

  const needsVal = mode === "insert" || mode === "search" || mode === "delete";

  function handleRun() {
    const v = parseInt(val, 10);
    if (needsVal && isNaN(v)) return;
    if (mode === "insert")    onInsert(v);
    if (mode === "search")    onSearch(v);
    if (mode === "delete")    onDelete(v);
    if (mode === "inorder")   onInorder();
    if (mode === "preorder")  onPreorder();
    if (mode === "postorder") onPostorder();
    setVal("");
  }

  const MODES = [
    { key: "insert",    label: "insert",    tooltip: "BST'ye değer ekle" },
    { key: "search",    label: "search",    tooltip: "Değer ara — O(h)" },
    { key: "delete",    label: "delete",    tooltip: "Değeri sil (yaprak / tek çocuk / iki çocuk)" },
    { key: "inorder",   label: "inorder",   tooltip: "Sol → Kök → Sağ (sıralı çıktı)" },
    { key: "preorder",  label: "preorder",  tooltip: "Kök → Sol → Sağ" },
    { key: "postorder", label: "postorder", tooltip: "Sol → Sağ → Kök" },
  ];

  return (
    <div className="stack-ops-panel">
      <div className="stack-ops-label">İşlem Seç</div>
      <div className="ll-mode-row">
        {MODES.map(({ key, label, tooltip }) => (
          <button
            key={key}
            className={`ll-mode-btn ${mode === key ? "llm-active" : ""}`}
            onClick={() => setMode(key)}
            data-tooltip={tooltip}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="stack-input-row">
        {needsVal && (
          <input
            className="stack-val-input"
            type="number"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRun()}
            placeholder="değer"
            style={{ width: 80 }}
          />
        )}
        <button
          className="stack-push-btn"
          onClick={handleRun}
          disabled={busy || (needsVal && val === "")}
        >
          Çalıştır
        </button>
      </div>
    </div>
  );
}

/* ── Ana sayfa ── */
export default function BinaryTree() {
  const {
    current, settledNodes,
    stepIndex, totalSteps,
    isPlaying, isDone, canPlay,
    speed, setSpeed,
    togglePlay, stepForward, stepBackward,
    autoPlayPreset,
    manualInsert, manualSearch, manualDelete,
    manualInorder, manualPreorder, manualPostorder,
    reset,
  } = useBinaryTree();

  const [activePreset, setActivePreset] = useState("klasik");

  useEffect(() => {
    const t = setTimeout(() => autoPlayPreset(PRESETS.klasik.ops), 600);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const activeLine = current?.activeLine ?? null;
  const busy       = isPlaying;

  function handlePreset(key) { setActivePreset(key); autoPlayPreset(PRESETS[key].ops); }
  function handleReset()     { reset(); setActivePreset(""); }

  const playLabel = isPlaying ? "⏸ Durdur" : isDone ? "↺ Yeniden" : "▶ Oynat";
  const stepCls   = current ? "step-explanation step-active" : "step-explanation step-idle";

  return (
    <div className="sorting-page">
      <div className="page-container">

        {/* Başlık */}
        <div className="page-header">
          <div>
            <div className="page-tag">Veri Yapısı</div>
            <h1 className="page-title">İkili Arama Ağacı (BST)</h1>
            <p className="page-subtitle">
              Her düğümün sol alt ağacı daha küçük, sağ alt ağacı daha büyük değerler içerir.
              Arama, ekleme ve silme O(log n) — dengeli ağaçta.
            </p>
          </div>
        </div>

        <div className="page-body">

          {/* ══ Sol: Görselleştirici ══ */}
          <div className="visualizer-col">

            <ManualPanel
              busy={busy}
              onInsert={manualInsert}
              onSearch={manualSearch}
              onDelete={manualDelete}
              onInorder={manualInorder}
              onPreorder={manualPreorder}
              onPostorder={manualPostorder}
            />

            <TreeViz current={current} settledNodes={settledNodes} />

            {/* Adım açıklaması */}
            <div className={stepCls}>
              <div className="step-main">
                {!current && "Preset seçin — animasyon otomatik başlar. Ya da üstten manuel işlem yapın."}
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
                {[1000, 700, 400, 150].map((ms) => (
                  <button
                    key={ms}
                    className={`ctrl-btn ctrl-secondary ${speed === ms ? "speed-active" : ""}`}
                    onClick={() => setSpeed(ms)}
                  >
                    {ms === 1000 ? "×1" : ms === 700 ? "×2" : ms === 400 ? "×4" : "×8"}
                  </button>
                ))}
              </div>
              <button className="ctrl-btn ctrl-secondary" onClick={handleReset}>↺ Yenile</button>
            </div>

            {/* İstatistikler */}
            <div className="stack-stats">
              <div className="ss-item">
                <span className="ss-val" style={{ color: "var(--primary)" }}>
                  {settledNodes.length}
                </span>
                <span className="ss-label">Düğüm</span>
              </div>
              <div className="ss-divider" />
              <div className="ss-item">
                <span className="ss-val" style={{ color: "#059669" }}>
                  {current?.stats.inserts ?? 0}
                </span>
                <span className="ss-label">Ekleme</span>
              </div>
              <div className="ss-divider" />
              <div className="ss-item">
                <span className="ss-val" style={{ color: "#7c3aed" }}>
                  {current?.stats.searches ?? 0}
                </span>
                <span className="ss-label">Arama</span>
              </div>
              <div className="ss-divider" />
              <div className="ss-item">
                <span className="ss-val" style={{ color: "#f59e0b" }}>
                  {current?.stats.comparisons ?? 0}
                </span>
                <span className="ss-label">Karşılaştırma</span>
              </div>
              <div className="ss-divider" />
              <div className="ss-item">
                <span className="ss-val">
                  {canPlay ? `${stepIndex + 1} / ${totalSteps}` : "—"}
                </span>
                <span className="ss-label">Adım</span>
              </div>
            </div>

            {/* Preset bar */}
            <div className="preset-bar">
              <span className="preset-label">Senaryo</span>
              <div className="preset-group">
                {Object.entries(PRESETS).map(([key, { label, tooltip }]) => (
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

            {/* Pseudocode */}
            <div className="info-card">
              <h3 className="info-card-title">Nasıl Çalışır?</h3>
              <p className="info-card-text" style={{ marginBottom: 14 }}>
                BST'de her düğümün <strong>sol çocukları küçük</strong>,
                <strong> sağ çocukları büyük</strong> değer taşır. Bu sayede her
                adımda aramayı yarıya indiririz — dengeli ağaçta O(log n).
              </p>
              <div className="pseudocode">
                {PSEUDO.map((line, i) => {
                  if (line.sep) return (
                    <div key={i} className="pseudo-line pseudo-separator">
                      <span className="pseudo-num" />
                      <span className="pseudo-code">──────────────</span>
                    </div>
                  );
                  const isActive = activeLine === line.n;
                  return (
                    <div key={i} className={`pseudo-line ${isActive ? "pseudo-active" : ""} ${line.header ? "pseudo-header" : ""}`}>
                      <span className="pseudo-num">{line.n}</span>
                      <span className="pseudo-code">{line.text}</span>
                      {isActive && <span className="pseudo-arrow">← şu an</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ══ Sağ: Bilgi paneli ══ */}
          <div className="info-section">

            <div className="section-divider">BST Kuralı</div>

            <div className="info-card">
              <h3 className="info-card-title">Her Düğümde Geçerli Olan Kural</h3>
              <p className="info-card-text" style={{ marginBottom: 14 }}>
                BST özelliği yalnızca doğrudan çocuklar için değil,
                <strong> tüm alt ağaç</strong> için geçerlidir:
              </p>

              {/* Statik BST diyagramı */}
              <div className="bst-rule-diagram">
                <svg viewBox="0 0 360 280" width="100%" style={{ display: "block", minHeight: 260 }}>
                  {/* Kenarlar */}
                  <line x1={180} y1={55}  x2={95}  y2={135} stroke="#c4b5fd" strokeWidth={2} />
                  <line x1={180} y1={55}  x2={265} y2={135} stroke="#86efac" strokeWidth={2} />
                  <line x1={95}  y1={135} x2={50}  y2={215} stroke="#c4b5fd" strokeWidth={2} />
                  <line x1={95}  y1={135} x2={140} y2={215} stroke="#c4b5fd" strokeWidth={2} />

                  {/* Gölge alanları */}
                  <ellipse cx={95}  cy={182} rx={72} ry={58} fill="#ede9fe" opacity={0.35} />
                  <ellipse cx={265} cy={135} rx={46} ry={36} fill="#dcfce7" opacity={0.45} />

                  {/* Alan etiketleri */}
                  <text x={14}  y={170} fontSize={10} fill="#7c3aed" fontWeight={700}>sol alt ağaç</text>
                  <text x={14}  y={185} fontSize={10} fill="#7c3aed" fontWeight={700}>{"(hepsi < 50)"}</text>
                  <text x={265} y={88}  fontSize={10} fill="#15803d" fontWeight={700} textAnchor="middle">sağ alt ağaç</text>
                  <text x={265} y={102} fontSize={10} fill="#15803d" fontWeight={700} textAnchor="middle">{"(hepsi > 50)"}</text>

                  {/* Düğümler */}
                  {[
                    { cx: 180, cy: 55,  val: 50, fill: "#ede9fe", stroke: "#7c3aed", tc: "#4c1d95", label: "ROOT" },
                    { cx: 95,  cy: 135, val: 30, fill: "#ede9fe", stroke: "#a78bfa", tc: "#5b21b6" },
                    { cx: 265, cy: 135, val: 70, fill: "#dcfce7", stroke: "#4ade80", tc: "#14532d" },
                    { cx: 50,  cy: 215, val: 20, fill: "#ede9fe", stroke: "#a78bfa", tc: "#5b21b6" },
                    { cx: 140, cy: 215, val: 40, fill: "#ede9fe", stroke: "#a78bfa", tc: "#5b21b6" },
                  ].map(({ cx, cy, val, fill, stroke, tc, label }) => (
                    <g key={val}>
                      <circle cx={cx} cy={cy} r={26} fill={fill} stroke={stroke} strokeWidth={2} />
                      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
                        fontSize={14} fontWeight={800} fill={tc} fontFamily="Courier New, monospace">
                        {val}
                      </text>
                      {label && (
                        <text x={cx} y={cy - 34} textAnchor="middle"
                          fontSize={9} fontWeight={800} fill="var(--primary)" letterSpacing={0.5}>
                          {label}
                        </text>
                      )}
                    </g>
                  ))}
                </svg>

                {/* Inorder şeridi */}
                <div className="bst-inorder-strip">
                  <span className="bis-label">inorder çıktısı:</span>
                  {[20, 30, 40, 50, 70].map((v) => (
                    <span key={v} className="bis-node">{v}</span>
                  ))}
                  <span className="bis-note">→ otomatik sıralı!</span>
                </div>
              </div>

              <p className="info-card-text" style={{ marginTop: 12 }}>
                50'nin solundaki <strong>her</strong> düğüm (20, 30, 40) 50'den küçük.
                Sağındaki (70) büyük. Bu kural ağacın her seviyesinde geçerlidir.
                Bu yüzden inorder gezinme her zaman sıralı çıktı verir.
              </p>
            </div>

            <div className="section-divider">Karmaşıklık</div>

            <div className="info-card">
              <h3 className="info-card-title">Zaman &amp; Alan Karmaşıklığı</h3>
              <table className="complexity-table">
                <thead>
                  <tr><th>İşlem</th><th>Ort. (dengeli)</th><th>En kötü (çizgili)</th></tr>
                </thead>
                <tbody>
                  {[
                    ["insert()", "O(log n)", "O(n)"],
                    ["search()", "O(log n)", "O(n)"],
                    ["inorder",  "O(n)",     "O(n)"],
                    ["Alan",     "O(n)",     "O(n)"],
                  ].map(([op, avg, worst]) => (
                    <tr key={op}>
                      <td className="ct-op">{op}</td>
                      <td className="ct-good">{avg}</td>
                      <td className="ct-mid">{worst}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="info-card-text" style={{ marginTop: 12 }}>
                Ağaç <strong>dengeli</strong> kaldığı sürece yükseklik O(log n).
                Sıralı ekleme yapılırsa ağaç "çizgi" haline gelir ve O(n)'ye düşer.
                AVL veya Red-Black ağaçlar dengeyi garanti eder.
              </p>
            </div>

            <div className="section-divider">Gezinme Türleri</div>

            <div className="info-card">
              <h3 className="info-card-title">Traversal Karşılaştırması</h3>
              <table className="complexity-table">
                <thead><tr><th>Tür</th><th>Sıra</th><th>Kullanım</th></tr></thead>
                <tbody>
                  {[
                    ["Inorder",   "Sol→Kök→Sağ", "BST'den sıralı çıktı — en önemli özellik"],
                    ["Preorder",  "Kök→Sol→Sağ",  "Ağacı kopyalama / serileştirme"],
                    ["Postorder", "Sol→Sağ→Kök",  "Ağaç silme / bellek temizleme"],
                  ].map(([t, order, use]) => (
                    <tr key={t}>
                      <td className="ct-op">{t}</td>
                      <td style={{ fontSize: "0.76rem" }}>{order}</td>
                      <td style={{ fontSize: "0.74rem", color: "var(--text-secondary)" }}>{use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="section-divider">Kullanım Alanları</div>

            <div className="info-card">
              <h3 className="info-card-title">Gerçek Dünya Kullanımı</h3>
              <div className="usecase-list">
                {[
                  { icon: "🗄️", title: "Veritabanı İndeksleri", desc: "B-Tree ve B+Tree, BST'nin dengeli genellemesidir. PostgreSQL ve MySQL indeksleri bu yapıyı kullanır." },
                  { icon: "📂", title: "Dosya Sistemi", desc: "Klasör ağaçları ve dosya arama işlemleri ağaç yapılarıyla hızlandırılır." },
                  { icon: "🔤", title: "Autocomplete / Trie", desc: "Prefix ağaçları BST'nin kelime odaklı varyantıdır. Klavye tahmin sistemleri bu yapıyı kullanır." },
                  { icon: "🎮", title: "Oyun Motorları", desc: "BSP (Binary Space Partitioning) ağaçları 3D sahneleri bölümleyerek render optimizasyonu sağlar." },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="usecase-row">
                    <span className="usecase-icon">{icon}</span>
                    <div>
                      <div className="usecase-title">{title}</div>
                      <div className="usecase-desc">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-divider">Avantajlar &amp; Sınırlar</div>

            <div className="info-card">
              <ul className="feature-list">
                <li><span className="feature-icon feature-check">✓</span><span><strong>Hızlı arama</strong> — dengeli ağaçta O(log n), diziye göre çok daha verimli</span></li>
                <li><span className="feature-icon feature-check">✓</span><span><strong>Sıralı çıktı</strong> — inorder gezinme otomatik olarak sıralı veriyi verir</span></li>
                <li><span className="feature-icon feature-check">✓</span><span><strong>Dinamik yapı</strong> — ekleme/silme sırasında yeniden boyutlandırma gerekmez</span></li>
                <li><span className="feature-icon feature-x">✗</span><span><strong>Denge garantisi yok</strong> — sıralı ekleme O(n) zamana düşürür</span></li>
                <li><span className="feature-icon feature-x">✗</span><span><strong>Ekstra bellek</strong> — her düğüm iki pointer (sol + sağ) tutar</span></li>
                <li><span className="feature-icon feature-x">✗</span><span><strong>Cache dostu değil</strong> — pointer tabanlı → cache miss yüksek olabilir</span></li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
