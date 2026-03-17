import { useState, useRef, useCallback, useEffect } from "react";

export const TABLE_SIZE = 11;

export const PRESETS = {
  basic: {
    label: "Temel İşlemler",
    tooltip: "Ekleme, arama ve silme — her operasyon adım adım gösterilir",
    ops: [
      { op: "insert", key: "name", value: "Ali" },
      { op: "insert", key: "city", value: "Ankara" },
      { op: "insert", key: "age",  value: "25" },
      { op: "search", key: "city" },
      { op: "search", key: "zip" },
      { op: "delete", key: "age" },
      { op: "search", key: "age" },
    ],
  },
  collision: {
    label: "Çakışma Demosu",
    tooltip: "Aynı slota düşen anahtarlar — chaining ile nasıl çözülür?",
    ops: [
      { op: "insert", key: "name", value: "Ali" },    // slot 10
      { op: "insert", key: "age",  value: "25" },     // slot 4
      { op: "insert", key: "key",  value: "gizli" },  // slot 10 → ÇAKIŞMA!
      { op: "insert", key: "cat",  value: "Minnoş" }, // slot 4  → ÇAKIŞMA!
      { op: "search", key: "key" },
      { op: "search", key: "cat" },
    ],
  },
  mixed: {
    label: "Karma İşlem",
    tooltip: "Güncelleme ve silme sonrası zincir değişir — gerçek kullanım senaryosu",
    ops: [
      { op: "insert", key: "job",  value: "dev" },      // slot 7
      { op: "insert", key: "zip",  value: "06100" },    // slot 9
      { op: "insert", key: "name", value: "Ali" },      // slot 10
      { op: "insert", key: "max",  value: "100" },      // slot 7 → ÇAKIŞMA!
      { op: "search", key: "zip" },
      { op: "update", key: "name", value: "Veli" },     // UPDATE demo
      { op: "delete", key: "job" },
      { op: "search", key: "max" },
    ],
  },
};

