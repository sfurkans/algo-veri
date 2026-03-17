import { useState, useEffect, Fragment } from "react";
import { useStack } from "../../visualizers/data-structures/useStack";
import "../../pages/sorting/SortingPage.css";
import "./DataStructuresPage.css";


/* ── Pseudocode ── */
const PSEUDO = [
  { n: 1,  text: "push(değer):",         header: true },
  { n: 2,  text: "  üste değer ekle"                  },
  { n: 3,  text: "  top ← top + 1"                    },
  { n: null, sep: true },
  { n: 5,  text: "pop():",               header: true },
  { n: 6,  text: "  eğer boş → hata!"                 },
  { n: 7,  text: "  değer ← yığın[top]"               },
  { n: 8,  text: "  döndür değer"                     },
  { n: null, sep: true },
  { n: 10, text: "peek():",              header: true },
  { n: 11, text: "  eğer boş → hata!"                 },
  { n: 12, text: "  döndür yığın[top]"                },
  { n: null, sep: true },
  { n: 14, text: "isEmpty():",           header: true },
  { n: 15, text: "  döndür top === 0"                 },
];

/* ── Preset senaryolar ── */
const PRESETS = {
  basic: {
    label: "Temel İşlemler",
    tooltip: "push / pop / peek / isEmpty — tüm operasyonların özeti",
    ops: [
      { op: "push", val: 5  },
      { op: "push", val: 12 },
      { op: "push", val: 8  },
      { op: "peek"          },
      { op: "pop"           },
      { op: "push", val: 3  },
      { op: "pop"           },
      { op: "isEmpty"       },
    ],
  },
  lifo: {
    label: "LIFO Sırası",
    tooltip: "Son giren ilk çıkar — 1→5 push, sonra tersten pop",
    ops: [
      { op: "push", val: 1 },
      { op: "push", val: 2 },
      { op: "push", val: 3 },
      { op: "push", val: 4 },
      { op: "push", val: 5 },
      { op: "pop"          },
      { op: "pop"          },
      { op: "pop"          },
      { op: "pop"          },
      { op: "pop"          },
    ],
  },
  mixed: {
    label: "Karma İşlem",
    tooltip: "Gerçek kullanıma yakın — push / pop / peek karışık",
    ops: [
      { op: "push", val: 7  },
      { op: "push", val: 14 },
      { op: "pop"           },
      { op: "push", val: 22 },
      { op: "push", val: 9  },
      { op: "peek"          },
      { op: "pop"           },
      { op: "pop"           },
      { op: "isEmpty"       },
    ],
  },
  error: {
    label: "Hata Durumu",
    tooltip: "Boş yığında pop / peek — hata koşulları",
    ops: [
      { op: "isEmpty"       },
      { op: "pop"           },
      { op: "peek"          },
      { op: "push", val: 42 },
      { op: "pop"           },
      { op: "isEmpty"       },
    ],
  },
};

