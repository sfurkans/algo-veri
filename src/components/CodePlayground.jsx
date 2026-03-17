import { useState, useRef, useCallback } from "react";
import "./CodePlayground.css";

const DEFAULT_CODE = `// Kullanabileceğin fonksiyonlar:
// compare(i, j) → arr[i] > arr[j] ise pozitif döner, adımı kaydeder
// swap(i, j)    → arr[i] ile arr[j] yer değiştirir, adımı kaydeder
// arr.length    → dizi uzunluğu

for (let i = 0; i < arr.length - 1; i++) {
  for (let j = 0; j < arr.length - i - 1; j++) {
    if (compare(j, j + 1) > 0) {
      swap(j, j + 1);
    }
  }
}`;

const MAX_STEPS = 8000;

function runUserCode(code, initialArray) {
  const arr = [...initialArray];
  const steps = [];
  let comparisons = 0;
  let swaps = 0;
  let stepCount = 0;

  function compare(i, j) {
    if (stepCount++ > MAX_STEPS)
      throw new Error("Çok fazla adım! Sonsuz döngü olabilir.");
    comparisons++;
    const op = arr[i] > arr[j] ? ">" : "≤";
    steps.push({
      array: [...arr],
      comparing: [i, j],
      swapping: [],
      comparisons,
      swaps,
      description: `${arr[i]} ile ${arr[j]} karşılaştırılıyor`,
      detail:
        arr[i] > arr[j]
          ? `${arr[i]} > ${arr[j]} — Yer değiştirilecek.`
          : `${arr[i]} ≤ ${arr[j]} — Sıra zaten doğru, devam ediliyor.`,
      compareValues: [arr[i], arr[j]],
      compareOp: op,
    });
    return arr[i] - arr[j];
  }

  function swap(i, j) {
    if (stepCount++ > MAX_STEPS)
      throw new Error("Çok fazla adım! Sonsuz döngü olabilir.");
    swaps++;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [i, j],
      comparisons,
      swaps,
      description: `${arr[j]} ve ${arr[i]} yer değiştiriyor`,
      detail: `Elemanlar yer değiştirdi.`,
      compareValues: null,
      compareOp: null,
    });
  }

  try {
    // eslint-disable-next-line no-new-func
    new Function("arr", "compare", "swap", code)(arr, compare, swap);
    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [...Array(arr.length).keys()],
      comparisons,
      swaps,
      description: "Algoritma tamamlandı!",
      detail: `Toplam ${comparisons} karşılaştırma ve ${swaps} takas yapıldı.`,
      compareValues: null,
      compareOp: null,
    });
    return { steps, error: null };
  } catch (e) {
    return { steps: [], error: e.message };
  }
}

function getValueColor(val, min, max) {
  const t = (val - min) / (max - min || 1);
  const hue = 220 - t * 180;
  return `hsl(${hue}, 70%, 62%)`;
}

function getBarState(index, step) {
  if (!step) return "default";
  if (step.sorted?.includes(index)) return "sorted";
  if (step.swapping?.includes(index)) return "swapping";
  if (step.comparing?.includes(index)) return "comparing";
  return "default";
}

