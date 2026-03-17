import { useState } from "react";
import { useBFS, BFS_PRESETS } from "../../visualizers/searching/useBFS";
import "../sorting/SortingPage.css";
import "../data-structures/DataStructuresPage.css";
import "./BFS.css";

const NODE_R      = 22;
const ARROW_EXTRA = 8;

/* ── Pseudocode ───────────────────────────────────────────────────────────── */
const PSEUDO = [
  { text: "BFS(graf, başlangıç):",        header: true  },
  { text: "  kuyruk ← [başlangıç]"                      },
  { text: "  ziyaret ← {başlangıç}"                     },
  { sep: true },
  { text: "  while kuyruk boş değil:"                   },
  { text: "    düğüm ← kuyruk.çıkar()"                  },
  { sep: true },
  { text: "    for komşu in graf[düğüm]:"                },
  { text: "      if komşu ∉ ziyaret:"                   },
  { text: "        ziyaret.ekle(komşu)"                  },
  { text: "        kuyruk.ekle(komşu)"                   },
  { sep: true },
  { text: "    ziyaret.ekle(düğüm)"                      },
  { sep: true },
  { text: "  return ziyaret sırası"                      },
];

// activeLine → pseudo dizisinde hangi satır vurgulanacak
const LINE_MAP = {
  0: 1,   // kuyruk ← [başlangıç]
  1: 2,   // ziyaret ← {başlangıç}
  3: 5,   // düğüm ← kuyruk.çıkar()
  4: 12,  // ziyaret.ekle(düğüm)  — komşu döngüsünden sonra
  5: 8,   // if komşu ∉ ziyaret
  6: 10,  // kuyruk.ekle(komşu)
  8: 8,   // already visited check
};

/* ── Op Banner ────────────────────────────────────────────────────────────── */
function OpBanner({ current }) {
  if (!current) return null;

  const isDone  = current.description?.startsWith("BFS tamamlandı");
  const isEnq   = current.description?.includes("kuyruğa eklendi");
  const isDeq   = current.description?.includes("kuyruktan çıkarıldı");
  const isCheck = current.description?.includes("kontrol ediliyor");
  const isSkip  = current.description?.includes("zaten");

  const cls = isDone  ? "bfs-banner-done"
            : isDeq   ? "bfs-banner-deq"
            : isEnq   ? "bfs-banner-enq"
            : isCheck ? "bfs-banner-check"
            : isSkip  ? "bfs-banner-skip"
            : "bfs-banner-idle";

  const icon = isDone  ? "✓"
             : isDeq   ? "←"
             : isEnq   ? "+"
             : isCheck ? "?"
             : isSkip  ? "↷"
             : "●";

  return (
    <div className={`bfs-banner ${cls}`}>
      <span className="bfs-banner-icon">{icon}</span>
      <div className="bfs-banner-body">
        <div className="bfs-banner-op">{current.description}</div>
        {current.detail && <div className="bfs-banner-sub">{current.detail}</div>}
      </div>
    </div>
  );
}

