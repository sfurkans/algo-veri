import { useState, useEffect, useRef, useCallback } from "react";

function generateArray(size = 16) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 85) + 10);
}

function generateSteps(arr) {
  const steps = [];
  const a = [...arr];
  const n = a.length;
  const sortedIndices = new Set();
  let comparisons = 0;
  let swaps = 0;
  const completedRounds = []; // { round, swaps }

  for (let i = 0; i < n - 1; i++) {
    let roundSwaps = 0;

    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      const isGreater = a[j] > a[j + 1];

      steps.push({
        array: [...a],
        comparing: [j, j + 1],
        swapping: [],
        sorted: [...sortedIndices],
        activeLine: 2,
        round: i + 1,
        totalRounds: n - 1,
        comparisons,
        swaps,
        completedRounds: [...completedRounds],
        description: `${a[j]} ile ${a[j + 1]} karşılaştırılıyor`,
        detail: isGreater
          ? `${a[j]} > ${a[j + 1]} — Sol taraf daha büyük, yer değiştirilecek.`
          : `${a[j]} ≤ ${a[j + 1]} — Sıra zaten doğru, devam ediliyor.`,
        compareValues: [a[j], a[j + 1]],
        compareOp: isGreater ? ">" : "≤",
      });

      if (isGreater) {
        swaps++;
        roundSwaps++;
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({
          array: [...a],
          comparing: [],
          swapping: [j, j + 1],
          sorted: [...sortedIndices],
          activeLine: 3,
          round: i + 1,
          totalRounds: n - 1,
          comparisons,
          swaps,
          completedRounds: [...completedRounds],
          description: `${a[j + 1]} ve ${a[j]} yer değiştiriyor`,
          detail: `Büyük sayı (${a[j + 1]}) sağa taşındı.`,
          compareValues: null,
          compareOp: null,
        });
      }
    }

    sortedIndices.add(n - 1 - i);
    completedRounds.push({ round: i + 1, swaps: roundSwaps });
  }
  sortedIndices.add(0);

  steps.push({
    array: [...a],
    comparing: [],
    swapping: [],
    sorted: [...Array(n).keys()],
    activeLine: null,
    round: n - 1,
    totalRounds: n - 1,
    comparisons,
    swaps,
    completedRounds: [...completedRounds],
    description: "Dizi tamamen sıralandı!",
    detail: `Toplam ${comparisons} karşılaştırma ve ${swaps} takas yapıldı.`,
    compareValues: null,
    compareOp: null,
  });

  return steps;
}

export function useBubbleSort(size = 16) {
  const [array, setArray] = useState(() => generateArray(size));
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(300);
  const timerRef = useRef(null);

  useEffect(() => {
    setSteps(generateSteps(array));
    setStepIndex(-1);
    setIsPlaying(false);
  }, [array]);

  const reset = useCallback(() => {
    setArray(generateArray(size));
  }, [size]);

  const current = stepIndex >= 0 ? steps[stepIndex] : null;

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
    if (stepIndex >= steps.length - 1) {
      setStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((p) => !p);
    }
  }, [stepIndex, steps.length]);

  const isDone = stepIndex === steps.length - 1;

  return {
    array,
    current,
    stepIndex,
    totalSteps: steps.length,
    isPlaying,
    isDone,
    speed,
    setSpeed,
    reset,
    togglePlay,
    stepForward,
    stepBackward,
  };
}
