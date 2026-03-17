import { useState } from "react";
import { useGraph, GRAPH_PRESETS } from "../../visualizers/data-structures/useGraph";
import "../sorting/SortingPage.css";
import "./DataStructuresPage.css";
import "./Graph.css";

/* ── Sabitler ─────────────────────────────────────────────────────────────── */
const NODE_R      = 22;   // düğüm yarıçapı (px)
const ARROW_EXTRA = 8;    // ok ucu boşluğu

/* ── Pseudocode verisi ────────────────────────────────────────────────────── */
const PSEUDO = [
  { text: "ADD_NODE(label):",                 header: true },
  { text: "  düğüm ← yeni Düğüm(label)"                  },
  { text: "  V.ekle(düğüm)"                               },
  { text: "  adjList[düğüm] ← []"                         },
  { sep: true },
  { text: "ADD_EDGE(u, v):",                  header: true },
  { text: "  eğer u ∈ V ve v ∈ V:"                        },
  { text: "    E.ekle((u, v))"                             },
  { text: "    adjList[u].ekle(v)"                         },
  { text: "    eğer yönsüz:"                               },
  { text: "      adjList[v].ekle(u)"                       },
  { sep: true },
  { text: "REMOVE_EDGE(u, v):",               header: true },
  { text: "  E.sil((u, v))"                               },
  { text: "  adjList[u].sil(v)"                            },
  { text: "  eğer yönsüz:"                                },
  { text: "    adjList[v].sil(u)"                          },
  { sep: true },
  { text: "REMOVE_NODE(u):",                  header: true },
  { text: "  V.sil(u)"                                     },
  { text: "  adjList.sil(u)"                               },
  { text: "  E.sil(e | u ∈ e)"                             },
];

/* ── Operasyon Banner ─────────────────────────────────────────────────────── */
function OpBanner({ lastOp, edgeMode }) {
  const isEdgeMode = edgeMode !== false;

  if (isEdgeMode) {
    const cls   = edgeMode === "from" ? "gr-banner-edgefrom" : "gr-banner-edgeto";
    const icon  = edgeMode === "from" ? "○" : "◎";
    const title = edgeMode === "from" ? "KAYNAK SEÇ" : "HEDEF SEÇ";
    const sub   = edgeMode === "from"
      ? "Kenarın başlayacağı düğüme tıkla"
      : "Kenarın biteceği düğüme tıkla";
    return (
      <div className={`gr-banner ${cls}`}>
        <span className="gr-banner-icon">{icon}</span>
        <div className="gr-banner-body">
          <div className="gr-banner-op">{title}</div>
          <div className="gr-banner-sub">{sub}</div>
        </div>
      </div>
    );
  }

  const typeMap = {
    idle:          { icon: "⊙", cls: "gr-banner-idle",    op: "Hazır",          sub: "Düğüme tıkla, işlem başlat veya preset seç" },
    selectNode:    { icon: "●", cls: "gr-banner-select",  op: "DÜĞÜM SEÇİLDİ", sub: lastOp.description },
    selectEdge:    { icon: "—", cls: "gr-banner-select",  op: "KENAR SEÇİLDİ", sub: lastOp.description },
    addNode:       { icon: "+", cls: "gr-banner-add",     op: "DÜĞÜM EKLENDİ", sub: lastOp.description },
    addEdge:       { icon: "↔", cls: "gr-banner-add",     op: "KENAR EKLENDİ", sub: lastOp.description },
    removeNode:    { icon: "✕", cls: "gr-banner-remove",  op: "DÜĞÜM SİLİNDİ", sub: lastOp.description },
    removeEdge:    { icon: "✕", cls: "gr-banner-remove",  op: "KENAR SİLİNDİ", sub: lastOp.description },
    toggleDirected:{ icon: "→", cls: "gr-banner-toggle",  op: "MOD DEĞİŞTİ",   sub: lastOp.description },
    error:         { icon: "!", cls: "gr-banner-error",   op: "HATA",           sub: lastOp.description },
  };

  const cfg = typeMap[lastOp?.type] ?? typeMap.idle;

  return (
    <div className={`gr-banner ${cfg.cls}`}>
      <span className="gr-banner-icon">{cfg.icon}</span>
      <div className="gr-banner-body">
        <div className="gr-banner-op">{cfg.op}</div>
        <div className="gr-banner-sub">{cfg.sub}</div>
      </div>
    </div>
  );
}