export default function CodePlayground({ initialArray, defaultCode, subtitle }) {
  const [code, setCode] = useState(defaultCode ?? DEFAULT_CODE);
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(300);
  const [error, setError] = useState(null);
  const [hasRun, setHasRun] = useState(false);
  const timerRef = useRef(null);

  const run = useCallback(() => {
    clearInterval(timerRef.current);
    setIsPlaying(false);
    const { steps: s, error: e } = runUserCode(code, initialArray);
    if (e) {
      setError(e);
      setSteps([]);
      setStepIndex(-1);
      setHasRun(false);
    } else {
      setError(null);
      setSteps(s);
      setStepIndex(-1);
      setHasRun(true);
    }
  }, [code, initialArray]);

  const togglePlay = useCallback(() => {
    if (steps.length === 0) return;
    if (isPlaying) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setIsPlaying(false);
      return;
    }
    if (stepIndex >= steps.length - 1) setStepIndex(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setStepIndex((i) => {
        if (i >= steps.length - 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setIsPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, speed);
    setIsPlaying(true);
  }, [steps, stepIndex, speed, isPlaying]);

  const stepForward = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  const stepBackward = () => setStepIndex((i) => Math.max(i - 1, 0));

  const current = stepIndex >= 0 ? steps[stepIndex] : null;
  const displayArray = current ? current.array : initialArray;
  const isDone = stepIndex === steps.length - 1 && steps.length > 0;
  const min = Math.min(...displayArray);
  const max = Math.max(...displayArray);

  // Speed slider change → restart interval if playing
  const handleSpeedChange = (e) => {
    const newSpeed = 800 - Number(e.target.value) + 50;
    setSpeed(newSpeed);
    if (isPlaying) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setStepIndex((i) => {
          if (i >= steps.length - 1) {
            clearInterval(timerRef.current);
            setIsPlaying(false);
            return i;
          }
          return i + 1;
        });
      }, newSpeed);
    }
  };

  return (
    <div className="playground">
      <div className="playground-header">
        <div className="playground-title-row">
          <span className="playground-icon">{"</>"}</span>
          <div>
            <h2 className="playground-title">Kendi Algoritmanı Yaz</h2>
            <p className="playground-subtitle">
              {subtitle ?? (
                <>
                  Solda hazır gelen kodu inceleyebilir ya da silip kendi sıralama algoritmanı yazabilirsin.{" "}
                  <strong>compare(i, j)</strong> ile iki elemanı karşılaştır,{" "}
                  <strong>swap(i, j)</strong> ile yerlerini değiştir.{" "}
                  <strong>Çalıştır</strong>'a bastığında algoritman sağdaki grafikte adım adım canlanır.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="playground-body">
        {/* Editor */}
        <div className="editor-col">
          <div className="editor-topbar">
            <div className="editor-dots">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
            </div>
            <span className="editor-filename">algorithm.js</span>
          </div>
          <div className="editor-wrap">
            <div className="line-numbers">
              {code.split("\n").map((_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
            <textarea
              className="code-editor"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>
          {error && (
            <div className="editor-error">
              <span className="error-icon">✕</span>
              <span>{error}</span>
            </div>
          )}
          <button className="run-btn" onClick={run}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Çalıştır
          </button>
        </div>

        {/* Visualizer */}
        <div className="playground-viz">
          {!hasRun ? (
            <div className="viz-placeholder">
              <div className="placeholder-icon">📊</div>
              <p>Kodu çalıştırdıktan sonra görselleştirme burada görünür.</p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="pg-stats">
                <div className="pg-stat">
                  <span className="pg-stat-val">{current?.comparisons ?? 0}</span>
                  <span className="pg-stat-label">Karşılaştırma</span>
                </div>
                <div className="pg-stat">
                  <span className="pg-stat-val">{current?.swaps ?? 0}</span>
                  <span className="pg-stat-label">Takas</span>
                </div>
                <div className="pg-stat">
                  <span className="pg-stat-val">{stepIndex < 0 ? 0 : stepIndex + 1}</span>
                  <span className="pg-stat-label">/ {steps.length} Adım</span>
                </div>
              </div>

              {/* Progress */}
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${stepIndex < 0 ? 0 : ((stepIndex + 1) / steps.length) * 100}%` }}
                />
              </div>

              {/* Bars */}
              <div className="bars-container" style={{ height: "200px" }}>
                {displayArray.map((val, i) => {
                  const state = getBarState(i, current);
                  const isPointed = current?.comparing?.includes(i) || current?.swapping?.includes(i);
                  return (
                    <div key={i} className="bar-wrapper">
                      <span className={`bar-arrow ${isPointed ? "bar-arrow-visible" : ""}`}>▼</span>
                      <div
                        className={`bar-fill bar-${state}`}
                        style={{
                          height: `${val}%`,
                          ...(state === "default" ? { background: getValueColor(val, min, max) } : {}),
                        }}
                      />
                      <span className="bar-label">{val}</span>
                    </div>
                  );
                })}
              </div>

              {/* Step info */}
              <div className={`step-explanation ${isDone ? "step-done" : current ? "step-active" : "step-idle"}`}>
                <div className="step-main">
                  {current ? current.description : "▶ Play'e bas"}
                </div>
                {current?.detail && <div className="step-detail">{current.detail}</div>}
              </div>

              {/* Controls */}
              <div className="pg-controls">
                <button className="ctrl-btn ctrl-icon" onClick={stepBackward} disabled={stepIndex <= 0}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/>
                  </svg>
                </button>
                <button className={`ctrl-btn ctrl-play ${isPlaying ? "is-playing" : ""}`} onClick={togglePlay}>
                  {isPlaying ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  )}
                </button>
                <button className="ctrl-btn ctrl-icon" onClick={stepForward} disabled={isDone}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>
                  </svg>
                </button>
                <div className="speed-control">
                  <span className="speed-label">🐢</span>
                  <input
                    type="range" min="50" max="800" step="50"
                    value={800 - speed + 50}
                    onChange={handleSpeedChange}
                    className="speed-slider"
                  />
                  <span className="speed-label">🐇</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
