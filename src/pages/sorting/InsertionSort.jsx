import { useState, Fragment } from "react";
import { useInsertionSort } from "../../visualizers/sorting/useInsertionSort";
import CodePlayground from "../../components/CodePlayground";
import "./SortingPage.css";

const SIZE = 14;

function generateSortedArray(size) {
  return Array.from({ length: size }, (_, i) => Math.round(10 + (i * 82) / (size - 1)));
}
function generateReversedArray(size) {
  return generateSortedArray(size).reverse();
}
function generateNearlySortedArray(size) {
  const arr = generateSortedArray(size);
  const positions = [
    [Math.floor(size * 0.1), Math.floor(size * 0.2)],
    [Math.floor(size * 0.4), Math.floor(size * 0.55)],
    [Math.floor(size * 0.7), Math.floor(size * 0.85)],
  ];
  positions.forEach(([i, j]) => {
    if (i !== j && j < size) [arr[i], arr[j]] = [arr[j], arr[i]];
  });
  return arr;
}

const pseudocode = [
  { line: "for i = 1 to n-1:", indent: 0 },
  { line: "key = arr[i]", indent: 1 },
  { line: "j = i - 1", indent: 1 },
  { line: "while j ≥ 0 and arr[j] > key:", indent: 1 },
  { line: "arr[j+1] = arr[j]", indent: 2 },
  { line: "j = j - 1", indent: 2 },
  { line: "arr[j+1] = key", indent: 1 },
];

const complexity = [
  { label: "En İyi Durum", value: "O(n)", color: "green" },
  { label: "Ortalama Durum", value: "O(n²)", color: "yellow" },
  { label: "En Kötü Durum", value: "O(n²)", color: "red" },
  { label: "Bellek", value: "O(1)", color: "blue" },
];

const INSERTION_SORT_CODE = `// Eklemeli Sıralama (Insertion Sort)
// compare(i, j) → arr[i] > arr[j] ise pozitif döner
// swap(i, j)    → arr[i] ile arr[j] yer değiştirir
// Not: Bu versiyonda kaydırma yerine takas kullanılır.

for (let i = 1; i < arr.length; i++) {
  let j = i;
  while (j > 0 && compare(j - 1, j) > 0) {
    swap(j - 1, j);
    j--;
  }
}`;

function getBarState(index, current) {
  if (!current) return "default";
  if (current.shifting?.includes(index)) return "shifting";
  if (index === current.lifted && current.lifted >= 0) return "lifted";
  if (current.comparing?.includes(index)) return "comparing";
  if (index === current.insertPos && current.insertPos >= 0 && current.lifted < 0) return "inserted";
  if (current.sorted?.includes(index)) return "sorted";
  return "default";
}

function getValueColor(val, min, max) {
  const t = (val - min) / (max - min || 1);
  const hue = 220 - t * 180;
  return `hsl(${hue}, 70%, 62%)`;
}

function InsertionBox({ values, op }) {
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
        <span className="compare-idx">anahtar</span>
      </div>
    </div>
  );
}