/* ── Graf SVG Canvas ──────────────────────────────────────────────────────── */
function GraphCanvas({
  nodes, edges, directed,
  selectedNodeId, selectedEdgeId,
  highlightId, edgeMode, edgeFrom,
  onNodeClick, onEdgeClick,
}) {
  return (
    <div className="gr-canvas-wrap">
      <svg viewBox="0 0 400 310" className="gr-svg" preserveAspectRatio="xMidYMid meet">

        {/* Ok ucu tanımları (directed graflar için) */}
        <defs>
          <marker id="gr-arrow"        markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" className="gr-arrowhead" />
          </marker>
          <marker id="gr-arrow-sel"    markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" className="gr-arrowhead-sel" />
          </marker>
          <marker id="gr-arrow-new"    markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" className="gr-arrowhead-new" />
          </marker>
        </defs>

        {/* ── Kenarlar ── */}
        {edges.map((edge) => {
          const fromNode = nodes.find((n) => n.id === edge.from);
          const toNode   = nodes.find((n) => n.id === edge.to);
          if (!fromNode || !toNode) return null;

          const dx  = toNode.x - fromNode.x;
          const dy  = toNode.y - fromNode.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len < 1) return null;

          const nx = dx / len;
          const ny = dy / len;
          const x1 = fromNode.x + nx * NODE_R;
          const y1 = fromNode.y + ny * NODE_R;
          const x2 = toNode.x   - nx * (NODE_R + (directed ? ARROW_EXTRA : 0));
          const y2 = toNode.y   - ny * (NODE_R + (directed ? ARROW_EXTRA : 0));

          const isSelected  = edge.id === selectedEdgeId;
          const isNew       = highlightId === `e${edge.id}`;
          const isConnected = edge.from === selectedNodeId || edge.to === selectedNodeId;
          const arrowMark   = isSelected ? "url(#gr-arrow-sel)"
                            : isNew      ? "url(#gr-arrow-new)"
                            :              "url(#gr-arrow)";

          return (
            <g key={edge.id} className="gr-edge-group" onClick={() => onEdgeClick(edge.id)} style={{ cursor: "pointer" }}>
              {/* Geniş tıklanabilir alan */}
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth="14" />
              {/* Görsel kenar */}
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                className={`gr-edge ${isSelected ? "gr-edge-selected" : ""} ${isNew ? "gr-edge-new" : ""} ${isConnected && !isSelected ? "gr-edge-connected" : ""}`}
                markerEnd={directed ? arrowMark : undefined}
              />
            </g>
          );
        })}

        {/* ── Düğümler ── */}
        {nodes.map((node) => {
          const isSelected  = node.id === selectedNodeId;
          const isEdgeFrom  = node.id === edgeFrom;
          const isNew       = highlightId === `n${node.id}`;
          const isEdgeTarget = edgeMode === "to" && node.id !== edgeFrom;

          return (
            <g
              key={node.id}
              className="gr-node-group"
              onClick={() => onNodeClick(node.id)}
              style={{ cursor: "pointer" }}
            >
              <circle
                cx={node.x} cy={node.y} r={NODE_R}
                className={[
                  "gr-node",
                  isSelected  ? "gr-node-selected"  : "",
                  isEdgeFrom  ? "gr-node-edgefrom"  : "",
                  isNew       ? "gr-node-new"        : "",
                  isEdgeTarget ? "gr-node-edgetarget": "",
                ].join(" ")}
              />
              <text
                x={node.x} y={node.y + 1}
                className="gr-node-label"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {node.label}
              </text>
            </g>
          );
        })}

        {/* Boş durum */}
        {nodes.length === 0 && (
          <text x="200" y="165" textAnchor="middle" className="gr-empty-text">
            Düğüm eklemek için butona tıkla
          </text>
        )}
      </svg>
    </div>
  );
}

