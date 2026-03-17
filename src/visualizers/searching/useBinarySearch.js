import { useState, useRef, useCallback, useEffect } from "react";

export function generateSortedArray(size = 16) {
  const set = new Set();
  while (set.size < size) {
    set.add(Math.floor(Math.random() * 500) + 1); // 1–500
  }
  return [...set].sort((a, b) => a - b);
}

function generateSteps(arr, target) {
  const steps = [];
  let low = 0;
  let high = arr.length - 1;
  let comparisons = 0;
  let foundIdx = -1;

  function snapshot(phase, mid, description, detail, activeLine) {
    const elLeft = [];
    const elRight = [];
    for (let i = 0; i < low; i++) elLeft.push(i);
    for (let i = high + 1; i < arr.length; i++) elRight.push(i);
    steps.push({
      array: [...arr],
      low,
      high,
      mid,
      phase,
      found: foundIdx,
      comparisons,
      remaining: phase === "done_notfound" ? 0 : Math.max(0, high - low + 1),
      elLeft: [...elLeft],
      elRight: [...elRight],
      description,
      detail,
      activeLine,
    });
  }

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    comparisons++;

    snapshot(
      "comparing", mid,
      `dizi[${mid}] = ${arr[mid]} kontrol ediliyor`,
      `mid = ⌊(${low} + ${high}) / 2⌋ = ${mid}`,
      3
    );

    if (arr[mid] === target) {
      foundIdx = mid;
      snapshot(
        "found", mid,
        `dizi[${mid}] = ${arr[mid]} — Bulundu!`,
        `${arr[mid]} === ${target}`,
        4
      );
      snapshot(
        "done_found", mid,
        `Tamamlandı — ${comparisons} karşılaştırmada bulundu`,
        null,
        4
      );
      return steps;
    } else if (arr[mid] < target) {
      snapshot(
        "go_right", mid,
        `${arr[mid]} < ${target} — sol yarı elendi, sağa git`,
        `low = ${mid + 1}`,
        6
      );
      low = mid + 1;
    } else {
      snapshot(
        "go_left", mid,
        `${arr[mid]} > ${target} — sağ yarı elendi, sola git`,
        `high = ${mid - 1}`,
        8
      );
      high = mid - 1;
    }
  }

  snapshot(
    "done_notfound", -1,
    `${target} dizide bulunamadı`,
    `low(${low}) > high(${high}) — tüm adaylar elendi`,
    10
  );
  return steps;
}

export function useBinarySearch(size = 16) {
  const [array, setArray] = useState(() => generateSortedArray(size));
  const [target, setTargetState] = useState(null);
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(700);
  const timerRef = useRef(null);

  // Interval yönetimi: isPlaying veya speed değişince timer yeniden kurulur
  useEffect(() => {
    if (!isPlaying) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setStepIndex((i) => {
        if (i >= steps.length - 1) {
          setIsPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, speed);
    return () => clearInterval(timerRef.current);
  }, [isPlaying, speed, steps.length]);

  const setTarget = useCallback((tgt) => {
    clearInterval(timerRef.current);
    setIsPlaying(false);
    setTargetState(tgt);
    const s = generateSteps(array, tgt);
    setSteps(s);
    setStepIndex(-1);
  }, [array]);

  const resetWith = useCallback((arr, tgt) => {
    clearInterval(timerRef.current);
    setIsPlaying(false);
    setArray(arr);
    setTargetState(tgt);
    const s = generateSteps(arr, tgt);
    setSteps(s);
    setStepIndex(-1);
  }, []);

  const reset = useCallback(() => {
    clearInterval(timerRef.current);
    setIsPlaying(false);
    const arr = generateSortedArray(size);
    setArray(arr);
    setTargetState(null);
    setSteps([]);
    setStepIndex(-1);
  }, [size]);

  const changeArray = useCallback((arr) => {
    clearInterval(timerRef.current);
    setIsPlaying(false);
    setArray(arr);
    setTargetState(null);
    setSteps([]);
    setStepIndex(-1);
  }, []);

  const togglePlay = useCallback(() => {
    if (steps.length === 0) return;
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    if (stepIndex >= steps.length - 1) setStepIndex(0);
    setIsPlaying(true);
  }, [steps.length, stepIndex, isPlaying]);

  const stepForward = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }, [steps]);

  const stepBackward = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);


  const current = stepIndex >= 0 ? steps[stepIndex] : null;
  const isDone = stepIndex === steps.length - 1 && steps.length > 0;

  return {
    array, target, setTarget,
    current, stepIndex, totalSteps: steps.length,
    isPlaying, isDone, speed, setSpeed,
    reset, resetWith, changeArray, togglePlay, stepForward, stepBackward,
  };
}
