import { useComparison, COMPARISON_ALGOS } from "../../visualizers/comparison/useComparison";
import "./Comparison.css";

// ── AlgoSelector ─────────────────────────────────────────────────────────────
function AlgoSelector({ selected, other, onChange, label }) {
  return (
    <div className="cmp-algo-group">
      <div className="cmp-algo-group-label">{label}</div>
      <div className="cmp-algo-btns">
        {Object.entries(COMPARISON_ALGOS).map(([key, algo]) => {
          const isSelected = selected === key;
          const isDisabled = other === key;
          return (
            <button
              key={key}
              className={`cmp-algo-btn${isSelected ? " cmp-algo-btn-selected" : ""}`}
              style={isSelected ? { backgroundColor: algo.color, borderColor: algo.color } : {}}
              disabled={isDisabled}
              onClick={() => onChange(key)}
            >
              {algo.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── AlgoPanel ────────────────────────────────────────────────────────────────
function AlgoPanel({ algoKey, current, stepCount, stepIndex, isDone, isAheadDone, arraySize }) {
  const algo = COMPARISON_ALGOS[algoKey];
  if (!current) return <div className="cmp-panel" style={{ borderLeft: `3px solid ${algo.color}` }} />;

  const maxVal = Math.max(...current.array, 1);
  const showLabels = true;

  const sortedSet  = new Set(current.sorted);
  const swappedSet = new Set(current.swapped);
  const activeSet  = new Set(current.active);

  function barColor(idx) {
    if (sortedSet.has(idx))  return "#22c55e";
    if (swappedSet.has(idx)) return "#f97316";
    if (activeSet.has(idx))  return algo.color;
    return "#e2e8f0";
  }

  return (
    <div className="cmp-panel" style={{ borderLeft: `3px solid ${algo.color}` }}>
      {/* Header */}
      <div className="cmp-panel-header">
        <div className="cmp-panel-name-wrap">
          <span className="cmp-panel-name" style={{ color: algo.color }}>{algo.label}</span>
          <span className="cmp-panel-badge">{algo.badge}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {isDone && <span className="cmp-done-tag">✓ Bitti</span>}
        </div>
      </div>

      {/* Description banner */}
      <div className="cmp-panel-banner" style={{ background: algo.bg }}>
        {current.description}
      </div>

      {/* Bar chart */}
      <div className="cmp-bars-area">
        {(() => {
          const arr = current.array;
          const perRow = 10;
          const rows = [];
          for (let r = 0; r < arr.length; r += perRow) {
            rows.push(arr.slice(r, r + perRow).map((_, i) => r + i));
          }
          return rows.map((rowIdxs, ri) => (
            <div key={ri} className="cmp-bars-row">
              {rowIdxs.map((idx) => {
                const val = arr[idx];
                const heightPct = (val / maxVal) * 100;
                return (
                  <div key={idx} className="cmp-bar-col">
                    {showLabels && <span className="cmp-bar-val">{val}</span>}
                    <div
                      className="cmp-bar"
                      style={{
                        height: `${heightPct}%`,
                        backgroundColor: barColor(idx),
                      }}
                    />
                  </div>
                );
              })}
            </div>
          ));
        })()}
      </div>

      {/* Footer */}
      <div className="cmp-panel-footer">
        {isDone ? (
          <span className="cmp-done-info">✓ {stepCount} adımda tamamlandı</span>
        ) : (
          <span className="cmp-step-info">Adım: {stepIndex + 1} / {stepCount}</span>
        )}
        {isDone && isAheadDone && (
          <span className="cmp-winner-badge">🏆 Daha az adım!</span>
        )}
      </div>
    </div>
  );
}

// ── ResultSummary ─────────────────────────────────────────────────────────────
function ResultSummary({ algoA, algoB, stepsALen, stepsBLen }) {
  const diff = Math.abs(stepsALen - stepsBLen);
  const pct  = Math.round((diff / Math.max(stepsALen, stepsBLen)) * 100);
  const tie  = stepsALen === stepsBLen;

  const algoAInfo = COMPARISON_ALGOS[algoA];
  const algoBInfo = COMPARISON_ALGOS[algoB];

  if (tie) {
    return (
      <div className="cmp-result">
        <span className="cmp-result-icon">⚖️</span>
        <div className="cmp-result-body">
          <div className="cmp-result-title">Berabere!</div>
          <span className="cmp-result-tie">
            Her iki algoritma da bu dizi üzerinde <strong>{stepsALen}</strong> adımda tamamlandı.
          </span>
        </div>
      </div>
    );
  }

  const winner  = stepsALen < stepsBLen ? algoAInfo : algoBInfo;
  const loser   = stepsALen < stepsBLen ? algoBInfo : algoAInfo;
  const winSteps = Math.min(stepsALen, stepsBLen);
  const loseSteps = Math.max(stepsALen, stepsBLen);

  return (
    <div className="cmp-result">
      <span className="cmp-result-icon">🏆</span>
      <div className="cmp-result-body">
        <div className="cmp-result-title" style={{ color: winner.color }}>
          {winner.label} kazandı!
        </div>
        <div className="cmp-result-detail">
          <strong style={{ color: winner.color }}>{winner.label}</strong> bu dizide{" "}
          <strong>{winSteps}</strong> adım kullandı;{" "}
          <strong style={{ color: loser.color }}>{loser.label}</strong>{" "}
          ise <strong>{loseSteps}</strong> adım — <strong>%{pct} daha fazla</strong>.
        </div>
      </div>
    </div>
  );
}

// ── Main Comparison Component ─────────────────────────────────────────────────
export default function Comparison() {
  const {
    algoA, algoB,
    arraySize,
    stepsA, stepsB,
    stepIndex,
    isPlaying,
    speed, setSpeed,
    totalSteps,
    isDone,
    isADone, isBDone,
    currentA, currentB,
    togglePlay,
    stepForward, stepBackward,
    randomize,
    changeSize,
    changeAlgoA, changeAlgoB,
  } = useComparison();

  const progressPct = totalSteps > 1 ? (stepIndex / (totalSteps - 1)) * 100 : 0;

  // For progress markers
  const algoADoneStep  = stepsA.length - 1;
  const algoBDoneStep  = stepsB.length - 1;
  const markerAPct = totalSteps > 1 ? Math.min((algoADoneStep / (totalSteps - 1)) * 100, 100) : 100;
  const markerBPct = totalSteps > 1 ? Math.min((algoBDoneStep / (totalSteps - 1)) * 100, 100) : 100;

  const algoAInfo = COMPARISON_ALGOS[algoA];
  const algoBInfo = COMPARISON_ALGOS[algoB];

  const bothDone = isADone && isBDone;

  return (
    <div className="cmp-page">
      <div className="cmp-container">

        {/* Header */}
        <div className="cmp-header">
          <div className="cmp-tag">⇄ Karşılaştırma Modu</div>
          <h1>Karşılaştırma Modu</h1>
          <p>Aynı diziyi iki algoritmayla karşılaştır — farkı gerçek zamanlı gözlemle</p>
        </div>

        {/* Config Bar */}
        <div className="cmp-config-bar">
          <div className="cmp-selectors-row">
            <AlgoSelector
              selected={algoA}
              other={algoB}
              onChange={changeAlgoA}
              label="Algoritma A"
            />
            <div className="cmp-vs">vs</div>
            <AlgoSelector
              selected={algoB}
              other={algoA}
              onChange={changeAlgoB}
              label="Algoritma B"
            />
          </div>

          <div className="cmp-size-row">
            <span className="cmp-size-label">Boyut:</span>
            <input
              type="range"
              className="cmp-size-slider"
              min={8}
              max={20}
              value={arraySize}
              onChange={(e) => changeSize(Number(e.target.value))}
            />
            <span className="cmp-size-val">{arraySize}</span>
            <button className="cmp-randomize-btn" onClick={randomize}>
              ⟳ Karıştır
            </button>
          </div>
        </div>

        {/* Dual panels */}
        <div className="cmp-panels">
          <AlgoPanel
            algoKey={algoA}
            current={currentA}
            stepCount={stepsA.length}
            stepIndex={Math.min(stepIndex, stepsA.length - 1)}
            isDone={isADone}
            isAheadDone={isADone && !isBDone}
            arraySize={arraySize}
          />
          <AlgoPanel
            algoKey={algoB}
            current={currentB}
            stepCount={stepsB.length}
            stepIndex={Math.min(stepIndex, stepsB.length - 1)}
            isDone={isBDone}
            isAheadDone={isBDone && !isADone}
            arraySize={arraySize}
          />
        </div>

        {/* Result Summary — only when both are done */}
        {bothDone && (
          <ResultSummary
            algoA={algoA}
            algoB={algoB}
            stepsALen={stepsA.length}
            stepsBLen={stepsB.length}
          />
        )}

        {/* Progress */}
        <div className="cmp-progress-wrap">
          <div className="cmp-progress-label">İlerleme</div>
          <div className="cmp-progress-bar-wrap">
            <div
              className="cmp-progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="cmp-progress-markers">
            <div className="cmp-progress-marker">
              <span
                className="cmp-marker-dot"
                style={{ backgroundColor: algoAInfo.color }}
              />
              <span className="cmp-marker-label">
                {algoAInfo.label}: {stepsA.length} adım
                {isADone && markerAPct < 100 ? " ✓" : ""}
              </span>
            </div>
            <div className="cmp-progress-marker">
              <span
                className="cmp-marker-dot"
                style={{ backgroundColor: algoBInfo.color }}
              />
              <span className="cmp-marker-label">
                {algoBInfo.label}: {stepsB.length} adım
                {isBDone && markerBPct < 100 ? " ✓" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="cmp-controls">
          <div className="cmp-ctrl-group">
            {/* Back */}
            <button
              className="cmp-ctrl-btn"
              onClick={stepBackward}
              disabled={stepIndex === 0}
              title="Geri"
            >
              <span className="cmp-ctrl-icon">◀</span>
            </button>

            {/* Play / Pause / Replay */}
            <button
              className={`cmp-ctrl-btn cmp-ctrl-play${isPlaying ? " cmp-playing" : ""}`}
              onClick={togglePlay}
              title={isDone ? "Yeniden Oynat" : isPlaying ? "Durdur" : "Oynat"}
            >
              <span className="cmp-ctrl-icon">
                {isDone ? "↺" : isPlaying ? "⏸" : "▶"}
              </span>
            </button>

            {/* Forward */}
            <button
              className="cmp-ctrl-btn"
              onClick={stepForward}
              disabled={isDone}
              title="İleri"
            >
              <span className="cmp-ctrl-icon">▶</span>
            </button>
          </div>

          {/* Speed */}
          <div className="cmp-speed">
            <span className="cmp-speed-label">Hız</span>
            <span className="cmp-speed-emoji">🐢</span>
            <input
              type="range"
              className="cmp-speed-slider"
              min={60}
              max={900}
              step={20}
              value={900 - speed + 60}
              onChange={(e) => setSpeed(900 - Number(e.target.value) + 60)}
            />
            <span className="cmp-speed-emoji">🐇</span>
          </div>
        </div>

      </div>
    </div>
  );
}