/* ────────────────────────────────────────────────────────────
   OPERATION BANNER
   Her operasyon fazını renk + ikon + açıklama ile gösterir.
──────────────────────────────────────────────────────────── */
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

  const { phase, incoming, outgoing, result, description } = current;
  const sz     = current.stack.length;
  const topVal = sz > 0 ? current.stack[sz - 1] : null;

  const cfgs = {
    push_enter: {
      icon: "↓", cls: "ob-push",
      label: `PUSH(${incoming})`,
      sub:   `${incoming} yığının tepesine doğru geliyor — boyut henüz: ${sz}`,
    },
    push_settle: {
      icon: "✓", cls: "ob-done",
      label: `PUSH(${topVal}) tamamlandı`,
      sub:   `${topVal} tepede yerleşti · yeni TOP = [${sz - 1}] · boyut: ${sz}`,
    },
    pop_lift: {
      icon: "↑", cls: "ob-pop",
      label: `POP()`,
      sub:   `Tepe eleman ${outgoing} yığından alınıyor — yığın henüz: ${sz} eleman`,
    },
    pop_gone: {
      icon: "✓", cls: "ob-done",
      label: `POP() → ${outgoing}`,
      sub:   `${outgoing} döndürüldü${sz > 0 ? ` · yeni TOP = ${topVal}` : " · yığın artık boş"} · boyut: ${sz}`,
    },
    peek: {
      icon: "👁", cls: "ob-peek",
      label: `PEEK() → ${result}`,
      sub:   `Tepe eleman görüntülendi, yığın değişmedi · boyut: ${sz}`,
    },
    isEmpty: {
      icon: result ? "□" : "■", cls: "ob-isempty",
      label: `isEmpty() → ${result}`,
      sub:   result ? "Yığın boş — hiç eleman yok" : `Yığında ${sz} eleman var, boş değil`,
    },
    error: {
      icon: "⚠", cls: "ob-error",
      label: "HATA!",
      sub:   description.replace(/.*?—\s*/, ""),
    },
  };

  const cfg = cfgs[phase];
  if (!cfg) return null;

  return (
    <div className={`op-banner ${cfg.cls}`}>
      <span className="ob-icon">{cfg.icon}</span>
      <div className="ob-body">
        <span className="ob-label">{cfg.label}</span>
        <span className="ob-sub">{cfg.sub}</span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   STACK GÖRSELLEŞTİRİCİ
──────────────────────────────────────────────────────────── */
function StackViz({ current, settledStack }) {
  const displayStack = current ? current.stack : settledStack;
  const { phase, incoming, outgoing, highlightIdx } = current ?? {};
  const sz     = displayStack.length;
  const topVal = sz > 0 ? displayStack[sz - 1] : null;

  return (
    <div className="stack-viz-card">

      {/* 1 ── Operation Banner */}
      <OperationBanner current={current} />

      {/* 2 ── Stack sütunu */}
      <div className="stack-column">

        {/* PUSH: gelen eleman + yön etiketi */}
        {phase === "push_enter" && (
          <Fragment>
            <div className="stack-dir-label sdl-push">
              <span className="sdl-arrow">↓</span>
              <span>{incoming} geliyor</span>
            </div>
            <div className="stack-box stb-entering">
              <span className="stack-val">{incoming}</span>
            </div>
            <div className="stack-gap-arrow">⋮</div>
          </Fragment>
        )}

        {/* Boş yığın */}
        {sz === 0 && phase !== "push_enter" && (
          <div className="stack-empty-msg">— boş yığın —</div>
        )}

        {/* Yığın elemanları — tepeden tabana */}
        {[...displayStack].reverse().map((val, revIdx) => {
          const origIdx   = sz - 1 - revIdx;
          const isTop     = origIdx === sz - 1;
          const isHL      = origIdx === highlightIdx;
          const isLeaving = isHL && phase === "pop_lift";

          let cls = "stack-box";
          if (isHL && phase === "push_settle") cls += " stb-settled";
          if (isHL && phase === "pop_lift")    cls += " stb-leaving";
          if (isHL && phase === "peek")        cls += " stb-peek";
          if (isHL && phase === "pop_gone")    cls += " stb-new-top";

          return (
            <Fragment key={origIdx}>
              {/* POP: yön etiketi — sadece çıkan eleman üstünde */}
              {isLeaving && (
                <div className="stack-dir-label sdl-pop">
                  <span className="sdl-arrow">↑</span>
                  <span>{outgoing} çıkıyor</span>
                </div>
              )}

              <div className={cls}>
                {/* TOP rozeti — sağ üst köşe */}
                {isTop && <span className="stack-top-badge">TOP</span>}
                {/* Index — sol alt */}
                <span className="stack-idx">[{origIdx}]</span>
                {/* Değer — merkez */}
                <span className="stack-val">{val}</span>
              </div>
            </Fragment>
          );
        })}

        {/* Taban */}
        <div className="stack-base-line" />
      </div>

      {/* 3 ── Metadata şeridi */}
      <div className="stack-meta-strip">
        <div className="sms-cell">
          <span className="sms-key">top indeks</span>
          <span className="sms-val" style={{ color: "var(--primary)" }}>
            {sz > 0 ? sz - 1 : "—"}
          </span>
        </div>
        <div className="sms-div" />
        <div className="sms-cell">
          <span className="sms-key">tepe değer</span>
          <span className="sms-val" style={{ color: "#f59e0b" }}>
            {topVal ?? "—"}
          </span>
        </div>
        <div className="sms-div" />
        <div className="sms-cell">
          <span className="sms-key">boyut</span>
          <span className="sms-val">{sz}</span>
        </div>
        <div className="sms-div" />
        <div className="sms-cell">
          <span className="sms-key">boş?</span>
          <span className="sms-val" style={{ color: sz === 0 ? "#ef4444" : "#059669" }}>
            {sz === 0 ? "evet" : "hayır"}
          </span>
        </div>
      </div>

    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   ANA SAYFA
──────────────────────────────────────────────────────────── */
export default function Stack() {
  const {
    current, settledStack,
    stepIndex, totalSteps,
    isPlaying, isDone, canPlay,
    speed, setSpeed,
    togglePlay, stepForward, stepBackward,
    loadPreset, autoPlayPreset,
    manualPush, manualPop, manualPeek, manualIsEmpty,
    reset,
  } = useStack();

  const [inputVal,     setInputVal]     = useState("");
  const [activePreset, setActivePreset] = useState("basic");

  /* Sayfa açılınca "Temel İşlemler" preset'ini otomatik yükle ve oynat */
  useEffect(() => {
    const t = setTimeout(() => autoPlayPreset(PRESETS.basic.ops), 600);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const displayStack = current ? current.stack : settledStack;
  const activeLine   = current?.activeLine ?? null;
  const phase        = current?.phase ?? null;

  function handlePush() {
    const n = parseInt(inputVal, 10);
    if (!isNaN(n)) { manualPush(n); setInputVal(""); setActivePreset(""); }
  }
  function handlePop()     { manualPop();     setActivePreset(""); }
  function handlePeek()    { manualPeek();    setActivePreset(""); }
  function handleIsEmpty() { manualIsEmpty(); setActivePreset(""); }

  function handlePreset(key) {
    setActivePreset(key);
    autoPlayPreset(PRESETS[key].ops);
  }

  function handleReset() {
    reset();
    setInputVal("");
    setActivePreset("");
  }

  const playLabel = isPlaying ? "⏸ Durdur" : isDone ? "↺ Yeniden" : "▶ Oynat";

  const stepCls = phase === "error"
    ? "step-explanation step-idle"
    : current ? "step-explanation step-active" : "step-explanation step-idle";

  return (
    <div className="sorting-page">
      <div className="page-container">

        {/* Başlık */}
        <div className="page-header">
          <div>
            <div className="page-tag">Veri Yapısı</div>
            <h1 className="page-title">Yığın (Stack)</h1>
            <p className="page-subtitle">
              LIFO prensibi — son giren, ilk çıkar. Her işlem O(1) sabit zaman.
            </p>
          </div>
        </div>

        <div className="page-body">

          {/* ══ Sol: Görselleştirici ══ */}
          <div className="visualizer-col">

            {/* Manuel işlem paneli */}
            <div className="stack-ops-panel">
              <div className="stack-ops-label">İşlem Yap</div>
              <div className="stack-input-row">
                <input
                  className="stack-val-input"
                  type="number"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePush()}
                  placeholder="değer"
                />
                <button
                  className="stack-push-btn"
                  onClick={handlePush}
                  disabled={isPlaying || inputVal === ""}
                  data-tooltip="Girilen değeri yığının tepesine ekle"
                >
                  PUSH
                </button>
              </div>
              <div className="stack-quick-row">
                <button className="stack-op-btn" onClick={handlePop}     disabled={isPlaying} data-tooltip="Tepe elemanı yığından çıkar ve döndür">POP</button>
                <button className="stack-op-btn" onClick={handlePeek}    disabled={isPlaying} data-tooltip="Tepe elemanı göster, yığını değiştirme">PEEK</button>
                <button className="stack-op-btn" onClick={handleIsEmpty} disabled={isPlaying} data-tooltip="Yığın boş mu? true / false döndürür">isEmpty</button>
              </div>
            </div>

            {/* Görsel */}
            <StackViz current={current} settledStack={settledStack} />

            {/* Adım açıklaması */}
            <div className={stepCls}>
              <div className="step-main">
                {!current && "Preset seçin — animasyon otomatik başlar. Ya da üstten manuel işlem yapın."}
                {current && current.description}
              </div>
              {current?.detail && (
                <div className="step-detail">{current.detail}</div>
              )}
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
                <span className="ss-val" style={{ color: "var(--primary)" }}>{displayStack.length}</span>
                <span className="ss-label">Boyut</span>
              </div>
              <div className="ss-divider" />
              <div className="ss-item">
                <span className="ss-val" style={{ color: "#059669" }}>{current?.stats.pushes ?? 0}</span>
                <span className="ss-label">Push</span>
              </div>
              <div className="ss-divider" />
              <div className="ss-item">
                <span className="ss-val" style={{ color: "#ef4444" }}>{current?.stats.pops ?? 0}</span>
                <span className="ss-label">Pop</span>
              </div>
              <div className="ss-divider" />
              <div className="ss-item">
                <span className="ss-val" style={{ color: "#f59e0b" }}>{current?.stats.peeks ?? 0}</span>
                <span className="ss-label">Peek</span>
              </div>
              <div className="ss-divider" />
              <div className="ss-item">
                <span className="ss-val">{canPlay ? `${stepIndex + 1} / ${totalSteps}` : "—"}</span>
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


            <div className="info-card">
              <h3 className="info-card-title">Nasıl Çalışır?</h3>
              <p className="info-card-text" style={{ marginBottom: 16 }}>
                Stack <strong>LIFO</strong> (Last In, First Out) prensibiyle çalışır:
                en son eklenen eleman en önce çıkar. Tüm işlemler yalnızca
                <strong> tepeden (top)</strong> yapılır — bu yüzden hepsi O(1)'dir.
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

            <div className="section-divider">Karmaşıklık</div>

            <div className="info-card">
              <h3 className="info-card-title">Zaman &amp; Alan Karmaşıklığı</h3>
              <table className="complexity-table">
                <thead>
                  <tr><th>İşlem</th><th>Zaman</th><th>Alan</th></tr>
                </thead>
                <tbody>
                  {[
                    ["push()",    "O(1)", "O(1)"],
                    ["pop()",     "O(1)", "O(1)"],
                    ["peek()",    "O(1)", "O(1)"],
                    ["isEmpty()", "O(1)", "O(1)"],
                    ["Arama",     "O(n)", "O(1)"],
                  ].map(([op, t, s]) => (
                    <tr key={op}>
                      <td className="ct-op">{op}</td>
                      <td className={t === "O(1)" ? "ct-good" : "ct-mid"}>{t}</td>
                      <td className={s === "O(1)" ? "ct-good" : "ct-mid"}>{s}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="info-card-text" style={{ marginTop: 12 }}>
                n elemanlı yığının kendisi <strong>O(n)</strong> bellek kullanır.
                Ancak her tek işlem için ek bellek gerekmez.
              </p>
            </div>

            <div className="section-divider">Kullanım Alanları</div>

            <div className="info-card">
              <h3 className="info-card-title">Gerçek Dünya Kullanımı</h3>
              <div className="usecase-list">
                {[
                  { icon: "📞", title: "Call Stack", desc: "Her fonksiyon çağrısı yığına eklenir, return edilince çıkar. Recursive algoritmalar bu yapıya dayanır." },
                  { icon: "↩️", title: "Undo / Redo", desc: "Metin editörleri her değişikliği yığına ekler. Ctrl+Z yapıldığında son işlem pop edilir." },
                  { icon: "🔗", title: "Parantez Eşleştirme", desc: "Derleyiciler açılan parantezleri yığına ekler; kapanan her parantezde pop ile eşleştirir." },
                  { icon: "🌐", title: "Tarayıcı Geçmişi", desc: "Ziyaret edilen sayfalar yığına eklenir. Geri tuşu top'u pop eder — klasik LIFO kullanımı." },
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
                <li><span className="feature-icon feature-check">✓</span><span><strong>Tüm işlemler O(1)</strong> — push, pop, peek sabit zamanlı</span></li>
                <li><span className="feature-icon feature-check">✓</span><span><strong>Basit yapı</strong> — dizi veya bağlı liste üstüne kolayca inşa edilir</span></li>
                <li><span className="feature-icon feature-check">✓</span><span><strong>Bellek verimli</strong> — yalnızca tutulan veriler kadar yer kullanır</span></li>
                <li><span className="feature-icon feature-x">✗</span><span><strong>Rastgele erişim yok</strong> — ortadaki elemana ulaşmak O(n)</span></li>
                <li><span className="feature-icon feature-x">✗</span><span><strong>Yalnızca tepeden işlem</strong> — alt elemanlara doğrudan müdahale edilemez</span></li>
                <li><span className="feature-icon feature-x">✗</span><span><strong>Taşma riski</strong> — dizi tabanlı uygulamada boyut sınırı vardır</span></li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
