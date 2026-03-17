import { useState, useEffect, useCallback, useRef } from "react";


export const HEAPSORT_PRESETS = {
  temel: {
    label: "Temel",
    tooltip: "12 eleman — heapify dalgalarını adım adım izle",
    array: [4, 10, 3, 5, 1, 8, 7, 2, 9, 6, 11, 12],
  },
  standart: {
    label: "Standart",
    tooltip: "15 eleman — tam dolu binary tree (4 seviye)",
    array: [4, 12, 7, 8, 2, 15, 3, 1, 6, 11, 9, 5, 14, 10, 13],
  },
  ters: {
    label: "Ters Sıralı",
    tooltip: "12 eleman büyükten küçüğe — heap oluşturma çok hızlı",
    array: [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  },
};

// ── Adım üretici ─────────────────────────────────────────────────────────────
function generateSteps(initialArray) {
  const steps = [];
  const a = [...initialArray];
  const n = a.length;
  const nodeStates = new Array(n).fill("default");
  let heapSize = n;

  function snap(description, detail, activeLine, phase) {
    steps.push({
      array:      [...a],
      nodeStates: [...nodeStates],
      heapSize,
      phase,
      description,
      detail,
      activeLine,
    });
  }

  function resetStates() {
    for (let i = 0; i < n; i++) {
      nodeStates[i] = i >= heapSize ? "sorted" : "default";
    }
  }

  // Yinelemeli siftDown: root'tan başlayarak heap özelliğini yeniden sağlar
  function siftDown(root, size, phase) {
    let cur = root;
    while (cur < size) {
      const left  = 2 * cur + 1;
      const right = 2 * cur + 2;
      let largest = cur;

      if (left  < size && a[left]  > a[largest]) largest = left;
      if (right < size && a[right] > a[largest]) largest = right;

      // Karşılaştırma anlık görüntüsü
      resetStates();
      nodeStates[cur] = "active";
      if (left  < size) nodeStates[left]  = "comparing";
      if (right < size) nodeStates[right] = "comparing";

      const lStr = left  < size ? String(a[left])  : "—";
      const rStr = right < size ? String(a[right]) : "—";
      snap(
        `${a[cur]} karşılaştırılıyor`,
        `Kök: ${a[cur]}  ·  Sol: ${lStr}  ·  Sağ: ${rStr}`,
        4,
        phase
      );

      if (largest === cur) {
        resetStates();
        snap(
          `${a[cur]} yerinde — heap özelliği sağlandı`,
          "Her iki çocuk daha küçük ya da yok",
          4,
          phase
        );
        break;
      }

      // Takas
      resetStates();
      nodeStates[cur]     = "swapped";
      nodeStates[largest] = "swapped";
      snap(
        `${a[cur]} ↔ ${a[largest]} takas`,
        `${a[largest]} daha büyük → yukarı çık`,
        5,
        phase
      );
      [a[cur], a[largest]] = [a[largest], a[cur]];
      snap(
        `Takas tamamlandı`,
        `${a[cur]} artık yukarıda`,
        5,
        phase
      );
      cur = largest;
    }
  }

  // ── Başlangıç ───────────────────────────────────────────────────────────
  resetStates();
  snap("Başlangıç dizisi", "Max Heap oluşturma başlıyor", 0, "build");

  // ── Aşama 1: Max Heap Oluştur ───────────────────────────────────────────
  const firstNonLeaf = Math.floor(n / 2) - 1;
  snap(
    `İlk heapify: A[${firstNonLeaf}] = ${a[firstNonLeaf]}`,
    `Yaprak olmayan son düğüm — indeks ${firstNonLeaf}'den 0'a doğru`,
    1,
    "build"
  );

  for (let i = firstNonLeaf; i >= 0; i--) {
    resetStates();
    nodeStates[i] = "active";
    snap(
      `A[${i}] = ${a[i]} heapify`,
      `Bu düğümden alt ağacı max-heap'e çevir`,
      3,
      "build"
    );
    siftDown(i, heapSize, "build");
  }

  resetStates();
  snap(
    `Max Heap hazır! Kök: ${a[0]}`,
    "Her ebeveyn kendi çocuklarından büyük",
    6,
    "build"
  );

  // ── Aşama 2: Sıralama ───────────────────────────────────────────────────
  snap(
    "Sıralama aşaması başlıyor",
    "Kökü (maks) sona taşı, heap'i küçült, tekrar heapify",
    7,
    "sort"
  );

  for (let i = n - 1; i > 0; i--) {
    // Kök (maks) ↔ son eleman
    resetStates();
    nodeStates[0] = "active";
    nodeStates[i] = "comparing";
    snap(
      `Maks (${a[0]}) → A[${i}] ile takas`,
      `Heap boyutu: ${heapSize}  —  en büyük yerleşecek`,
      8,
      "sort"
    );

    [a[0], a[i]] = [a[i], a[0]];
    heapSize--;
    nodeStates[0] = "swapped";
    nodeStates[i] = "sorted";
    snap(
      `${a[i]} yerine oturdu`,
      `Heap boyutu: ${heapSize + 1} → ${heapSize}`,
      9,
      "sort"
    );

    // Yeni köke siftDown
    resetStates();
    if (heapSize > 1) {
      nodeStates[0] = "active";
      snap(
        `Yeni kök (${a[0]}) aşağı kaydır`,
        "Heap özelliği yeniden sağlanıyor",
        10,
        "sort"
      );
      siftDown(0, heapSize, "sort");
      resetStates();
    }
  }

  // Tamamlandı
  nodeStates.fill("sorted");
  snap(
    "Heap Sort tamamlandı!",
    "Dizi küçükten büyüğe sıralandı",
    11,
    "done"
  );

  return steps;
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useHeapSort() {
  const [activePreset, setActivePreset] = useState("temel");
  const [array, setArray]               = useState(HEAPSORT_PRESETS.temel.array);
  const [steps, setSteps]               = useState([]);
  const [stepIndex, setStepIndex]       = useState(0);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [speed, setSpeed]               = useState(600);
  const intervalRef                     = useRef(null);

  useEffect(() => {
    const s = generateSteps(array);
    setSteps(s);
    setStepIndex(0);
    setIsPlaying(false);
  }, [array]);

  const current    = steps[stepIndex] ?? null;
  const totalSteps = steps.length;
  const isDone     = stepIndex >= totalSteps - 1;

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (!isPlaying) return;
    intervalRef.current = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= totalSteps - 1) { setIsPlaying(false); return prev; }
        return prev + 1;
      });
    }, speed);
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, speed, totalSteps]);

  const togglePlay = useCallback(() => {
    if (isDone) { setStepIndex(0); setIsPlaying(true); }
    else setIsPlaying((v) => !v);
  }, [isDone]);

  const stepForward  = useCallback(() => {
    setIsPlaying(false);
    setStepIndex((p) => Math.min(p + 1, totalSteps - 1));
  }, [totalSteps]);
  const stepBackward = useCallback(() => {
    setIsPlaying(false);
    setStepIndex((p) => Math.max(p - 1, 0));
  }, []);

  const loadPreset = useCallback((key) => {
    const p = HEAPSORT_PRESETS[key];
    if (!p) return;
    setActivePreset(key);
    setArray(p.array);
  }, []);

  return {
    array: current?.array ?? array,
    current, stepIndex, totalSteps, isDone,
    isPlaying, speed, setSpeed,
    activePreset, loadPreset,
    togglePlay, stepForward, stepBackward,
  };
}