function RoundShiftChart({ completedRounds, currentRound, totalRounds }) {
  if (!completedRounds || completedRounds.length === 0) {
    return (
      <div className="round-chart-empty">
        Turlar tamamlandıkça grafik burada görünecek
      </div>
    );
  }

  const maxShifts = Math.max(...completedRounds.map((r) => r.shifts), 1);

  return (
    <div className="round-chart">
      {Array.from({ length: totalRounds }, (_, i) => {
        const round = completedRounds.find((r) => r.round === i + 1);
        const isActive = currentRound === i + 1 && !round;
        const height = round ? (round.shifts / maxShifts) * 100 : 0;
        const hasShifts = round && round.shifts > 0;
        return (
          <div key={i} className="round-bar-wrap">
            <span className="round-bar-count">{round ? round.shifts : ""}</span>
            <div className="round-bar-track">
              <div
                className={`round-bar-fill ${isActive ? "round-bar-active" : ""} ${
                  round ? (hasShifts ? "round-bar-done" : "round-bar-noswap") : ""
                }`}
                style={{ height: `${round ? (hasShifts ? Math.max(height, 4) : 4) : isActive ? 4 : 0}%` }}
              />
            </div>
            <span className="round-bar-label">
              {i + 1}
              {round
                ? hasShifts
                  ? <span className="round-bar-swap-icon">→</span>
                  : <span className="round-bar-noswap-icon">·</span>
                : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const PLAYGROUND_ARRAY = [45, 12, 78, 23, 56, 34, 89, 67, 19, 41, 73, 28, 85, 50];

export default function InsertionSort() {
  const [activePreset, setActivePreset] = useState("random");

  const {
    array, current, stepIndex, totalSteps,
    isPlaying, isDone, speed, setSpeed,
    reset, resetWith, togglePlay, stepForward, stepBackward,
  } = useInsertionSort(SIZE);

  const handlePreset = (type) => {
    setActivePreset(type);
    if (type === "random") reset();
    else if (type === "sorted") resetWith(generateSortedArray(SIZE));
    else if (type === "reversed") resetWith(generateReversedArray(SIZE));
    else resetWith(generateNearlySortedArray(SIZE));
  };

  const displayArray = current ? current.array : array;
  const min = Math.min(...displayArray);
  const max = Math.max(...displayArray);
  const totalCount = displayArray.length;
  // Sıralı bölgenin sonu — çizgi bu indeksten önce çizilir
  const sortedBoundary = current && !isDone ? current.sorted.length : 0;

  return (
    <div className="sorting-page">
      <div className="page-container">

        {/* Header */}
        <div className="page-header">
          <div className="page-header-text">
            <span className="page-tag">Sıralama Algoritması</span>
            <h1 className="page-title">Insertion Sort</h1>
            <p className="page-subtitle">Eklemeli Sıralama</p>
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

            {/* Meta row */}
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
                    <span className="counter-icon">→</span>
                    <span className="counter-val">{current?.shifts ?? 0}</span>
                    <span className="counter-label">Kaydırma</span>
                  </div>
                </div>
              </div>
              {current?.keyVal != null && (
                <div className="key-badge">
                  <span className="key-badge-label">Anahtar</span>
                  <span className="key-badge-val">{current.keyVal}</span>
                </div>
              )}
            </div>

            {/* Preset bar */}
            <div className="preset-bar">
              <span className="preset-label">Senaryo</span>
              <div className="preset-group">
                {[
                  { key: "random",   label: "Rastgele",      tooltip: "Her seferinde farklı, karışık bir dizi" },
                  { key: "sorted",   label: "Sıralı ↑",      tooltip: "O(n) en iyi durum — her tur 1 karşılaştırma" },
                  { key: "reversed", label: "Ters Sıralı ↓", tooltip: "O(n²) en kötü durum — maksimum kaydırma" },
                  { key: "nearly",   label: "Az Karışık ≈",  tooltip: "Insertion Sort'un parladığı yer — minimum kaydırma" },
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

            {/* Ana görselleştirici */}
            <div className="visualizer-section">
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${stepIndex < 0 ? 0 : ((stepIndex + 1) / totalSteps) * 100}%` }}
                />
              </div>

              <div className="bars-container ins-bars">
                {displayArray.map((val, i) => {
                  const state = getBarState(i, current);
                  const isPointed =
                    current?.comparing?.includes(i) ||
                    current?.shifting?.includes(i) ||
                    i === current?.lifted;
                  const valueColor = getValueColor(val, min, max);
                  return (
                    <Fragment key={i}>
                      {sortedBoundary > 0 && i === sortedBoundary && (
                        <div className="sorted-boundary-line" />
                      )}
                      <div className="bar-wrapper">
                      <span className={`bar-arrow ${isPointed ? "bar-arrow-visible" : ""}`}>
                        {i === current?.lifted ? "▲" : "▼"}
                      </span>
                      <div
                        className={`bar-fill bar-${state}`}
                        style={{
                          height: `${val}%`,
                          ...(state === "default" ? { background: valueColor } : {}),
                        }}
                      />
                      <span className="bar-label">{val}</span>
                      </div>
                    </Fragment>
                  );
                })}
              </div>

              <div className="legend">
                {[
                  { cls: "dot-lifted",   label: "Elde tutulan (anahtar)" },
                  { cls: "dot-comparing", label: "Karşılaştırılan" },
                  { cls: "dot-shifting", label: "Kaydırılan" },
                  { cls: "dot-sorted",   label: "Sıralı" },
                  { cls: "dot-boundary", label: "Sıralı | Sıralanmamış sınırı" },
                ].map((l) => (
                  <div key={l.label} className="legend-item">
                    <span className={`legend-dot ${l.cls}`} />
                    {l.label}
                  </div>
                ))}
              </div>

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

            <div className="bottom-row">
              <InsertionBox values={current?.compareValues} op={current?.compareOp} />
              <div className={`step-explanation ${isDone ? "step-done" : current ? "step-active" : "step-idle"}`}>
                <div className="step-main">
                  {current ? current.description : "▶ Play'e bas veya adım adım ilerle"}
                </div>
                {current?.detail && <div className="step-detail">{current.detail}</div>}
              </div>
            </div>

            <div className="section-divider">İstatistikler</div>

            <div className="info-card">
              <h3 className="info-card-title">Tur Bazlı Kaydırma Sayısı</h3>
              <RoundShiftChart
                completedRounds={current?.completedRounds ?? []}
                currentRound={current?.round ?? 0}
                totalRounds={current?.totalRounds ?? totalCount - 1}
              />
              <p className="chart-desc">
                Her çubuk, o turda kaç kaydırma yapıldığını gösterir.
                <span className="chart-legend-inline">
                  <span className="clr-dot clr-dot-swap" /> Kaydırma var
                  &nbsp;&nbsp;
                  <span className="clr-dot clr-dot-noswap" /> Kaydırma yok
                </span>
                <br />
                Sıralı dizide tüm çubuklar sıfır kalır — bu O(n) en iyi durumun
                görsel kanıtıdır. Ters sıralıda çubuklar 1, 2, 3... şeklinde artar.
              </p>
            </div>

            <div className="section-divider">Kendi Kodunu Dene</div>

            <CodePlayground
              initialArray={PLAYGROUND_ARRAY}
              defaultCode={INSERTION_SORT_CODE}
              subtitle={
                <>
                  Hazır gelen Insertion Sort'u incele ya da kendi versiyonunu yaz.{" "}
                  <strong>compare(j-1, j)</strong> ile anahtarı solundaki elemanla karşılaştır —{" "}
                  büyükse <strong>swap(j-1, j)</strong> ile kaydır, anahtar doğru yerine oturana kadar devam et.{" "}
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
                <li>İkinci elemandan başla — ilk eleman tek başına <strong>zaten sıralıdır</strong></li>
                <li>Sonraki elemanı <strong>al</strong> (anahtar)</li>
                <li>Solundaki sıralı bölgede <strong>anahtardan büyük elemanları</strong> sağa kaydır</li>
                <li>Kaydırma durduğunda <strong>boşluğa anahtarı yerleştir</strong></li>
                <li>Sıralı bölge bir eleman büyür — bu adımları <strong>n-1 kez</strong> tekrarla</li>
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
                  <div className="complexity-row-badge badge-green">En İyi Durum — O(n)</div>
                  <p className="complexity-row-desc">
                    Dizi <strong>zaten sıralıysa</strong> her tur yalnızca 1 karşılaştırma
                    yapar ve hiç kaydırma olmaz. Toplam n-1 karşılaştırmayla biter.
                    Bu Bubble Sort ve Selection Sort'un ulaşamadığı bir avantajdır —
                    onlar sıralı dizide de O(n²) karşılaştırma yapar.
                  </p>
                </div>
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-yellow">Ortalama Durum — O(n²)</div>
                  <p className="complexity-row-desc">
                    Elemanlar rastgele karışık olduğunda her tur ortalama i/2 karşılaştırma
                    ve i/2 kaydırma yapar. Toplamda n×(n-1)/4 işlem, yani <strong>O(n²)</strong>.
                  </p>
                </div>
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-red">En Kötü Durum — O(n²)</div>
                  <p className="complexity-row-desc">
                    Dizi <strong>ters sıralıysa</strong> her eleman sıralı bölgenin
                    en başına kadar gitmek zorundadır. Tur i için i kaydırma yapılır:
                    toplamda 1+2+...+(n-1) = n(n-1)/2 kaydırma.
                  </p>
                </div>
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-blue">Bellek — O(1)</div>
                  <p className="complexity-row-desc">
                    Yalnızca <code>key</code>, <code>i</code>, <code>j</code> değişkenlerini
                    kullanır. Dizi boyutundan bağımsız sabit bellek.
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
                  <span>Kaydırma</span>
                </div>
                <div className="scenario-row">
                  <span className="scenario-name">Sıralı dizi</span>
                  <span className="scenario-val good">13 (n-1)</span>
                  <span className="scenario-val good">0</span>
                </div>
                <div className="scenario-row">
                  <span className="scenario-name">Az karışık</span>
                  <span className="scenario-val mid">~15–30</span>
                  <span className="scenario-val mid">~3–12</span>
                </div>
                <div className="scenario-row">
                  <span className="scenario-name">Rastgele</span>
                  <span className="scenario-val mid">~30–70</span>
                  <span className="scenario-val mid">~30–70</span>
                </div>
                <div className="scenario-row">
                  <span className="scenario-name">Ters sıralı</span>
                  <span className="scenario-val fixed">91 (n²/2)</span>
                  <span className="scenario-val fixed">91 (n²/2)</span>
                </div>
              </div>
              <div className="scenario-note">
                <strong>Selection Sort'tan farkı:</strong> Selection Sort her zaman
                91 karşılaştırma yapar. Insertion Sort ise sıralı dizide yalnızca
                13 karşılaştırma yapar — bu O(n) en iyi durumunun somut kanıtıdır.
              </div>
            </div>

            <div className="section-divider">Özellikler</div>

            <div className="info-card">
              <h3 className="info-card-title">Özellikler</h3>
              <ul className="feature-list">
                <li><span className="feature-icon feature-check">✓</span>Sıralı / neredeyse sıralı dizilerde çok verimli (O(n))</li>
                <li><span className="feature-icon feature-check">✓</span>Kararlı (stable) — eşit elemanların sırası bozulmaz</li>
                <li><span className="feature-icon feature-check">✓</span>Online — tüm diziyi önceden görmeden, eleman geldikçe çalışır</li>
                <li><span className="feature-icon feature-check">✓</span>Yerinde sıralama (ek bellek yok)</li>
                <li><span className="feature-icon feature-cross">✗</span>Büyük ve karışık dizilerde yavaş kalır — O(n²)</li>
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
                    Sıralı girdide yalnızca <strong>n-1 karşılaştırma</strong> —
                    her tur tek bir karşılaştırmayla biter. Bu O(n) en iyi durumunun
                    doğrudan kanıtıdır. Ters sıralıda ise n(n-1)/2 = 91 karşılaştırma yapılır.
                  </p>
                </div>
              </div>

              <div className="metric-divider" />

              <div className="metric-item">
                <div className="metric-icon-wrap metric-shift">
                  <span>→</span>
                </div>
                <div>
                  <div className="metric-name">Kaydırma Sayısı</div>
                  <p className="metric-desc">
                    Dizinin ne kadar bozuk olduğunu doğrudan yansıtır.
                    Sıralı dizide sıfır kaydırma. Ters sıralıda ise her eleman
                    sıralı bölgenin en başına kadar taşınmak zorundadır —
                    toplamda en fazla n(n-1)/2 kaydırma yapılır.
                  </p>
                </div>
              </div>

              <div className="metric-divider" />

              <div className="metric-insight">
                <div className="insight-row">
                  <span className="insight-label">Kaydırma = 0</span>
                  <span className="insight-tag tag-green">Dizi sıralıydı — O(n)</span>
                </div>
                <div className="insight-row">
                  <span className="insight-label">Az kaydırma</span>
                  <span className="insight-tag tag-green">Neredeyse sıralıydı</span>
                </div>
                <div className="insight-row">
                  <span className="insight-label">Kaydırma ≈ Karşılaştırma</span>
                  <span className="insight-tag tag-red">Ters sıralıya yakın</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
