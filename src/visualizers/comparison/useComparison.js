import { useState, useEffect, useRef } from "react";

export const COMPARISON_ALGOS = {
  bubble:    { label: "Bubble Sort",    badge: "O(n²)",      color: "#6366f1", bg: "#e0e7ff" },
  selection: { label: "Selection Sort", badge: "O(n²)",      color: "#8b5cf6", bg: "#ede9fe" },
  insertion: { label: "Insertion Sort", badge: "O(n²)",      color: "#a855f7", bg: "#f5f3ff" },
  merge:     { label: "Merge Sort",     badge: "O(n log n)", color: "#3b82f6", bg: "#eff6ff" },
  quick:     { label: "Quick Sort",     badge: "O(n log n)", color: "#f59e0b", bg: "#fef3c7" },
  heap:      { label: "Heap Sort",      badge: "O(n log n)", color: "#10b981", bg: "#dcfce7" },
};

// Step format: { array, active, swapped, sorted, description }

function randomArray(size) {
  const pool = new Set();
  while (pool.size < size) pool.add(Math.floor(Math.random() * (size * 4)) + 1);
  return [...pool].slice(0, size);
}

// ── Bubble Sort ──────────────────────────────────────────────────────────────
function genBubble(arr) {
  const steps = [];
  const a = [...arr];
  const n = a.length;
  const sorted = new Set();

  steps.push({ array: [...a], active: [], swapped: [], sorted: [], description: "Başlangıç" });

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({
        array: [...a],
        active: [j, j + 1],
        swapped: [],
        sorted: [...sorted],
        description: `${a[j]} ile ${a[j + 1]} karşılaştırılıyor`,
      });

      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({
          array: [...a],
          active: [],
          swapped: [j, j + 1],
          sorted: [...sorted],
          description: `${a[j + 1]} ve ${a[j]} yer değiştirdi`,
        });
      }
    }
    sorted.add(n - 1 - i);
  }
  sorted.add(0);

  steps.push({
    array: [...a],
    active: [],
    swapped: [],
    sorted: [...Array(n).keys()],
    description: "Tamamlandı!",
  });

  return steps;
}

// ── Selection Sort ───────────────────────────────────────────────────────────
function genSelection(arr) {
  const steps = [];
  const a = [...arr];
  const n = a.length;
  const sorted = new Set();

  steps.push({ array: [...a], active: [], swapped: [], sorted: [], description: "Başlangıç" });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    for (let j = i + 1; j < n; j++) {
      steps.push({
        array: [...a],
        active: [minIdx, j],
        swapped: [],
        sorted: [...sorted],
        description: `${a[j]} ile minimum ${a[minIdx]} karşılaştırılıyor`,
      });

      if (a[j] < a[minIdx]) {
        minIdx = j;
        steps.push({
          array: [...a],
          active: [minIdx],
          swapped: [],
          sorted: [...sorted],
          description: `Yeni minimum: ${a[minIdx]} (indeks ${minIdx})`,
        });
      }
    }

    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      steps.push({
        array: [...a],
        active: [],
        swapped: [i, minIdx],
        sorted: [...sorted],
        description: `${a[i]} ile ${a[minIdx]} yer değiştirdi`,
      });
    }

    sorted.add(i);
    steps.push({
      array: [...a],
      active: [],
      swapped: [],
      sorted: [...sorted],
      description: `${a[i]} yerine oturdu`,
    });
  }
  sorted.add(n - 1);

  steps.push({
    array: [...a],
    active: [],
    swapped: [],
    sorted: [...Array(n).keys()],
    description: "Tamamlandı!",
  });

  return steps;
}

// ── Insertion Sort ───────────────────────────────────────────────────────────
function genInsertion(arr) {
  const steps = [];
  const a = [...arr];
  const n = a.length;

  steps.push({ array: [...a], active: [], swapped: [], sorted: [0], description: "Başlangıç" });

  for (let i = 1; i < n; i++) {
    const key = a[i];

    steps.push({
      array: [...a],
      active: [i],
      swapped: [],
      sorted: [...Array(i).keys()],
      description: `Anahtar: ${key} seçildi (indeks ${i})`,
    });

    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      steps.push({
        array: [...a],
        active: [j, j + 1],
        swapped: [],
        sorted: [...Array(i).keys()],
        description: `${a[j]} > ${key} — sola kaydırılıyor`,
      });

      a[j + 1] = a[j];
      steps.push({
        array: [...a],
        active: [],
        swapped: [j, j + 1],
        sorted: [...Array(i).keys()],
        description: `${a[j]} bir sağa kaydırıldı`,
      });
      j--;
    }

    a[j + 1] = key;
    steps.push({
      array: [...a],
      active: [],
      swapped: [j + 1],
      sorted: [...Array(i + 1).keys()],
      description: `${key}, ${j + 1}. konuma yerleşti`,
    });
  }

  steps.push({
    array: [...a],
    active: [],
    swapped: [],
    sorted: [...Array(n).keys()],
    description: "Tamamlandı!",
  });

  return steps;
}

