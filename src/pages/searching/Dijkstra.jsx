import { useState } from "react";
import { useDijkstra, DIJKSTRA_PRESETS } from "../../visualizers/searching/useDijkstra";
import "../sorting/SortingPage.css";
import "../data-structures/DataStructuresPage.css";
import "./Dijkstra.css";

const NODE_R = 22;

/* ── Pseudocode ───────────────────────────────────────────────────────────── */
const PSEUDO = [
  { text: "Dijkstra(graf, başlangıç):",       header: true },
  { text: "  dist[v] ← ∞   for v ∈ V"                     },
  { text: "  dist[başlangıç] ← 0"                          },
  { text: "  işlenmedi ← tüm düğümler"                     },
  { sep: true },
  { text: "  while işlenmedi boş değil:"                   },
  { text: "    u ← min_dist(işlenmedi)"                    },
  { text: "    işlenmedi.çıkar(u)"                         },
  { sep: true },
  { text: "    for (v, w) in komşular[u]:"                 },
  { text: "      yeni ← dist[u] + w"                      },
  { text: "      if yeni < dist[v]:"                       },
  { text: "        dist[v] ← yeni"                         },
  { sep: true },
  { text: "  return dist"                                  },
];

const LINE_MAP = {
  0: 1,   // dist[v] ← ∞
  1: 2,   // dist[start] ← 0
  2: 6,   // u ← min_dist
  3: 7,   // işlenmedi.çıkar(u)
  4: 10,  // yeni ← dist[u] + w
  5: 12,  // dist[v] ← yeni
  6: 11,  // if yeni < dist[v]  (false branch)
  7: 14,  // return dist
};

/* ── Op Banner ────────────────────────────────────────────────────────────── */
function OpBanner({ current }) {
  if (!current) return null;

  const isDone    = current.description?.startsWith("Dijkstra tamamlandı");
  const isSelect  = current.description?.includes("seçildi");
  const isSettle  = current.description?.includes("kesinleşti");
  const isRelax   = current.description?.includes("güncellendi →");
  const isNoRelax = current.description?.includes("güncellenmedi");
  const isCheck   = current.description?.includes("ağırlık");

  const cls = isDone    ? "dijk-banner-done"
            : isSettle  ? "dijk-banner-settle"
            : isRelax   ? "dijk-banner-relax"
            : isSelect  ? "dijk-banner-select"
            : isCheck   ? "dijk-banner-check"
            : isNoRelax ? "dijk-banner-skip"
            : "dijk-banner-idle";

  const icon = isDone    ? "✓"
             : isSettle  ? "✓"
             : isRelax   ? "↓"
             : isSelect  ? "◉"
             : isCheck   ? "?"
             : isNoRelax ? "↷"
             : "●";

  return (
    <div className={`dijk-banner ${cls}`}>
      <span className="dijk-banner-icon">{icon}</span>
      <div className="dijk-banner-body">
        <div className="dijk-banner-op">{current.description}</div>
        {current.detail && <div className="dijk-banner-sub">{current.detail}</div>}
      </div>
    </div>
  );
}

