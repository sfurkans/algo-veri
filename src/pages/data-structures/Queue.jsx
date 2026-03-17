import { useState, useEffect } from "react";
import { useQueue } from "../../visualizers/data-structures/useQueue";
import "../../pages/sorting/SortingPage.css";
import "./DataStructuresPage.css";


/* ── Pseudocode ── */
const PSEUDO = [
  { n: 1,  text: "enqueue(değer):",   header: true },
  { n: 2,  text: "  REAR'a ekle"                   },
  { n: 3,  text: "  rear ← rear + 1"               },
  { n: null, sep: true },
  { n: 5,  text: "dequeue():",        header: true },
  { n: 6,  text: "  eğer boş → hata!"              },
  { n: 7,  text: "  değer ← kuyruk[front]"         },
  { n: 8,  text: "  döndür değer"                  },
  { n: 9,  text: "  front ← front + 1"             },
  { n: null, sep: true },
  { n: 11, text: "front():",          header: true },
  { n: 12, text: "  eğer boş → hata!"              },
  { n: 13, text: "  döndür kuyruk[front]"          },
  { n: null, sep: true },
  { n: 15, text: "isEmpty():",        header: true },
  { n: 16, text: "  döndür front === rear"         },
];

/* ── Preset senaryolar ── */
const PRESETS = {
  basic: {
    label: "Temel İşlemler",
    tooltip: "enqueue / dequeue / front / isEmpty — tüm operasyonların özeti",
    ops: [
      { op: "enqueue", val: 5  },
      { op: "enqueue", val: 12 },
      { op: "enqueue", val: 8  },
      { op: "front"            },
      { op: "dequeue"          },
      { op: "enqueue", val: 3  },
      { op: "dequeue"          },
      { op: "isEmpty"          },
    ],
  },
  fifo: {
    label: "FIFO Sırası",
    tooltip: "İlk giren ilk çıkar — 1→5 enqueue, sonra sırayla dequeue",
    ops: [
      { op: "enqueue", val: 1 },
      { op: "enqueue", val: 2 },
      { op: "enqueue", val: 3 },
      { op: "enqueue", val: 4 },
      { op: "enqueue", val: 5 },
      { op: "dequeue"         },
      { op: "dequeue"         },
      { op: "dequeue"         },
      { op: "dequeue"         },
      { op: "dequeue"         },
    ],
  },
  mixed: {
    label: "Karma İşlem",
    tooltip: "Gerçek kullanıma yakın — enqueue / dequeue / front karışık",
    ops: [
      { op: "enqueue", val: 7  },
      { op: "enqueue", val: 14 },
      { op: "dequeue"          },
      { op: "enqueue", val: 22 },
      { op: "enqueue", val: 9  },
      { op: "front"            },
      { op: "dequeue"          },
      { op: "dequeue"          },
      { op: "isEmpty"          },
    ],
  },
  error: {
    label: "Hata Durumu",
    tooltip: "Boş kuyrukta dequeue / front — hata koşulları",
    ops: [
      { op: "isEmpty"          },
      { op: "dequeue"          },
      { op: "front"            },
      { op: "enqueue", val: 42 },
      { op: "dequeue"          },
      { op: "isEmpty"          },
    ],
  },
};

