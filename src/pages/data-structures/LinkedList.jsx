import { useState, useEffect, useRef } from "react";
import { useLinkedList } from "../../visualizers/data-structures/useLinkedList";
import "../../pages/sorting/SortingPage.css";
import "./DataStructuresPage.css";


const PSEUDO = [
  { n: 1,  text: "append(val):",                  header: true },
  { n: 2,  text: "  yeni ← Düğüm(val)"                        },
  { n: 3,  text: "  eğer liste boş → HEAD=yeni"               },
  { n: 4,  text: "  current ← HEAD"                           },
  { n: 5,  text: "  while current.next ≠ NULL"                },
  { n: 6,  text: "    current ← current.next"                 },
  { n: 7,  text: "  current.next ← yeni"                      },
  { n: null, sep: true },
  { n: 9,  text: "prepend(val):",                 header: true },
  { n: 10, text: "  yeni ← Düğüm(val)"                        },
  { n: 11, text: "  yeni.next ← HEAD"                         },
  { n: 12, text: "  HEAD ← yeni"                              },
  { n: null, sep: true },
  { n: 14, text: "insertAt(val, idx):",           header: true },
  { n: 15, text: "  eğer idx=0 → prepend"                     },
  { n: 16, text: "  current ← geç(idx-1)"                     },
  { n: 17, text: "  yeni.next ← current.next"                 },
  { n: 18, text: "  current.next ← yeni"                      },
  { n: null, sep: true },
  { n: 20, text: "deleteAt(idx):",                header: true },
  { n: 21, text: "  eğer idx=0 → HEAD=HEAD.next"              },
  { n: 22, text: "  prev ← geç(idx-1)"                        },
  { n: 23, text: "  hedef ← prev.next"                        },
  { n: 24, text: "  prev.next ← hedef.next"                   },
  { n: null, sep: true },
  { n: 26, text: "search(val):",                  header: true },
  { n: 27, text: "  current ← HEAD"                           },
  { n: 28, text: "  while current ≠ NULL"                     },
  { n: 29, text: "    eğer current.val=val → döndür idx"      },
  { n: 30, text: "    current ← current.next"                 },
  { n: 31, text: "  döndür -1"                                },
];

const PRESETS = {
  basic: {
    label: "Temel İşlemler",
    tooltip: "append / prepend / search — bağlı listenin özeti",
    ops: [
      { op: "append",  val: 10 },
      { op: "append",  val: 20 },
      { op: "append",  val: 30 },
      { op: "prepend", val: 5  },
      { op: "search",  val: 20 },
      { op: "search",  val: 99 },
    ],
  },
  insert: {
    label: "Ortaya Ekle",
    tooltip: "insertAt — pointer yeniden bağlama mantığı",
    ops: [
      { op: "append",   val: 1  },
      { op: "append",   val: 2  },
      { op: "append",   val: 3  },
      { op: "append",   val: 4  },
      { op: "insertAt", val: 10, idx: 0 },
      { op: "insertAt", val: 25, idx: 3 },
      { op: "insertAt", val: 99, idx: 6 },
    ],
  },
  delete: {
    label: "Silme",
    tooltip: "deleteAt — pointer yeniden bağlama ile silme",
    ops: [
      { op: "append",   val: 5  },
      { op: "append",   val: 12 },
      { op: "append",   val: 8  },
      { op: "append",   val: 3  },
      { op: "append",   val: 17 },
      { op: "deleteAt", idx: 0  },
      { op: "deleteAt", idx: 2  },
      { op: "deleteAt", idx: 2  },
    ],
  },
  traverse: {
    label: "Arama / O(n)",
    tooltip: "Her düğümü tek tek gezme — O(n) maliyetini gör",
    ops: [
      { op: "append", val: 5  },
      { op: "append", val: 12 },
      { op: "append", val: 8  },
      { op: "append", val: 3  },
      { op: "append", val: 17 },
      { op: "search", val: 17 },
      { op: "search", val: 8  },
      { op: "search", val: 99 },
    ],
  },
};

