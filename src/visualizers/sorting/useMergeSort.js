import { useState, useEffect, useRef, useCallback } from "react";

function generateArray(size = 16) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 85) + 10);
}

function generateSteps(arr) {
  const steps = [];
  const a = [...arr];
  const n = a.length;
  const maxDepth = Math.ceil(Math.log2(n));
  let comparisons = 0;
  let copies = 0;
  const mergedSet = new Set();
  const completedMerges = [];

  for (let width = 1; width < n; width *= 2) {
    const depth = Math.round(Math.log2(width)) + 1;

    for (let left = 0; left < n - width; left += 2 * width) {
      const mid = left + width - 1;
      const right = Math.min(left + 2 * width - 1, n - 1);
      let roundComparisons = 0;
      let resultCount = 0;

      const leftArr = a.slice(left, mid + 1);
      const rightArr = a.slice(mid + 1, right + 1);
      let i = 0, j = 0, k = left;

      const src = () => ({
        leftArr,
        rightArr,
        leftPtr: i,
        rightPtr: j,
        resultCount,
      });

      // Announce merge start
      steps.push({
        array: [...a],
        leftRange: [left, mid],
        rightRange: [mid + 1, right],
        comparing: [],
        copying: -1,
        mergedIndices: [...mergedSet],
        sorted: [],
        depth,
        maxDepth,
        comparisons,
        copies,
        completedMerges: [...completedMerges],
        activeLine: 6,
        mergeSrc: src(),
        description: `Seviye ${depth}: [${left}–${mid}] ve [${mid + 1}–${right}] birleştiriliyor`,
        detail: `Sol: [${leftArr.join(", ")}]  ·  Sağ: [${rightArr.join(", ")}]`,
        compareValues: null,
        compareOp: null,
      });

      while (i < leftArr.length && j < rightArr.length) {
        comparisons++;
        roundComparisons++;
        const isLeftSmaller = leftArr[i] <= rightArr[j];

        // Compare step
        steps.push({
          array: [...a],
          leftRange: [left, mid],
          rightRange: [mid + 1, right],
          comparing: [left + i, mid + 1 + j],
          copying: -1,
          mergedIndices: [...mergedSet],
          sorted: [],
          depth,
          maxDepth,
          comparisons,
          copies,
          completedMerges: [...completedMerges],
          activeLine: 12,
          mergeSrc: src(),
          description: `${leftArr[i]} ile ${rightArr[j]} karşılaştırılıyor`,
          detail: isLeftSmaller
            ? `${leftArr[i]} ≤ ${rightArr[j]} — sol eleman alınıyor`
            : `${leftArr[i]} > ${rightArr[j]} — sağ eleman alınıyor`,
          compareValues: [leftArr[i], rightArr[j]],
          compareOp: isLeftSmaller ? "≤" : ">",
        });

        const copiedVal = isLeftSmaller ? leftArr[i] : rightArr[j];
        if (isLeftSmaller) i++; else j++;
        a[k] = copiedVal;
        copies++;
        resultCount++;

        // Copy step
        steps.push({
          array: [...a],
          leftRange: [left, mid],
          rightRange: [mid + 1, right],
          comparing: [],
          copying: k,
          mergedIndices: [...mergedSet],
          sorted: [],
          depth,
          maxDepth,
          comparisons,
          copies,
          completedMerges: [...completedMerges],
          activeLine: isLeftSmaller ? 13 : 15,
          mergeSrc: src(),
          description: `${copiedVal}, ${k}. konuma yerleştirildi`,
          detail: `${isLeftSmaller ? "Sol" : "Sağ"} alt diziden alındı.`,
          compareValues: null,
          compareOp: null,
        });

        k++;
      }

      // Remaining left elements
      while (i < leftArr.length) {
        a[k] = leftArr[i++];
        copies++;
        resultCount++;
        steps.push({
          array: [...a],
          leftRange: [left, mid],
          rightRange: [mid + 1, right],
          comparing: [],
          copying: k,
          mergedIndices: [...mergedSet],
          sorted: [],
          depth,
          maxDepth,
          comparisons,
          copies,
          completedMerges: [...completedMerges],
          activeLine: 16,
          mergeSrc: src(),
          description: `${a[k]} (sol kalıntı) ${k}. konuma kopyalandı`,
          detail: `Sağ alt dizi bitti — sol alt dizinin geri kalanı kopyalanıyor.`,
          compareValues: null,
          compareOp: null,
        });
        k++;
      }

      // Remaining right elements
      while (j < rightArr.length) {
        a[k] = rightArr[j++];
        copies++;
        resultCount++;
        steps.push({
          array: [...a],
          leftRange: [left, mid],
          rightRange: [mid + 1, right],
          comparing: [],
          copying: k,
          mergedIndices: [...mergedSet],
          sorted: [],
          depth,
          maxDepth,
          comparisons,
          copies,
          completedMerges: [...completedMerges],
          activeLine: 16,
          mergeSrc: src(),
          description: `${a[k]} (sağ kalıntı) ${k}. konuma kopyalandı`,
          detail: `Sol alt dizi bitti — sağ alt dizinin geri kalanı kopyalanıyor.`,
          compareValues: null,
          compareOp: null,
        });
        k++;
      }

      for (let x = left; x <= right; x++) mergedSet.add(x);
      completedMerges.push({ depth, left, right, comparisons: roundComparisons });
    }
  }

  // Final sorted step
  steps.push({
    array: [...a],
    leftRange: null,
    rightRange: null,
    comparing: [],
    copying: -1,
    mergedIndices: [],
    sorted: [...Array(n).keys()],
    depth: maxDepth,
    maxDepth,
    comparisons,
    copies,
    completedMerges: [...completedMerges],
    activeLine: null,
    mergeSrc: null,
    description: "Dizi tamamen sıralandı!",
    detail: `Toplam ${comparisons} karşılaştırma ve ${copies} kopyalama yapıldı.`,
    compareValues: null,
    compareOp: null,
  });

  return steps;
}

export function useMergeSort(size = 16) {
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
