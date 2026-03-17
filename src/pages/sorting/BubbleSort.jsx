import { useBubbleSort } from "../../visualizers/sorting/useBubbleSort";
import CodePlayground from "../../components/CodePlayground";
import "./SortingPage.css";

const pseudocode = [
  { line: "for i = 0 to n-2:", indent: 0 },
  { line: "for j = 0 to n-i-2:", indent: 1 },
  { line: "if arr[j] > arr[j+1]:", indent: 2 },
  { line: "swap(arr[j], arr[j+1])", indent: 3 },
];

const complexity = [
  { label: "En İyi Durum", value: "O(n)", color: "green" },
  { label: "Ortalama Durum", value: "O(n²)", color: "yellow" },
  { label: "En Kötü Durum", value: "O(n²)", color: "red" },
  { label: "Bellek Kullanımı", value: "O(1)", color: "blue" },
];

function getBarState(index, current) {
  if (!current) return "default";
  if (current.sorted?.includes(index)) return "sorted";
  if (current.swapping?.includes(index)) return "swapping";
  if (current.comparing?.includes(index)) return "comparing";
  return "default";
}

// Değere göre hsl rengi: küçük=mavi, büyük=turuncu
function getValueColor(val, min, max) {
  const t = (val - min) / (max - min || 1);
  const hue = 220 - t * 180; // 220 (mavi) → 40 (turuncu)
  return `hsl(${hue}, 70%, 62%)`;
}

function CompareBox({ values, op }) {
  if (!values) return <div className="compare-box compare-box-empty">—</div>;
  return (
    <div className="compare-box">
      <div className={`compare-val ${op === ">" ? "compare-val-bigger" : "compare-val-smaller"}`}>
        <span className="compare-num">{values[0]}</span>
        <span className="compare-idx">arr[j]</span>
      </div>
      <div className={`compare-op ${op === ">" ? "op-greater" : "op-less"}`}>{op}</div>
      <div className={`compare-val ${op === ">" ? "compare-val-smaller" : "compare-val-bigger"}`}>
        <span className="compare-num">{values[1]}</span>
        <span className="compare-idx">arr[j+1]</span>
      </div>
    </div>
  );
}

function SortedRing({ sortedCount, totalCount }) {
  const pct = totalCount === 0 ? 0 : Math.round((sortedCount / totalCount) * 100);
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="sorted-ring">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={r} fill="none"
          stroke="url(#ringGrad)" strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 48 48)"
          style={{ transition: "stroke-dashoffset 0.4s ease" }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
        <text x="48" y="44" textAnchor="middle" fontSize="15" fontWeight="800" fill="#0f172a">{pct}%</text>
        <text x="48" y="58" textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="600">SIRALI</text>
      </svg>
      <span className="ring-label">{sortedCount} / {totalCount} eleman</span>
    </div>
  );
}

function RoundChart({ completedRounds, currentRound, totalRounds }) {
  if (!completedRounds || completedRounds.length === 0) {
    return (
      <div className="round-chart-empty">
        Turlar tamamlandıkça grafik burada görünecek
      </div>
    );
  }

  const maxSwaps = Math.max(...completedRounds.map((r) => r.swaps), 1);

  return (
    <div className="round-chart">
      {Array.from({ length: totalRounds }, (_, i) => {
        const round = completedRounds.find((r) => r.round === i + 1);
        const isActive = currentRound === i + 1 && !round;
        const height = round ? (round.swaps / maxSwaps) * 100 : 0;
        return (
          <div key={i} className="round-bar-wrap">
            <span className="round-bar-count">{round ? round.swaps : ""}</span>
            <div className="round-bar-track">
              <div
                className={`round-bar-fill ${isActive ? "round-bar-active" : ""} ${round ? "round-bar-done" : ""}`}
                style={{ height: `${round ? Math.max(height, 4) : isActive ? 4 : 0}%` }}
              />
            </div>
            <span className="round-bar-label">{i + 1}</span>
          </div>
        );
      })}
    </div>
  );
}

