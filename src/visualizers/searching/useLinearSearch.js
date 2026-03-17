import { useState, useEffect, useRef, useCallback } from "react";

const SIZE = 14;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateArray(size = SIZE) {
  const pool = new Set();
  while (pool.size < size - 2) pool.add(Math.floor(Math.random() * 70) + 15);
  const base = [...pool];
  // 2 adet tekrar ekle
  base.push(base[0], base[3]);
  return shuffle(base).slice(0, size);
}

function generateSteps(arr, target) {
  const steps = [];
  const n = arr.length;
  const found = [];
  let comparisons = 0;

  for (let i = 0; i < n; i++) {
    comparisons++;
    const isMatch = arr[i] === target;

    steps.push({
      array: arr,
      target,
      current: i,
      found: [...found],
      comparisons,
      phase: "comparing",
      activeLine: 4,
      description: `dizi[${i}] = ${arr[i]} — hedef ${target} ile karşılaştırılıyor`,
      detail: isMatch
        ? `${arr[i]} === ${target} ✓ — Eşleşme bulundu!`
        : `${arr[i]} ≠ ${target} — sonraki elemana geç`,
    });

    if (isMatch) {
      found.push(i);
      steps.push({
        array: arr,
        target,
        current: i,
        found: [...found],
        comparisons,
        phase: "found",
        activeLine: 5,
        description: `${target} bulundu! → İndeks ${i} sonuçlara eklendi`,
        detail:
          found.length === 1
            ? `İlk eşleşme. Tüm dizi taranana kadar arama devam ediyor.`
            : `${found.length}. eşleşme. Arama devam ediyor.`,
      });
    }
  }

  steps.push({
    array: arr,
    target,
    current: -1,
    found: [...found],
    comparisons,
    phase: found.length > 0 ? "done_found" : "done_notfound",
    activeLine: 7,
    description:
      found.length > 0
        ? `Tamamlandı — ${found.length} eşleşme bulundu`
        : `Tamamlandı — ${target} dizide bulunamadı`,
    detail:
      found.length > 0
        ? `Bulunan indeksler: [${found.join(", ")}] · ${comparisons} karşılaştırma yapıldı`
        : `${n} eleman kontrol edildi, ${target} bulunamadı · ${comparisons} karşılaştırma`,
  });

  return steps;
}

export function useLinearSearch(size = SIZE) {
  const [array, setArray] = useState(() => generateArray(size));
  const [target, setTarget] = useState(null);
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(400);
  const timerRef = useRef(null);

  useEffect(() => {
    if (target !== null) {
      setSteps(generateSteps(array, target));
    } else {
      setSteps([]);
    }
    setStepIndex(-1);
    setIsPlaying(false);
  }, [array, target]);

  const reset = useCallback(() => {
    setArray(generateArray(size));
    setTarget(null);
  }, [size]);

  const resetWith = useCallback((arr, tgt) => {
    setArray([...arr]);
    setTarget(tgt !== undefined ? tgt : null);
  }, []);

  const current = stepIndex >= 0 && steps.length > 0 ? steps[stepIndex] : null;

  const stepForward = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }, [steps.length]);

  const stepBackward = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setStepIndex((i) => {
          if (i >= steps.length - 1) {
            setIsPlaying(false);
            return i;
          }
          return i + 1;
        });
      }, speed);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, steps.length, speed]);

  const togglePlay = useCallback(() => {
    if (steps.length === 0) return;
    if (stepIndex >= steps.length - 1) {
      setStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((p) => !p);
    }
  }, [stepIndex, steps.length]);

  const isDone = steps.length > 0 && stepIndex === steps.length - 1;

  return {
    array,
    target,
    setTarget,
    current,
    stepIndex,
    totalSteps: steps.length,
    isPlaying,
    isDone,
    speed,
    setSpeed,
    reset,
    resetWith,
    togglePlay,
    stepForward,
    stepBackward,
  };
}
