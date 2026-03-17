import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────────────────
   STEP GENERATOR
   Her operasyon 1-2 adım üretir. Adımlar saf fonksiyon ile
   hesaplanır; hook sadece oynatmayı yönetir.
───────────────────────────────────────────────────────── */
function generateSteps(operations, initialStack = []) {
  const steps  = [];
  const stack  = [...initialStack];
  const stats  = { pushes: 0, pops: 0, peeks: 0 };

  /* Her adım için ortak alanları başlangıç değerleriyle merge eder */
  function add(extra) {
    steps.push({
      stack:       [...stack],
      stats:       { ...stats },
      incoming:    null,
      outgoing:    null,
      highlightIdx: -1,
      result:      null,
      isError:     false,
      ...extra,
    });
  }

  for (const op of operations) {

    /* ── PUSH ── */
    if (op.op === "push") {
      add({
        phase:        "push_enter",
        incoming:     op.val,
        highlightIdx: stack.length,
        description:  `PUSH(${op.val})`,
        detail:       `${op.val} yığının tepesine ekleniyor`,
        activeLine:   2,
      });

      stack.push(op.val);
      stats.pushes++;

      add({
        phase:        "push_settle",
        highlightIdx: stack.length - 1,
        description:  `PUSH(${op.val}) tamamlandı — boyut: ${stack.length}`,
        detail:       `${op.val} yerleşti. TOP = ${op.val}`,
        activeLine:   3,
      });

    /* ── POP ── */
    } else if (op.op === "pop") {
      if (stack.length === 0) {
        add({
          phase:       "error",
          description: "POP() — HATA: Yığın boş!",
          detail:      "Boş yığından eleman çıkarılamaz.",
          activeLine:  6,
          isError:     true,
        });
      } else {
        const val = stack[stack.length - 1];

        add({
          phase:        "pop_lift",
          outgoing:     val,
          highlightIdx: stack.length - 1,
          result:       val,
          description:  `POP() — ${val} çıkarılıyor`,
          detail:       `Tepe eleman (${val}) yığından alınıyor`,
          activeLine:   7,
        });

        stack.pop();
        stats.pops++;

        add({
          phase:        "pop_gone",
          outgoing:     val,
          highlightIdx: stack.length > 0 ? stack.length - 1 : -1,
          result:       val,
          description:  `POP() = ${val} — boyut: ${stack.length}`,
          detail:       stack.length > 0
            ? `${val} döndürüldü. Yeni TOP = ${stack[stack.length - 1]}`
            : `${val} döndürüldü. Yığın artık boş.`,
          activeLine:   8,
        });
      }

    /* ── PEEK ── */
    } else if (op.op === "peek") {
      if (stack.length === 0) {
        add({
          phase:       "error",
          description: "PEEK() — HATA: Yığın boş!",
          detail:      "Boş yığına peek yapılamaz.",
          activeLine:  11,
          isError:     true,
        });
      } else {
        const val = stack[stack.length - 1];
        stats.peeks++;
        add({
          phase:        "peek",
          highlightIdx: stack.length - 1,
          result:       val,
          description:  `PEEK() = ${val}`,
          detail:       `Tepe eleman görüntülendi: ${val}. Yığın değişmedi.`,
          activeLine:   12,
        });
      }

    /* ── isEmpty ── */
    } else if (op.op === "isEmpty") {
      const empty = stack.length === 0;
      add({
        phase:       "isEmpty",
        result:      empty,
        description: `isEmpty() = ${empty}`,
        detail:      empty
          ? "Yığın boş — hiç eleman yok."
          : `Yığında ${stack.length} eleman var, boş değil.`,
        activeLine:  15,
      });
    }
  }

  return steps;
}

/* ─────────────────────────────────────────────────────────
   HOOK
───────────────────────────────────────────────────────── */
export function useStack() {
  const [steps,     setSteps]     = useState([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed,     setSpeed]     = useState(700);
  const timerRef                  = useRef(null);

  /* Son adımın yığını = "yerleşmiş" yığın.
     Manuel işlemler buradan başlar. */
  const settledStack = steps.length > 0 ? steps[steps.length - 1].stack : [];

  const current  = stepIndex >= 0 && steps.length > 0 ? steps[stepIndex] : null;
  const isDone   = steps.length > 0 && stepIndex === steps.length - 1;
  const canPlay  = steps.length > 0;

  /* Otomatik oynatma */
  useEffect(() => {
    if (!isPlaying) return;
    timerRef.current = setInterval(() => {
      setStepIndex(i => {
        if (i >= steps.length - 1) { setIsPlaying(false); return i; }
        return i + 1;
      });
    }, speed);
    return () => clearInterval(timerRef.current);
  }, [isPlaying, steps.length, speed]);

  const stepForward = useCallback(
    () => setStepIndex(i => Math.min(i + 1, steps.length - 1)),
    [steps.length]
  );
  const stepBackward = useCallback(
    () => setStepIndex(i => Math.max(i - 1, 0)),
    []
  );
  const togglePlay = useCallback(() => {
    if (!canPlay) return;
    if (stepIndex >= steps.length - 1) { setStepIndex(0); setIsPlaying(true); }
    else setIsPlaying(p => !p);
  }, [canPlay, stepIndex, steps.length]);

  /* Ortak yükleyici */
  function _load(ops, fromStack, autoPlay = false) {
    clearInterval(timerRef.current);
    const newSteps = generateSteps(ops, fromStack);
    setSteps(newSteps);
    setStepIndex(-1);
    setIsPlaying(autoPlay);
  }

  /* Preset: sıfırdan başlar, manuel adım için */
  function loadPreset(ops)       { _load(ops, [], false); }
  /* Preset: sıfırdan başlar, otomatik oynatır */
  function autoPlayPreset(ops)   { _load(ops, [], true);  }

  /* Manuel işlemler: mevcut yığından devam eder */
  function manualPush(val)  { _load([{ op: "push",    val }], settledStack, true); }
  function manualPop()      { _load([{ op: "pop"           }], settledStack, true); }
  function manualPeek()     { _load([{ op: "peek"          }], settledStack, true); }
  function manualIsEmpty()  { _load([{ op: "isEmpty"       }], settledStack, true); }

  function reset() {
    clearInterval(timerRef.current);
    setSteps([]);
    setStepIndex(-1);
    setIsPlaying(false);
  }

  return {
    current,
    settledStack,
    stepIndex,
    totalSteps: steps.length,
    isPlaying,
    isDone,
    canPlay,
    speed, setSpeed,
    togglePlay,
    stepForward,
    stepBackward,
    loadPreset,
    autoPlayPreset,
    manualPush,
    manualPop,
    manualPeek,
    manualIsEmpty,
    reset,
  };
}
