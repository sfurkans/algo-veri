import { useState } from "react";
import { useHashTable, PRESETS, TABLE_SIZE } from "../../visualizers/data-structures/useHashTable";
import "../sorting/SortingPage.css";
import "./DataStructuresPage.css";
import "./HashTable.css";

// ── Pseudocode verisi ─────────────────────────────────────────────────────────
const PSEUDO = [
  { text: "INSERT(key, value):",       header: true },
  { text: "  hash ← 0"                               },
  { text: "  for her karakter c ∈ key:"              },
  { text: "    hash ← hash + ASCII(c)"               },
  { text: "  slot ← hash % TABLE_SIZE"               },
  { text: "  table[slot].ekle({key, value})"         },
  { sep: true },
  { text: "SEARCH(key):",              header: true },
  { text: "  slot ← hashFn(key)"                    },
  { text: "  for item ∈ table[slot]:"                },
  { text: "    if item.key === key:"                 },
  { text: "      return item.value"                  },
  { text: "  return null  // bulunamadı"             },
  { sep: true },
  { text: "UPDATE(key, newValue):",    header: true },
  { text: "  slot ← hashFn(key)"                    },
  { text: "  for item ∈ table[slot]:"                },
  { text: "    if item.key === key:"                 },
  { text: "      item.value ← newValue"              },
  { text: "      return true"                        },
  { text: "  return false  // bulunamadı"            },
  { sep: true },
  { text: "DELETE(key):",              header: true },
  { text: "  slot ← hashFn(key)"                    },
  { text: "  for item ∈ table[slot]:"                },
  { text: "    if item.key === key:"                 },
  { text: "      table[slot].sil(item)"              },
  { text: "      return true"                        },
  { text: "  return false  // bulunamadı"            },
];

// ── Yardımcı bileşenler ───────────────────────────────────────────────────────

function OpBanner({ current }) {
  if (!current || current.phase === "idle" || current.phase === "finished") {
    return (
      <div className="ht-banner ht-banner-idle">
        <span className="ht-banner-icon">⊙</span>
        <div className="ht-banner-body">
          <div className="ht-banner-op">Hazır</div>
          <div className="ht-banner-result" style={{ color: "var(--text-muted)", fontWeight: 500 }}>
            Oynat veya adım adım ilerle
          </div>
        </div>
      </div>
    );
  }

  const { op, activeKey, activeValue, opResult } = current;
  const cfg = {
    insert: { icon: "↓", label: "INSERT", cls: "ht-banner-insert" },
    search: { icon: "⌕", label: "SEARCH", cls: "ht-banner-search" },
    update: { icon: "✎", label: "UPDATE", cls: "ht-banner-update" },
    delete: { icon: "✕", label: "DELETE", cls: "ht-banner-delete" },
  };
  const { icon, label, cls } = cfg[op] ?? cfg.insert;

  const resultMap = {
    inserted:          { text: "✓ Eklendi",                       ok: true  },
    collision_insert:  { text: "⚡ Çakışma — zincire eklendi",    ok: true  },
    found:             { text: "✓ Bulundu",                       ok: true  },
    not_found:         { text: "✗ Bulunamadı",                    ok: false },
    updated:           { text: "✓ Güncellendi",                   ok: true  },
    update_not_found:  { text: "✗ Bulunamadı — güncellenemedi",   ok: false },
    deleted:           { text: "✓ Silindi",                       ok: true  },
    delete_not_found:  { text: "✗ Bulunamadı — silinemedi",       ok: false },
  };
  const res = opResult ? resultMap[opResult] : null;

  return (
    <div className={`ht-banner ${cls}`}>
      <span className="ht-banner-icon">{icon}</span>
      <div className="ht-banner-body">
        <div className="ht-banner-op">
          {label}{" "}
          <span className="ht-banner-key">"{activeKey}"</span>
          {(op === "insert" || op === "update") && activeValue && (
            <span className="ht-banner-value"> → "{activeValue}"</span>
          )}
        </div>
        {res && (
          <div className={`ht-banner-result ${res.ok ? "ht-result-ok" : "ht-result-fail"}`}>
            {res.text}
          </div>
        )}
      </div>
    </div>
  );
}