// Playground için sabit bir dizi kullanıyoruz (yenilenince de aynı kalsın)
const BUBBLE_SORT_CODE = `// Kabarcık Sıralama (Bubble Sort)
// compare(i, j) → arr[i] > arr[j] ise pozitif döner
// swap(i, j)    → arr[i] ile arr[j] yer değiştirir

for (let i = 0; i < arr.length - 1; i++) {
  for (let j = 0; j < arr.length - i - 1; j++) {
    if (compare(j, j + 1) > 0) {
      swap(j, j + 1);
    }
  }
}`;

const PLAYGROUND_ARRAY = [72, 15, 43, 88, 31, 57, 20, 64, 9, 76, 38, 51, 25, 93];

export default function BubbleSort() {
  const {
    array,
    current,
    stepIndex,
    totalSteps,
    isPlaying,
    isDone,
    speed,
    setSpeed,
    reset,
    togglePlay,
    stepForward,
    stepBackward,
  } = useBubbleSort(14);

  const displayArray = current ? current.array : array;
  const min = Math.min(...displayArray);
  const max = Math.max(...displayArray);
  const sortedCount = current?.sorted?.length ?? 0;
  const totalCount = displayArray.length;

  return (
    <div className="sorting-page">
      <div className="page-container">

        {/* Header */}
        <div className="page-header">
          <div className="page-header-text">
            <span className="page-tag">Sıralama Algoritması</span>
            <h1 className="page-title">Bubble Sort</h1>
            <p className="page-subtitle">Kabarcık Sıralama</p>
          </div>
          <div className="complexity-badges">
            {complexity.map((c) => (
              <div key={c.label} className={`complexity-badge badge-${c.color}`}>
                <span className="badge-label">{c.label}</span>
                <span className="badge-value">{c.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="page-body">

          {/* ── Left: Visualizer ── */}
          <div className="visualizer-col">

            {/* Tur + sayaçlar + halka */}
            <div className="meta-row">
              <div className="meta-left">
                <div className="meta-pill pill-round">
                  {current ? `Tur ${current.round} / ${current.totalRounds}` : "Tur — / —"}
                </div>
                <div className="meta-counters">
                  <div className="counter">
                    <span className="counter-icon">⇄</span>
                    <span className="counter-val">{current?.comparisons ?? 0}</span>
                    <span className="counter-label">Karşılaştırma</span>
                  </div>
                  <div className="counter">
                    <span className="counter-icon">↕</span>
                    <span className="counter-val">{current?.swaps ?? 0}</span>
                    <span className="counter-label">Takas</span>
                  </div>
                </div>
              </div>
              <SortedRing sortedCount={sortedCount} totalCount={totalCount} />
            </div>

            {/* Main card */}
            <div className="visualizer-section">
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${stepIndex < 0 ? 0 : ((stepIndex + 1) / totalSteps) * 100}%` }}
                />
              </div>

              {/* Bars */}
              <div className="bars-container">
                {displayArray.map((val, i) => {
                  const state = getBarState(i, current);
                  const isPointed = current?.comparing?.includes(i) || current?.swapping?.includes(i);
                  const valueColor = getValueColor(val, min, max);
                  return (
                    <div key={i} className="bar-wrapper">
                      <span className={`bar-arrow ${isPointed ? "bar-arrow-visible" : ""}`}>▼</span>
                      <div
                        className={`bar-fill bar-${state}`}
                        style={{
                          height: `${val}%`,
                          ...(state === "default" ? { background: valueColor } : {}),
                        }}
                      />
                      <span className="bar-label">{val}</span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="legend">
                {[
                  { cls: "dot-comparing", label: "Karşılaştırılan" },
                  { cls: "dot-swapping", label: "Takas Ediliyor" },
                  { cls: "dot-sorted", label: "Sıralandı" },
                ].map((l) => (
                  <div key={l.label} className="legend-item">
                    <span className={`legend-dot ${l.cls}`} />
                    {l.label}
                  </div>
                ))}
                <div className="legend-item">
                  <span className="legend-dot dot-gradient" />
                  Küçük → Büyük
                </div>
              </div>

              {/* Controls */}
              <div className="controls">
                <button className="ctrl-btn ctrl-secondary" onClick={reset}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
                  </svg>
                  Yenile
                </button>
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
                    type="range" min="50" max="800" step="50"
                    value={800 - speed + 50}
                    onChange={(e) => setSpeed(800 - Number(e.target.value) + 50)}
                    className="speed-slider"
                  />
                  <span className="speed-label">🐇</span>
                </div>
              </div>
            </div>

            <div className="section-divider">Adım Bilgisi</div>

            {/* Karşılaştırma kutusu + açıklama */}
            <div className="bottom-row">
              <CompareBox
                values={current?.compareValues}
                op={current?.compareOp}
              />
              <div className={`step-explanation ${isDone ? "step-done" : current ? "step-active" : "step-idle"}`}>
                <div className="step-main">
                  {current ? current.description : "▶ Play'e bas veya adım adım ilerle"}
                </div>
                {current?.detail && (
                  <div className="step-detail">{current.detail}</div>
                )}
              </div>
            </div>

            <div className="section-divider">İstatistikler</div>

            {/* Tur bazlı takas grafiği */}
            <div className="info-card">
              <h3 className="info-card-title">Tur Bazlı Takas Sayısı</h3>
              <RoundChart
                completedRounds={current?.completedRounds ?? []}
                currentRound={current?.round ?? 0}
                totalRounds={current?.totalRounds ?? 13}
              />
              <p className="chart-desc">
                Her çubuk, o turda kaç yer değiştirme yapıldığını gösterir.
                İlk turlarda dizi karışık olduğundan takas çok olur — turlar ilerledikçe azalır.
                Bu da Bubble Sort'un neden <strong>O(n²)</strong> olduğunu sezgisel olarak gösterir.
              </p>
            </div>

            <div className="section-divider">Kendi Kodunu Dene</div>

            {/* Code Playground */}
            <CodePlayground
              initialArray={PLAYGROUND_ARRAY}
              defaultCode={BUBBLE_SORT_CODE}
              subtitle={
                <>
                  Hazır gelen Bubble Sort kodunu incele ya da silip kendi versiyonunu yaz.{" "}
                  <strong>compare(j, j+1)</strong> ile komşuları karşılaştır —{" "}
                  pozitif dönerse <strong>swap(j, j+1)</strong> ile yer değiştir.{" "}
                  Her turda en büyük eleman sona "kabarır".{" "}
                  <strong>Çalıştır</strong>'a bastığında her adım grafikte canlanır.
                </>
              }
            />
          </div>

          {/* ── Right: Info panel ── */}
          <div className="info-section">
            <div className="info-card">
              <h3 className="info-card-title">Nasıl Çalışır?</h3>
              <p className="info-card-text">
                Bubble Sort, dizinin başından sonuna doğru komşu elemanları
                karşılaştırır. Sol eleman sağdakinden büyükse yer değiştirir.
                Her turda en büyük eleman dizinin sonuna "kabarır". Bu işlem
                n-1 kez tekrarlanır.
              </p>
            </div>

            <div className="section-divider">Kod</div>

            <div className="info-card">
              <h3 className="info-card-title">Pseudocode</h3>
              <div className="pseudocode">
                {pseudocode.map((p, i) => (
                  <div key={i} className={`pseudo-line ${current?.activeLine === i ? "pseudo-active" : ""}`}>
                    <span className="pseudo-num">{i + 1}</span>
                    <span className="pseudo-code" style={{ paddingLeft: `${p.indent * 16}px` }}>
                      {p.line}
                    </span>
                  </div>
                ))}
              </div>
              {current?.activeLine != null && (
                <p className="pseudo-hint">← Satır {current.activeLine + 1} şu an çalışıyor</p>
              )}
            </div>

            <div className="section-divider">Karmaşıklık</div>

            <div className="info-card">
              <h3 className="info-card-title">Karmaşıklık Analizi</h3>
              <div className="complexity-list">
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-green">En İyi Durum — O(n)</div>
                  <p className="complexity-row-desc">
                    Dizi <strong>zaten sıralı</strong> olsa bile Bubble Sort tüm elemanları
                    tek tek kontrol eder. Hiç takas yapmaz ama n-1 karşılaştırma yapar.
                    Bu yüzden en iyi ihtimalde bile doğrusal zaman alır.
                  </p>
                </div>
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-yellow">Ortalama Durum — O(n²)</div>
                  <p className="complexity-row-desc">
                    Elemanlar <strong>rastgele karışık</strong> olduğunda hem çok karşılaştırma
                    hem de çok takas yapar. n eleman için yaklaşık n×n işlem gerekir.
                    10 eleman → ~100 işlem, 100 eleman → ~10.000 işlem.
                  </p>
                </div>
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-red">En Kötü Durum — O(n²)</div>
                  <p className="complexity-row-desc">
                    Dizi <strong>tam ters sıralı</strong> olduğunda en fazla takas yapılır.
                    Her adımda her eleman yanlış yerdedir ve maksimum yer değiştirme gerekir.
                    Bu Bubble Sort'un en verimsiz halidir.
                  </p>
                </div>
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-blue">Bellek Kullanımı — O(1)</div>
                  <p className="complexity-row-desc">
                    Bubble Sort sıralama sırasında <strong>ekstra bellek kullanmaz.</strong>
                    Sadece iki elemanı birbiriyle değiştirmek için geçici bir değişken yeterlidir.
                    Dizi ne kadar büyük olursa olsun bellek ihtiyacı değişmez.
                  </p>
                </div>
              </div>
            </div>

            <div className="section-divider">Özellikler</div>

            <div className="info-card">
              <h3 className="info-card-title">Özellikler</h3>
              <ul className="feature-list">
                <li><span className="feature-icon feature-check">✓</span>Yerinde sıralama (ek bellek yok)</li>
                <li><span className="feature-icon feature-check">✓</span>Kararlı (stable) algoritma</li>
                <li><span className="feature-icon feature-check">✓</span>Anlaşılması en kolay algoritma</li>
                <li><span className="feature-icon feature-cross">✗</span>Büyük veri setlerinde yavaş</li>
              </ul>
            </div>

            <div className="section-divider">Analiz</div>

            <div className="info-card metric-card">
              <h3 className="info-card-title">Sayaçlar Ne Söyler?</h3>

              <div className="metric-item">
                <div className="metric-icon-wrap metric-compare">
                  <span>⇄</span>
                </div>
                <div>
                  <div className="metric-name">Karşılaştırma Sayısı</div>
                  <p className="metric-desc">
                    Bubble Sort her zaman tüm komşu çiftleri kontrol etmek zorundadır —
                    dizi sıralı olsa bile. Bu yüzden karşılaştırma sayısı
                    <strong> her zaman n×(n-1)/2 civarındadır</strong> ve dizinin
                    durumundan bağımsız sabite yakın kalır. Bu, O(n²) karmaşıklığının
                    doğrudan kanıtıdır.
                  </p>
                </div>
              </div>

              <div className="metric-divider" />

              <div className="metric-item">
                <div className="metric-icon-wrap metric-swap">
                  <span>↕</span>
                </div>
                <div>
                  <div className="metric-name">Takas Sayısı</div>
                  <p className="metric-desc">
                    Dizinin ne kadar "karışık" olduğunu doğrudan yansıtır.
                    Takas sayısı yüksekse elemanlar başlangıçta yerinden çok
                    uzaktaydı demektir. Takas sayısı sıfıra yakınsa dizi
                    neredeyse sıralıydı — ama algoritma bunu önceden bilemez,
                    yine de tüm karşılaştırmaları yapar.
                  </p>
                </div>
              </div>

              <div className="metric-divider" />

              <div className="metric-insight">
                <div className="insight-row">
                  <span className="insight-label">Karşılaştırma yüksek, takas düşük</span>
                  <span className="insight-tag tag-green">Dizi neredeyse sıralıydı</span>
                </div>
                <div className="insight-row">
                  <span className="insight-label">Karşılaştırma yüksek, takas da yüksek</span>
                  <span className="insight-tag tag-red">Dizi çok karışıktı</span>
                </div>
                <div className="insight-row">
                  <span className="insight-label">Karşılaştırma düşük olamaz</span>
                  <span className="insight-tag tag-gray">Bubble Sort'un zayıflığı</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