/* ── İstatistik Satırı ────────────────────────────────────────────────────── */
function StatsRow({ nodes, edges, directed }) {
  const V       = nodes.length;
  const E       = edges.length;
  const maxE    = directed ? V * (V - 1) : (V * (V - 1)) / 2;
  const density = maxE > 0 ? (E / maxE) : 0;

  return (
    <div className="gr-stats">
      <div className="gr-stat">
        <span className="gr-stat-val">{V}</span>
        <span className="gr-stat-label">Düğüm (V)</span>
      </div>
      <div className="gr-stat">
        <span className="gr-stat-val">{E}</span>
        <span className="gr-stat-label">Kenar (E)</span>
      </div>
      <div className="gr-stat">
        <span className="gr-stat-val gr-stat-small">{density.toFixed(2)}</span>
        <span className="gr-stat-label">Yoğunluk</span>
      </div>
      <div className="gr-stat">
        <span className={`gr-stat-val gr-stat-small ${directed ? "gr-directed" : "gr-undirected"}`}>
          {directed ? "Yönlü" : "Yönsüz"}
        </span>
        <span className="gr-stat-label">Tür</span>
      </div>
    </div>
  );
}

/* ── Adım Açıklaması ──────────────────────────────────────────────────────── */
function StepBox({ lastOp, edgeMode }) {
  if (edgeMode !== false) return null;

  const isError = lastOp?.type === "error";
  const isOk    = ["addNode", "addEdge", "removeNode", "removeEdge"].includes(lastOp?.type);
  const cls     = isError ? "gr-step-fail" : isOk ? "gr-step-ok" : "gr-step-idle";

  return (
    <div className={`gr-step ${cls}`}>
      {lastOp?.type === "idle" || !lastOp
        ? "▶ Bir düğüme tıkla ya da işlem başlat"
        : lastOp.description}
    </div>
  );
}