function HashCalcBox({ hashCalc }) {
  if (!hashCalc) {
    return (
      <div className="ht-hash-box ht-hash-idle">
        <div className="ht-hash-title">hash(key)</div>
        <div className="ht-hash-empty">Operasyon başlayınca hash hesabı burada görünür</div>
      </div>
    );
  }

  const { key, charIdx, chars, sum, tableSize, result } = hashCalc;
  const isDone = result !== null;

  // Henüz hesaplanmamış karakterler
  const pendingChars = isDone ? [] : [...key].slice(chars.length);

  return (
    <div className="ht-hash-box">
      <div className="ht-hash-title">hash("{key}")</div>

      <div className="ht-hash-chars">
        {chars.map(({ char, code }, i) => {
          const isActive = !isDone && i === charIdx;
          const cls = isActive ? "ht-char-active" : "ht-char-done";
          return (
            <div key={i} className={`ht-hash-char ${cls}`}>
              <span className="ht-char-c">'{char}'</span>
              <span className="ht-char-arrow">→</span>
              <span className="ht-char-code">{code}</span>
            </div>
          );
        })}
        {pendingChars.map((char, i) => (
          <div key={`p${i}`} className="ht-hash-char ht-char-pending">
            <span className="ht-char-c">'{char}'</span>
            <span className="ht-char-arrow">→</span>
            <span className="ht-char-code">?</span>
          </div>
        ))}
      </div>

      <div className="ht-hash-divider" />

      <div className="ht-hash-sum">
        <span className="ht-sum-label">Toplam:</span>
        <span className="ht-sum-val">{sum}</span>
      </div>

      {isDone && (
        <div className="ht-hash-result">
          <span className="ht-result-calc">{sum} % {tableSize}</span>
          <span className="ht-result-eq">=</span>
          <span className="ht-result-slot">{result}</span>
          <span className="ht-result-arrow">→ Slot {result}</span>
        </div>
      )}
    </div>
  );
}

