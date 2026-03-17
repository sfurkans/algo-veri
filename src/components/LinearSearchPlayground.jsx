import { useState, useRef, useCallback } from "react";
import "./LinearSearchPlayground.css";

const DEFAULT_CODE = `// Kullanabileceğin fonksiyonlar:
// check(i)  → arr[i] === target ise true döner, adımı kaydeder
// arr        → dizi (sadece okunabilir)
// target     → aranacak değer

for (let i = 0; i < arr.length; i++) {
  if (check(i)) {
    // i. indekste eşleşme bulundu
  }
}`;

const MAX_STEPS = 2000;

function runUserCode(code, initialArray, target) {
  const arr = [...initialArray];
  const steps = [];
  let comparisons = 0;
  let matchCount = 0;
  let stepCount = 0;
  const foundSoFar = [];

  function check(i) {
    if (stepCount++ > MAX_STEPS)
      throw new Error("Çok fazla adım! Sonsuz döngü olabilir.");
    if (i < 0 || i >= arr.length)
      throw new Error(`check(${i}) geçersiz indeks — dizi uzunluğu ${arr.length}`);
    comparisons++;
    const isMatch = arr[i] === target;
    if (isMatch) {
      matchCount++;
      foundSoFar.push(i);
    }
    steps.push({
      array: [...arr],
      checking: i,
      found: [...foundSoFar],
      comparisons,
      matchCount,
      phase: isMatch ? "found" : "checking",
      description: isMatch
        ? `dizi[${i}] = ${arr[i]} — Eşleşme! ✓`
        : `dizi[${i}] = ${arr[i]} — ${target} değil, devam`,
      detail: isMatch
        ? `${arr[i]} === ${target} — eşleşme bulundu`
        : `${arr[i]} ≠ ${target} — geç`,
    });
    return isMatch;
  }

  try {
    // eslint-disable-next-line no-new-func
    new Function("arr", "target", "check", code)(arr, target, check);
    steps.push({
      array: [...arr],
      checking: -1,
      found: [...foundSoFar],
      comparisons,
      matchCount,
      phase: matchCount > 0 ? "done_found" : "done_notfound",
      description:
        matchCount > 0
          ? `Tamamlandı — ${matchCount} eşleşme, ${comparisons} karşılaştırma yapıldı`
          : `Tamamlandı — ${target} bulunamadı, ${comparisons} karşılaştırma yapıldı`,
      detail: null,
    });
    return { steps, error: null };
  } catch (e) {
    return { steps: [], error: e.message };
  }
}

function getBoxState(idx, step) {
  if (!step) return "default";
  const { checking, found, phase } = step;
  const done = phase === "done_found" || phase === "done_notfound";
  if (found.includes(idx)) return "found";
  if (idx === checking) return "checking";
  if (done || (checking >= 0 && idx < checking)) return "checked";
  return "default";
}

