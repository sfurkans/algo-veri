import { useState } from "react";
import { useSelectionSort } from "../../visualizers/sorting/useSelectionSort";
import CodePlayground from "../../components/CodePlayground";
import "./SortingPage.css";

const SIZE = 14;

function generateSortedArray(size) {
  return Array.from({ length: size }, (_, i) =>
    Math.round(10 + (i * 82) / (size - 1))
  );
}

function generateReversedArray(size) {
  return generateSortedArray(size).reverse();
}

const pseudocode = [
  { line: "for i = 0 to n-2:", indent: 0 },
  { line: "minIdx = i", indent: 1 },
  { line: "for j = i+1 to n-1:", indent: 1 },
  { line: "if arr[j] < arr[minIdx]:", indent: 2 },
  { line: "minIdx = j", indent: 3 },
  { line: "swap(arr[i], arr[minIdx])", indent: 1 },
];

const complexity = [
  { label: "Tüm Durumlar", value: "O(n²)", color: "red" },
  { label: "Takas (max)", value: "n−1", color: "yellow" },
  { label: "Bellek", value: "O(1)", color: "blue" },
];

const SELECTION_SORT_CODE = `// Seçme Sıralama (Selection Sort)
// compare(i, j) → arr[i] > arr[j] ise pozitif döner
// swap(i, j)    → arr[i] ile arr[j] yer değiştirir

for (let i = 0; i < arr.length - 1; i++) {
  let minIdx = i;
  for (let j = i + 1; j < arr.length; j++) {
    if (compare(minIdx, j) > 0) {
      minIdx = j;
    }
  }
  swap(i, minIdx);
}`;

function getBarState(index, current) {
  if (!current) return "default";
  if (current.sorted?.includes(index)) return "sorted";
  if (current.swapping?.includes(index)) return "swapping";
  if (index === current.minimum) return "minimum";
  if (current.comparing?.includes(index)) return "comparing";
  if (index === current.scanPos) return "scanpos";
  return "default";
}

function getValueColor(val, min, max) {
  const t = (val - min) / (max - min || 1);
  const hue = 220 - t * 180;
  return `hsl(${hue}, 70%, 62%)`;
}

// Taranan eleman vs güncel minimum
function MinTracker({ values, op }) {
  if (!values) return <div className="compare-box compare-box-empty">—</div>;
  return (
    <div className="compare-box">
      <div className={`compare-val ${op === "<" ? "compare-val-smaller" : "compare-val-bigger"}`}>
        <span className="compare-num">{values[0]}</span>
        <span className="compare-idx">arr[j]</span>
      </div>
      <div className={`compare-op ${op === "<" ? "op-less" : "op-greater"}`}>{op}</div>
      <div className={`compare-val ${op === "<" ? "compare-val-bigger" : "compare-val-smaller"}`}>
        <span className="compare-num">{values[1]}</span>
        <span className="compare-idx">minimum</span>
      </div>
    </div>
  );
}

