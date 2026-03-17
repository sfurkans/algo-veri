import { useState, useEffect, useRef, useCallback } from "react";

function generateArray(size = 16) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 85) + 10);
}

function generateSteps(arr) {
  const steps = [];
  const a = [...arr];
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;
  const placed = new Set();
  const completedPartitions = [];

  function doPartition(left, right, depth) {
    const pivotVal = a[right];
    let i = left - 1;

    // Announce pivot selection
    steps.push({
      array: [...a],
      pivotIdx: right,
      pivotVal,
      boundary: i,
      scanning: -1,
      partitionRange: [left, right],
      swapping: [],
      placed: [...placed],
      sorted: [],
      depth,
      comparisons,
      swaps,
      completedPartitions: [...completedPartitions],
      activeLine: 8,
      description: `Pivot: ${pivotVal} seçildi (indeks ${right})`,
      detail: `[${left}–${right}] aralığı bölünüyor. Son eleman ${pivotVal} pivot olarak seçildi.`,
      compareValues: null,
      compareOp: null,
    });

    for (let j = left; j < right; j++) {
      comparisons++;
      const isSmall = a[j] <= pivotVal;

      // Compare step
      steps.push({
        array: [...a],
        pivotIdx: right,
        pivotVal,
        boundary: i,
        scanning: j,
        partitionRange: [left, right],
        swapping: [],
        placed: [...placed],
        sorted: [],
        depth,
        comparisons,
        swaps,
        completedPartitions: [...completedPartitions],
        activeLine: 11,
        description: `${a[j]} ile pivot ${pivotVal} karşılaştırılıyor`,
        detail: isSmall
          ? `${a[j]} ≤ ${pivotVal} — sol bölgeye taşınacak`
          : `${a[j]} > ${pivotVal} — sağ bölgede kalacak`,
        compareValues: [a[j], pivotVal],
        compareOp: isSmall ? "≤" : ">",
      });

      if (isSmall) {
        i++;
        const didSwap = i !== j;
        if (didSwap) {
          swaps++;
          [a[i], a[j]] = [a[j], a[i]];
        }

        steps.push({
          array: [...a],
          pivotIdx: right,
          pivotVal,
          boundary: i,
          scanning: j,
          partitionRange: [left, right],
          swapping: didSwap ? [i, j] : [],
          placed: [...placed],
          sorted: [],
          depth,
          comparisons,
          swaps,
          completedPartitions: [...completedPartitions],
          activeLine: 13,
          description: didSwap
            ? `${a[i]} ve ${a[j]} yer değiştiriyor`
            : `${a[j]} sol bölgeye eklendi`,
          detail: `Sol sınır ${i}. indekse uzatıldı (${i - left + 1} eleman ≤ ${pivotVal}).`,
          compareValues: null,
          compareOp: null,
        });
      }
    }

    // Place pivot in final position
    const pivotFinalIdx = i + 1;
    const pivotNeedsSwap = pivotFinalIdx !== right;
    if (pivotNeedsSwap) {
      swaps++;
      [a[pivotFinalIdx], a[right]] = [a[right], a[pivotFinalIdx]];
    }
    placed.add(pivotFinalIdx);
    completedPartitions.push({
      left, right, pivotFinalIdx, depth,
      size: right - left + 1,
      comparisons: right - left,
    });

    steps.push({
      array: [...a],
      pivotIdx: pivotFinalIdx,
      pivotVal,
      boundary: i,
      scanning: -1,
      partitionRange: [left, right],
      swapping: pivotNeedsSwap ? [pivotFinalIdx, right] : [],
      placed: [...placed],
      sorted: [],
      depth,
      comparisons,
      swaps,
      completedPartitions: [...completedPartitions],
      activeLine: 14,
      description: `Pivot ${pivotVal}, ${pivotFinalIdx}. konuma kalıcı olarak yerleşti`,
      detail: `Sol: ${pivotFinalIdx - left} eleman < pivot. Sağ: ${right - pivotFinalIdx} eleman > pivot.`,
      compareValues: null,
      compareOp: null,
    });

    return pivotFinalIdx;
  }

  function quickSort(left, right, depth) {
    if (left > right) return;
    if (left === right) { placed.add(left); return; }

    const p = doPartition(left, right, depth);
    quickSort(left, p - 1, depth + 1);
    quickSort(p + 1, right, depth + 1);
  }

  quickSort(0, n - 1, 0);

  // Final step
  steps.push({
    array: [...a],
    pivotIdx: -1,
    pivotVal: null,
    boundary: -1,
    scanning: -1,
    partitionRange: null,
    swapping: [],
    placed: [...placed],
    sorted: [...Array(n).keys()],
    depth: 0,
    comparisons,
    swaps,
    completedPartitions: [...completedPartitions],
    activeLine: null,
    description: "Dizi tamamen sıralandı!",
    detail: `Toplam ${comparisons} karşılaştırma ve ${swaps} takas yapıldı.`,
    compareValues: null,
    compareOp: null,
  });

  return steps;
}

export function useQuickSort(size = 16) {
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

  const reset = useCallback(() => setArray(generateArray(size)), [size]);
  const resetWith = useCallback((arr) => setArray([...arr]), []);
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
          if (i >= steps.length - 1) { setIsPlaying(false); return i; }
          return i + 1;
        });
      }, speed);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, steps.length, speed]);

  const togglePlay = useCallback(() => {
    if (stepIndex >= steps.length - 1) { setStepIndex(0); setIsPlaying(true); }
    else setIsPlaying((p) => !p);
  }, [stepIndex, steps.length]);

  const isDone = stepIndex === steps.length - 1;

  return {
    array, current, stepIndex, totalSteps: steps.length,
    isPlaying, isDone, speed, setSpeed,
    reset, resetWith, togglePlay, stepForward, stepBackward,
  };
}
