import { useState } from "react";
import { useMergeSort } from "../../visualizers/sorting/useMergeSort";
import CodePlayground from "../../components/CodePlayground";
import "../../components/CodePlayground.css";
import "./SortingPage.css";

/* ── Complexity badges ───────────────────────────────────────── */
const COMPLEXITY_DATA = [
  { label: "En İyi Durum",   value: "O(n log n)", color: "green"  },
  { label: "Ortalama Durum", value: "O(n log n)", color: "yellow" },
  { label: "En Kötü Durum",  value: "O(n log n)", color: "red"    },
  { label: "Bellek",         value: "O(n)",        color: "blue"   },
];

/* ── Pseudocode ──────────────────────────────────────────────── */
const PSEUDOCODE_LINES = [
  { n: 1,  text: "mergeSort(dizi, sol, sağ):" },
  { n: 2,  text: "  eğer sol ≥ sağ: döndür" },
  { n: 3,  text: "  orta = ⌊(sol + sağ) / 2⌋" },
  { n: 4,  text: "  mergeSort(dizi, sol, orta)" },
  { n: 5,  text: "  mergeSort(dizi, orta+1, sağ)" },
  { n: 6,  text: "  birleştir(dizi, sol, orta, sağ)  ←" },
  { n: 7,  text: "────────────────────────────────────" },
  { n: 8,  text: "birleştir(dizi, sol, orta, sağ):" },
  { n: 9,  text: "  sol[], sağ[] geçici dizilere kopyala" },
  { n: 10, text: "  i=0, j=0, k=sol" },
  { n: 11, text: "  while i < |sol| ve j < |sağ|:" },
  { n: 12, text: "    eğer sol[i] ≤ sağ[j]:  ←" },
  { n: 13, text: "      dizi[k++] = sol[i++]  ←" },
  { n: 14, text: "    değilse:" },
  { n: 15, text: "      dizi[k++] = sağ[j++]  ←" },
  { n: 16, text: "  kalan elemanları kopyala  ←" },
];

/* ── Playground code ─────────────────────────────────────────── */
const PLAYGROUND_ARRAY = [38, 27, 43, 3, 9, 82, 10, 1];

const MERGE_SORT_CODE = `// Birleştirme Sıralama (Merge Sort)
// compare(i, j) → arr[i] > arr[j] ise pozitif döner
// swap(i, j)    → arr[i] ile arr[j] yer değiştirir
// Not: Gerçek Merge Sort ekstra dizi kullanır.
// Bu versiyon takas tabanlı birleştirme yapar.

function mergeInPlace(left, mid, right) {
  let i = left, j = mid + 1;
  while (i <= mid && j <= right) {
    if (compare(i, j) <= 0) {
      i++;
    } else {
      let pos = j;
      while (pos > i) { swap(pos, pos - 1); pos--; }
      i++; mid++; j++;
    }
  }
}

function mergeSort(left, right) {
  if (left >= right) return;
  const mid = Math.floor((left + right) / 2);
  mergeSort(left, mid);
  mergeSort(mid + 1, right);
  mergeInPlace(left, mid, right);
}

mergeSort(0, arr.length - 1);`;

/* ── Preset generators ───────────────────────────────────────── */
const SIZE = 14;

function generateSortedArray(size) {
  return Array.from({ length: size }, (_, i) => 10 + Math.round((85 / (size - 1)) * i));
}

function generateReversedArray(size) {
  return generateSortedArray(size).reverse();
}

function generateNearlySortedArray(size) {
  const arr = generateSortedArray(size);
  [[1, 3], [5, 7], [9, 11]].forEach(([a, b]) => {
    if (b < size) [arr[a], arr[b]] = [arr[b], arr[a]];
  });
  return arr;
}

/* ── Bar state ───────────────────────────────────────────────── */
function getBarState(idx, step, isDone) {
  if (!step) return "default";
  const { leftRange, rightRange, comparing, copying, mergedIndices, sorted } = step;

  if (isDone || sorted?.includes(idx)) return "sorted";
  if (copying === idx) return "copying";
  if (comparing[0] === idx) return "comparing-left";
  if (comparing[1] === idx) return "comparing-right";
  if (leftRange && idx >= leftRange[0] && idx <= leftRange[1]) return "left-sub";
  if (rightRange && idx >= rightRange[0] && idx <= rightRange[1]) return "right-sub";
  if (mergedIndices?.includes(idx)) return "prev-merged";
  return "default";
}