/* ── Banner ── */
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
  const { phase, description } = current;
  const cfgs = {
    traverse_start:  { icon: "→", cls: "ob-traverse" },
    traverse_step:   { icon: "→", cls: "ob-traverse" },
    traverse_tail:   { icon: "⤵", cls: "ob-rewire"  },
    rewire_prev:     { icon: "✂", cls: "ob-rewire"  },
    node_new:        { icon: "+", cls: "ob-push"    },
    node_found:      { icon: "✓", cls: "ob-done"    },
    node_not_found:  { icon: "✗", cls: "ob-notfound"},
    delete_target:   { icon: "✗", cls: "ob-pop"     },
    delete_done:     { icon: "✓", cls: "ob-done"    },
    error:           { icon: "⚠", cls: "ob-error"   },
  };
  const cfg = cfgs[phase];
  if (!cfg) return null;
  return (
    <div className={`op-banner ${cfg.cls}`}>
      <span className="ob-icon">{cfg.icon}</span>
      <div className="ob-body">
        <span className="ob-label">{phase === "error" ? "HATA!" : description}</span>
        <span className="ob-sub">{current.detail}</span>
      </div>
    </div>
  );
}

/* ── Görselleştirici ── */
function LinkedListViz({ current, settledNodes }) {
  const scrollRef = useRef(null);
  const displayNodes = current ? current.nodes : settledNodes;
  const { phase, highlightIdx, prevIdx, newIdx, deleteIdx } = current ?? {};

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
  }, [displayNodes.length]);

  const sz = displayNodes.length;

  function getNodeCls(idx) {
    const b = "ll-node";
    if (idx === newIdx)    return b + " lln-new";
    if (idx === deleteIdx) return b + " lln-delete";
    if (idx === highlightIdx) {
      if (phase === "node_found")                                  return b + " lln-found";
      if (phase === "delete_done")                                 return b + " lln-done";
      if (phase === "rewire_prev" || phase === "traverse_tail")   return b + " lln-rewire";
      if (phase === "traverse_step" || phase === "traverse_start") return b + " lln-visiting";
    }
    if (idx === prevIdx && idx !== highlightIdx) return b + " lln-prev";
    return b;
  }

  function getConnectorCls(idx) {
    if ((phase === "rewire_prev" || phase === "traverse_tail") && idx === highlightIdx)
      return "ll-connector llc-cut";
    if (phase === "delete_target" && idx === deleteIdx - 1)
      return "ll-connector llc-cut";
    if (phase === "delete_done" && idx === highlightIdx)
      return "ll-connector llc-new";
    if (phase === "node_new" && idx === newIdx - 1)
      return "ll-connector llc-new";
    return "ll-connector";
  }

  return (
    <div className="ll-viz-card">
      <OperationBanner current={current} />

      <div className="ll-scroll-area" ref={scrollRef}>
        <div className="ll-chain">
          {sz === 0 ? (
            <div className="ll-empty-msg">
              <div className="ll-null">NULL</div>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginLeft: 10 }}>HEAD → NULL (boş liste)</span>
            </div>
          ) : (
            <>
              {displayNodes.map((val, idx) => {
                const isLast = idx === sz - 1;
                const labels = [];
                if (idx === 0)      labels.push({ text: "HEAD", cls: "ll-lbl-head" });
                if (isLast)         labels.push({ text: "TAIL", cls: "ll-lbl-tail" });
                if (idx === newIdx) labels.push({ text: "yeni", cls: "ll-lbl-new" });
                if (idx === deleteIdx) labels.push({ text: "silinecek", cls: "ll-lbl-del" });
                if (idx === highlightIdx && idx !== deleteIdx && idx !== newIdx) {
                  if (phase === "node_found")
                    labels.push({ text: "bulundu!", cls: "ll-lbl-found" });
                  else if (phase === "rewire_prev" || phase === "traverse_tail")
                    labels.push({ text: "önceki", cls: "ll-lbl-prev" });
                  else if (phase === "delete_done")
                    labels.push({ text: "bağlandı", cls: "ll-lbl-new" });
                  else if (phase === "traverse_step" || phase === "traverse_start")
                    labels.push({ text: "current", cls: "ll-lbl-current" });
                }
                if (idx === prevIdx && idx !== highlightIdx)
                  labels.push({ text: "prev", cls: "ll-lbl-prev" });

                return (
                  <div key={idx} className="ll-node-wrap">
                    <div className={getNodeCls(idx)}>
                      <div className="ll-node-val">{val}</div>
                      <div className="ll-node-ptr"><span className="ll-ptr-sym">→</span></div>
                    </div>
                    {labels.length > 0 && (
                      <div className="ll-label-row">
                        {labels.map((l, li) => (
                          <span key={li} className={`ll-label ${l.cls}`}>{l.text}</span>
                        ))}
                      </div>
                    )}
                    {!isLast && (
                      <div className={getConnectorCls(idx)}>
                        <div className="llc-line" />
                        <div className="llc-head" />
                      </div>
                    )}
                  </div>
                );
              })}
              {/* NULL terminator */}
              <div className="ll-node-wrap">
                <div className="ll-connector"><div className="llc-line" /><div className="llc-head" /></div>
                <div className="ll-null">NULL</div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="stack-meta-strip">
        <div className="sms-cell">
          <span className="sms-key">HEAD</span>
          <span className="sms-val" style={{ color: "#7c3aed" }}>{sz > 0 ? displayNodes[0] : "NULL"}</span>
        </div>
        <div className="sms-div" />
        <div className="sms-cell">
          <span className="sms-key">TAIL</span>
          <span className="sms-val" style={{ color: "#0891b2" }}>{sz > 0 ? displayNodes[sz - 1] : "NULL"}</span>
        </div>
        <div className="sms-div" />
        <div className="sms-cell">
          <span className="sms-key">boyut</span>
          <span className="sms-val">{sz}</span>
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

/* ── Manuel Panel ── */
function ManualPanel({ settledNodes, busy, onAppend, onPrepend, onInsertAt, onDeleteAt, onSearch }) {
  const [val,  setVal]  = useState("");
  const [idx,  setIdx]  = useState("");
  const [mode, setMode] = useState("append");

  const needsVal = mode !== "deleteAt";
  const needsIdx = mode === "insertAt" || mode === "deleteAt";

  function handleRun() {
    const v = parseInt(val, 10);
    const i = parseInt(idx, 10);
    if (needsVal && isNaN(v)) return;
    if (needsIdx && isNaN(i)) return;
    if (mode === "append")   onAppend(v);
    if (mode === "prepend")  onPrepend(v);
    if (mode === "insertAt") onInsertAt(v, i);
    if (mode === "deleteAt") onDeleteAt(i);
    if (mode === "search")   onSearch(v);
    setVal(""); setIdx("");
  }

  const MODES = [
    { key: "append",   label: "append",   tooltip: "Sona ekle — O(n) traversal" },
    { key: "prepend",  label: "prepend",  tooltip: "Başa ekle — O(1) sabit" },
    { key: "insertAt", label: "insertAt", tooltip: "Belirtilen indekse ekle" },
    { key: "deleteAt", label: "deleteAt", tooltip: "Belirtilen indeksi sil" },
    { key: "search",   label: "search",   tooltip: "Değeri ara — O(n) traversal" },
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
          <input className="stack-val-input" type="number" value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRun()}
            placeholder="değer" style={{ width: 80 }} />
        )}
        {needsIdx && (
          <input className="stack-val-input" type="number" value={idx}
            onChange={(e) => setIdx(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRun()}
            placeholder="indeks" style={{ width: 80 }} />
        )}
        <button className="stack-push-btn" onClick={handleRun}
          disabled={busy || (needsVal && val === "") || (needsIdx && idx === "")}>
          Çalıştır
        </button>
      </div>
      {settledNodes.length > 0 && (
        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "Courier New, monospace", marginTop: 2, wordBreak: "break-all" }}>
          {settledNodes.join(" → ")} → NULL
        </div>
      )}
    </div>
  );
}