/* ── Adjacency List Görünümü ──────────────────────────────────────────────── */
function AdjacencyListView({ nodes, adjList, directed }) {
  if (nodes.length === 0) {
    return (
      <div className="gr-adjlist gr-adjlist-empty">
        <div className="gr-adjlist-title">Komşuluk Listesi</div>
        <div className="gr-adjlist-empty-text">Henüz düğüm yok</div>
      </div>
    );
  }

  return (
    <div className="gr-adjlist">
      <div className="gr-adjlist-title">
        Komşuluk Listesi
        <span className="gr-adjlist-badge">{directed ? "yönlü" : "yönsüz"}</span>
      </div>
      {nodes.map((node) => {
        const neighborIds = adjList[node.id] ?? [];
        const neighbors   = neighborIds
          .map((id) => nodes.find((n) => n.id === id)?.label)
          .filter(Boolean)
          .sort();
        return (
          <div key={node.id} className="gr-adjrow">
            <span className="gr-adjrow-node">{node.label}</span>
            <span className="gr-adjrow-arrow">→</span>
            <span className="gr-adjrow-chain">
              {neighbors.length === 0 ? (
                <span className="gr-adjrow-empty">∅</span>
              ) : (
                neighbors.map((label, i) => (
                  <span key={i} className="gr-adjrow-neighbor">
                    {label}
                    {i < neighbors.length - 1 && <span className="gr-adjrow-sep"> → </span>}
                  </span>
                ))
              )}
              <span className="gr-adjrow-null"> → null</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Adjacency Matrix Görünümü ────────────────────────────────────────────── */
function AdjacencyMatrixView({ nodes, adjMatrix }) {
  if (nodes.length === 0) return null;
  if (nodes.length > 7) {
    return (
      <div className="gr-matrix gr-matrix-overflow">
        <div className="gr-matrix-title">Komşuluk Matrisi</div>
        <div className="gr-matrix-overflow-text">
          Matris görünümü en fazla 7 düğüm için gösterilir. ({nodes.length} düğüm mevcut)
        </div>
      </div>
    );
  }

  return (
    <div className="gr-matrix">
      <div className="gr-matrix-title">Komşuluk Matrisi</div>
      <div className="gr-matrix-scroll">
        <table className="gr-matrix-table">
          <thead>
            <tr>
              <th className="gr-matrix-corner"></th>
              {nodes.map((n) => (
                <th key={n.id} className="gr-matrix-header">{n.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {adjMatrix.map((row, ri) => (
              <tr key={ri}>
                <td className="gr-matrix-rowhead">{nodes[ri]?.label}</td>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`gr-matrix-cell ${cell === 1 ? "gr-matrix-one" : "gr-matrix-zero"}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Accordion ────────────────────────────────────────────────────────────── */
function AccordionSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`gr-accordion ${open ? "gr-acc-open" : ""}`}>
      <button className="gr-acc-header" onClick={() => setOpen((v) => !v)}>
        <span className="gr-acc-title">{title}</span>
        <svg className="gr-acc-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="gr-acc-body">{children}</div>}
    </div>
  );
}

/* ── Ana bileşen ──────────────────────────────────────────────────────────── */
export default function Graf() {
  const {
    nodes, edges, directed,
    selectedNodeId, selectedEdgeId, highlightId,
    edgeMode, edgeFrom,
    lastOp,
    adjList, adjMatrix,
    activePreset, loadPreset,
    handleNodeClick, handleEdgeClick,
    addNode, startEdgeMode, cancelMode, removeSelected,
    toggleDirected,
  } = useGraph();

  const canDelete = selectedNodeId !== null || selectedEdgeId !== null;

  return (
    <div className="sorting-page">
      <div className="page-container">

        {/* ── Header ── */}
        <div className="page-header">
          <div>
            <div className="page-tag">Veri Yapısı</div>
            <h1 className="page-title">Graf (Graph)</h1>
            <p className="page-subtitle">
              Düğümler ve kenarlardan oluşan evrensel veri yapısı — sosyal ağlardan GPS'e her yerde.
            </p>
          </div>
        </div>

        <div className="page-body">

          {/* ══════════════════ SOL: Görselleştirici ══════════════════ */}
          <div className="visualizer-col">

            {/* Operasyon Banner */}
            <OpBanner lastOp={lastOp} edgeMode={edgeMode} />

            {/* SVG Graf */}
            <GraphCanvas
              nodes={nodes}
              edges={edges}
              directed={directed}
              selectedNodeId={selectedNodeId}
              selectedEdgeId={selectedEdgeId}
              highlightId={highlightId}
              edgeMode={edgeMode}
              edgeFrom={edgeFrom}
              onNodeClick={handleNodeClick}
              onEdgeClick={handleEdgeClick}
            />

            {/* İstatistikler */}
            <StatsRow nodes={nodes} edges={edges} directed={directed} />

            {/* Adım açıklaması */}
            <StepBox lastOp={lastOp} edgeMode={edgeMode} />

            {/* ── Kontroller ── */}
            <div className="gr-controls">
              <div className="gr-ctrl-row">
                <button
                  className="gr-btn gr-btn-add"
                  onClick={addNode}
                  disabled={edgeMode !== false}
                  title="Yeni düğüm ekle"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                  Düğüm Ekle
                </button>

                {edgeMode === false ? (
                  <button
                    className="gr-btn gr-btn-edge"
                    onClick={startEdgeMode}
                    disabled={nodes.length < 2}
                    title="Kenar ekle"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                    Kenar Ekle
                  </button>
                ) : (
                  <button className="gr-btn gr-btn-cancel" onClick={cancelMode}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    İptal
                  </button>
                )}

                <button
                  className="gr-btn gr-btn-remove"
                  onClick={removeSelected}
                  disabled={!canDelete || edgeMode !== false}
                  title="Seçili düğüm/kenarı sil"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                  Seçiliyi Sil
                </button>
              </div>

              {/* Yönlü/Yönsüz toggle */}
              <div className="gr-toggle-row">
                <button
                  className={`gr-toggle-btn ${directed ? "gr-toggle-on" : "gr-toggle-off"}`}
                  onClick={toggleDirected}
                >
                  <span className="gr-toggle-track">
                    <span className="gr-toggle-thumb" />
                  </span>
                  <span className="gr-toggle-label">
                    {directed ? "Yönlü Graf" : "Yönsüz Graf"}
                  </span>
                </button>
              </div>
            </div>

            {/* Preset Bar */}
            <div className="preset-bar">
              <span className="preset-label">Senaryo</span>
              <div className="preset-group">
                {Object.entries(GRAPH_PRESETS).map(([key, p]) => (
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

            {/* Adjacency List */}
            <div className="section-divider">Komşuluk Gösterimleri</div>
            <AdjacencyListView nodes={nodes} adjList={adjList} directed={directed} />

            {/* Adjacency Matrix */}
            <AdjacencyMatrixView nodes={nodes} adjMatrix={adjMatrix} />

          </div>

          {/* ══════════════════ SAĞ: Bilgi Paneli ══════════════════ */}
          <div className="info-section">

            <AccordionSection title="Nasıl Çalışır?" defaultOpen={true}>
              <ol className="gr-how-list">
                <li>Graf, <strong>düğümler</strong> ve düğümler arasındaki <strong>kenarlardan</strong> oluşan bir veri yapısıdır.</li>
                <li>Her kenar iki düğüm arasındaki ilişkiyi temsil eder. Bir düğüme bağlı kenar sayısına <strong>derece</strong> denir.</li>
                <li>Yönsüz grafta kenarların yönü yoktur ve bağlantı her iki yönde de geçerlidir.</li>
                <li>Yönlü grafta her kenarın bir başlangıç ve bir bitiş noktası vardır, bağlantı tek yönlüdür.</li>
                <li>Bir düğümden diğerine giden kenar dizisine <strong>yol</strong>, başladığı noktaya dönen yola <strong>döngü</strong> denir.</li>
                <li>Graf bellekte <strong>komşuluk listesi</strong> ya da <strong>komşuluk matrisi</strong> kullanılarak saklanır.</li>
                <li>BFS ve DFS algoritmaları bu yapı üzerinde çalışarak grafı sistematik biçimde dolaşır.</li>
              </ol>
            </AccordionSection>

            <AccordionSection title="Pseudocode" defaultOpen={true}>
              <div className="pseudocode">
                {(() => {
                  let lineNum = 0;
                  return PSEUDO.map((p, i) => {
                    if (p.sep) return <div key={i} className="pseudo-line pseudo-separator" />;
                    if (!p.header) lineNum++;
                    return (
                      <div key={i} className={`pseudo-line ${p.header ? "pseudo-header-line" : ""}`}>
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

            <AccordionSection title="Graf vs Ağaç">
              <div className="scenario-table">
                <div className="scenario-header">
                  <span>Özellik</span>
                  <span>Graf</span>
                  <span>Ağaç</span>
                </div>
                <div className="scenario-row">
                  <span>Döngü</span>
                  <span className="scenario-val">Olabilir</span>
                  <span className="scenario-val good">Yok</span>
                </div>
                <div className="scenario-row">
                  <span>Kök düğüm</span>
                  <span className="scenario-val">Yok</span>
                  <span className="scenario-val good">Var</span>
                </div>
                <div className="scenario-row">
                  <span>Kenar sayısı</span>
                  <span className="scenario-val">Serbest</span>
                  <span className="scenario-val good">V - 1</span>
                </div>
                <div className="scenario-row">
                  <span>Bağlantı</span>
                  <span className="scenario-val">Zorunlu değil</span>
                  <span className="scenario-val good">Zorunlu</span>
                </div>
                <div className="scenario-row">
                  <span>Yön</span>
                  <span className="scenario-val good">Her ikisi</span>
                  <span className="scenario-val">Genellikle yönsüz</span>
                </div>
              </div>
              <p className="scenario-note" style={{ marginTop: 8 }}>
                <strong>Ağaç, grafın özel bir halidir</strong> — döngüsüz ve bağlantılı yönsüz graf.
                Her ağaç bir graftır; her graf bir ağaç değildir.
              </p>
            </AccordionSection>

            <AccordionSection title="Karmaşıklık Analizi" defaultOpen={true}>
              <div className="gr-complexity-intro">
                Karmaşıklık, <strong>V</strong> (düğüm sayısı) ve <strong>E</strong> (kenar sayısı) cinsinden ifade edilir.
              </div>
              <table className="gr-cmplx-table">
                <thead>
                  <tr>
                    <th>İşlem</th>
                    <th>Adj. List</th>
                    <th>Adj. Matrix</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Alan (Space)</td>
                    <td><span className="badge-green">O(V+E)</span></td>
                    <td><span className="badge-yellow">O(V²)</span></td>
                  </tr>
                  <tr>
                    <td>Kenar Ekle</td>
                    <td><span className="badge-green">O(1)</span></td>
                    <td><span className="badge-green">O(1)</span></td>
                  </tr>
                  <tr>
                    <td>Kenar Sil</td>
                    <td><span className="badge-yellow">O(E)</span></td>
                    <td><span className="badge-green">O(1)</span></td>
                  </tr>
                  <tr>
                    <td>Kenar Var mı?</td>
                    <td><span className="badge-yellow">O(V)</span></td>
                    <td><span className="badge-green">O(1)</span></td>
                  </tr>
                  <tr>
                    <td>Komşuları Bul</td>
                    <td><span className="badge-green">O(derece)</span></td>
                    <td><span className="badge-yellow">O(V)</span></td>
                  </tr>
                  <tr>
                    <td>BFS / DFS</td>
                    <td><span className="badge-green">O(V+E)</span></td>
                    <td><span className="badge-yellow">O(V²)</span></td>
                  </tr>
                </tbody>
              </table>
              <div className="complexity-list" style={{ marginTop: 10 }}>
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-green">Seyrek Graf → Adj. List</div>
                  <p className="complexity-row-desc">
                    E &lt;&lt; V² olan graflar için komşuluk listesi <strong>bellek açısından çok daha verimlidir</strong>.
                    Sosyal ağlar, yol haritaları gibi gerçek dünya grafları çoğunlukla seyrek olur.
                  </p>
                </div>
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-yellow">Yoğun Graf → Adj. Matrix</div>
                  <p className="complexity-row-desc">
                    E ≈ V² olan yoğun graflarda matris tercih edilir.
                    "Şu kenar var mı?" sorusuna <strong>O(1)'de</strong> yanıt verir.
                  </p>
                </div>
              </div>
            </AccordionSection>

            <AccordionSection title="Graf Türleri">
              <div className="gr-types">
                <div className="gr-type-item">
                  <span className="gr-type-icon">↔</span>
                  <div>
                    <div className="gr-type-name">Yönsüz Graf</div>
                    <div className="gr-type-desc">Kenarlar çift yönlüdür — A—B ile B—A aynı kenardır. Arkadaşlık ağı örnek.</div>
                  </div>
                </div>
                <div className="gr-type-item">
                  <span className="gr-type-icon">→</span>
                  <div>
                    <div className="gr-type-name">Yönlü Graf (Digraph)</div>
                    <div className="gr-type-desc">Kenarların yönü vardır. A→B, B'nin A'yı takip ettiği anlamına gelmez. Twitter takip örnek.</div>
                  </div>
                </div>
                <div className="gr-type-item">
                  <span className="gr-type-icon">⚖</span>
                  <div>
                    <div className="gr-type-name">Ağırlıklı Graf</div>
                    <div className="gr-type-desc">Kenarlara ağırlık (maliyet, mesafe) atanır. GPS yol haritaları örnek.</div>
                  </div>
                </div>
                <div className="gr-type-item">
                  <span className="gr-type-icon">⬡</span>
                  <div>
                    <div className="gr-type-name">DAG (Directed Acyclic Graph)</div>
                    <div className="gr-type-desc">Yönlü ve döngüsüz. Görev bağımlılıkları, derleme sırası örnek.</div>
                  </div>
                </div>
              </div>
            </AccordionSection>

            <AccordionSection title="Gerçek Hayatta">
              <ul className="gr-usage-list">
                <li className="gr-usage-item">
                  <span className="gr-usage-icon">🗺️</span>
                  <span className="gr-usage-text">
                    <strong>GPS ve Harita Uygulamaları</strong> — şehirler düğüm, yollar kenar.
                    Dijkstra algoritması en kısa rotayı bu grafta bulur.
                  </span>
                </li>
                <li className="gr-usage-item">
                  <span className="gr-usage-icon">👥</span>
                  <span className="gr-usage-text">
                    <strong>Sosyal Ağlar</strong> — kullanıcılar düğüm, arkadaşlıklar kenar.
                    "Ortak arkadaşlar" ve "öneri" sistemleri graf algoritmaları kullanır.
                  </span>
                </li>
                <li className="gr-usage-item">
                  <span className="gr-usage-icon">🌐</span>
                  <span className="gr-usage-text">
                    <strong>İnternet ve Web</strong> — web sayfaları düğüm, linkler kenar.
                    Google'ın PageRank algoritması bu grafı analiz eder.
                  </span>
                </li>
                <li className="gr-usage-item">
                  <span className="gr-usage-icon">📦</span>
                  <span className="gr-usage-text">
                    <strong>Paket Bağımlılıkları</strong> — npm, pip gibi paket yöneticileri
                    bağımlılıkları DAG olarak modeller ve döngü olmadığını kontrol eder.
                  </span>
                </li>
                <li className="gr-usage-item">
                  <span className="gr-usage-icon">🔌</span>
                  <span className="gr-usage-text">
                    <strong>Elektrik Devreleri</strong> — bileşenler düğüm, bağlantılar kenar.
                    Devre optimizasyonu ve hata tespitinde graf algoritmaları kullanılır.
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