/* ── SVG Canvas ───────────────────────────────────────────────────────────── */
function DijkstraCanvas({ nodes, edges, current, startNodeId, onNodeClick, isPlaying }) {
  const nodeStates = current?.nodeStates ?? {};
  const edgeStates = current?.edgeStates ?? {};
  const distances  = current?.distances  ?? {};

  const nodeColor = {
    unvisited: { fill: "#f8fafc", stroke: "#94a3b8" },
    updated:   { fill: "#fffbeb", stroke: "#fbbf24" },
    current:   { fill: "#fef3c7", stroke: "#f59e0b" },
    settled:   { fill: "#dcfce7", stroke: "#22c55e" },
  };

  return (
    <div className="dijk-canvas-wrap">
      <svg viewBox="0 0 440 380" className="dijk-svg" preserveAspectRatio="xMidYMid meet">
        {/* Kenarlar + Ağırlık Etiketleri */}
        {edges.map((edge) => {
          const from = nodes.find((n) => n.id === edge.from);
          const to   = nodes.find((n) => n.id === edge.to);
          if (!from || !to) return null;

          const dx  = to.x - from.x, dy = to.y - from.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len < 1) return null;
          const nx = dx / len, ny = dy / len;
          const x1 = from.x + nx * NODE_R;
          const y1 = from.y + ny * NODE_R;
          const x2 = to.x   - nx * NODE_R;
          const y2 = to.y   - ny * NODE_R;

          // Ağırlık etiketi — kenara dik ofset
          const perpX   = -ny * 13;
          const perpY   =  nx * 13;
          const weightX = (x1 + x2) / 2 + perpX;
          const weightY = (y1 + y2) / 2 + perpY;

          const state   = edgeStates[edge.id] ?? "default";
          const edgeCls = `dijk-edge dijk-edge-${state}`;

          return (
            <g key={edge.id}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} className={edgeCls} />
              <rect
                x={weightX - 10} y={weightY - 9}
                width={20} height={17}
                rx={4}
                className="dijk-weight-bg"
              />
              <text x={weightX} y={weightY + 4} textAnchor="middle" className="dijk-weight-label">
                {edge.weight}
              </text>
            </g>
          );
        })}

        {/* Düğümler */}
        {nodes.map((node) => {
          const state    = nodeStates[node.id] ?? "unvisited";
          const colors   = nodeColor[state] ?? nodeColor.unvisited;
          const isStart  = node.id === startNodeId;
          const isActive = node.id === current?.activeNodeId;
          const isCheck  = node.id === current?.checkNeighbor;
          const dist     = distances[node.id];
          const distLabel = dist === undefined || dist === Infinity ? "∞" : String(dist);

          return (
            <g
              key={node.id}
              onClick={() => !isPlaying && onNodeClick(node.id)}
              style={{ cursor: isPlaying ? "default" : "pointer" }}
              className="dijk-node-group"
            >
              <circle
                cx={node.x} cy={node.y} r={NODE_R}
                fill={colors.fill}
                stroke={isActive ? "#f59e0b" : isCheck ? "#3b82f6" : colors.stroke}
                strokeWidth={isActive || isCheck ? 3 : isStart && state === "unvisited" ? 2.5 : 2}
                strokeDasharray={isStart && state === "unvisited" ? "5 3" : undefined}
                className={`dijk-node dijk-node-${state}`}
              />
              <text
                x={node.x} y={node.y - 3}
                textAnchor="middle" dominantBaseline="middle"
                className="dijk-node-label"
              >
                {node.label}
              </text>
              <text
                x={node.x} y={node.y + 10}
                textAnchor="middle" dominantBaseline="middle"
                className="dijk-node-dist"
              >
                {distLabel}
              </text>
              {isStart && state === "unvisited" && (
                <text x={node.x} y={node.y - NODE_R - 6} textAnchor="middle" className="dijk-start-tag">
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

/* ── Mesafe Tablosu ───────────────────────────────────────────────────────── */
function DistanceTable({ nodes, current }) {
  const distances = current?.distances  ?? {};
  const prev      = current?.prev       ?? {};
  const settled   = current?.settled    ?? [];
  const activeId  = current?.activeNodeId;
  const nodeMap   = Object.fromEntries(nodes.map((n) => [n.id, n]));

  function dStr(id) {
    const d = distances[id];
    return d === undefined || d === Infinity ? "∞" : String(d);
  }

  function prevLabel(nodeId) {
    const p = prev[nodeId];
    if (p === null || p === undefined) return "—";
    return nodeMap[p]?.label ?? "?";
  }

  function rowCls(node) {
    if (settled.includes(node.id))       return "dijk-table-row dtr-settled";
    if (node.id === activeId)            return "dijk-table-row dtr-current";
    if (distances[node.id] !== Infinity) return "dijk-table-row dtr-updated";
    return "dijk-table-row";
  }

  function NodeRow({ node }) {
    return (
      <div className={rowCls(node)}>
        <span className="dtr-node">{node.label}</span>
        <span className="dtr-dist">{dStr(node.id)}</span>
        <span className="dtr-prev">{prevLabel(node.id)}</span>
      </div>
    );
  }

  const TableHead = () => (
    <div className="dijk-table-head">
      <span>Düğüm</span>
      <span>Mesafe</span>
      <span>Önceki</span>
    </div>
  );

  // 7+ düğümde iki sütunlu düzen
  const useTwoCols = nodes.length > 6;
  const half       = Math.ceil(nodes.length / 2);
  const leftNodes  = useTwoCols ? nodes.slice(0, half) : nodes;
  const rightNodes = useTwoCols ? nodes.slice(half)    : [];

  return (
    <div className="dijk-table-wrap">
      <span className="dijk-table-title">Mesafe Tablosu</span>
      {useTwoCols ? (
        <div className="dijk-table-two-col">
          <div className="dijk-table-col">
            <TableHead />
            {leftNodes.map((n) => <NodeRow key={n.id} node={n} />)}
          </div>
          <div className="dijk-table-col">
            <TableHead />
            {rightNodes.map((n) => <NodeRow key={n.id} node={n} />)}
          </div>
        </div>
      ) : (
        <div className="dijk-table-grid">
          <TableHead />
          {leftNodes.map((n) => <NodeRow key={n.id} node={n} />)}
        </div>
      )}
    </div>
  );
}

/* ── Renk Açıklaması ──────────────────────────────────────────────────────── */
function Legend() {
  const items = [
    { cls: "dleg-unvisited", label: "Ziyaret edilmedi" },
    { cls: "dleg-updated",   label: "Mesafe güncellendi" },
    { cls: "dleg-current",   label: "İşleniyor" },
    { cls: "dleg-settled",   label: "Kesinleşti" },
  ];
  return (
    <div className="dijk-legend">
      {items.map((item) => (
        <div key={item.cls} className="dijk-legend-item">
          <span className={`dijk-legend-dot ${item.cls}`} />
          <span className="dijk-legend-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Accordion ────────────────────────────────────────────────────────────── */
function AccordionSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`dijk-accordion ${open ? "dijk-acc-open" : ""}`}>
      <button className="dijk-acc-header" onClick={() => setOpen((v) => !v)}>
        <span className="dijk-acc-title">{title}</span>
        <svg className="dijk-acc-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="dijk-acc-body">{children}</div>}
    </div>
  );
}

/* ── Ana Bileşen ──────────────────────────────────────────────────────────── */
export default function Dijkstra() {
  const {
    nodes, edges,
    current, stepIndex, totalSteps, isDone,
    isPlaying, speed, setSpeed,
    activePreset, loadPreset,
    startNodeId, changeStart,
    togglePlay, stepForward, stepBackward,
  } = useDijkstra();

  const activePseudoLine = current?.activeLine != null ? LINE_MAP[current.activeLine] ?? null : null;

  return (
    <div className="sorting-page">
      <div className="page-container">

        {/* ── Header ── */}
        <div className="page-header">
          <div>
            <div className="page-tag">Graf Algoritması</div>
            <h1 className="page-title">Dijkstra — En Kısa Yol</h1>
            <p className="page-subtitle">
              Ağırlıklı graflarda bir başlangıç düğümünden tüm diğer düğümlere en kısa yolu bulur.
            </p>
          </div>
        </div>

        <div className="page-body">

          {/* ══════════ SOL: Görselleştirici ══════════ */}
          <div className="visualizer-col">

            <OpBanner current={current} />

            <DijkstraCanvas
              nodes={nodes}
              edges={edges}
              current={current}
              startNodeId={startNodeId}
              onNodeClick={changeStart}
              isPlaying={isPlaying}
            />

            <Legend />

            <DistanceTable nodes={nodes} current={current} />

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
                  <span className="dijk-start-hint">
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
                {Object.entries(DIJKSTRA_PRESETS).map(([key, p]) => (
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
              <ol className="dijk-how-list">
                <li>Başlangıç düğümünün mesafesi 0, diğerlerinin mesafesi ∞ olarak atanır.</li>
                <li>İşlenmemiş düğümler arasından mesafesi en küçük olan seçilir.</li>
                <li>Seçilen düğümün tüm komşuları incelenir: mevcut mesafe + kenar ağırlığı hesaplanır.</li>
                <li>Bu yeni değer komşunun mevcut mesafesinden küçükse güncellenir (relaxation).</li>
                <li>Seçilen düğüm "kesinleşti" olarak işaretlenir — mesafesi artık değişmez.</li>
                <li>Tüm düğümler kesinleşene kadar 2–5 adımları tekrar edilir.</li>
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

            <AccordionSection title="Neden Çalışır?" defaultOpen={true}>
              <p className="dijk-proof-intro">
                Dijkstra'nın doğruluğu <strong>açgözlü seçim özelliğine</strong> dayanır:
              </p>
              <div className="dijk-proof-steps">
                <div className="dijk-proof-item">
                  <span className="dijk-proof-num">1</span>
                  <p>En küçük mesafeli düğüm seçildiğinde, o düğüme giden yol zaten en kısadır.
                     Daha uzun bir yol varsa ağırlık negatif olmadığı sürece kısaltılamaz.</p>
                </div>
                <div className="dijk-proof-item">
                  <span className="dijk-proof-num">2</span>
                  <p>Kesinleşen her düğümün mesafesi kalıcıdır. Henüz işlenmemiş düğümlerden
                     geçen yollar ancak daha uzun olabilir.</p>
                </div>
                <div className="dijk-proof-item">
                  <span className="dijk-proof-num">3</span>
                  <p>Bu yüzden Dijkstra yalnızca <strong>negatif olmayan ağırlıklarla</strong> doğru
                     çalışır. Negatif kenar için Bellman-Ford kullanılmalıdır.</p>
                </div>
              </div>
            </AccordionSection>

            <AccordionSection title="Karmaşıklık Analizi" defaultOpen={true}>
              <div className="dijk-cmplx-grid">
                <div className="dijk-cmplx-cell cmplx-time">
                  <span className="dijk-cmplx-op">Zaman</span>
                  <span className="dijk-cmplx-val">O(V²)</span>
                  <span className="dijk-cmplx-sub">basit dizi ile</span>
                </div>
                <div className="dijk-cmplx-cell cmplx-time">
                  <span className="dijk-cmplx-op">Zaman</span>
                  <span className="dijk-cmplx-val">O((V+E) log V)</span>
                  <span className="dijk-cmplx-sub">min-heap ile</span>
                </div>
              </div>
              <div className="complexity-list" style={{ marginTop: 12 }}>
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-green">Min-Heap</div>
                  <p className="complexity-row-desc">
                    Her kenar en fazla bir kez işlenir, her düğüm heap'ten bir kez çıkar.
                    Bu görselleştirme O(V²) yaklaşımını göstermektedir.
                  </p>
                </div>
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-yellow">Alan: O(V)</div>
                  <p className="complexity-row-desc">
                    Mesafe dizisi ve önceki düğüm (prev) dizisi V boyutunda.
                    Priority queue en fazla V eleman tutar.
                  </p>
                </div>
              </div>
            </AccordionSection>

            <AccordionSection title="BFS vs Dijkstra">
              <div className="scenario-table">
                <div className="scenario-header">
                  <span>Özellik</span>
                  <span>BFS</span>
                  <span>Dijkstra</span>
                </div>
                <div className="scenario-row">
                  <span>Kenar ağırlığı</span>
                  <span className="scenario-val">Ağırlıksız</span>
                  <span className="scenario-val good">Ağırlıklı ✓</span>
                </div>
                <div className="scenario-row">
                  <span>Kullandığı yapı</span>
                  <span className="scenario-val">Kuyruk (FIFO)</span>
                  <span className="scenario-val good">Min-Heap</span>
                </div>
                <div className="scenario-row">
                  <span>En kısa yol</span>
                  <span className="scenario-val">Adım sayısı</span>
                  <span className="scenario-val good">Toplam ağırlık ✓</span>
                </div>
                <div className="scenario-row">
                  <span>Negatif kenar</span>
                  <span className="scenario-val">—</span>
                  <span className="scenario-val">Desteklemez ✗</span>
                </div>
                <div className="scenario-row">
                  <span>Zaman</span>
                  <span className="scenario-val">O(V+E)</span>
                  <span className="scenario-val">O((V+E) log V)</span>
                </div>
              </div>
              <p className="scenario-note" style={{ marginTop: 8 }}>
                Ağırlıksız graflar için BFS yeterlidir ve daha hızlıdır.
                Ağırlıklı graflar için Dijkstra, negatif ağırlıklar içinse Bellman-Ford tercih edilir.
              </p>
            </AccordionSection>

            <AccordionSection title="Gerçek Hayatta">
              <ul className="dijk-usage-list">
                <li className="dijk-usage-item">
                  <span className="dijk-usage-icon">🗺️</span>
                  <span className="dijk-usage-text">
                    <strong>GPS Navigasyon</strong> — Google Maps, Yandex ve benzeri uygulamalar
                    ağırlıklı yol grafı üzerinde Dijkstra (veya türevlerini) kullanarak en hızlı
                    rotayı hesaplar.
                  </span>
                </li>
                <li className="dijk-usage-item">
                  <span className="dijk-usage-icon">🌐</span>
                  <span className="dijk-usage-text">
                    <strong>Ağ Yönlendirme</strong> — İnternet paketleri, OSPF protokolü aracılığıyla
                    Dijkstra ile en düşük maliyetli yoldan yönlendirilir.
                  </span>
                </li>
                <li className="dijk-usage-item">
                  <span className="dijk-usage-icon">✈️</span>
                  <span className="dijk-usage-text">
                    <strong>Uçuş Planlama</strong> — Havayolları, aktarmalı uçuşlarda en ucuz veya
                    en kısa süreli bağlantıyı Dijkstra tabanlı algoritmalarla bulur.
                  </span>
                </li>
                <li className="dijk-usage-item">
                  <span className="dijk-usage-icon">🎮</span>
                  <span className="dijk-usage-text">
                    <strong>Oyun Yapay Zekası</strong> — Harita üzerinde farklı zemin maliyetleri
                    olan oyunlarda karakterlerin en verimli yolu bulması için kullanılır.
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
