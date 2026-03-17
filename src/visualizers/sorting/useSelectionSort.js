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
  const completedRounds = [];

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    let roundComparisons = 0;

    // Tur başlangıcı: minIdx = i
    steps.push({
      array: [...a],
      comparing: [],
      swapping: [],
      minimum: i,
      scanPos: i,
      sorted: [...sortedIndices],
      activeLine: 1,
      round: i + 1,
      totalRounds: n - 1,
      comparisons,
      swaps,
      completedRounds: [...completedRounds],
      description: `Tur ${i + 1}: ${a[i]} şimdilik en küçük`,
      detail: `İndeks ${i}'deki ${a[i]}, geçici minimum olarak belirlendi. Kalan elemanlar taranacak.`,
      compareValues: null,
      compareOp: null,
    });

    for (let j = i + 1; j < n; j++) {
      comparisons++;
      roundComparisons++;
      const isSmaller = a[j] < a[minIdx];

      // Karşılaştırma adımı
      steps.push({
        array: [...a],
        comparing: [j],
        swapping: [],
        minimum: minIdx,
        scanPos: i,
        sorted: [...sortedIndices],
        activeLine: 3,
        round: i + 1,
        totalRounds: n - 1,
        comparisons,
        swaps,
        completedRounds: [...completedRounds],
        description: `${a[j]} ile minimum ${a[minIdx]} karşılaştırılıyor`,
        detail: isSmaller
          ? `${a[j]} < ${a[minIdx]} — Yeni minimum bulundu!`
          : `${a[j]} ≥ ${a[minIdx]} — Minimum değişmiyor, taramaya devam.`,
        compareValues: [a[j], a[minIdx]],
        compareOp: isSmaller ? "<" : "≥",
      });

      if (isSmaller) {
        minIdx = j;
        // Yeni minimum güncellendi
        steps.push({
          array: [...a],
          comparing: [],
          swapping: [],
          minimum: minIdx,
          scanPos: i,
          sorted: [...sortedIndices],
          activeLine: 4,
          round: i + 1,
          totalRounds: n - 1,
          comparisons,
          swaps,
          completedRounds: [...completedRounds],
          description: `Yeni minimum: ${a[minIdx]} (indeks ${minIdx})`,
          detail: `En küçük eleman güncellendi. Tarama devam ediyor.`,
          compareValues: null,
          compareOp: null,
        });
      }
    }

    // Takas adımı
    const didSwap = minIdx !== i;
    if (didSwap) {
      const minVal = a[minIdx];
      const posVal = a[i];
      swaps++;
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      steps.push({
        array: [...a],
        comparing: [],
        swapping: [i, minIdx],
        minimum: -1,
        scanPos: i,
        sorted: [...sortedIndices],
        activeLine: 5,
        round: i + 1,
        totalRounds: n - 1,
        comparisons,
        swaps,
        completedRounds: [...completedRounds],
        description: `${minVal} ve ${posVal} yer değiştiriyor`,
        detail: `Minimum (${minVal}) indeks ${i}'ye taşındı. ${posVal} ise indeks ${minIdx}'ye gitti.`,
        compareValues: null,
        compareOp: null,
      });
    } else {
      // Takas gerekmedi
      steps.push({
        array: [...a],
        comparing: [],
        swapping: [],
        minimum: i,
        scanPos: i,
        sorted: [...sortedIndices],
        activeLine: 5,
        round: i + 1,
        totalRounds: n - 1,
        comparisons,
        swaps,
        completedRounds: [...completedRounds],
        description: `${a[i]} zaten doğru konumda`,
        detail: `İndeks ${i}'deki ${a[i]} zaten minimumdu. Takas gerekmedi.`,
        compareValues: null,
        compareOp: null,
      });
    }

    sortedIndices.add(i);
    completedRounds.push({ round: i + 1, comparisons: roundComparisons, swapped: didSwap });
  }

  sortedIndices.add(n - 1);

  steps.push({
    array: [...a],
    comparing: [],
    swapping: [],
    minimum: -1,
    scanPos: -1,
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

export function useSelectionSort(size = 16) {
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

  const resetWith = useCallback((arr) => {
    setArray([...arr]);
  }, []);

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
    resetWith,
    togglePlay,
    stepForward,
    stepBackward,
  };
}
