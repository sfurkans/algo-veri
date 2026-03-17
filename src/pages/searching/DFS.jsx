import { useState } from "react";
import { useDFS, DFS_PRESETS } from "../../visualizers/searching/useDFS";
import "../sorting/SortingPage.css";
import "../data-structures/DataStructuresPage.css";
import "./DFS.css";

const NODE_R = 22;

/* ── Pseudocode ───────────────────────────────────────────────────────────── */
const PSEUDO = [
  { text: "DFS(graf, başlangıç):",          header: true  },
  { text: "  yığın ← [başlangıç]"                         },
  { text: "  ziyaret ← {}"                                },
  { sep: true },
  { text: "  while yığın boş değil:"                      },
  { text: "    düğüm ← yığın.pop()"                       },
  { text: "    ziyaret.ekle(düğüm)"                        },
  { sep: true },
  { text: "    for komşu in ters(graf[düğüm]):"            },
  { text: "      if komşu ∉ ziyaret:"                     },
  { text: "        yığın.ekle(komşu)"                      },
  { sep: true },
  { text: "  return ziyaret sırası"                        },
];

// activeLine → pseudo dizisinde hangi satır vurgulanacak
const LINE_MAP = {
  0: 1,   // yığın ← [başlangıç]
  1: 1,   // yığın ← [başlangıç] (push)
  3: 5,   // düğüm ← yığın.pop()
  4: 6,   // ziyaret.ekle(düğüm)
  5: 9,   // if komşu ∉ ziyaret
  6: 10,  // yığın.ekle(komşu)
  8: 9,   // already visited check
};

/* ── Op Banner ────────────────────────────────────────────────────────────── */
function OpBanner({ current }) {
  if (!current) return null;

  const isDone  = current.description?.startsWith("DFS tamamlandı");
  const isPop   = current.description?.includes("yığından çıkarıldı");
  const isPush  = current.description?.includes("yığına eklendi");
  const isCheck = current.description?.includes("kontrol ediliyor");
  const isSkip  = current.description?.includes("zaten");

  const cls = isDone  ? "dfs-banner-done"
            : isPop   ? "dfs-banner-pop"
            : isPush  ? "dfs-banner-push"
            : isCheck ? "dfs-banner-check"
            : isSkip  ? "dfs-banner-skip"
            : "dfs-banner-idle";

  const icon = isDone  ? "✓"
             : isPop   ? "←"
             : isPush  ? "+"
             : isCheck ? "?"
             : isSkip  ? "↷"
             : "●";

  return (
    <div className={`dfs-banner ${cls}`}>
      <span className="dfs-banner-icon">{icon}</span>
      <div className="dfs-banner-body">
        <div className="dfs-banner-op">{current.description}</div>
        {current.detail && <div className="dfs-banner-sub">{current.detail}</div>}
      </div>
    </div>
  );
}