// Tur bazlı karşılaştırma sayısı grafiği — azalan merdiven → O(n²) kanıtı
function RoundComparisonChart({ completedRounds, currentRound, totalRounds }) {
  if (!completedRounds || completedRounds.length === 0) {
    return (
      <div className="round-chart-empty">
        Turlar tamamlandıkça grafik burada görünecek
      </div>
    );
  }

  const maxComparisons = Math.max(...completedRounds.map((r) => r.comparisons), 1);

  return (
    <div className="round-chart">
      {Array.from({ length: totalRounds }, (_, i) => {
        const round = completedRounds.find((r) => r.round === i + 1);
        const isActive = currentRound === i + 1 && !round;
        const height = round ? (round.comparisons / maxComparisons) * 100 : 0;
        return (
          <div key={i} className="round-bar-wrap">
            <span className="round-bar-count">{round ? round.comparisons : ""}</span>
            <div className="round-bar-track">
              <div
                className={`round-bar-fill ${isActive ? "round-bar-active" : ""} ${round ? (round.swapped ? "round-bar-done" : "round-bar-noswap") : ""}`}
                style={{ height: `${round ? Math.max(height, 4) : isActive ? 4 : 0}%` }}
              />
            </div>
            <span className="round-bar-label">
              {i + 1}{round ? (round.swapped ? <span className="round-bar-swap-icon">↕</span> : <span className="round-bar-noswap-icon">·</span>) : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const PLAYGROUND_ARRAY = [63, 27, 84, 11, 52, 38, 91, 44, 17, 76, 29, 65, 8, 47];

export default function SelectionSort() {
  const [activePreset, setActivePreset] = useState("random");

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
    resetWith,
    togglePlay,
    stepForward,
    stepBackward,
  } = useSelectionSort(SIZE);

  const handlePreset = (type) => {
    setActivePreset(type);
    if (type === "random") reset();
    else if (type === "sorted") resetWith(generateSortedArray(SIZE));
    else resetWith(generateReversedArray(SIZE));
  };

  const displayArray = current ? current.array : array;
  const min = Math.min(...displayArray);
  const max = Math.max(...displayArray);
  const totalCount = displayArray.length;

  return (
    <div className="sorting-page">
      <div className="page-container">

        {/* Header */}
        <div className="page-header">
          <div className="page-header-text">
            <span className="page-tag">Sıralama Algoritması</span>
            <h1 className="page-title">Selection Sort</h1>
            <p className="page-subtitle">Seçme Sıralama</p>
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

          {/* ── Sol: Görselleştirici ── */}
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
                    <div className="counter-val-group">
                      <span className="counter-val">{current?.swaps ?? 0}</span>
                      <span className="counter-max">/ max {totalCount - 1}</span>
                    </div>
                    <span className="counter-label">Takas</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Preset seçici */}
            <div className="preset-bar">
              <span className="preset-label">Senaryo</span>
              <div className="preset-group">
                {[
                  { key: "random",   label: "Rastgele",      tooltip: "Her seferinde farklı, karışık bir dizi üretir" },
                  { key: "sorted",   label: "Sıralı ↑",      tooltip: "Küçükten büyüğe sıralı — hiç takas olmaz" },
                  { key: "reversed", label: "Ters Sıralı ↓", tooltip: "Büyükten küçüğe sıralı — karşılaştırma sayısı değişir mi?" },
                ].map(({ key, label, tooltip }) => (
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

            {/* Ana görselleştirici kart */}
            <div className="visualizer-section">
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${stepIndex < 0 ? 0 : ((stepIndex + 1) / totalSteps) * 100}%` }}
                />
              </div>

              {/* Barlar */}
              <div className="bars-container">
                {displayArray.map((val, i) => {
                  const state = getBarState(i, current);
                  const isPointed = current?.comparing?.includes(i) || current?.swapping?.includes(i) || i === current?.minimum;
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

              {/* Renk açıklamaları */}
              <div className="legend">
                {[
                  { cls: "dot-comparing", label: "Taranan eleman" },
                  { cls: "dot-minimum", label: "Güncel minimum" },
                  { cls: "dot-swapping", label: "Yer değiştiriyor" },
                  { cls: "dot-sorted", label: "Sıralandı" },
                  { cls: "dot-scanpos", label: "Hedef pozisyon" },
                ].map((l) => (
                  <div key={l.label} className="legend-item">
                    <span className={`legend-dot ${l.cls}`} />
                    {l.label}
                  </div>
                ))}
              </div>

              {/* Kontroller */}
              <div className="controls">
                <button className="ctrl-btn ctrl-secondary" onClick={() => handlePreset("random")}>
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

            {/* MinTracker + adım açıklaması */}
            <div className="bottom-row">
              <MinTracker
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

            {/* Tur bazlı karşılaştırma grafiği */}
            <div className="info-card">
              <h3 className="info-card-title">Tur Bazlı Karşılaştırma Sayısı</h3>
              <RoundComparisonChart
                completedRounds={current?.completedRounds ?? []}
                currentRound={current?.round ?? 0}
                totalRounds={current?.totalRounds ?? totalCount - 1}
              />
              <p className="chart-desc">
                Her çubuk, o turda kaç karşılaştırma yapıldığını gösterir.
                Tur ilerledikçe sıralanmış eleman artar ve taranacak alan küçülür.
                Bu azalan merdiven biçimi, toplam işlem sayısının <strong>n×(n-1)/2 ≈ O(n²)</strong> olduğunu
                sezgisel olarak kanıtlar.{" "}
                <span className="chart-legend-inline">
                  <span className="clr-dot clr-dot-swap" /> Takas yapıldı
                  &nbsp;&nbsp;
                  <span className="clr-dot clr-dot-noswap" /> Takas yok
                </span>
              </p>
            </div>

            <div className="section-divider">Kendi Kodunu Dene</div>

            <CodePlayground
              initialArray={PLAYGROUND_ARRAY}
              defaultCode={SELECTION_SORT_CODE}
              subtitle={
                <>
                  Hazır gelen Selection Sort'u incele ya da kendi versiyonunu yaz.{" "}
                  <strong>compare(minIdx, j)</strong> ile güncel minimumu taranan elemanla karşılaştır —{" "}
                  daha küçük bulursan <code>minIdx</code>'i güncelle, tur bitince{" "}
                  <strong>swap(i, minIdx)</strong> ile yerine otur.{" "}
                  <strong>Çalıştır</strong>'a bastığında her tur adım adım görselleştirilir.
                </>
              }
            />
          </div>

          {/* ── Sağ: Bilgi paneli ── */}
          <div className="info-section">
            <div className="info-card">
              <h3 className="info-card-title">Nasıl Çalışır?</h3>
              <ol className="hiw-list">
                <li>Sıralanmamış kısmın <strong>en küçük elemanını</strong> bul</li>
                <li>Onu sıralanmamış kısmın <strong>ilk pozisyonuyla</strong> yer değiştir</li>
                <li>O pozisyon artık <strong>kalıcı olarak yerleşti</strong> — bir daha dokunulmaz</li>
                <li>Hedef bir sağa kayar, <strong>n−1 turda</strong> dizi tamamlanır</li>
              </ol>
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
                  <div className="complexity-row-badge badge-red">Zaman Karmaşıklığı — Her Zaman O(n²)</div>
                  <p className="complexity-row-desc">
                    Selection Sort, dizi sıralı olsa da ters olsa da tam <strong>n×(n-1)/2
                    karşılaştırma</strong> yapar — erken çıkış mekanizması yoktur.
                    14 eleman için bu her zaman <strong>91 karşılaştırma</strong>'dır.
                    Takas sayısı girdiye göre 0 ile n-1 arasında değişir ama
                    toplam zaman hep karesel kalır.
                  </p>
                </div>
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-blue">Bellek Kullanımı — O(1)</div>
                  <p className="complexity-row-desc">
                    Yalnızca üç değişken kullanır: <code>i</code>, <code>j</code>, <code>minIdx</code>.
                    Dizi ne kadar büyürse büyüsün ek bellek ihtiyacı değişmez.
                  </p>
                </div>
              </div>
            </div>

            <div className="section-divider">Senaryo Karşılaştırması</div>

            <div className="info-card">
              <h3 className="info-card-title">Girdiye Göre Davranış (n = 14)</h3>
              <div className="scenario-table">
                <div className="scenario-header">
                  <span>Senaryo</span>
                  <span>Karşılaştırma</span>
                  <span>Takas</span>
                </div>
                <div className="scenario-row">
                  <span className="scenario-name">Sıralı dizi</span>
                  <span className="scenario-val fixed">91 (sabit)</span>
                  <span className="scenario-val good">0</span>
                </div>
                <div className="scenario-row">
                  <span className="scenario-name">Ters sıralı</span>
                  <span className="scenario-val fixed">91 (sabit)</span>
                  <span className="scenario-val mid">7</span>
                </div>
                <div className="scenario-row">
                  <span className="scenario-name">Rastgele</span>
                  <span className="scenario-val fixed">91 (sabit)</span>
                  <span className="scenario-val mid">0 – 13</span>
                </div>
              </div>
              <div className="scenario-note">
                <strong>Bubble Sort ile kıyas:</strong> aynı 14 elemanlı dizide
                karşılaştırma 0–91, takas ise 0–91 arasında değişir — girdiye
                tamamen bağımlıdır. Selection Sort'ta karşılaştırma hiç değişmez.
              </div>
            </div>

            <div className="section-divider">Özellikler</div>

            <div className="info-card">
              <h3 className="info-card-title">Özellikler</h3>
              <ul className="feature-list">
                <li><span className="feature-icon feature-check">✓</span>En az takas yapan basit algoritma (max n-1)</li>
                <li><span className="feature-icon feature-check">✓</span>Yazma maliyeti yüksek ortamlarda avantajlı</li>
                <li><span className="feature-icon feature-cross">✗</span>Sıralı dizide dahi O(n²) — erken çıkış yok</li>
              </ul>
            </div>

            <div className="section-divider">Kararlılık</div>

            <div className="info-card">
              <h3 className="info-card-title">Neden Kararsız? (Unstable)</h3>
              <p className="info-card-text">
                Selection Sort, <strong>eşit değerli elemanların göreli sırasını</strong> koruyamaz.
                Uzaktaki bir minimum ile yapılan takas, arada kalan eşit elemanın
                önüne geçmesine yol açabilir.
              </p>
              <div className="unstable-example">
                <div className="unstable-row">
                  <span className="unstable-label">Giriş</span>
                  <div className="unstable-cells">
                    <span className="ucell ucell-a">3ᵃ</span>
                    <span className="ucell ucell-b">3ᵇ</span>
                    <span className="ucell ucell-min">1</span>
                  </div>
                </div>
                <div className="unstable-arrow">↓ Tur 1: minimum (1) ile 3ᵃ yer değiştirir</div>
                <div className="unstable-row">
                  <span className="unstable-label">Çıkış</span>
                  <div className="unstable-cells">
                    <span className="ucell ucell-min">1</span>
                    <span className="ucell ucell-b">3ᵇ</span>
                    <span className="ucell ucell-a">3ᵃ</span>
                  </div>
                </div>
                <p className="unstable-note">
                  3ᵃ ve 3ᵇ eşit değere sahip; ama çıkışta göreli sıraları değişti.
                  Stabil bir algoritma (Bubble Sort, Insertion Sort) bu sırayı her zaman korurdu.
                </p>
              </div>
            </div>

            <div className="section-divider">Analiz</div>

            <div className="info-card metric-card">
              <h3 className="info-card-title">Sayaçlar Ne Söyler?</h3>

              <div className="metric-item">
                <div className="metric-icon-wrap metric-swap">
                  <span>↕</span>
                </div>
                <div>
                  <div className="metric-name">Takas Sayısı</div>
                  <p className="metric-desc">
                    Her tur <strong>en fazla 1 takas</strong> yapar; minimum zaten
                    doğru yerdeyse hiç takas olmaz. Bu yüzden toplam takas sayısı
                    en fazla n-1'dir. Yazma işlemi yavaş olan ortamlarda (flash bellek,
                    EEPROM) bu özellik Selection Sort'u diğer O(n²) algoritmalardan
                    üstün kılar.
                  </p>
                </div>
              </div>

              <div className="metric-divider" />

              <div className="metric-insight">
                <div className="insight-row">
                  <span className="insight-label">Karşılaştırma her zaman n(n-1)/2</span>
                  <span className="insight-tag tag-gray">Girdi bağımsız</span>
                </div>
                <div className="insight-row">
                  <span className="insight-label">Takas sayısı 0 ise</span>
                  <span className="insight-tag tag-green">Dizi zaten sıralıydı</span>
                </div>
                <div className="insight-row">
                  <span className="insight-label">Takas sayısı n-1 ise</span>
                  <span className="insight-tag tag-red">Dizi tam ters sıralıydı</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