/* ── SVG Canvas ───────────────────────────────────────────────────────────── */
function BFSCanvas({ nodes, edges, current, startNodeId, onNodeClick, isPlaying }) {
  const nodeStates = current?.nodeStates ?? {};
  const edgeStates = current?.edgeStates ?? {};

  const nodeColor = {
    unvisited: { fill: "#f8fafc", stroke: "#94a3b8" },
    queued:    { fill: "#fef9c3", stroke: "#f59e0b" },
    visiting:  { fill: "#ede9fe", stroke: "#7c3aed" },
    visited:   { fill: "#dcfce7", stroke: "#22c55e" },
  };

  return (
    <div className="bfs-canvas-wrap">
      <svg viewBox="0 0 400 310" className="bfs-svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="bfs-arrow-default" markerWidth="9" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 9 3, 0 6" fill="#cbd5e1" />
          </marker>
          <marker id="bfs-arrow-tree" markerWidth="9" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 9 3, 0 6" fill="#7c3aed" />
          </marker>
          <marker id="bfs-arrow-check" markerWidth="9" markerHeight="6" refX="8" refY="3" orient="auto">
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

          const state  = edgeStates[edge.id] ?? "default";
          const edgeCls = `bfs-edge bfs-edge-${state}`;

          return (
            <line key={edge.id} x1={x1} y1={y1} x2={x2} y2={y2} className={edgeCls} />
          );
        })}

        {/* Düğümler */}
        {nodes.map((node) => {
          const state  = nodeStates[node.id] ?? "unvisited";
          const colors = nodeColor[state] ?? nodeColor.unvisited;
          const isStart   = node.id === startNodeId;
          const isActive  = node.id === current?.activeNodeId;
          const isChecked = node.id === current?.checkNeighbor;

          return (
            <g
              key={node.id}
              onClick={() => !isPlaying && onNodeClick(node.id)}
              style={{ cursor: isPlaying ? "default" : "pointer" }}
              className="bfs-node-group"
            >
              <circle
                cx={node.x} cy={node.y} r={NODE_R}
                fill={colors.fill}
                stroke={isActive ? "#7c3aed" : isChecked ? "#f59e0b" : colors.stroke}
                strokeWidth={isActive || isChecked ? 3 : isStart && state === "unvisited" ? 2.5 : 2}
                strokeDasharray={isStart && state === "unvisited" ? "5 3" : undefined}
                className={`bfs-node bfs-node-${state}`}
              />
              <text
                x={node.x} y={node.y + 1}
                textAnchor="middle" dominantBaseline="middle"
                className="bfs-node-label"
              >
                {node.label}
              </text>
              {isStart && state === "unvisited" && (
                <text
                  x={node.x} y={node.y - NODE_R - 6}
                  textAnchor="middle"
                  className="bfs-start-tag"
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

/* ── Kuyruk Görünümü ──────────────────────────────────────────────────────── */
function QueueView({ queue, nodes }) {
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));
  return (
    <div className="bfs-queue-wrap">
      <div className="bfs-queue-title">
        <span className="bfs-queue-label">Kuyruk</span>
        <span className="bfs-queue-hint">ön → arka</span>
      </div>
      <div className="bfs-queue-body">
        {queue.length === 0 ? (
          <span className="bfs-queue-empty">boş</span>
        ) : (
          queue.map((id, i) => (
            <span key={i} className="bfs-queue-item">
              {i === 0 && <span className="bfs-queue-front">ön</span>}
              <span className="bfs-queue-node">{nodeMap[id]?.label ?? "?"}</span>
              {i < queue.length - 1 && <span className="bfs-queue-arrow">→</span>}
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
    <div className="bfs-order-wrap">
      <span className="bfs-order-title">Ziyaret Sırası</span>
      <div className="bfs-order-body">
        {visitOrder.length === 0 ? (
          <span className="bfs-order-empty">henüz yok</span>
        ) : (
          visitOrder.map((id, i) => (
            <span key={i} className="bfs-order-item">
              <span className="bfs-order-num">{i + 1}</span>
              <span className="bfs-order-node">{nodeMap[id]?.label ?? "?"}</span>
              {i < visitOrder.length - 1 && <span className="bfs-order-sep">→</span>}
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
    { cls: "leg-unvisited", label: "Ziyaret edilmedi" },
    { cls: "leg-queued",    label: "Kuyrukta" },
    { cls: "leg-visiting",  label: "İşleniyor" },
    { cls: "leg-visited",   label: "Ziyaret edildi" },
  ];
  return (
    <div className="bfs-legend">
      {items.map((item) => (
        <div key={item.cls} className="bfs-legend-item">
          <span className={`bfs-legend-dot ${item.cls}`} />
          <span className="bfs-legend-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Accordion ────────────────────────────────────────────────────────────── */
function AccordionSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`bfs-accordion ${open ? "bfs-acc-open" : ""}`}>
      <button className="bfs-acc-header" onClick={() => setOpen((v) => !v)}>
        <span className="bfs-acc-title">{title}</span>
        <svg className="bfs-acc-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="bfs-acc-body">{children}</div>}
    </div>
  );
}

/* ── Ana Bileşen ──────────────────────────────────────────────────────────── */
export default function BFS() {
  const {
    nodes, edges,
    current, stepIndex, totalSteps, isDone,
    isPlaying, speed, setSpeed,
    activePreset, loadPreset,
    startNodeId, changeStart,
    togglePlay, stepForward, stepBackward,
  } = useBFS();

  const activePseudoLine = current?.activeLine != null ? LINE_MAP[current.activeLine] ?? null : null;

  return (
    <div className="sorting-page">
      <div className="page-container">

        {/* ── Header ── */}
        <div className="page-header">
          <div>
            <div className="page-tag">Graf Algoritması</div>
            <h1 className="page-title">BFS — Genişlik Öncelikli Arama</h1>
            <p className="page-subtitle">
              Grafı katman katman keşfeder, kuyruğu kullanarak en yakın komşulardan başlar.
            </p>
          </div>
        </div>

        <div className="page-body">

          {/* ══════════ SOL: Görselleştirici ══════════ */}
          <div className="visualizer-col">

            <OpBanner current={current} />

            <BFSCanvas
              nodes={nodes}
              edges={edges}
              current={current}
              startNodeId={startNodeId}
              onNodeClick={changeStart}
              isPlaying={isPlaying}
            />

            <Legend />

            <QueueView  queue={current?.queue ?? []}      nodes={nodes} />
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
                  <span className="bfs-start-hint">
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
                {Object.entries(BFS_PRESETS).map(([key, p]) => (
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
              <ol className="bfs-how-list">
                <li>Başlangıç düğümü kuyruğa eklenir ve ziyaret edildi olarak işaretlenir.</li>
                <li>Kuyruktan bir düğüm çıkarılır ve tüm komşuları incelenir.</li>
                <li>Daha önce ziyaret edilmemiş her komşu kuyruğa eklenir.</li>
                <li>Kuyruk boşalana kadar bu işlem tekrar edilir.</li>
                <li>BFS, başlangıç düğümüne en yakın düğümleri önce ziyaret eder — katman katman ilerler.</li>
                <li>Bu özellik sayesinde BFS, ağırlıksız graflarda en kısa yolu garantiler.</li>
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

            <AccordionSection title="Karmaşıklık Analizi" defaultOpen={true}>
              <div className="bfs-cmplx-grid">
                <div className="bfs-cmplx-cell cmplx-time">
                  <span className="bfs-cmplx-op">Zaman</span>
                  <span className="bfs-cmplx-val">O(V+E)</span>
                  <span className="bfs-cmplx-sub">her düğüm ve kenar bir kez</span>
                </div>
                <div className="bfs-cmplx-cell cmplx-space">
                  <span className="bfs-cmplx-op">Alan</span>
                  <span className="bfs-cmplx-val">O(V)</span>
                  <span className="bfs-cmplx-sub">kuyruk ve ziyaret seti</span>
                </div>
              </div>
              <div className="complexity-list" style={{ marginTop: 12 }}>
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-green">O(V+E)</div>
                  <p className="complexity-row-desc">
                    Her düğüm kuyruğa tam bir kez girer ve çıkar. Her kenar iki kez kontrol edilir.
                    Toplam işlem sayısı düğüm ve kenar sayısının toplamıyla orantılıdır.
                  </p>
                </div>
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-yellow">Adj. Matrix ile O(V²)</div>
                  <p className="complexity-row-desc">
                    Komşuluk matrisi kullanıldığında her düğümün tüm komşularını bulmak
                    O(V) zaman alır, bu da toplam O(V²) yapar. Adj. List tercih edilmeli.
                  </p>
                </div>
              </div>
            </AccordionSection>

            <AccordionSection title="BFS vs DFS">
              <div className="scenario-table">
                <div className="scenario-header">
                  <span>Özellik</span>
                  <span>BFS</span>
                  <span>DFS</span>
                </div>
                <div className="scenario-row">
                  <span>Yapı</span>
                  <span className="scenario-val good">Kuyruk (FIFO)</span>
                  <span className="scenario-val">Stack (LIFO)</span>
                </div>
                <div className="scenario-row">
                  <span>Dolaşım</span>
                  <span className="scenario-val good">Katman katman</span>
                  <span className="scenario-val">Derine iner</span>
                </div>
                <div className="scenario-row">
                  <span>En kısa yol</span>
                  <span className="scenario-val good">Garantiler ✓</span>
                  <span className="scenario-val">Garantilemez</span>
                </div>
                <div className="scenario-row">
                  <span>Bellek</span>
                  <span className="scenario-val">Fazla (geniş)</span>
                  <span className="scenario-val good">Az (derin)</span>
                </div>
                <div className="scenario-row">
                  <span>Zaman</span>
                  <span className="scenario-val">O(V+E)</span>
                  <span className="scenario-val">O(V+E)</span>
                </div>
              </div>
              <p className="scenario-note" style={{ marginTop: 8 }}>
                Hangisini seçeceğin probleme bağlı: <strong>en kısa yol</strong> için BFS,
                <strong> tüm yolları keşfet / döngü tespiti</strong> için DFS.
              </p>
            </AccordionSection>

            <AccordionSection title="Gerçek Hayatta">
              <ul className="bfs-usage-list">
                <li className="bfs-usage-item">
                  <span className="bfs-usage-icon">🗺️</span>
                  <span className="bfs-usage-text">
                    <strong>GPS ve Navigasyon</strong> — ağırlıksız graflarda iki nokta arasındaki
                    en az adımlı yolu BFS garantiler.
                  </span>
                </li>
                <li className="bfs-usage-item">
                  <span className="bfs-usage-icon">👥</span>
                  <span className="bfs-usage-text">
                    <strong>Sosyal Ağ Mesafesi</strong> — "kaç adımda tanışırsın?" sorusu BFS ile
                    O(V+E) sürede cevaplanır. LinkedIn "2. derece bağlantı" özelliği buna örnek.
                  </span>
                </li>
                <li className="bfs-usage-item">
                  <span className="bfs-usage-icon">🌐</span>
                  <span className="bfs-usage-text">
                    <strong>Web Crawler</strong> — arama motorları web sayfalarını BFS ile tarıyarak
                    bağlantılı sayfaları keşfeder.
                  </span>
                </li>
                <li className="bfs-usage-item">
                  <span className="bfs-usage-icon">🎮</span>
                  <span className="bfs-usage-text">
                    <strong>Oyun / Bulmaca</strong> — labirent çözme, Rubik küp, 15-puzzle gibi
                    problemlerde en az hamle sayısını BFS bulur.
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