/* ── Ana Sayfa ── */
export default function LinkedList() {
  const {
    current, settledNodes,
    stepIndex, totalSteps,
    isPlaying, isDone, canPlay,
    speed, setSpeed,
    togglePlay, stepForward, stepBackward,
    autoPlayPreset,
    manualAppend, manualPrepend, manualInsertAt, manualDeleteAt, manualSearch,
    reset,
  } = useLinkedList();

  const [activePreset, setActivePreset] = useState("basic");

  useEffect(() => {
    const t = setTimeout(() => autoPlayPreset(PRESETS.basic.ops), 600);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const activeLine    = current?.activeLine ?? null;
  const phase         = current?.phase ?? null;
  const busy          = isPlaying;
  const displayNodes  = current?.nodes ?? settledNodes;

  function handlePreset(key) { setActivePreset(key); autoPlayPreset(PRESETS[key].ops); }
  function handleReset()     { reset(); setActivePreset(""); }

  const playLabel = isPlaying ? "⏸ Durdur" : isDone ? "↺ Yeniden" : "▶ Oynat";
  const stepCls   = phase === "error"
    ? "step-explanation step-idle"
    : current ? "step-explanation step-active" : "step-explanation step-idle";

  return (
    <div className="sorting-page">
      <div className="page-container">

        <div className="page-header">
          <div>
            <div className="page-tag">Veri Yapısı</div>
            <h1 className="page-title">Bağlı Liste (Linked List)</h1>
            <p className="page-subtitle">
              Her düğüm bir değer + sonraki düğümün adresi taşır. Dinamik boyut, pointer tabanlı bağlantı.
            </p>
          </div>
        </div>

        <div className="page-body">

          {/* Sol */}
          <div className="visualizer-col">

            <ManualPanel settledNodes={settledNodes} busy={busy}
              onAppend={manualAppend} onPrepend={manualPrepend}
              onInsertAt={manualInsertAt} onDeleteAt={manualDeleteAt}
              onSearch={manualSearch} />

            <LinkedListViz current={current} settledNodes={settledNodes} />

            <div className={stepCls}>
              <div className="step-main">
                {!current && "Preset seçin — animasyon otomatik başlar. Ya da üstten manuel işlem yapın."}
                {current && current.description}
              </div>
              {current?.detail && <div className="step-detail">{current.detail}</div>}
            </div>

            <div className="controls">
              <div className="ctrl-group">
                <button className="ctrl-btn ctrl-icon" onClick={stepBackward} disabled={!current || stepIndex <= 0}>◀◀</button>
                <button className={`ctrl-btn ctrl-play ${isPlaying ? "is-playing" : ""}`} onClick={togglePlay} disabled={!canPlay}>
                  {playLabel}
                </button>
                <button className="ctrl-btn ctrl-icon" onClick={stepForward} disabled={isDone || !canPlay}>▶▶</button>
              </div>
              <div className="ctrl-group">
                <span className="speed-label">Hız</span>
                {[1000, 700, 400, 150].map((ms) => (
                  <button key={ms} className={`ctrl-btn ctrl-secondary ${speed === ms ? "speed-active" : ""}`} onClick={() => setSpeed(ms)}>
                    {ms === 1000 ? "×1" : ms === 700 ? "×2" : ms === 400 ? "×4" : "×8"}
                  </button>
                ))}
              </div>
              <button className="ctrl-btn ctrl-secondary" onClick={handleReset}>↺ Yenile</button>
            </div>

            <div className="stack-stats">
              <div className="ss-item">
                <span className="ss-val" style={{ color: "var(--primary)" }}>{displayNodes.length}</span>
                <span className="ss-label">Boyut</span>
              </div>
              <div className="ss-divider" />
              <div className="ss-item">
                <span className="ss-val" style={{ color: "#059669" }}>
                  {(current?.stats.appends ?? 0) + (current?.stats.prepends ?? 0) + (current?.stats.inserts ?? 0)}
                </span>
                <span className="ss-label">Ekleme</span>
              </div>
              <div className="ss-divider" />
              <div className="ss-item">
                <span className="ss-val" style={{ color: "#ef4444" }}>{current?.stats.deletes ?? 0}</span>
                <span className="ss-label">Silme</span>
              </div>
              <div className="ss-divider" />
              <div className="ss-item">
                <span className="ss-val" style={{ color: "#f59e0b" }}>{current?.stats.comparisons ?? 0}</span>
                <span className="ss-label">Karşılaştırma</span>
              </div>
              <div className="ss-divider" />
              <div className="ss-item">
                <span className="ss-val">{canPlay ? `${stepIndex + 1} / ${totalSteps}` : "—"}</span>
                <span className="ss-label">Adım</span>
              </div>
            </div>

            <div className="preset-bar">
              <span className="preset-label">Senaryo</span>
              <div className="preset-group">
                {Object.entries(PRESETS).map(([key, { label, tooltip }]) => (
                  <button key={key}
                    className={`preset-btn ${activePreset === key ? "preset-active" : ""}`}
                    onClick={() => handlePreset(key)} data-tooltip={tooltip}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nasıl Çalışır — sol kolonun altında */}
            <div className="info-card">
              <h3 className="info-card-title">Nasıl Çalışır?</h3>
              <p className="info-card-text" style={{ marginBottom: 14 }}>
                Her <strong>düğüm</strong> iki şey tutar: bir değer ve sonraki düğümün
                <strong> adresi (pointer)</strong>. Bellekte ardışık olmak zorunda değildir —
                düğümler pointer ile zincir oluşturur.
              </p>
              <div className="ll-anatomy">
                <div className="ll-anat-box">
                  <div className="ll-anat-val-cell">42</div>
                  <div className="ll-anat-ptr-cell">→</div>
                </div>
                <div className="ll-anat-desc">
                  <span className="ll-anat-d">değer (data)</span>
                  <span className="ll-anat-d">next ptr</span>
                </div>
              </div>
              <div className="pseudocode" style={{ marginTop: 14 }}>
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

          {/* Sağ */}
          <div className="info-section">

            <div className="section-divider">Karmaşıklık</div>

            <div className="info-card">
              <h3 className="info-card-title">Zaman &amp; Alan Karmaşıklığı</h3>
              <table className="complexity-table">
                <thead><tr><th>İşlem</th><th>Zaman</th><th>Neden?</th></tr></thead>
                <tbody>
                  {[
                    ["prepend()",   "O(1)", "HEAD doğrudan güncellenir"],
                    ["append()",    "O(n)", "Sona ulaşmak için traversal"],
                    ["insertAt(i)", "O(n)", "i. pozisyona gitmek için traversal"],
                    ["deleteAt(i)", "O(n)", "i. pozisyona gitmek için traversal"],
                    ["search(val)", "O(n)", "Her düğüm sırayla kontrol edilir"],
                    ["Alan",        "O(n)", "n düğüm × (değer + ptr)"],
                  ].map(([op, t, why]) => (
                    <tr key={op}>
                      <td className="ct-op">{op}</td>
                      <td className={t === "O(1)" ? "ct-good" : "ct-mid"}>{t}</td>
                      <td style={{ fontSize: "0.76rem", color: "var(--text-secondary)" }}>{why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="section-divider">Dizi ile Karşılaştırma</div>

            <div className="info-card">
              <h3 className="info-card-title">Linked List vs Dizi</h3>
              <table className="complexity-table">
                <thead><tr><th>Özellik</th><th>Dizi</th><th>Linked List</th></tr></thead>
                <tbody>
                  {[
                    ["Erişim [i]",      "O(1) ✓",  "O(n) ✗"],
                    ["Arama",           "O(n)",    "O(n)"],
                    ["Başa ekleme",     "O(n) ✗",  "O(1) ✓"],
                    ["Sona ekleme",     "O(1)*",   "O(n)"],
                    ["Ortaya ekleme",   "O(n) ✗",  "O(n)"],
                    ["Bellek düzeni",   "Ardışık", "Dağınık"],
                    ["Dinamik boyut",   "Zor",     "Kolay ✓"],
                  ].map(([feat, arr, ll]) => (
                    <tr key={feat}>
                      <td className="ct-op">{feat}</td>
                      <td style={{ fontSize: "0.8rem" }}>{arr}</td>
                      <td style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 600 }}>{ll}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: 8 }}>* TAIL pointer tutulursa O(1)</p>
            </div>

            <div className="section-divider">Kullanım Alanları</div>

            <div className="info-card">
              <h3 className="info-card-title">Gerçek Dünya Kullanımı</h3>
              <div className="usecase-list">
                {[
                  { icon: "📝", title: "Müzik Çalar Listesi", desc: "Her şarkı düğüm, next pointer sonraki şarkıya götürür. Ortaya şarkı eklemek sadece pointer değiştirir." },
                  { icon: "🖥️", title: "İşletim Sistemi Belleği", desc: "Boş bellek blokları linked list ile takip edilir. Bloklar bellekte ardışık olmak zorunda değildir." },
                  { icon: "↩️", title: "Çift Yönlü Undo (DLL)", desc: "Doubly linked list ile hem ileri hem geri gezinme — her düğüm önceki ve sonrakine pointer tutar." },
                  { icon: "🔗", title: "Hash Tablosu Zinciri", desc: "Çakışan hash değerlerindeki elemanlar aynı bucket'ta linked list ile zincirlenir (chaining)." },
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
                <li><span className="feature-icon feature-check">✓</span><span><strong>Dinamik boyut</strong> — önceden boyut belirtmek gerekmez</span></li>
                <li><span className="feature-icon feature-check">✓</span><span><strong>Başa ekleme O(1)</strong> — dizide O(n) olan işlem burada sabit zamanlı</span></li>
                <li><span className="feature-icon feature-check">✓</span><span><strong>Ardışık bellek gerekmez</strong> — büyük blok bulma sorunu yok</span></li>
                <li><span className="feature-icon feature-x">✗</span><span><strong>Rastgele erişim yok</strong> — list[i] için HEAD'den i adım gitmek gerekir</span></li>
                <li><span className="feature-icon feature-x">✗</span><span><strong>Ekstra bellek</strong> — her düğüm pointer için ek alan kullanır</span></li>
                <li><span className="feature-icon feature-x">✗</span><span><strong>Cache dostu değil</strong> — düğümler dağınık → cache miss artar</span></li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
