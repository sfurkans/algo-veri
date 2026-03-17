import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────────────────
   STEP GENERATOR
   queue[0] = FRONT (çıkış), queue[last] = REAR (giriş)
───────────────────────────────────────────────────────── */
function generateSteps(operations, initialQueue = []) {
  const steps = [];
  const queue = [...initialQueue];
  const stats = { enqueues: 0, dequeues: 0, fronts: 0 };

  function add(extra) {
    steps.push({
      queue:        [...queue],
      stats:        { ...stats },
      incoming:     null,
      outgoing:     null,
      highlightIdx: -1,
      result:       null,
      isError:      false,
      ...extra,
    });
  }

  for (const op of operations) {

    /* ── ENQUEUE ── */
    if (op.op === "enqueue") {
      add({
        phase:        "enqueue_enter",
        incoming:     op.val,
        highlightIdx: queue.length,
        description:  `ENQUEUE(${op.val})`,
        detail:       `${op.val} kuyruğun arkasına (REAR) ekleniyor`,
        activeLine:   2,
      });

      queue.push(op.val);
      stats.enqueues++;

      add({
        phase:        "enqueue_settle",
        highlightIdx: queue.length - 1,
        description:  `ENQUEUE(${op.val}) tamamlandı — boyut: ${queue.length}`,
        detail:       `${op.val} REAR'a yerleşti · FRONT = ${queue[0]}`,
        activeLine:   3,
      });

    /* ── DEQUEUE ── */
    } else if (op.op === "dequeue") {
      if (queue.length === 0) {
        add({
          phase:       "error",
          description: "DEQUEUE() — HATA: Kuyruk boş!",
          detail:      "Boş kuyruktan eleman çıkarılamaz.",
          activeLine:  7,
          isError:     true,
        });
      } else {
        const val = queue[0];

        add({
          phase:        "dequeue_lift",
          outgoing:     val,
          highlightIdx: 0,
          result:       val,
          description:  `DEQUEUE() — ${val} çıkarılıyor`,
          detail:       `FRONT eleman (${val}) kuyruktan alınıyor`,
          activeLine:   8,
        });

        queue.shift();
        stats.dequeues++;

        add({
          phase:        "dequeue_gone",
          outgoing:     val,
          highlightIdx: 0,
          result:       val,
          description:  `DEQUEUE() = ${val} — boyut: ${queue.length}`,
          detail:       queue.length > 0
            ? `${val} döndürüldü. Yeni FRONT = ${queue[0]}`
            : `${val} döndürüldü. Kuyruk artık boş.`,
          activeLine:   9,
        });
      }

    /* ── FRONT ── */
    } else if (op.op === "front") {
      if (queue.length === 0) {
        add({
          phase:       "error",
          description: "FRONT() — HATA: Kuyruk boş!",
          detail:      "Boş kuyruğa front yapılamaz.",
          activeLine:  12,
          isError:     true,
        });
      } else {
        const val = queue[0];
        stats.fronts++;
        add({
          phase:        "front",
          highlightIdx: 0,
          result:       val,
          description:  `FRONT() = ${val}`,
          detail:       `Ön eleman görüntülendi: ${val}. Kuyruk değişmedi.`,
          activeLine:   13,
        });
      }

    /* ── isEmpty ── */
    } else if (op.op === "isEmpty") {
      const empty = queue.length === 0;
      add({
        phase:       "isEmpty",
        result:      empty,
        description: `isEmpty() = ${empty}`,
        detail:      empty
          ? "Kuyruk boş — hiç eleman yok."
          : `Kuyrukta ${queue.length} eleman var, boş değil.`,
        activeLine:  16,
      });
    }
  }

  return steps;
}

/* ─────────────────────────────────────────────────────────
   HOOK
───────────────────────────────────────────────────────── */
export function useQueue() {
  const [steps,     setSteps]     = useState([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed,     setSpeed]     = useState(700);
  const timerRef                  = useRef(null);

  const settledQueue = steps.length > 0 ? steps[steps.length - 1].queue : [];

  const current = stepIndex >= 0 && steps.length > 0 ? steps[stepIndex] : null;
  const isDone  = steps.length > 0 && stepIndex === steps.length - 1;
  const canPlay = steps.length > 0;

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

  const stepForward  = useCallback(() => setStepIndex(i => Math.min(i + 1, steps.length - 1)), [steps.length]);
  const stepBackward = useCallback(() => setStepIndex(i => Math.max(i - 1, 0)), []);

  const togglePlay = useCallback(() => {
    if (!canPlay) return;
    if (stepIndex >= steps.length - 1) { setStepIndex(0); setIsPlaying(true); }
    else setIsPlaying(p => !p);
  }, [canPlay, stepIndex, steps.length]);

  function _load(ops, fromQueue, autoPlay = false) {
    clearInterval(timerRef.current);
    const newSteps = generateSteps(ops, fromQueue);
    setSteps(newSteps);
    setStepIndex(-1);
    setIsPlaying(autoPlay);
  }

  function loadPreset(ops)     { _load(ops, [], false); }
  function autoPlayPreset(ops) { _load(ops, [], true);  }

  function manualEnqueue(val) { _load([{ op: "enqueue", val }], settledQueue, true); }
  function manualDequeue()    { _load([{ op: "dequeue"       }], settledQueue, true); }
  function manualFront()      { _load([{ op: "front"         }], settledQueue, true); }
  function manualIsEmpty()    { _load([{ op: "isEmpty"       }], settledQueue, true); }

  function reset() {
    clearInterval(timerRef.current);
    setSteps([]);
    setStepIndex(-1);
    setIsPlaying(false);
  }

  return {
    current,
    settledQueue,
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
    manualEnqueue,
    manualDequeue,
    manualFront,
    manualIsEmpty,
    reset,
  };
}