/* ── MergeBox ────────────────────────────────────────────────── */
function MergeBox({ values, op }) {
  if (!values) {
    return (
      <div className="mrg-box mrg-box-idle">
        <span className="mrg-idle-text">Karşılaştırma bekleniyor…</span>
      </div>
    );
  }
  const isLeft = op === "≤";
  return (
    <div className="mrg-box">
      <div className={`mrg-side mrg-side-left ${isLeft ? "mrg-winner" : ""}`}>
        <span className="mrg-label">Sol</span>
        <span className="mrg-val">{values[0]}</span>
      </div>
      <div className="mrg-op">{op}</div>
      <div className={`mrg-side mrg-side-right ${!isLeft ? "mrg-winner" : ""}`}>
        <span className="mrg-label">Sağ</span>
        <span className="mrg-val">{values[1]}</span>
      </div>
    </div>
  );
}

/* ── AuxArrayViz ─────────────────────────────────────────────── */
function AuxArrayViz({ mergeSrc, array, leftRange, rightRange }) {
  if (!mergeSrc || !leftRange || !rightRange) {
    return (
      <div className="aux-viz aux-viz-idle">
        <span className="aux-idle-text">Birleştirme başlayınca geçici dizi burada görünür</span>
      </div>
    );
  }

  const { leftArr, rightArr, leftPtr, rightPtr, resultCount } = mergeSrc;
  const left = leftRange[0];

  return (
    <div className="aux-viz">
      <div className="aux-row">
        <span className="aux-row-label">Sol [ ]</span>
        <div className="aux-cells">
          {leftArr.map((val, idx) => (
            <div
              key={idx}
              className={`aux-cell aux-cell-left ${idx === leftPtr && leftPtr < leftArr.length ? "aux-ptr-left" : ""} ${idx < leftPtr ? "aux-used" : ""}`}
            >
              {val}
            </div>
          ))}
        </div>
      </div>

      <div className="aux-row">
        <span className="aux-row-label">Sağ [ ]</span>
        <div className="aux-cells">
          {rightArr.map((val, idx) => (
            <div
              key={idx}
              className={`aux-cell aux-cell-right ${idx === rightPtr && rightPtr < rightArr.length ? "aux-ptr-right" : ""} ${idx < rightPtr ? "aux-used" : ""}`}
            >
              {val}
            </div>
          ))}
        </div>
      </div>

      <div className="aux-divider" />

      <div className="aux-row aux-row-result">
        <span className="aux-row-label">Sonuç</span>
        <div className="aux-cells">
          {Array.from({ length: leftArr.length + rightArr.length }, (_, idx) => {
            const isFilled = idx < resultCount;
            const isCurrent = isFilled && idx === resultCount - 1;
            return (
              <div
                key={idx}
                className={`aux-cell aux-cell-result ${isFilled ? "aux-filled" : "aux-empty"} ${isCurrent ? "aux-current" : ""}`}
              >
                {isFilled ? array[left + idx] : ""}
              </div>
            );
          })}
        </div>
      </div>

      <div className="aux-progress">
        <div
          className="aux-progress-bar"
          style={{ width: `${(resultCount / (leftArr.length + rightArr.length)) * 100}%` }}
        />
      </div>
    </div>
  );
}

/* ── SplitTree ───────────────────────────────────────────────── */
function SplitTree({ n, depth, maxDepth }) {
  if (!maxDepth) return null;
  const inputLevel  = maxDepth - depth + 1;
  const outputLevel = maxDepth - depth;

  return (
    <div className="split-tree">
      {Array.from({ length: maxDepth + 1 }, (_, level) => {
        const numBlocks = Math.min(Math.pow(2, level), n);
        const blockSize = level === 0 ? "n" : level === maxDepth ? "1" : Math.round(n / numBlocks);
        const isInput  = level === inputLevel;
        const isOutput = level === outputLevel;

        return (
          <div
            key={level}
            className={`stree-row${isInput ? " stree-input" : ""}${isOutput ? " stree-output" : ""}`}
          >
            <span className="stree-label">{blockSize}</span>
            <div className="stree-blocks">
              {Array.from({ length: numBlocks }, (_, bi) => (
                <div key={bi} className="stree-block" />
              ))}
            </div>
          </div>
        );
      })}
      <div className="stree-legend">
        <span className="stree-leg-item stree-leg-input">Birleştirilen</span>
        <span className="stree-leg-item stree-leg-output">Sonuç</span>
      </div>
    </div>
  );
}