export default function LinearSearchPlayground({ initialArray, defaultCode }) {
  const arr = initialArray;
  const uniqueVals = [...new Set(arr)].sort((a, b) => a - b);

  const [code, setCode] = useState(defaultCode ?? DEFAULT_CODE);
  const [target, setTarget] = useState(arr[Math.floor(arr.length / 2)]);
  const [targetInput, setTargetInput] = useState(
    String(arr[Math.floor(arr.length / 2)])
  );
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(350);
  const [error, setError] = useState(null);
  const [hasRun, setHasRun] = useState(false);
  const timerRef = useRef(null);

  const run = useCallback(() => {
    clearInterval(timerRef.current);
    setIsPlaying(false);
    const t = parseInt(targetInput, 10);
    const searchTarget = isNaN(t) ? target : t;
    setTarget(searchTarget);
    const { steps: s, error: e } = runUserCode(code, arr, searchTarget);
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
  }, [code, arr, target, targetInput]);

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

  const current = stepIndex >= 0 ? steps[stepIndex] : null;
  const isDone = stepIndex === steps.length - 1 && steps.length > 0;
  const phase = current?.phase ?? null;
  const isDoneFinal = phase === "done_found" || phase === "done_notfound";

  return (
    <div className="lsp-root">
      {/* ── Header ── */}
      <div className="playground-header">
        <div className="playground-title-row">
          <span className="playground-icon">{"</>"}</span>
          <div>
            <h2 className="playground-title">Kendi Algoritmanı Yaz</h2>
            <p className="playground-subtitle">
              <strong>check(i)</strong> ile i. elemanı hedefle karşılaştır — true dönerse eşleşme var.
              Aşağıdan hedef sayıyı seç, kodu yaz ve{" "}
              <strong>Çalıştır</strong>'a bas.
            </p>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="lsp-body">

        {/* Editor */}
        <div className="editor-col">
          <div className="editor-topbar">
            <div className="editor-dots">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
            </div>
            <span className="editor-filename">linear-search.js</span>
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

          {/* Target selector inside editor panel */}
          <div className="lsp-target-row">
            <span className="lsp-target-label">Hedef:</span>
            <button
              className="lsp-adj"
              onClick={() =>
                setTargetInput((v) => String((parseInt(v, 10) || 0) - 1))
              }
            >−</button>
            <input
              className="lsp-target-input"
              type="number"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && run()}
            />
            <button
              className="lsp-adj"
              onClick={() =>
                setTargetInput((v) => String((parseInt(v, 10) || 0) + 1))
              }
            >+</button>
            <div className="lsp-quickpick">
              {uniqueVals.map((v) => (
                <button
                  key={v}
                  className={`lsp-qbtn ${parseInt(targetInput, 10) === v ? "lsp-qbtn-active" : ""}`}
                  onClick={() => setTargetInput(String(v))}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <button className="run-btn" onClick={run}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Çalıştır
          </button>
        </div>

        {/* Visualization */}
        <div className="playground-viz">
          {!hasRun ? (
            <div className="viz-placeholder">
              <div className="placeholder-icon">🔍</div>
              <p>Hedef seç, kodu çalıştır — arama adımları burada görünür.</p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="pg-stats">
                <div className="pg-stat">
                  <span className="pg-stat-val" style={{ color: "var(--primary)" }}>
                    {target}
                  </span>
                  <span className="pg-stat-label">Hedef</span>
                </div>
                <div className="pg-stat">
                  <span className="pg-stat-val">{current?.comparisons ?? 0}</span>
                  <span className="pg-stat-label">Karşılaştırma</span>
                </div>
                <div className="pg-stat">
                  <span className="pg-stat-val" style={{ color: "#22c55e" }}>
                    {current?.matchCount ?? 0}
                  </span>
                  <span className="pg-stat-label">Eşleşme</span>
                </div>
                <div className="pg-stat">
                  <span className="pg-stat-val">
                    {stepIndex < 0 ? 0 : stepIndex + 1}
                  </span>
                  <span className="pg-stat-label">/ {steps.length} Adım</span>
                </div>
              </div>

              {/* Progress */}
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${stepIndex < 0 ? 0 : ((stepIndex + 1) / steps.length) * 100}%`,
                  }}
                />
              </div>

              {/* Box grid */}
              <div className="lsp-boxes">
                {arr.map((val, idx) => {
                  const state = getBoxState(idx, current);
                  return (
                    <div key={idx} className={`lsp-box lsp-${state}`}>
                      <span className="lsp-val">{val}</span>
                      <span className="lsp-idx">{idx}</span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="lsp-legend">
                <span className="lsp-leg-item"><span className="lsp-leg-dot lsp-leg-checking" />Kontrol ediliyor</span>
                <span className="lsp-leg-item"><span className="lsp-leg-dot lsp-leg-found" />Eşleşti</span>
                <span className="lsp-leg-item"><span className="lsp-leg-dot lsp-leg-checked" />Geçildi</span>
              </div>

              {/* Result banner */}
              {isDoneFinal && (
                <div className={`lsp-result ${phase === "done_found" ? "lsp-result-found" : "lsp-result-notfound"}`}>
                  <span>{phase === "done_found" ? "✓" : "✗"}</span>
                  <span>{current.description}</span>
                </div>
              )}

              {/* Step explanation */}
              {!isDoneFinal && (
                <div className={`step-explanation ${current ? "step-active" : "step-idle"}`}>
                  <div className="step-main">
                    {current ? current.description : "▶ Play'e bas"}
                  </div>
                  {current?.detail && (
                    <div className="step-detail">{current.detail}</div>
                  )}
                </div>
              )}

              {/* Controls */}
              <div className="pg-controls">
                <button
                  className="ctrl-btn ctrl-icon"
                  onClick={stepBackward}
                  disabled={stepIndex <= 0}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="19 20 9 12 19 4 19 20" /><line x1="5" y1="19" x2="5" y2="5" />
                  </svg>
                </button>
                <button
                  className={`ctrl-btn ctrl-play ${isPlaying ? "is-playing" : ""}`}
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  )}
                </button>
                <button
                  className="ctrl-btn ctrl-icon"
                  onClick={stepForward}
                  disabled={isDone}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" />
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