/* ── SVG Canvas ───────────────────────────────────────────────────────────── */
function DFSCanvas({ nodes, edges, current, startNodeId, onNodeClick, isPlaying }) {
  const nodeStates = current?.nodeStates ?? {};
  const edgeStates = current?.edgeStates ?? {};

  const nodeColor = {
    unvisited: { fill: "#f8fafc", stroke: "#94a3b8" },
    stacked:   { fill: "#dbeafe", stroke: "#3b82f6" },
    visiting:  { fill: "#e0e7ff", stroke: "#4338ca" },
    visited:   { fill: "#dcfce7", stroke: "#22c55e" },
  };

  return (
    <div className="dfs-canvas-wrap">
      <svg viewBox="0 0 400 310" className="dfs-svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="dfs-arrow-default" markerWidth="9" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 9 3, 0 6" fill="#cbd5e1" />
          </marker>
          <marker id="dfs-arrow-tree" markerWidth="9" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 9 3, 0 6" fill="#4338ca" />
          </marker>
          <marker id="dfs-arrow-check" markerWidth="9" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 9 3, 0 6" fill="#f59e0b" />
          </marker>
        </defs>

        {/* Kenarlar */}
        {edges.map((edge) => {
          const from = nodes.find((n) => n.id === edge.from);
          const to   = nodes.find((n) => n.id === edge.to);
          if (!from || !to) return null;

          const dx = to.x - from.x, dy = to.y - from.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len < 1) return null;
          const nx = dx / len, ny = dy / len;
          const x1 = from.x + nx * NODE_R;
          const y1 = from.y + ny * NODE_R;
          const x2 = to.x - nx * NODE_R;
          const y2 = to.y - ny * NODE_R;

          const state   = edgeStates[edge.id] ?? "default";
          const edgeCls = `dfs-edge dfs-edge-${state}`;

          return (
            <line key={edge.id} x1={x1} y1={y1} x2={x2} y2={y2} className={edgeCls} />
          );
        })}

        {/* Düğümler */}
        {nodes.map((node) => {
          const state    = nodeStates[node.id] ?? "unvisited";
          const colors   = nodeColor[state] ?? nodeColor.unvisited;
          const isStart   = node.id === startNodeId;
          const isActive  = node.id === current?.activeNodeId;
          const isChecked = node.id === current?.checkNeighbor;

          return (
            <g
              key={node.id}
              onClick={() => !isPlaying && onNodeClick(node.id)}
              style={{ cursor: isPlaying ? "default" : "pointer" }}
              className="dfs-node-group"
            >
              <circle
                cx={node.x} cy={node.y} r={NODE_R}
                fill={colors.fill}
                stroke={isActive ? "#4338ca" : isChecked ? "#f59e0b" : colors.stroke}
                strokeWidth={isActive || isChecked ? 3 : isStart && state === "unvisited" ? 2.5 : 2}
                strokeDasharray={isStart && state === "unvisited" ? "5 3" : undefined}
                className={`dfs-node dfs-node-${state}`}
              />
              <text
                x={node.x} y={node.y + 1}
                textAnchor="middle" dominantBaseline="middle"
                className="dfs-node-label"
              >
                {node.label}
              </text>
              {isStart && state === "unvisited" && (
                <text
                  x={node.x} y={node.y - NODE_R - 6}
                  textAnchor="middle"
                  className="dfs-start-tag"
                >
                  başlangıç
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Yığın Görünümü ───────────────────────────────────────────────────────── */
function StackView({ stack, nodes }) {
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));
  return (
    <div className="dfs-stack-wrap">
      <div className="dfs-stack-title">
        <span className="dfs-stack-label">Yığın</span>
        <span className="dfs-stack-hint">alt → üst</span>
      </div>
      <div className="dfs-stack-body">
        {stack.length === 0 ? (
          <span className="dfs-stack-empty">boş</span>
        ) : (
          stack.map((id, i) => (
            <span key={i} className="dfs-stack-item">
              <span className="dfs-stack-node">{nodeMap[id]?.label ?? "?"}</span>
              {i === stack.length - 1 && <span className="dfs-stack-top">üst</span>}
              {i < stack.length - 1 && <span className="dfs-stack-arrow">→</span>}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

/* ── Ziyaret Sırası ───────────────────────────────────────────────────────── */
function VisitOrderView({ visitOrder, nodes }) {
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));
  return (
    <div className="dfs-order-wrap">
      <span className="dfs-order-title">Ziyaret Sırası</span>
      <div className="dfs-order-body">
        {visitOrder.length === 0 ? (
          <span className="dfs-order-empty">henüz yok</span>
        ) : (
          visitOrder.map((id, i) => (
            <span key={i} className="dfs-order-item">
              <span className="dfs-order-num">{i + 1}</span>
              <span className="dfs-order-node">{nodeMap[id]?.label ?? "?"}</span>
              {i < visitOrder.length - 1 && <span className="dfs-order-sep">→</span>}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

/* ── Renk Açıklaması ──────────────────────────────────────────────────────── */
function Legend() {
  const items = [
    { cls: "dleg-unvisited", label: "Ziyaret edilmedi" },
    { cls: "dleg-stacked",   label: "Yığında" },
    { cls: "dleg-visiting",  label: "İşleniyor" },
    { cls: "dleg-visited",   label: "Ziyaret edildi" },
  ];
  return (
    <div className="dfs-legend">
      {items.map((item) => (
        <div key={item.cls} className="dfs-legend-item">
          <span className={`dfs-legend-dot ${item.cls}`} />
          <span className="dfs-legend-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Accordion ────────────────────────────────────────────────────────────── */
function AccordionSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`dfs-accordion ${open ? "dfs-acc-open" : ""}`}>
      <button className="dfs-acc-header" onClick={() => setOpen((v) => !v)}>
        <span className="dfs-acc-title">{title}</span>
        <svg className="dfs-acc-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="dfs-acc-body">{children}</div>}
    </div>
  );
}

/* ── Ana Bileşen ──────────────────────────────────────────────────────────── */
export default function DFS() {
  const {
    nodes, edges,
    current, stepIndex, totalSteps, isDone,
    isPlaying, speed, setSpeed,
    activePreset, loadPreset,
    startNodeId, changeStart,
    togglePlay, stepForward, stepBackward,
  } = useDFS();

  const activePseudoLine = current?.activeLine != null ? LINE_MAP[current.activeLine] ?? null : null;

  return (
    <div className="sorting-page">
      <div className="page-container">

        {/* ── Header ── */}
        <div className="page-header">
          <div>
            <div className="page-tag">Graf Algoritması</div>
            <h1 className="page-title">DFS — Derinlik Öncelikli Arama</h1>
            <p className="page-subtitle">
              Grafı yığın (stack) kullanarak derine inerek keşfeder, geri adım atarak tüm düğümlere ulaşır.
            </p>
          </div>
        </div>

        <div className="page-body">

          {/* ══════════ SOL: Görselleştirici ══════════ */}
          <div className="visualizer-col">

            <OpBanner current={current} />

            <DFSCanvas
              nodes={nodes}
              edges={edges}
              current={current}
              startNodeId={startNodeId}
              onNodeClick={changeStart}
              isPlaying={isPlaying}
            />

            <Legend />

            <StackView stack={current?.stack ?? []}          nodes={nodes} />
            <VisitOrderView visitOrder={current?.visitOrder ?? []} nodes={nodes} />

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
              <div className="meta-left">
                {!isPlaying && (
                  <span className="dfs-start-hint">
                    Başlangıç düğümü değiştirmek için bir düğüme tıkla
                  </span>
                )}
              </div>
              <div className="step-progress">{stepIndex + 1} / {totalSteps}</div>
            </div>

            {/* Preset Seçici */}
            <div className="preset-bar">
              <span className="preset-label">Senaryo</span>
              <div className="preset-group">
                {Object.entries(DFS_PRESETS).map(([key, p]) => (
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
              <ol className="dfs-how-list">
                <li>Başlangıç düğümü yığına eklenir.</li>
                <li>Yığının tepesinden bir düğüm çıkarılır ve ziyaret edildi olarak işaretlenir.</li>
                <li>Bu düğümün tüm ziyaret edilmemiş komşuları yığına eklenir.</li>
                <li>DFS, yığından en son eklenen komşuyu işler — bu sayede derine iner.</li>
                <li>Yığın boşalana kadar işlem tekrar edilir, çıkmaz sokakta geri adım atılır.</li>
                <li>Döngülü graflarda geri kenarlar (back edge) oluşur; bu özellik döngü tespitinde kullanılır.</li>
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

            <AccordionSection title="Kenar Türleri" defaultOpen={true}>
              <div className="dfs-edges-grid">
                <div className="dfs-edge-card dfs-ec-tree">
                  <span className="dfs-ec-line" />
                  <div>
                    <span className="dfs-ec-name">Ağaç Kenarı</span>
                    <p className="dfs-ec-desc">DFS tarafından ilk kez keşfedilen kenardır. DFS ağacını oluşturur.</p>
                  </div>
                </div>
                <div className="dfs-edge-card dfs-ec-back">
                  <span className="dfs-ec-line dfs-ec-line-back" />
                  <div>
                    <span className="dfs-ec-name">Geri Kenar</span>
                    <p className="dfs-ec-desc">Ziyaret edilmiş bir ataya giden kenardır. Döngü varlığını gösterir.</p>
                  </div>
                </div>
              </div>
            </AccordionSection>

            <AccordionSection title="Karmaşıklık Analizi" defaultOpen={true}>
              <div className="dfs-cmplx-grid">
                <div className="dfs-cmplx-cell cmplx-time">
                  <span className="dfs-cmplx-op">Zaman</span>
                  <span className="dfs-cmplx-val">O(V+E)</span>
                  <span className="dfs-cmplx-sub">her düğüm ve kenar bir kez</span>
                </div>
                <div className="dfs-cmplx-cell cmplx-space">
                  <span className="dfs-cmplx-op">Alan</span>
                  <span className="dfs-cmplx-val">O(V)</span>
                  <span className="dfs-cmplx-sub">yığın ve ziyaret seti</span>
                </div>
              </div>
              <div className="complexity-list" style={{ marginTop: 12 }}>
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-green">O(V+E)</div>
                  <p className="complexity-row-desc">
                    Her düğüm yığına tam bir kez girer ve çıkar. Her kenar iki kez kontrol edilir.
                    Toplam işlem sayısı düğüm ve kenar sayısının toplamıyla orantılıdır.
                  </p>
                </div>
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-yellow">Özyineleme ile O(V) stack</div>
                  <p className="complexity-row-desc">
                    Özyinelemeli DFS, çağrı yığınını (call stack) kullanır. Çok derin graflarda
                    yığın taşması (stack overflow) riski oluşabilir; yinelemeli sürüm tercih edilmeli.
                  </p>
                </div>
              </div>
            </AccordionSection>

            <AccordionSection title="BFS vs DFS">
              <div className="scenario-table">
                <div className="scenario-header">
                  <span>Özellik</span>
                  <span>DFS</span>
                  <span>BFS</span>
                </div>
                <div className="scenario-row">
                  <span>Yapı</span>
                  <span className="scenario-val good">Yığın (LIFO)</span>
                  <span className="scenario-val">Kuyruk (FIFO)</span>
                </div>
                <div className="scenario-row">
                  <span>Dolaşım</span>
                  <span className="scenario-val good">Derine iner</span>
                  <span className="scenario-val">Katman katman</span>
                </div>
                <div className="scenario-row">
                  <span>En kısa yol</span>
                  <span className="scenario-val">Garantilemez</span>
                  <span className="scenario-val good">Garantiler ✓</span>
                </div>
                <div className="scenario-row">
                  <span>Döngü tespiti</span>
                  <span className="scenario-val good">Doğal ✓ (geri kenar)</span>
                  <span className="scenario-val">Dolaylı</span>
                </div>
                <div className="scenario-row">
                  <span>Bellek</span>
                  <span className="scenario-val good">Az (derin)</span>
                  <span className="scenario-val">Fazla (geniş)</span>
                </div>
                <div className="scenario-row">
                  <span>Zaman</span>
                  <span className="scenario-val">O(V+E)</span>
                  <span className="scenario-val">O(V+E)</span>
                </div>
              </div>
              <p className="scenario-note" style={{ marginTop: 8 }}>
                <strong>En kısa yol</strong> için BFS, <strong>döngü tespiti / topolojik sıralama /
                bağlantı bileşenleri</strong> için DFS tercih edilir.
              </p>
            </AccordionSection>

            <AccordionSection title="Gerçek Hayatta">
              <ul className="dfs-usage-list">
                <li className="dfs-usage-item">
                  <span className="dfs-usage-icon">🔄</span>
                  <span className="dfs-usage-text">
                    <strong>Döngü Tespiti</strong> — bağımlılık grafiklerinde (npm, Maven) döngüsel
                    bağımlılıkları DFS'in geri kenarları aracılığıyla tespit edilir.
                  </span>
                </li>
                <li className="dfs-usage-item">
                  <span className="dfs-usage-icon">📋</span>
                  <span className="dfs-usage-text">
                    <strong>Topolojik Sıralama</strong> — görev planlaması, derleme sırası gibi
                    bağımlılıklı işlemleri DFS ile doğru sıraya dizmek mümkündür.
                  </span>
                </li>
                <li className="dfs-usage-item">
                  <span className="dfs-usage-icon">🧩</span>
                  <span className="dfs-usage-text">
                    <strong>Bağlantı Bileşenleri</strong> — bir grafın kaç bağlı bileşenden oluştuğunu
                    DFS ile O(V+E) sürede bulunabilir. Sosyal ağ analizinde kullanılır.
                  </span>
                </li>
                <li className="dfs-usage-item">
                  <span className="dfs-usage-icon">🎮</span>
                  <span className="dfs-usage-text">
                    <strong>Labirent / Bulmaca</strong> — bir çıkış olup olmadığını bulmak için
                    DFS kullanılır; tüm yolları keşfederek çözüm arar.
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