// ── Merge Sort ───────────────────────────────────────────────────────────────
function genMerge(arr) {
  const steps = [];
  const a = [...arr];
  const n = a.length;
  const mergedSet = new Set();

  steps.push({ array: [...a], active: [], swapped: [], sorted: [], description: "Başlangıç" });

  for (let width = 1; width < n; width *= 2) {
    for (let left = 0; left < n - width; left += 2 * width) {
      const mid = left + width - 1;
      const right = Math.min(left + 2 * width - 1, n - 1);

      const leftArr = a.slice(left, mid + 1);
      const rightArr = a.slice(mid + 1, right + 1);
      let i = 0, j = 0, k = left;

      steps.push({
        array: [...a],
        active: [...Array(right - left + 1).keys()].map(x => x + left),
        swapped: [],
        sorted: [...mergedSet],
        description: `[${left}–${mid}] ve [${mid + 1}–${right}] birleştiriliyor`,
      });

      while (i < leftArr.length && j < rightArr.length) {
        steps.push({
          array: [...a],
          active: [left + i, mid + 1 + j],
          swapped: [],
          sorted: [...mergedSet],
          description: `${leftArr[i]} ile ${rightArr[j]} karşılaştırılıyor`,
        });

        if (leftArr[i] <= rightArr[j]) {
          a[k] = leftArr[i++];
        } else {
          a[k] = rightArr[j++];
        }

        steps.push({
          array: [...a],
          active: [],
          swapped: [k],
          sorted: [...mergedSet],
          description: `${a[k]}, ${k}. konuma yerleştirildi`,
        });
        k++;
      }

      while (i < leftArr.length) {
        a[k] = leftArr[i++];
        steps.push({
          array: [...a],
          active: [],
          swapped: [k],
          sorted: [...mergedSet],
          description: `${a[k]} (sol kalıntı) kopyalandı`,
        });
        k++;
      }

      while (j < rightArr.length) {
        a[k] = rightArr[j++];
        steps.push({
          array: [...a],
          active: [],
          swapped: [k],
          sorted: [...mergedSet],
          description: `${a[k]} (sağ kalıntı) kopyalandı`,
        });
        k++;
      }

      for (let x = left; x <= right; x++) mergedSet.add(x);
    }
  }

  steps.push({
    array: [...a],
    active: [],
    swapped: [],
    sorted: [...Array(n).keys()],
    description: "Tamamlandı!",
  });

  return steps;
}

// ── Quick Sort ───────────────────────────────────────────────────────────────
function genQuick(arr) {
  const steps = [];
  const a = [...arr];
  const n = a.length;
  const settled = new Set();

  steps.push({ array: [...a], active: [], swapped: [], sorted: [], description: "Başlangıç" });

  function partition(lo, hi) {
    const pivotVal = a[hi];
    let i = lo - 1;

    steps.push({
      array: [...a],
      active: [hi],
      swapped: [],
      sorted: [...settled],
      description: `Pivot: ${pivotVal} seçildi (indeks ${hi})`,
    });

    for (let j = lo; j < hi; j++) {
      steps.push({
        array: [...a],
        active: [hi, j],
        swapped: [],
        sorted: [...settled],
        description: `${a[j]} ile pivot ${pivotVal} karşılaştırılıyor`,
      });

      if (a[j] <= pivotVal) {
        i++;
        if (i !== j) {
          [a[i], a[j]] = [a[j], a[i]];
          steps.push({
            array: [...a],
            active: [],
            swapped: [i, j],
            sorted: [...settled],
            description: `${a[i]} ve ${a[j]} yer değiştirdi`,
          });
        }
      }
    }

    const pivotFinal = i + 1;
    if (pivotFinal !== hi) {
      [a[pivotFinal], a[hi]] = [a[hi], a[pivotFinal]];
    }
    settled.add(pivotFinal);

    steps.push({
      array: [...a],
      active: [],
      swapped: [pivotFinal],
      sorted: [...settled],
      description: `Pivot ${pivotVal}, ${pivotFinal}. konuma yerleşti`,
    });

    return pivotFinal;
  }

  function quickSort(lo, hi) {
    if (lo > hi) return;
    if (lo === hi) {
      settled.add(lo);
      return;
    }
    const p = partition(lo, hi);
    quickSort(lo, p - 1);
    quickSort(p + 1, hi);
  }

  quickSort(0, n - 1);

  steps.push({
    array: [...a],
    active: [],
    swapped: [],
    sorted: [...Array(n).keys()],
    description: "Tamamlandı!",
  });

  return steps;
}