// ── Adım üretici ─────────────────────────────────────────────────────────────
function generateSteps(operations) {
  const steps = [];
  // Canlı tablo durumu (bu fonksiyon boyunca mutate edilir)
  const table = Array.from({ length: TABLE_SIZE }, () => []);
  let totalElements  = 0;
  let totalCollisions = 0;

  // Anlık tablo durumunun derin kopyasını içeren adım nesnesi döndürür
  function snap(overrides = {}) {
    return {
      table:            table.map((chain) => chain.map((item) => ({ ...item }))),
      totalElements,
      totalCollisions,
      op:               null,
      activeKey:        "",
      activeValue:      "",
      phase:            "idle",
      highlightSlot:    null,
      highlightChainIdx: null,
      newItemSlot:      null,
      newItemChainIdx:  null,
      deletingSlot:     null,
      deletingChainIdx: null,
      hashCalc:         null,
      description:      "",
      detail:           null,
      opResult:         null,
      ...overrides,
    };
  }

  for (const { op, key, value = "" } of operations) {
    // Karakter karakter hash hesabı
    let runningSum = 0;
    const charSteps = [];
    for (let i = 0; i < key.length; i++) {
      const code = key.charCodeAt(i);
      runningSum += code;
      charSteps.push({ charIdx: i, char: key[i], code, sum: runningSum });
    }
    const slot = runningSum % TABLE_SIZE;

    const hashCalcFinal = {
      key,
      chars:     charSteps.map((s) => ({ char: s.char, code: s.code })),
      sum:       runningSum,
      tableSize: TABLE_SIZE,
      result:    slot,
    };

    const opLabel = op === "insert" ? "INSERT" : op === "search" ? "SEARCH" : op === "update" ? "UPDATE" : "DELETE";

    // 1 ── Başlangıç
    steps.push(snap({
      op, activeKey: key, activeValue: value,
      phase: "start",
      description: op === "insert"
        ? `INSERT  "${key}"  →  "${value}"`
        : `${opLabel}  "${key}"`,
      detail: "Hash değeri hesaplanıyor...",
    }));

    // 2 ── Karakter karakter hash
    for (const { charIdx, char, code, sum } of charSteps) {
      steps.push(snap({
        op, activeKey: key, activeValue: value,
        phase: "hashing_char",
        hashCalc: {
          key, charIdx,
          chars:     charSteps.slice(0, charIdx + 1).map((s) => ({ char: s.char, code: s.code })),
          sum,
          tableSize: TABLE_SIZE,
          result:    null,
        },
        description: `'${char}'  →  ASCII ${code}`,
        detail:      `Toplam şu an: ${sum}`,
      }));
    }

    // 3 ── Hash tamamlandı
    steps.push(snap({
      op, activeKey: key, activeValue: value,
      phase:         "hashing_done",
      hashCalc:      hashCalcFinal,
      highlightSlot: slot,
      description:   `${runningSum}  %  ${TABLE_SIZE}  =  ${slot}`,
      detail:        `Hedef: Slot ${slot}`,
    }));

    // ── INSERT ────────────────────────────────────────────────────────────────
    if (op === "insert") {
      const isCollision = table[slot].length > 0;

      steps.push(snap({
        op, activeKey: key, activeValue: value,
        phase:         isCollision ? "collision" : "slot_empty",
        hashCalc:      hashCalcFinal,
        highlightSlot: slot,
        description:   isCollision
          ? `Slot ${slot} dolu! Çakışma — ${table[slot].length} eleman var`
          : `Slot ${slot} boş — ekleniyor...`,
        detail: isCollision ? "Zincire (chaining) ekleniyor..." : null,
      }));

      if (isCollision) totalCollisions++;
      table[slot].push({ key, value });
      totalElements++;
      const newChainIdx = table[slot].length - 1;

      steps.push(snap({
        op, activeKey: key, activeValue: value,
        phase:          "done",
        hashCalc:       hashCalcFinal,
        highlightSlot:  slot,
        newItemSlot:    slot,
        newItemChainIdx: newChainIdx,
        description:    `"${key}"  →  "${value}"  eklendi  (slot ${slot})`,
        detail:         isCollision ? "Zincire eklendi." : "Boş slota eklendi.",
        opResult:       isCollision ? "collision_insert" : "inserted",
      }));

    // ── SEARCH ────────────────────────────────────────────────────────────────
    } else if (op === "search") {
      const chain = table[slot];

      if (chain.length === 0) {
        steps.push(snap({
          op, activeKey: key,
          phase:         "done",
          hashCalc:      hashCalcFinal,
          highlightSlot: slot,
          description:   `Slot ${slot} boş — "${key}" bulunamadı`,
          opResult:      "not_found",
        }));
      } else {
        let found = false;
        for (let ci = 0; ci < chain.length; ci++) {
          const match = chain[ci].key === key;
          steps.push(snap({
            op, activeKey: key,
            phase:             "chain_check",
            hashCalc:          hashCalcFinal,
            highlightSlot:     slot,
            highlightChainIdx: ci,
            description:       `"${chain[ci].key}"  ===  "${key}"?`,
            detail:            match ? "Eşleşme bulundu!" : "Eşleşmedi, devam...",
          }));

          if (match) {
            found = true;
            steps.push(snap({
              op, activeKey: key,
              phase:             "done",
              hashCalc:          hashCalcFinal,
              highlightSlot:     slot,
              highlightChainIdx: ci,
              description:       `"${key}"  bulundu!  →  "${chain[ci].value}"`,
              detail:            `Slot ${slot}, zincir [${ci}]`,
              opResult:          "found",
            }));
            break;
          }
        }
        if (!found) {
          steps.push(snap({
            op, activeKey: key,
            phase:         "done",
            hashCalc:      hashCalcFinal,
            highlightSlot: slot,
            description:   `"${key}" bulunamadı  (${chain.length} eleman tarandı)`,
            detail:        `Slot ${slot}'in tüm zinciri kontrol edildi`,
            opResult:      "not_found",
          }));
        }
      }

    // ── UPDATE ────────────────────────────────────────────────────────────────
    } else if (op === "update") {
      const chain = table[slot];
      let foundIdx = -1;

      for (let ci = 0; ci < chain.length; ci++) {
        const match = chain[ci].key === key;
        steps.push(snap({
          op, activeKey: key, activeValue: value,
          phase:             "chain_check",
          hashCalc:          hashCalcFinal,
          highlightSlot:     slot,
          highlightChainIdx: ci,
          description:       `"${chain[ci].key}"  ===  "${key}"?`,
          detail:            match ? "Bulundu, güncelleniyor..." : "Eşleşmedi, devam...",
        }));
        if (match) { foundIdx = ci; break; }
      }

      if (foundIdx >= 0) {
        const oldValue = chain[foundIdx].value;
        chain[foundIdx].value = value;

        steps.push(snap({
          op, activeKey: key, activeValue: value,
          phase:             "done",
          hashCalc:          hashCalcFinal,
          highlightSlot:     slot,
          highlightChainIdx: foundIdx,
          newItemSlot:       slot,
          newItemChainIdx:   foundIdx,
          description:       `"${key}"  güncellendi  →  "${value}"`,
          detail:            `Eski değer: "${oldValue}"`,
          opResult:          "updated",
        }));
      } else {
        steps.push(snap({
          op, activeKey: key, activeValue: value,
          phase:         "done",
          hashCalc:      hashCalcFinal,
          highlightSlot: slot,
          description:   chain.length === 0
            ? `Slot ${slot} boş — "${key}" bulunamadı`
            : `"${key}" bulunamadı — güncellenemedi`,
          opResult: "update_not_found",
        }));
      }

    // ── DELETE ────────────────────────────────────────────────────────────────
    } else if (op === "delete") {
      const chain = table[slot];
      let foundIdx = -1;

      for (let ci = 0; ci < chain.length; ci++) {
        const match = chain[ci].key === key;
        steps.push(snap({
          op, activeKey: key,
          phase:             "chain_check",
          hashCalc:          hashCalcFinal,
          highlightSlot:     slot,
          highlightChainIdx: ci,
          description:       `"${chain[ci].key}"  ===  "${key}"?`,
          detail:            match ? "Bulundu, siliniyor..." : "Eşleşmedi, devam...",
        }));
        if (match) { foundIdx = ci; break; }
      }

      if (foundIdx >= 0) {
        steps.push(snap({
          op, activeKey: key,
          phase:            "deleting",
          hashCalc:         hashCalcFinal,
          highlightSlot:    slot,
          deletingSlot:     slot,
          deletingChainIdx: foundIdx,
          description:      `"${key}"  siliniyor...`,
          detail:           `Slot ${slot}[${foundIdx}] zincirden kaldırılıyor`,
        }));

        table[slot].splice(foundIdx, 1);
        totalElements--;

        steps.push(snap({
          op, activeKey: key,
          phase:         "done",
          hashCalc:      hashCalcFinal,
          highlightSlot: slot,
          description:   `"${key}"  silindi  (slot ${slot})`,
          detail:        table[slot].length > 0
            ? `Zincirde ${table[slot].length} eleman kaldı`
            : "Slot artık boş",
          opResult: "deleted",
        }));
      } else {
        steps.push(snap({
          op, activeKey: key,
          phase:         "done",
          hashCalc:      hashCalcFinal,
          highlightSlot: slot,
          description:   chain.length === 0
            ? `Slot ${slot} boş — "${key}" bulunamadı`
            : `"${key}" bulunamadı — silinemedi`,
          opResult: "delete_not_found",
        }));
      }
    }
  }

  // Son adım
  steps.push(snap({
    phase:       "finished",
    description: "Tüm operasyonlar tamamlandı.",
  }));

  return steps;
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useHashTable() {
  const [activePreset, setActivePreset] = useState("basic");
  const [steps, setSteps]               = useState(() => generateSteps(PRESETS.basic.ops));
  const [stepIndex, setStepIndex]       = useState(0);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [speed, setSpeed]               = useState(700);
  const timerRef = useRef(null);

  useEffect(() => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    setIsPlaying(false);
    setSteps(generateSteps(PRESETS[activePreset].ops));
    setStepIndex(0);
  }, [activePreset]);

  const current = steps[stepIndex] ?? null;
  const isDone  = stepIndex === steps.length - 1 && steps.length > 0;

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

  const stepForward = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }, [steps.length]);

  const stepBackward = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    if (stepIndex >= steps.length - 1) setStepIndex(0);
    setIsPlaying(true);
  }, [isPlaying, stepIndex, steps.length]);

  return {
    current,
    stepIndex,
    totalSteps: steps.length,
    isPlaying,
    isDone,
    speed,
    setSpeed,
    activePreset,
    setActivePreset,
    togglePlay,
    stepForward,
    stepBackward,
  };
}