/* ── DepthComparisonChart ────────────────────────────────────── */
function DepthComparisonChart({ completedMerges, maxDepth }) {
  if (!maxDepth) return <p className="chart-empty">Turlar tamamlandıkça grafik burada görünecek</p>;

  const byDepth = {};
  for (let d = 1; d <= maxDepth; d++) byDepth[d] = 0;
  completedMerges.forEach(({ depth, comparisons }) => {
    byDepth[depth] = (byDepth[depth] || 0) + comparisons;
  });

  const maxVal = Math.max(...Object.values(byDepth), 1);

  return (
    <div className="depth-chart">
      {Array.from({ length: maxDepth }, (_, i) => {
        const d = i + 1;
        const val = byDepth[d] || 0;
        const pct = val ? (val / maxVal) * 100 : 0;
        return (
          <div key={d} className="depth-row">
            <div className="depth-row-label">Seviye {d}</div>
            <div className="depth-row-bar-wrap">
              <div
                className="depth-row-bar"
                style={{ width: val ? `${pct}%` : "0%" }}
              />
              <span className="depth-row-val">{val || "–"}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────── */
export default function MergeSort() {
  const totalCount = SIZE;
  const {
    array, current, stepIndex, totalSteps,
    isPlaying, isDone, speed, setSpeed,
    reset, resetWith, togglePlay, stepForward, stepBackward,
  } = useMergeSort(totalCount);

  const [activePreset, setActivePreset] = useState("random");

  function handlePreset(key) {
    setActivePreset(key);
    if (key === "random")   reset();
    if (key === "sorted")   resetWith(generateSortedArray(totalCount));
    if (key === "reversed") resetWith(generateReversedArray(totalCount));
    if (key === "nearly")   resetWith(generateNearlySortedArray(totalCount));
  }

  const displayArray = current?.array ?? array;
  const maxVal = Math.max(...displayArray, 1);
  const maxDepth = current?.maxDepth ?? Math.ceil(Math.log2(totalCount));

  return (
    <div className="sorting-page">
      <div className="page-container">

        {/* ── Header ── */}
        <div className="page-header">
          <div>
            <div className="page-tag">Sıralama Algoritması</div>
            <h1 className="page-title">Birleştirme Sıralama</h1>
            <p className="page-subtitle">
              Diziyi ikiye böl, her yarıyı sırala, sonra birleştir — her zaman O(n log n).
            </p>
          </div>
          <div className="complexity-badges">
            {COMPLEXITY_DATA.map(({ label, value, color }) => (
              <div key={label} className={`complexity-badge badge-${color}`}>
                <span className="badge-value">{value}</span>
                <span className="badge-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="page-body">

          {/* ── Sol: Görselleştirici ── */}
          <div className="visualizer-col">

            {/* Bars */}
            <div className="bars-container mrg-bars">
              {displayArray.map((val, idx) => {
                const state = getBarState(idx, current, isDone);
                return (
                  <div key={idx} className="bar-wrapper">
                    <div
                      className={`bar-fill bar-${state}`}
                      style={{ height: `${(val / maxVal) * 100}%` }}
                    />
                    <div className="bar-label">{val}</div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="legend">
              <div className="legend-item"><div className="legend-dot dot-left-sub" />Sol alt dizi</div>
              <div className="legend-item"><div className="legend-dot dot-right-sub" />Sağ alt dizi</div>
              <div className="legend-item"><div className="legend-dot dot-comparing-left" />Sol işaretçi</div>
              <div className="legend-item"><div className="legend-dot dot-comparing-right" />Sağ işaretçi</div>
              <div className="legend-item"><div className="legend-dot dot-copying" />Yerleştirilen</div>
              <div className="legend-item"><div className="legend-dot dot-prev-merged" />Önceki birleşim</div>
              <div className="legend-item"><div className="legend-dot dot-sorted" />Sıralandı</div>
            </div>

            {/* Controls */}
            <div className="controls">
              <div className="ctrl-group">
                <button className="ctrl-btn ctrl-icon" onClick={stepBackward} disabled={!current || stepIndex <= 0}>◀◀</button>
                <button className={`ctrl-btn ctrl-play ${isPlaying ? "is-playing" : ""}`} onClick={togglePlay}>
                  {isPlaying ? "⏸ Durdur" : isDone ? "↺ Yeniden" : "▶ Oynat"}
                </button>
                <button className="ctrl-btn ctrl-icon" onClick={stepForward} disabled={isDone}>▶▶</button>
              </div>
              <div className="ctrl-group">
                <span className="speed-label">Hız</span>
                {[600, 300, 150, 60].map(ms => (
                  <button
                    key={ms}
                    className={`ctrl-btn ctrl-secondary ${speed === ms ? "speed-active" : ""}`}
                    onClick={() => setSpeed(ms)}
                  >
                    {ms === 600 ? "×1" : ms === 300 ? "×2" : ms === 150 ? "×4" : "×8"}
                  </button>
                ))}
              </div>
              <button className="ctrl-btn ctrl-secondary" onClick={() => { handlePreset("random"); }}>↺ Yenile</button>
            </div>

            {/* Meta row */}
            <div className="meta-row">
              <div className="meta-left">
                <div className="meta-pill pill-round">
                  {current
                    ? `Seviye ${current.depth} / ${current.maxDepth}`
                    : "Seviye — / —"}
                </div>
                <div className="meta-counters">
                  <div className="counter">
                    <span className="counter-icon">⇄</span>
                    <span className="counter-val">{current?.comparisons ?? 0}</span>
                    <span className="counter-label">Karşılaştırma</span>
                  </div>
                  <div className="counter">
                    <span className="counter-icon">⎘</span>
                    <span className="counter-val">{current?.copies ?? 0}</span>
                    <span className="counter-label">Kopyalama</span>
                  </div>
                </div>
              </div>
              <div className="step-progress">
                {stepIndex + 1} / {totalSteps}
              </div>
            </div>

            {/* Preset bar */}
            <div className="preset-bar">
              <span className="preset-label">Senaryo</span>
              <div className="preset-group">
                {[
                  { key: "random",   label: "Rastgele",      tooltip: "Her seferinde farklı, karışık bir dizi" },
                  { key: "sorted",   label: "Sıralı ↑",      tooltip: "En az karşılaştırma — her birleşimde tek yön" },
                  { key: "reversed", label: "Ters Sıralı ↓", tooltip: "Sıralı kadar verimli — yine tek yön birleşim" },
                  { key: "nearly",   label: "Az Karışık ≈",  tooltip: "Neredeyse sıralı — minimum karıştırma" },
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

            {/* MergeBox */}
            <MergeBox values={current?.compareValues} op={current?.compareOp} />

            {/* Auxiliary Array Visualization */}
            <div className="section-divider">Geçici Dizi (Birleştirme Anı)</div>
            <AuxArrayViz
              mergeSrc={current?.mergeSrc ?? null}
              array={current?.array ?? []}
              leftRange={current?.leftRange ?? null}
              rightRange={current?.rightRange ?? null}
            />

            {/* Step explanation */}
            <div className={`step-explanation ${isDone ? "step-done" : current ? "step-active" : "step-idle"}`}>
              <div className="step-main">
                {current ? current.description : "▶ Play'e bas veya adım adım ilerle"}
              </div>
              {current?.detail && <div className="step-detail">{current.detail}</div>}
            </div>

            <div className="section-divider">Bölme Ağacı</div>

            {/* SplitTree */}
            <SplitTree
              n={totalCount}
              depth={current?.depth ?? 1}
              maxDepth={maxDepth}
            />

            <div className="section-divider">İstatistikler</div>

            <div className="info-card">
              <h3 className="info-card-title">Seviye Başına Karşılaştırma</h3>
              <DepthComparisonChart
                completedMerges={current?.completedMerges ?? []}
                maxDepth={maxDepth}
              />
              <p className="chart-desc">
                Her seviye toplamda yaklaşık <strong>n</strong> karşılaştırma yapar.
                <span className="chart-legend-inline">
                  <span className="clr-dot" style={{ background: "#6366f1" }} /> Her çubuk ≈ n işlem
                </span>
                <br />
                log₂n seviye × n karşılaştırma = <strong>O(n log n)</strong> — görsel kanıt.
              </p>
            </div>

            <div className="section-divider">Kendi Kodunu Dene</div>

            <CodePlayground
              initialArray={PLAYGROUND_ARRAY}
              defaultCode={MERGE_SORT_CODE}
              subtitle={
                <>
                  Hazır gelen Merge Sort'u incele ya da kendi birleştirme mantığını yaz.{" "}
                  <strong>compare(i, j)</strong> ile elemanları karşılaştır,{" "}
                  <strong>swap(i, j)</strong> ile takas et.{" "}
                  Not: bu versiyon gerçek Merge Sort'un kopyalama adımını takas ile simüle eder.{" "}
                  <strong>Çalıştır</strong>'a bastığında her birleştirme adımı görselleştirilir.
                </>
              }
            />
          </div>

          {/* ── Sağ: Bilgi paneli ── */}
          <div className="info-section">

            <div className="info-card">
              <h3 className="info-card-title">Nasıl Çalışır?</h3>
              <ol className="how-list">
                <li>Diziyi ortadan ikiye böl</li>
                <li>Sol yarıyı özyinelemeli olarak sırala</li>
                <li>Sağ yarıyı özyinelemeli olarak sırala</li>
                <li>İki sıralı yarıyı <strong>birleştir</strong> (merge):
                  sol[i] ve sağ[j] karşılaştır, küçüğü al, ilerle</li>
                <li>Tek elemana ulaşana kadar böl — tek eleman zaten sıralıdır</li>
                <li>Yukarı doğru birleşerek tam sıralı dizi oluşur</li>
              </ol>
            </div>

            <div className="section-divider">Kod</div>

            <div className="info-card">
              <h3 className="info-card-title">Pseudocode</h3>
              <div className="pseudocode">
                {(() => {
                  let lineNum = 0;
                  return PSEUDOCODE_LINES.map(({ n, text }) => {
                    const isSep = n === 7;
                    if (!isSep) lineNum++;
                    return (
                      <div
                        key={n}
                        className={`pseudo-line ${isSep ? "pseudo-separator" : ""} ${current?.activeLine === n ? "pseudo-active" : ""}`}
                      >
                        <span className="pseudo-num">{isSep ? "" : lineNum}</span>
                        <span className="pseudo-code">{text.replace(" ←", "")}</span>
                        {current?.activeLine === n && (
                          <span className="pseudo-arrow">← şu an</span>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            <div className="section-divider">Karmaşıklık</div>

            <div className="info-card">
              <h3 className="info-card-title">Karmaşıklık Analizi</h3>
              <div className="complexity-list">
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-green">En İyi Durum — O(n log n)</div>
                  <p className="complexity-row-desc">
                    Dizi zaten sıralı olsa bile Merge Sort tam birleştirme işlemini yapar.
                    Ancak sıralı ve ters sıralı girişlerde her birleşim <strong>tek yönlü</strong> akar
                    (tüm sol elemanlar sağdan küçük), bu yüzden <strong>en az karşılaştırma</strong> yapılır.
                    Yine de kopyalama sayısı değişmez — bu Insertion Sort'tan farklıdır.
                  </p>
                </div>
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-yellow">Ortalama Durum — O(n log n)</div>
                  <p className="complexity-row-desc">
                    Rastgele karışık girişlerde sol ve sağ alt diziler birbirine karışır,
                    karşılaştırma sayısı artar. Ama asla O(n²)'ye düşmez —
                    log₂n seviye × n kopyalama, her koşulda karesel değil doğrusal×logaritmik.
                  </p>
                </div>
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-red">En Kötü Durum — O(n log n)</div>
                  <p className="complexity-row-desc">
                    Merge Sort'un <strong>en kötü durumu da O(n log n)</strong>'dir — bu Bubble, Selection
                    ve Insertion Sort'tan köklü bir farktır. Girdi ne olursa olsun
                    performans tahmin edilebilir ve garantilidir.
                  </p>
                </div>
                <div className="complexity-row">
                  <div className="complexity-row-badge badge-blue">Bellek — O(n)</div>
                  <p className="complexity-row-desc">
                    Birleştirme aşamasında geçici bir yardımcı dizi gerekir.
                    Bu Bubble/Selection/Insertion Sort'un O(1) belleğine kıyasla
                    bir dezavantajdır — ancak pratik uygulamalarda bu maliyet kabul edilebilir.
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
                  <span>Kopyalama</span>
                </div>
                <div className="scenario-row">
                  <span>Sıralı dizi</span>
                  <span>~28 (en az)</span>
                  <span>~54 (sabit)</span>
                </div>
                <div className="scenario-row">
                  <span>Ters sıralı</span>
                  <span>~28 (en az)</span>
                  <span>~54 (sabit)</span>
                </div>
                <div className="scenario-row">
                  <span>Rastgele</span>
                  <span>~40–55</span>
                  <span>~54 (sabit)</span>
                </div>
              </div>
              <p className="scenario-note">
                <strong>Dikkat:</strong> Kopyalama sayısı her durumda sabittir —
                Merge Sort her birleşimde tüm elemanları kopyalar. Karşılaştırma sayısı
                girdiye göre değişir ama her zaman O(n log n) aralığında kalır.
                Insertion Sort'ta sıralı dizi O(n), ters sıralı O(n²) yaptığı yerde
                Merge Sort her zaman O(n log n) yapar.
              </p>
            </div>

            <div className="section-divider">Özellikler</div>

            <div className="info-card">
              <h3 className="info-card-title">Özellikler</h3>
              <ul className="feature-list">
                <li><span className="feature-icon feature-check">✓</span>Her durumda O(n log n) — en güvenilir sıralama</li>
                <li><span className="feature-icon feature-check">✓</span>Kararlı (stable) — eşit elemanların sırası bozulmaz</li>
                <li><span className="feature-icon feature-check">✓</span>Büyük ve karışık dizilerde O(n²) algoritmalardan çok hızlı</li>
                <li><span className="feature-icon feature-x">✗</span>O(n) ekstra bellek — yerinde sıralama değil</li>
                <li><span className="feature-icon feature-x">✗</span>Küçük dizilerde Insertion Sort daha hızlı olabilir</li>
                <li><span className="feature-icon feature-x">✗</span>Önbellek dostu değil — bölünmüş bellek erişimi</li>
              </ul>
              <div className="feature-note">
                <strong>Gerçek dünyada:</strong> Python'ın <code>sorted()</code> fonksiyonu
                (Timsort), Java'nın <code>Arrays.sort()</code> ve birçok standart kütüphane
                Merge Sort tabanlıdır — kararlılığı ve garantili O(n log n) performansı nedeniyle.
              </div>
            </div>

            <div className="section-divider">Analiz</div>

            <div className="info-card">
              <h3 className="info-card-title">Sayaçlar Ne Söyler?</h3>
              <div className="metric-block">
                <div>
                  <div className="metric-name">Karşılaştırma Sayısı</div>
                  <p className="metric-desc">
                    Girdinin düzenine göre değişir: sıralı ve ters sıralı dizilerde
                    her birleşim tek yönlü aktığından daha az karşılaştırma yapılır.
                    Rastgele girdide iki taraf sık sık karışır. Ama her durumda
                    n×log₂n mertebesinde kalır.
                  </p>
                </div>
                <div>
                  <div className="metric-name">Kopyalama Sayısı</div>
                  <p className="metric-desc">
                    Her seviyede tam n eleman kopyalanır. log₂n seviye vardır.
                    Dolayısıyla toplam kopyalama = n×log₂n — girdi ne olursa olsun sabittir.
                    Bu sayı karşılaştırmadan bağımsızdır; algoritmanın bellek maliyetini doğrudan yansıtır.
                  </p>
                </div>
              </div>
              <div className="metric-insight">
                <div className="insight-row">
                  <span className="insight-label">Kopyalama sabit</span>
                  <span className="insight-tag tag-blue">Girdi bağımsız O(n log n)</span>
                </div>
                <div className="insight-row">
                  <span className="insight-label">Karşılaştırma düşük</span>
                  <span className="insight-tag tag-green">Sıralı veya ters sıralı girdi</span>
                </div>
                <div className="insight-row">
                  <span className="insight-label">Karşılaştırma yüksek</span>
                  <span className="insight-tag tag-yellow">Rastgele girdi — hâlâ O(n log n)</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
