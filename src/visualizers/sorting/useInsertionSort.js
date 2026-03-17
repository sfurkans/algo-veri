import { useState, useEffect, useRef, useCallback } from "react";

function generateArray(size = 16) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 85) + 10);
}

function generateSteps(arr) {
  const steps = [];
  const a = [...arr];
  const n = a.length;
  const sortedSet = new Set([0]);
  let comparisons = 0;
  let shifts = 0;
  const completedRounds = [];

  for (let i = 1; i < n; i++) {
    const key = a[i];
    let roundShifts = 0;
    let roundComparisons = 0;
    let holePos = i;

    // Round start: lift the element
    steps.push({
      array: [...a],
      comparing: [],
      shifting: [],
      sorted: [...sortedSet],
      lifted: i,
      insertPos: -1,
      keyVal: key,
      activeLine: 1,
      round: i,
      totalRounds: n - 1,
      comparisons,
      shifts,
      roundShifts,
      completedRounds: [...completedRounds],
      description: `Tur ${i}: ${key} eline alındı`,
      detail: `${i}. indeksteki ${key} eline alındı. Sıralı bölge (0–${i - 1}) içinde doğru konum aranacak.`,
      compareValues: null,
      compareOp: null,
    });

    let j = i - 1;

    while (j >= 0) {
      comparisons++;
      roundComparisons++;
      const isGreater = a[j] > key;

      // Snapshot with key shown at holePos
      const snapCompare = [...a];
      snapCompare[holePos] = key;

      steps.push({
        array: snapCompare,
        comparing: [j],
        shifting: [],
        sorted: [...sortedSet],
        lifted: holePos,
        insertPos: -1,
        keyVal: key,
        activeLine: 3,
        round: i,
        totalRounds: n - 1,
        comparisons,
        shifts,
        roundShifts,
        completedRounds: [...completedRounds],
        description: `${a[j]} ile ${key} karşılaştırılıyor`,
        detail: isGreater
          ? `${a[j]} > ${key} — ${a[j]} sağa kayacak.`
          : `${a[j]} ≤ ${key} — Doğru yer bulundu!`,
        compareValues: [a[j], key],
        compareOp: isGreater ? ">" : "≤",
      });

      if (isGreater) {
        shifts++;
        roundShifts++;
        a[j + 1] = a[j];
        holePos = j;

        const snapShift = [...a];
        snapShift[holePos] = key;

        steps.push({
          array: snapShift,
          comparing: [],
          shifting: [j + 1],
          sorted: [...sortedSet],
          lifted: holePos,
          insertPos: -1,
          keyVal: key,
          activeLine: 4,
          round: i,
          totalRounds: n - 1,
          comparisons,
          shifts,
          roundShifts,
          completedRounds: [...completedRounds],
          description: `${a[j + 1]} sağa kaydırıldı`,
          detail: `${key} için yer açılıyor. Boşluk ${j}. konuma taşındı.`,
          compareValues: null,
          compareOp: null,
        });

        j--;
      } else {
        break;
      }
    }

    a[j + 1] = key;
    sortedSet.add(i);

    steps.push({
      array: [...a],
      comparing: [],
      shifting: [],
      sorted: [...sortedSet],
      lifted: -1,
      insertPos: j + 1,
      keyVal: null,
      activeLine: 6,
      round: i,
      totalRounds: n - 1,
      comparisons,
      shifts,
      roundShifts,
      completedRounds: [...completedRounds],
      description: `${key}, ${j + 1}. konuma yerleştirildi`,
      detail:
        roundShifts === 0
          ? `${key} zaten doğru konumdaydı — kaydırma gerekmedi.`
          : `${key} doğru konumuna oturdu. Bu tur ${roundShifts} kaydırma yapıldı.`,
      compareValues: null,
      compareOp: null,
    });

    completedRounds.push({ round: i, shifts: roundShifts, comparisons: roundComparisons });
  }

  steps.push({
    array: [...a],
    comparing: [],
    shifting: [],
    sorted: [...Array(n).keys()],
    lifted: -1,
    insertPos: -1,
    keyVal: null,
    activeLine: null,
    round: n - 1,
    totalRounds: n - 1,
    comparisons,
    shifts,
    roundShifts: 0,
    completedRounds: [...completedRounds],
    description: "Dizi tamamen sıralandı!",
    detail: `Toplam ${comparisons} karşılaştırma ve ${shifts} kaydırma yapıldı.`,
    compareValues: null,
    compareOp: null,
  });

  return steps;
}

export function useInsertionSort(size = 16) {
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