function HashTableGrid({ current }) {
  const emptyTable = Array.from({ length: TABLE_SIZE }, () => []);
  const table = current?.table ?? emptyTable;
  const {
    highlightSlot, highlightChainIdx,
    newItemSlot, newItemChainIdx,
    deletingSlot, deletingChainIdx,
    phase, opResult,
  } = current ?? {};

  return (
    <div className="ht-table">
      {table.map((chain, slotIdx) => {
        const isHighlighted = highlightSlot === slotIdx;
        return (
          <div key={slotIdx} className={`ht-slot ${isHighlighted ? "ht-slot-highlight" : ""}`}>
            <div className="ht-slot-idx">{slotIdx}</div>
            <div className="ht-slot-chain">
              {chain.length === 0 ? (
                <span className="ht-slot-empty">∅</span>
              ) : (
                <>
                  {chain.map((item, ci) => {
                    const isNew      = newItemSlot === slotIdx && newItemChainIdx === ci;
                    const isDeleting = deletingSlot === slotIdx && deletingChainIdx === ci && phase === "deleting";
                    const isFound    = isHighlighted && highlightChainIdx === ci
                                       && phase === "done" && opResult === "found";
                    const isChecked  = isHighlighted && highlightChainIdx === ci && phase === "chain_check";

                    const itemCls = isDeleting ? "ht-item-deleting"
                                  : isFound    ? "ht-item-found"
                                  : isNew      ? "ht-item-new"
                                  : isChecked  ? "ht-item-checked"
                                  : "";

                    return (
                      <div key={ci} className="ht-chain-entry">
                        <div className={`ht-item ${itemCls}`}>
                          <span className="ht-item-key">{item.key}</span>
                          <span className="ht-item-sep">:</span>
                          <span className="ht-item-val">{item.value}</span>
                        </div>
                        {ci < chain.length - 1 && (
                          <span className="ht-chain-arrow">→</span>
                        )}
                      </div>
                    );
                  })}
                  <span className="ht-chain-null">→ null</span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatsRow({ current }) {
  const elements   = current?.totalElements   ?? 0;
  const collisions = current?.totalCollisions ?? 0;
  const lf         = elements / TABLE_SIZE;
  const lfPct      = Math.min(lf * 100, 100);
  const lfColor    = lf < 0.5 ? "#22c55e" : lf < 0.75 ? "#f59e0b" : "#ef4444";
  const lfValCls   = lf < 0.5 ? "" : lf < 0.75 ? "stat-warn" : "stat-danger";

  return (
    <div className="ht-stats">
      <div className="ht-stat">
        <span className="ht-stat-val">{elements}</span>
        <span className="ht-stat-label">Eleman</span>
      </div>
      <div className="ht-stat">
        <span className="ht-stat-val">{TABLE_SIZE}</span>
        <span className="ht-stat-label">Slot</span>
      </div>
      <div className="ht-stat" style={{ minWidth: 80 }}>
        <span className={`ht-stat-val ${lfValCls}`}>{lf.toFixed(2)}</span>
        <span className="ht-stat-label">Load Factor</span>
        <div className="ht-lf-bar" style={{ width: "100%" }}>
          <div className="ht-lf-fill" style={{ width: `${lfPct}%`, background: lfColor }} />
        </div>
      </div>
      <div className="ht-stat">
        <span className={`ht-stat-val ${collisions > 0 ? "stat-warn" : ""}`}>{collisions}</span>
        <span className="ht-stat-label">Çakışma</span>
      </div>
    </div>
  );
}

function DistributionChart({ current }) {
  const table = current?.table ?? Array.from({ length: TABLE_SIZE }, () => []);
  const max   = Math.max(...table.map((c) => c.length), 1);

  return (
    <div className="ht-dist">
      {table.map((chain, i) => {
        const h = chain.length ? (chain.length / max) * 100 : 3;
        return (
          <div key={i} className="ht-dist-bar-wrap">
            <div className="ht-dist-bar" style={{ height: `${h}%` }} />
            <span className="ht-dist-idx">{i}</span>
          </div>
        );
      })}
    </div>
  );
}

function StepBox({ current }) {
  if (!current || current.phase === "idle") {
    return (
      <div className="ht-step ht-step-idle">
        <div className="ht-step-main">▶ Play'e bas veya adım adım ilerle</div>
      </div>
    );
  }

  const { opResult, description, detail } = current;
  const doneCls = opResult === "found" || opResult === "inserted"
               || opResult === "collision_insert" || opResult === "deleted"
               || opResult === "updated"
    ? "ht-step-done"
    : opResult === "not_found" || opResult === "delete_not_found"
               || opResult === "update_not_found"
    ? "ht-step-fail"
    : "ht-step-active";

  return (
    <div className={`ht-step ${opResult ? doneCls : "ht-step-active"}`}>
      <div className="ht-step-main">{description}</div>
      {detail && <div className="ht-step-detail">{detail}</div>}
    </div>
  );
}

function AccordionSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`ht-accordion ${open ? "ht-acc-open" : ""}`}>
      <button className="ht-acc-header" onClick={() => setOpen((v) => !v)}>
        <span className="ht-acc-title">{title}</span>
        <svg className="ht-acc-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && <div className="ht-acc-body">{children}</div>}
    </div>
  );
}

// ── Ana bileşen ───────────────────────────────────────────────────────────────
export default function HashTable() {
  const {
    current, stepIndex, totalSteps,
    isPlaying, isDone, speed, setSpeed,
    activePreset, setActivePreset,
    togglePlay, stepForward, stepBackward,
  } = useHashTable();

  return (
    <div className="sorting-page">
      <div className="page-container">

        {/* ── Header ── */}
        <div className="page-header">
          <div>
            <div className="page-tag">Veri Yapısı</div>
            <h1 className="page-title">Hash Tablosu (Hash Table)</h1>
            <p className="page-subtitle">
              Anahtarı sayıya çevir, slotu bul, O(1)'de eriş — en hızlı arama yapısı.
            </p>
          </div>
        </div>

        <div className="page-body">

          {/* ══════════════════ SOL: Görselleştirici ══════════════════ */}
          <div className="visualizer-col">

            {/* Operasyon Banner */}
            <OpBanner current={current} />

            {/* Hash Hesap Kutusu */}
            <HashCalcBox hashCalc={current?.hashCalc ?? null} />

            {/* Ana Tablo */}
            <HashTableGrid current={current} />

            {/* İstatistik satırı */}
            <StatsRow current={current} />

            {/* Adım açıklaması */}
            <StepBox current={current} />

            {/* İlerleme */}
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${totalSteps > 1 ? ((stepIndex) / (totalSteps - 1)) * 100 : 0}%` }}
              />
            </div>

            {/* Kontroller */}
            <div className="controls">
              <div className="ctrl-group">
                <button
                  className="ctrl-btn ctrl-icon"
                  onClick={stepBackward}
                  disabled={stepIndex <= 0}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/>
                  </svg>
                </button>
                <button
                  className={`ctrl-btn ctrl-play ${isPlaying ? "is-playing" : ""}`}
                  onClick={togglePlay}
                >
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
                <button
                  className="ctrl-btn ctrl-icon"
                  onClick={stepForward}
                  disabled={isDone}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>
                  </svg>
                </button>
              </div>
              <div className="speed-control">
                <span className="speed-label">🐢</span>
                <input
                  type="range" min="50" max="900" step="50"
                  value={900 - speed + 50}
                  onChange={(e) => setSpeed(900 - Number(e.target.value) + 50)}
                  className="speed-slider"
                />
                <span className="speed-label">🐇</span>
              </div>
            </div>

            {/* Adım sayacı */}
            <div className="meta-row">
              <div className="step-progress">{stepIndex + 1} / {totalSteps}</div>
            </div>

            {/* Preset Seçici */}
            <div className="preset-bar">
              <span className="preset-label">Senaryo</span>
              <div className="preset-group">
                {Object.entries(PRESETS).map(([key, p]) => (
                  <button
                    key={key}
                    className={`preset-btn ${activePreset === key ? "preset-active" : ""}`}
                    onClick={() => setActivePreset(key)}
                    data-tooltip={p.tooltip}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dağılım Grafiği */}
            <div className="section-divider">Slot Dağılımı</div>
            <div className="info-card">
              <h3 className="info-card-title">Slot Başına Eleman Sayısı</h3>
              <DistributionChart current={current} />
              <p className="chart-desc" style={{ marginTop: 8 }}>
                İyi bir hash fonksiyonu elemanları <strong>eşit dağıtır</strong> — tüm çubuklar
                benzer yükseklikte olur. Uzun çubuklar o slotun aşırı yüklendiğini (clustering) gösterir.
              </p>
            </div>

          </div>

          {/* ══════════════════ SAĞ: Bilgi Paneli ══════════════════ */}
          <div className="info-section">

            <AccordionSection title="Nasıl Çalışır?" defaultOpen={true}>
              <ol className="ht-how-list">
                <li>Anahtar (key) bir <strong>hash fonksiyonuna</strong> verilir</li>
                <li>Fonksiyon anahtarı bir <strong>sayıya (indeks)</strong> dönüştürür</li>
                <li>Bu indeks <strong>tablo boyutuna bölünür</strong> — kalan = slot numarası</li>
                <li>Eleman o slota <strong>eklenir veya orada aranır</strong></li>
                <li>İki anahtar aynı slota düşerse <strong>çakışma (collision)</strong> olur</li>
                <li>Çakışmalar <strong>zincir (chaining)</strong> ile çözülür — slot bir liste tutar</li>
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

            <AccordionSection title="Karmaşıklık Analizi" defaultOpen={true}>
              <div className="ht-complexity-grid">
                <div className="ht-cmplx-cell cmplx-avg">
                  <span className="ht-cmplx-op">Ortalama</span>
                  <span className="ht-cmplx-val">O(1)</span>
                  <span className="ht-cmplx-sub">insert / search / delete</span>
                </div>
                <div className="ht-cmplx-cell cmplx-worst">
                  <span className="ht-cmplx-op">En Kötü</span>
                  <span className="ht-cmplx-val">O(n)</span>
                  <span className="ht-cmplx-sub">tüm elemanlar aynı slotta</span>
                </div>
                <div className="ht-cmplx-cell cmplx-mem">
                  <span className="ht-cmplx-op">Bellek</span>
                  <span className="ht-cmplx-val">O(n)</span>
                  <span className="ht-cmplx-sub">n eleman için</span>
                </div>
              </div>
              <div className="complexity-list" style={{ marginTop: 12 }}>
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-green">Ortalama — O(1)</div>
                  <p className="complexity-row-desc">
                    İyi dağılımda her slotta yalnızca birkaç eleman bulunur.
                    Hash fonksiyonu <strong>sabit sürede</strong> slotu hesaplar ve doğrudan oraya gidilir.
                    Bu, Binary Search'ün O(log n)'inden bile hızlıdır.
                  </p>
                </div>
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-red">En Kötü — O(n)</div>
                  <p className="complexity-row-desc">
                    Kötü bir hash fonksiyonu tüm elemanları aynı slota yığarsa,
                    arama zincirin tamamını taramak zorunda kalır.
                    Bu teorik senaryoda hash tablosu <strong>bağlı listeye dönüşür</strong>.
                  </p>
                </div>
              </div>
            </AccordionSection>

            <AccordionSection title="Hash Fonksiyonu">
              <p className="info-card-text">
                Bu görselleştirmede kullanılan fonksiyon:
              </p>
              <div className="pseudocode" style={{ marginTop: 8 }}>
                <div className="pseudo-line">
                  <span className="pseudo-text" style={{ color: "#4f46e5", fontWeight: 700 }}>
                    {"hash(key) { "}
                  </span>
                </div>
                <div className="pseudo-line">
                  <span className="pseudo-text">{"  sum = 0"}</span>
                </div>
                <div className="pseudo-line">
                  <span className="pseudo-text">{"  for c in key: sum += ASCII(c)"}</span>
                </div>
                <div className="pseudo-line">
                  <span className="pseudo-text">{"  return sum % TABLE_SIZE"}</span>
                </div>
                <div className="pseudo-line">
                  <span className="pseudo-text" style={{ color: "#4f46e5", fontWeight: 700 }}>
                    {"}"}
                  </span>
                </div>
              </div>
              <p className="info-card-text" style={{ marginTop: 10 }}>
                <strong>"name"</strong> için: n(110) + a(97) + m(109) + e(101) = 417
                → 417 % 11 = <strong>10</strong>
              </p>
              <p className="info-card-text" style={{ marginTop: 6 }}>
                Gerçek sistemlerde daha karmaşık fonksiyonlar (MurmurHash, FNV, djb2)
                kullanılır — daha az çakışma ve daha iyi dağılım sağlarlar.
              </p>
            </AccordionSection>

            <AccordionSection title="Load Factor">
              <p className="info-card-text">
                <strong>Load Factor = Eleman Sayısı / Slot Sayısı</strong>
              </p>
              <p className="info-card-text" style={{ marginTop: 8 }}>
                Load factor ne kadar yüksekse, çakışma olasılığı da o kadar artar.
                Çoğu gerçek implementasyon load factor <strong>0.7–0.75'i aşınca
                tabloyu yeniden boyutlandırır (rehash)</strong> — slot sayısını ikiye katlar
                ve tüm elemanları yeniden yerleştirir.
              </p>
              <div className="metric-insight" style={{ marginTop: 10 }}>
                <div className="insight-row">
                  <span className="insight-label">Load factor &lt; 0.5</span>
                  <span className="insight-tag tag-green">İyi — az çakışma</span>
                </div>
                <div className="insight-row">
                  <span className="insight-label">0.5 – 0.75</span>
                  <span className="insight-tag tag-yellow">Kabul edilebilir</span>
                </div>
                <div className="insight-row">
                  <span className="insight-label">Load factor &gt; 0.75</span>
                  <span className="insight-tag tag-red">Rehash zamanı!</span>
                </div>
              </div>
            </AccordionSection>

            <AccordionSection title="Çakışma Çözümü">
              <table className="ht-cmp-table">
                <thead>
                  <tr>
                    <th>Yöntem</th>
                    <th>Avantaj</th>
                    <th>Dezavantaj</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="ht-cmp-label">Chaining ← biz</span></td>
                    <td><span className="ht-pro">Basit, esnek</span></td>
                    <td><span className="ht-con">Ekstra bellek (pointer)</span></td>
                  </tr>
                  <tr>
                    <td><span className="ht-cmp-label">Linear Probing</span></td>
                    <td><span className="ht-pro">Önbellek dostu</span></td>
                    <td><span className="ht-con">Kümeleme (clustering)</span></td>
                  </tr>
                  <tr>
                    <td><span className="ht-cmp-label">Double Hashing</span></td>
                    <td><span className="ht-pro">Az kümeleme</span></td>
                    <td><span className="ht-con">Hesaplama maliyeti</span></td>
                  </tr>
                </tbody>
              </table>
              <p className="info-card-text" style={{ marginTop: 10 }}>
                Bu sayfada <strong>Separate Chaining</strong> gösterilmektedir — her slot
                bir bağlı liste tutar. Çakışan elemanlar bu listenin sonuna eklenir.
              </p>
            </AccordionSection>

            <AccordionSection title="Gerçek Hayatta">
              <ul className="ht-usage-list">
                <li className="ht-usage-item">
                  <span className="ht-usage-icon">🐍</span>
                  <span className="ht-usage-text">
                    <strong>Python dict, JavaScript Object/Map</strong> — dilde en temel veri yapısı.
                    Python'da her sınıf örneğinin attribute'ları bir hash tablosunda tutulur.
                  </span>
                </li>
                <li className="ht-usage-item">
                  <span className="ht-usage-icon">🗄️</span>
                  <span className="ht-usage-text">
                    <strong>Veritabanı indeksleri</strong> — eşitlik sorguları (WHERE id = 42)
                    hash index ile O(1)'de çalışır. Aralık sorguları için B-Tree kullanılır.
                  </span>
                </li>
                <li className="ht-usage-item">
                  <span className="ht-usage-icon">🔐</span>
                  <span className="ht-usage-text">
                    <strong>Şifre doğrulama</strong> — parolalar hash'lenerek saklanır.
                    Giriş sırasında girilen parola hash'lenir ve saklananla karşılaştırılır.
                  </span>
                </li>
                <li className="ht-usage-item">
                  <span className="ht-usage-icon">📦</span>
                  <span className="ht-usage-text">
                    <strong>Önbellek (Cache)</strong> — CPU önbelleği, DNS önbelleği, HTTP önbelleği
                    hepsi hash tablosu kullanır. Anahtar URL, değer yanıt içeriğidir.
                  </span>
                </li>
                <li className="ht-usage-item">
                  <span className="ht-usage-icon">🔎</span>
                  <span className="ht-usage-text">
                    <strong>Tekrar tespiti (Deduplication)</strong> — büyük veri setlerinde
                    tekrar eden elemanları O(n) sürede bulmak için Set (hash tablosu) kullanılır.
                  </span>
                </li>
              </ul>
            </AccordionSection>

            <AccordionSection title="Hash Tablosu vs Diğerleri">
              <div className="scenario-table">
                <div className="scenario-header">
                  <span>Yapı</span>
                  <span>Arama</span>
                  <span>Sıralı?</span>
                </div>
                <div className="scenario-row">
                  <span><strong>Hash Tablosu</strong></span>
                  <span className="scenario-val good">O(1) ort.</span>
                  <span className="scenario-val">✗</span>
                </div>
                <div className="scenario-row">
                  <span>Binary Search Tree</span>
                  <span className="scenario-val mid">O(log n)</span>
                  <span className="scenario-val good">✓</span>
                </div>
                <div className="scenario-row">
                  <span>Sıralı Dizi</span>
                  <span className="scenario-val mid">O(log n)</span>
                  <span className="scenario-val good">✓</span>
                </div>
                <div className="scenario-row">
                  <span>Sırasız Dizi</span>
                  <span className="scenario-val fixed">O(n)</span>
                  <span className="scenario-val">✗</span>
                </div>
              </div>
              <p className="scenario-note" style={{ marginTop: 8 }}>
                <strong>Kural:</strong> Sadece ekleme/arama/silme gerekiyorsa Hash Tablosu.
                Sıralı erişim, min/max veya aralık sorgusu gerekiyorsa BST veya sıralı dizi.
              </p>
            </AccordionSection>

          </div>
        </div>
      </div>
    </div>
  );
}