/* ────────────────────────────────────────────────────────────
   OPERATION BANNER
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
  const sz       = current.queue.length;
  const frontVal = sz > 0 ? current.queue[0] : null;
  const rearVal  = sz > 0 ? current.queue[sz - 1] : null;

  const cfgs = {
    enqueue_enter: {
      icon: "→", cls: "ob-enqueue",
      label: `ENQUEUE(${incoming})`,
      sub:   `${incoming} kuyruğun REAR tarafına doğru geliyor — boyut henüz: ${sz}`,
    },
    enqueue_settle: {
      icon: "✓", cls: "ob-done",
      label: `ENQUEUE(${rearVal}) tamamlandı`,
      sub:   `${rearVal} REAR'a yerleşti · FRONT = ${frontVal} · boyut: ${sz}`,
    },
    dequeue_lift: {
      icon: "←", cls: "ob-dequeue",
      label: `DEQUEUE()`,
      sub:   `FRONT eleman ${outgoing} kuyruktan alınıyor — kuyruk henüz: ${sz} eleman`,
    },
    dequeue_gone: {
      icon: "✓", cls: "ob-done",
      label: `DEQUEUE() → ${outgoing}`,
      sub:   `${outgoing} döndürüldü${sz > 0 ? ` · yeni FRONT = ${frontVal}` : " · kuyruk artık boş"} · boyut: ${sz}`,
    },
    front: {
      icon: "👁", cls: "ob-peek",
      label: `FRONT() → ${result}`,
      sub:   `Ön eleman görüntülendi, kuyruk değişmedi · boyut: ${sz}`,
    },
    isEmpty: {
      icon: result ? "□" : "■", cls: "ob-isempty",
      label: `isEmpty() → ${result}`,
      sub:   result ? "Kuyruk boş — hiç eleman yok" : `Kuyrukta ${sz} eleman var, boş değil`,
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
   QUEUE GÖRSELLEŞTİRİCİ
──────────────────────────────────────────────────────────── */
function QueueViz({ current, settledQueue }) {
  const displayQueue = current ? current.queue : settledQueue;
  const { phase, incoming, outgoing, highlightIdx } = current ?? {};
  const sz       = displayQueue.length;
  const frontVal = sz > 0 ? displayQueue[0] : null;
  const rearVal  = sz > 0 ? displayQueue[sz - 1] : null;

  return (
    <div className="queue-viz-card">

      {/* 1 ── Operation Banner */}
      <OperationBanner current={current} />

      {/* 2 ── Kuyruk satırı */}
      <div className="queue-scene">

        {/* FRONT etiketi (sol taraf — çıkış) */}
        <div className={`queue-end-label qel-front ${phase === "dequeue_lift" ? "qel-active" : ""}`}>
          <span className="qel-arrow">←</span>
          <span className="qel-text">FRONT<br />çıkış</span>
        </div>

        {/* Kuyruk içeriği */}
        <div className="queue-content">

          {/* DEQUEUE: çıkan eleman animasyonu (sol tarafa) */}
          {phase === "dequeue_lift" && (
            <div className="queue-box qb-leaving">
              <span className="queue-front-badge">OUT</span>
              <span className="queue-val">{outgoing}</span>
              <span className="queue-pos">[0]</span>
            </div>
          )}

          {/* Boş kuyruk */}
          {sz === 0 && phase !== "enqueue_enter" && (
            <div className="queue-empty-msg">— boş kuyruk —</div>
          )}

          {/* Kuyruk elemanları — soldan sağa (front → rear) */}
          {displayQueue.map((val, idx) => {
            const isFront  = idx === 0;
            const isRear   = idx === sz - 1;
            const isHL     = idx === highlightIdx;

            let cls = "queue-box";
            if (isHL && phase === "enqueue_settle") cls += " qb-settled";
            if (isHL && phase === "dequeue_gone")   cls += " qb-new-front";
            if (isHL && phase === "front")          cls += " qb-front-peek";

            return (
              <div key={idx} className={cls}>
                {isFront && <span className="queue-front-badge">F</span>}
                {isRear  && !isFront && <span className="queue-rear-badge">R</span>}
                <span className="queue-val">{val}</span>
                <span className="queue-pos">[{idx}]</span>
              </div>
            );
          })}

          {/* ENQUEUE: gelen eleman (sağ tarafa ekleniyor) */}
          {phase === "enqueue_enter" && (
            <div className="queue-box qb-entering">
              <span className="queue-rear-badge">IN</span>
              <span className="queue-val">{incoming}</span>
            </div>
          )}

        </div>

        {/* REAR etiketi (sağ taraf — giriş) */}
        <div className={`queue-end-label qel-rear ${phase === "enqueue_enter" ? "qel-active" : ""}`}>
          <span className="qel-text">REAR<br />giriş</span>
          <span className="qel-arrow">→</span>
        </div>

      </div>

      {/* 3 ── Metadata şeridi */}
      <div className="stack-meta-strip">
        <div className="sms-cell">
          <span className="sms-key">front değer</span>
          <span className="sms-val" style={{ color: "#7c3aed" }}>
            {frontVal ?? "—"}
          </span>
        </div>
        <div className="sms-div" />
        <div className="sms-cell">
          <span className="sms-key">rear değer</span>
          <span className="sms-val" style={{ color: "#0891b2" }}>
            {rearVal ?? "—"}
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
export default function Queue() {
  const {
    current, settledQueue,
    stepIndex, totalSteps,
    isPlaying, isDone, canPlay,
    speed, setSpeed,
    togglePlay, stepForward, stepBackward,
    autoPlayPreset,
    manualEnqueue, manualDequeue, manualFront, manualIsEmpty,
    reset,
  } = useQueue();

  const [inputVal,     setInputVal]     = useState("");
  const [activePreset, setActivePreset] = useState("basic");

  /* Sayfa açılınca "Temel İşlemler" preset'ini otomatik yükle ve oynat */
  useEffect(() => {
    const t = setTimeout(() => autoPlayPreset(PRESETS.basic.ops), 600);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const displayQueue = current ? current.queue : settledQueue;
  const activeLine   = current?.activeLine ?? null;
  const phase        = current?.phase ?? null;
  const busy         = isPlaying;

  function handleEnqueue() {
    const n = parseInt(inputVal, 10);
    if (!isNaN(n)) { manualEnqueue(n); setInputVal(""); setActivePreset(""); }
  }
  function handleDequeue()  { manualDequeue();  setActivePreset(""); }
  function handleFront()    { manualFront();    setActivePreset(""); }
  function handleIsEmpty()  { manualIsEmpty();  setActivePreset(""); }

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
            <h1 className="page-title">Kuyruk (Queue)</h1>
            <p className="page-subtitle">
              FIFO prensibi — ilk giren, ilk çıkar. Giriş REAR'dan, çıkış FRONT'tan. Her işlem O(1).
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
                  onKeyDown={(e) => e.key === "Enter" && handleEnqueue()}
                  placeholder="değer"
                />
                <button
                  className="stack-push-btn"
                  onClick={handleEnqueue}
                  disabled={busy || inputVal === ""}
                  data-tooltip="Girilen değeri kuyruğun REAR tarafına ekle"
                >
                  ENQUEUE
                </button>
              </div>
              <div className="stack-quick-row">
                <button className="stack-op-btn" onClick={handleDequeue} disabled={busy} data-tooltip="FRONT elemanı kuyruktan çıkar ve döndür">DEQUEUE</button>
                <button className="stack-op-btn" onClick={handleFront}   disabled={busy} data-tooltip="FRONT elemanı göster, kuyruğu değiştirme">FRONT</button>
                <button className="stack-op-btn" onClick={handleIsEmpty} disabled={busy} data-tooltip="Kuyruk boş mu? true / false döndürür">isEmpty</button>
              </div>
            </div>

            {/* Görsel */}
            <QueueViz current={current} settledQueue={settledQueue} />

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
                <span className="ss-val" style={{ color: "var(--primary)" }}>{displayQueue.length}</span>
                <span className="ss-label">Boyut</span>
              </div>
              <div className="ss-divider" />
              <div className="ss-item">
                <span className="ss-val" style={{ color: "#059669" }}>{current?.stats.enqueues ?? 0}</span>
                <span className="ss-label">Enqueue</span>
              </div>
              <div className="ss-divider" />
              <div className="ss-item">
                <span className="ss-val" style={{ color: "#ef4444" }}>{current?.stats.dequeues ?? 0}</span>
                <span className="ss-label">Dequeue</span>
              </div>
              <div className="ss-divider" />
              <div className="ss-item">
                <span className="ss-val" style={{ color: "#f59e0b" }}>{current?.stats.fronts ?? 0}</span>
                <span className="ss-label">Front</span>
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
                Queue <strong>FIFO</strong> (First In, First Out) prensibiyle çalışır:
                en önce eklenen eleman en önce çıkar. Giriş <strong>REAR</strong>'dan,
                çıkış <strong>FRONT</strong>'tan yapılır — her ikisi de O(1)'dir.
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
                    ["enqueue()", "O(1)", "O(1)"],
                    ["dequeue()", "O(1)", "O(1)"],
                    ["front()",   "O(1)", "O(1)"],
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
                n elemanlı kuyruğun kendisi <strong>O(n)</strong> bellek kullanır.
                Ancak her tek işlem için ek bellek gerekmez.
              </p>
            </div>

            <div className="section-divider">Stack vs Queue</div>

            <div className="info-card">
              <h3 className="info-card-title">Stack ile Fark</h3>
              <table className="complexity-table">
                <thead>
                  <tr><th>Özellik</th><th>Stack</th><th>Queue</th></tr>
                </thead>
                <tbody>
                  {[
                    ["Prensip",  "LIFO",    "FIFO"],
                    ["Giriş",    "TOP",     "REAR"],
                    ["Çıkış",    "TOP",     "FRONT"],
                    ["Örnek",    "Geri al", "Yazıcı kuyruğu"],
                  ].map(([feature, stack, queue]) => (
                    <tr key={feature}>
                      <td className="ct-op">{feature}</td>
                      <td style={{ fontSize: "0.83rem" }}>{stack}</td>
                      <td style={{ fontSize: "0.83rem", color: "var(--primary)", fontWeight: 600 }}>{queue}</td>
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
                  { icon: "🖨️", title: "Yazıcı Kuyruğu", desc: "Gönderilen belgeler sırayla yazdırılır. İlk gönderilen ilk yazdırılır — klasik FIFO kullanımı." },
                  { icon: "🌐", title: "Web Sunucusu İstekleri", desc: "Gelen HTTP istekleri kuyruğa alınır ve sırayla işlenir. Yoğun trafik yönetiminin temeli." },
                  { icon: "🔔", title: "Bildirim Sistemi", desc: "Uygulama bildirimleri üretildikleri sırayla kuyruğa girer; kullanıcıya aynı sırayla ulaşır." },
                  { icon: "🔍", title: "BFS (Genişlik Önce Arama)", desc: "Graf ve ağaç gezintisinde BFS algoritması kuyruk kullanır. Her düzey sırayla keşfedilir." },
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
                <li><span className="feature-icon feature-check">✓</span><span><strong>Tüm işlemler O(1)</strong> — enqueue, dequeue, front sabit zamanlı</span></li>
                <li><span className="feature-icon feature-check">✓</span><span><strong>Adil sıralama</strong> — her eleman geldiği sırayla işlenir</span></li>
                <li><span className="feature-icon feature-check">✓</span><span><strong>Bellek verimli</strong> — yalnızca tutulan veriler kadar yer kullanır</span></li>
                <li><span className="feature-icon feature-x">✗</span><span><strong>Rastgele erişim yok</strong> — ortadaki elemana ulaşmak O(n)</span></li>
                <li><span className="feature-icon feature-x">✗</span><span><strong>Yalnızca uçlardan işlem</strong> — ortaya eleman eklenemez/çıkarılamaz</span></li>
                <li><span className="feature-icon feature-x">✗</span><span><strong>Dizi tabanlıda kapasite sınırı</strong> — dinamik büyüme için bağlı liste gerekir</span></li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