// ── Heap Sort ────────────────────────────────────────────────────────────────
function genHeap(arr) {
  const steps = [];
  const a = [...arr];
  const n = a.length;
  let heapSize = n;

  const sortedIndices = () => {
    const s = [];
    for (let i = heapSize; i < n; i++) s.push(i);
    return s;
  };

  steps.push({ array: [...a], active: [], swapped: [], sorted: [], description: "Başlangıç" });

  function siftDown(root, size) {
    let cur = root;
    while (cur < size) {
      const left = 2 * cur + 1;
      const right = 2 * cur + 2;
      let largest = cur;

      if (left < size && a[left] > a[largest]) largest = left;
      if (right < size && a[right] > a[largest]) largest = right;

      const active = [cur];
      if (left < size) active.push(left);
      if (right < size) active.push(right);

      steps.push({
        array: [...a],
        active,
        swapped: [],
        sorted: sortedIndices(),
        description: `${a[cur]} heapify — sol:${left < size ? a[left] : '—'} sağ:${right < size ? a[right] : '—'}`,
      });

      if (largest === cur) break;

      steps.push({
        array: [...a],
        active: [],
        swapped: [cur, largest],
        sorted: sortedIndices(),
        description: `${a[cur]} ↔ ${a[largest]} takas`,
      });

      [a[cur], a[largest]] = [a[largest], a[cur]];
      cur = largest;
    }
  }

  // Build max-heap
  steps.push({
    array: [...a],
    active: [],
    swapped: [],
    sorted: [],
    description: "Max-Heap oluşturuluyor",
  });

  const firstNonLeaf = Math.floor(n / 2) - 1;
  for (let i = firstNonLeaf; i >= 0; i--) {
    siftDown(i, heapSize);
  }

  steps.push({
    array: [...a],
    active: [0],
    swapped: [],
    sorted: sortedIndices(),
    description: `Max-Heap hazır! Kök: ${a[0]}`,
  });

  // Extract max phase
  for (let i = n - 1; i > 0; i--) {
    steps.push({
      array: [...a],
      active: [0, i],
      swapped: [],
      sorted: sortedIndices(),
      description: `Maksimum ${a[0]} → son konuma taşınıyor`,
    });

    [a[0], a[i]] = [a[i], a[0]];
    heapSize--;

    steps.push({
      array: [...a],
      active: [],
      swapped: [0, i],
      sorted: sortedIndices(),
      description: `${a[i]} yerine oturdu`,
    });

    if (heapSize > 1) {
      siftDown(0, heapSize);
    }
  }

  steps.push({
    array: [...a],
    active: [],
    swapped: [],
    sorted: [...Array(n).keys()],
    description: "Tamamlandı!",
  });

  return steps;
}

const GENERATORS = {
  bubble:    genBubble,
  selection: genSelection,
  insertion: genInsertion,
  merge:     genMerge,
  quick:     genQuick,
  heap:      genHeap,
};

// ── useComparison hook ───────────────────────────────────────────────────────
export function useComparison() {
  const [algoA, setAlgoA] = useState("merge");
  const [algoB, setAlgoB] = useState("quick");
  const [arraySize, setArraySize] = useState(12);
  const [baseArray, setBaseArray] = useState(() => randomArray(12));
  const [stepsA, setStepsA] = useState([]);
  const [stepsB, setStepsB] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(400);
  const intervalRef = useRef(null);

  // Regenerate steps when algo or base array changes
  useEffect(() => {
    const sA = GENERATORS[algoA](baseArray);
    const sB = GENERATORS[algoB](baseArray);
    setStepsA(sA);
    setStepsB(sB);
    setStepIndex(0);
    setIsPlaying(false);
  }, [algoA, algoB, baseArray]);

  const totalSteps = Math.max(stepsA.length, stepsB.length);
  const isDone = stepIndex >= totalSteps - 1;
  const isADone = stepIndex >= stepsA.length - 1;
  const isBDone = stepIndex >= stepsB.length - 1;

  const currentA = stepsA[Math.min(stepIndex, stepsA.length - 1)] ?? null;
  const currentB = stepsB[Math.min(stepIndex, stepsB.length - 1)] ?? null;

  // Autoplay interval
  useEffect(() => {
    clearInterval(intervalRef.current);
    if (!isPlaying) return;
    intervalRef.current = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= totalSteps - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, speed);
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, speed, totalSteps]);

  function togglePlay() {
    if (isDone) {
      setStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((p) => !p);
    }
  }

  function stepForward() {
    setIsPlaying(false);
    setStepIndex((i) => Math.min(i + 1, totalSteps - 1));
  }

  function stepBackward() {
    setIsPlaying(false);
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  function randomize() {
    setBaseArray(randomArray(arraySize));
  }

  function changeSize(n) {
    setArraySize(n);
    setBaseArray(randomArray(n));
  }

  function changeAlgoA(key) {
    if (key === algoB) return;
    setAlgoA(key);
  }

  function changeAlgoB(key) {
    if (key === algoA) return;
    setAlgoB(key);
  }

  return {
    algoA,
    algoB,
    arraySize,
    baseArray,
    stepsA,
    stepsB,
    stepIndex,
    isPlaying,
    speed,
    setSpeed,
    totalSteps,
    isDone,
    isADone,
    isBDone,
    currentA,
    currentB,
    togglePlay,
    stepForward,
    stepBackward,
    randomize,
    changeSize,
    changeAlgoA,
    changeAlgoB,
  };
}
