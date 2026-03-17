import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────────────────
   STEP GENERATOR
   nodes = düğüm değerleri dizisi (index = konum)
   nodes[0] = HEAD, nodes[last] = TAIL
───────────────────────────────────────────────────────── */
function generateSteps(operations, initialNodes = []) {
  const steps = [];
  const nodes = [...initialNodes];
  const stats = { appends: 0, prepends: 0, inserts: 0, deletes: 0, searches: 0, comparisons: 0 };

  function add(extra) {
    steps.push({
      nodes:        [...nodes],
      stats:        { ...stats },
      highlightIdx: -1,   // "current" işaret ediyor
      prevIdx:      -1,   // "prev" işaret ediyor
      newIdx:       -1,   // yeni eklenen düğüm
      deleteIdx:    -1,   // silinecek düğüm
      result:       null,
      isError:      false,
      phase:        "idle",
      description:  "",
      detail:       "",
      activeLine:   null,
      ...extra,
    });
  }

  for (const op of operations) {

    /* ── APPEND ── */
    if (op.op === "append") {
      if (nodes.length === 0) {
        add({
          phase:       "traverse_start",
          description: `APPEND(${op.val})`,
          detail:      "Liste boş — HEAD'e doğrudan ekleniyor",
          activeLine:  3,
        });
      } else {
        // Her düğümde dur
        for (let i = 0; i < nodes.length; i++) {
          const isLast = i === nodes.length - 1;
          add({
            phase:        isLast ? "traverse_tail" : "traverse_step",
            highlightIdx: i,
            prevIdx:      i > 0 ? i - 1 : -1,
            description:  `APPEND(${op.val}) — Son arıyor`,
            detail:       isLast
              ? `düğüm[${i}]=${nodes[i]} → next=NULL → buraya eklenecek!`
              : `düğüm[${i}]=${nodes[i]} → next≠NULL, ilerle...`,
            activeLine:   isLast ? 6 : 5,
          });
        }
      }

      nodes.push(op.val);
      stats.appends++;

      add({
        phase:        "node_new",
        newIdx:       nodes.length - 1,
        highlightIdx: nodes.length - 1,
        prevIdx:      nodes.length > 1 ? nodes.length - 2 : -1,
        description:  `APPEND(${op.val}) tamamlandı`,
        detail:       nodes.length > 1
          ? `düğüm[${nodes.length - 2}].next → ${op.val} → NULL · boyut: ${nodes.length}`
          : `HEAD → ${op.val} → NULL · liste oluştu`,
        activeLine:   7,
      });

    /* ── PREPEND ── */
    } else if (op.op === "prepend") {
      const oldHead = nodes.length > 0 ? nodes[0] : null;

      add({
        phase:        "traverse_step",
        highlightIdx: 0,
        description:  `PREPEND(${op.val})`,
        detail:       oldHead !== null
          ? `Mevcut HEAD (${oldHead}) bir sağa kayacak — yeni düğüm başa gelecek`
          : "Liste boş — ilk düğüm oluşturulacak",
        activeLine:   11,
      });

      nodes.unshift(op.val);
      stats.prepends++;

      add({
        phase:        "node_new",
        newIdx:       0,
        highlightIdx: 0,
        description:  `PREPEND(${op.val}) tamamlandı`,
        detail:       nodes.length > 1
          ? `yeni[0]=${op.val} → next → [1]=${nodes[1]} · HEAD güncellendi`
          : `HEAD → ${op.val} → NULL · tek düğüm`,
        activeLine:   12,
      });

    /* ── INSERT AT ── */
    } else if (op.op === "insertAt") {
      const { val, idx } = op;

      if (idx < 0 || idx > nodes.length) {
        add({
          phase:   "error",
          isError: true,
          description: `INSERT(${val}, ${idx}) — HATA!`,
          detail:      `İndeks ${idx}, geçerli aralık dışında [0..${nodes.length}]`,
          activeLine:  15,
        });
        continue;
      }

      if (idx === 0) {
        add({
          phase:        "traverse_step",
          highlightIdx: 0,
          description:  `INSERT(${val}, 0) — Başa ekleniyor`,
          detail:       "İndeks 0 → prepend ile aynı mantık",
          activeLine:   15,
        });
      } else {
        for (let i = 0; i < idx; i++) {
          const isTarget = i === idx - 1;
          add({
            phase:        isTarget ? "rewire_prev" : "traverse_step",
            highlightIdx: i,
            prevIdx:      i > 0 ? i - 1 : -1,
            description:  `INSERT(${val}, ${idx}) — Pozisyon: ${i}/${idx - 1}`,
            detail:       isTarget
              ? `düğüm[${i}]=${nodes[i]} → buradan sonraki bağlantı kesilecek`
              : `düğüm[${i}]=${nodes[i]}, devam...`,
            activeLine:   isTarget ? 17 : 16,
          });
        }
      }

      nodes.splice(idx, 0, val);
      stats.inserts++;

      add({
        phase:        "node_new",
        newIdx:       idx,
        highlightIdx: idx,
        prevIdx:      idx > 0 ? idx - 1 : -1,
        description:  `INSERT(${val}, ${idx}) tamamlandı`,
        detail:       idx > 0
          ? `[${idx - 1}].next → ${val} → ${nodes[idx + 1] ?? "NULL"} · boyut: ${nodes.length}`
          : `HEAD → ${val} → ${nodes[1] ?? "NULL"} · boyut: ${nodes.length}`,
        activeLine:   18,
      });

    /* ── DELETE AT ── */
    } else if (op.op === "deleteAt") {
      const { idx } = op;

      if (nodes.length === 0) {
        add({
          phase:   "error",
          isError: true,
          description: "DELETE — HATA: Liste boş!",
          detail:      "Boş listeden silme yapılamaz.",
          activeLine:  21,
        });
        continue;
      }

      if (idx < 0 || idx >= nodes.length) {
        add({
          phase:   "error",
          isError: true,
          description: `DELETE(${idx}) — HATA: Geçersiz indeks!`,
          detail:      `İndeks ${idx}, geçerli aralık dışında [0..${nodes.length - 1}]`,
          activeLine:  21,
        });
        continue;
      }

      const val = nodes[idx];

      if (idx === 0) {
        add({
          phase:        "delete_target",
          deleteIdx:    0,
          highlightIdx: 0,
          description:  `DELETE(0) — HEAD (${val}) silinecek`,
          detail:       nodes.length > 1
            ? `HEAD (${val}) kaldırılıyor → yeni HEAD = ${nodes[1]}`
            : `HEAD (${val}) kaldırılıyor → liste boşalacak`,
          activeLine:   21,
        });
      } else {
        for (let i = 0; i < idx; i++) {
          const isTarget = i === idx - 1;
          add({
            phase:        isTarget ? "rewire_prev" : "traverse_step",
            highlightIdx: i,
            prevIdx:      i > 0 ? i - 1 : -1,
            description:  `DELETE(${idx}) — Pozisyon: ${i}/${idx - 1}`,
            detail:       isTarget
              ? `düğüm[${i}]=${nodes[i]} bulundu → bir sonraki (${val}) silinecek`
              : `düğüm[${i}]=${nodes[i]}, devam...`,
            activeLine:   22,
          });
        }

        add({
          phase:        "delete_target",
          deleteIdx:    idx,
          highlightIdx: idx,
          prevIdx:      idx - 1,
          description:  `DELETE(${idx}) — ${val} hedef`,
          detail:       `düğüm[${idx - 1}].next = ${val} → düğüm[${idx - 1}].next = ${nodes[idx + 1] ?? "NULL"}`,
          activeLine:   23,
        });
      }

      nodes.splice(idx, 1);
      stats.deletes++;

      const newHL = idx > 0 ? idx - 1 : (nodes.length > 0 ? 0 : -1);
      add({
        phase:        "delete_done",
        highlightIdx: newHL,
        description:  `DELETE(${idx}) = ${val} — tamamlandı`,
        detail:       nodes.length > 0
          ? `${val} silindi · boyut: ${nodes.length}${newHL >= 0 ? ` · yeni bağlantı: [${newHL}] → ${nodes[newHL + 1] ?? "NULL"}` : ""}`
          : `${val} silindi · liste artık boş`,
        activeLine:   24,
      });

    /* ── SEARCH ── */
    } else if (op.op === "search") {
      const { val } = op;
      stats.searches++;

      if (nodes.length === 0) {
        add({
          phase:   "error",
          isError: true,
          description: `SEARCH(${val}) — Liste boş!`,
          detail:      "Boş listede arama yapılamaz.",
          activeLine:  27,
        });
        continue;
      }

      let foundIdx = -1;
      for (let i = 0; i < nodes.length; i++) {
        stats.comparisons++;
        const found = nodes[i] === val;

        add({
          phase:        found ? "node_found" : "traverse_step",
          highlightIdx: i,
          prevIdx:      i > 0 ? i - 1 : -1,
          result:       found ? i : null,
          description:  found
            ? `SEARCH(${val}) = indeks ${i} — BULUNDU!`
            : `SEARCH(${val}) — düğüm[${i}]=${nodes[i]} kontrol`,
          detail:       found
            ? `Bulundu! düğüm[${i}].val = ${val}`
            : `${nodes[i]} ≠ ${val}${i < nodes.length - 1 ? `, devam... (${nodes.length - i - 1} kaldı)` : " — liste bitti"}`,
          activeLine:   found ? 30 : 28,
        });

        if (found) { foundIdx = i; break; }
      }

      if (foundIdx === -1) {
        add({
          phase:        "node_not_found",
          result:       -1,
          description:  `SEARCH(${val}) = bulunamadı`,
          detail:       `${val} listede yok · ${nodes.length} düğüm tarandı`,
          activeLine:   31,
        });
      }
    }
  }

  return steps;
}

/* ─────────────────────────────────────────────────────────
   HOOK
───────────────────────────────────────────────────────── */
export function useLinkedList() {
  const [steps,     setSteps]     = useState([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed,     setSpeed]     = useState(700);
  const timerRef                  = useRef(null);

  const settledNodes = steps.length > 0 ? steps[steps.length - 1].nodes : [];

  const current = stepIndex >= 0 && steps.length > 0 ? steps[stepIndex] : null;
  const isDone  = steps.length > 0 && stepIndex === steps.length - 1;
  const canPlay = steps.length > 0;

  useEffect(() => {
    if (!isPlaying) return;
    timerRef.current = setInterval(() => {
      setStepIndex(i => {
        if (i >= steps.length - 1) { setIsPlaying(false); return i; }
        return i + 1;
      });
    }, speed);
    return () => clearInterval(timerRef.current);
  }, [isPlaying, steps.length, speed]);

  const stepForward  = useCallback(() => setStepIndex(i => Math.min(i + 1, steps.length - 1)), [steps.length]);
  const stepBackward = useCallback(() => setStepIndex(i => Math.max(i - 1, 0)), []);

  const togglePlay = useCallback(() => {
    if (!canPlay) return;
    if (stepIndex >= steps.length - 1) { setStepIndex(0); setIsPlaying(true); }
    else setIsPlaying(p => !p);
  }, [canPlay, stepIndex, steps.length]);

  function _load(ops, fromNodes, autoPlay = false) {
    clearInterval(timerRef.current);
    setSteps(generateSteps(ops, fromNodes));
    setStepIndex(-1);
    setIsPlaying(autoPlay);
  }

  function loadPreset(ops)     { _load(ops, [], false); }
  function autoPlayPreset(ops) { _load(ops, [], true);  }

  function manualAppend(val)        { _load([{ op: "append",   val }], settledNodes, true); }
  function manualPrepend(val)       { _load([{ op: "prepend",  val }], settledNodes, true); }
  function manualInsertAt(val, idx) { _load([{ op: "insertAt", val, idx }], settledNodes, true); }
  function manualDeleteAt(idx)      { _load([{ op: "deleteAt", idx }], settledNodes, true); }
  function manualSearch(val)        { _load([{ op: "search",   val }], settledNodes, true); }

  function reset() {
    clearInterval(timerRef.current);
    setSteps([]);
    setStepIndex(-1);
    setIsPlaying(false);
  }

  return {
    current,
    settledNodes,
    stepIndex,
    totalSteps: steps.length,
    isPlaying,
    isDone,
    canPlay,
    speed, setSpeed,
    togglePlay,
    stepForward,
    stepBackward,
    loadPreset,
    autoPlayPreset,
    manualAppend,
    manualPrepend,
    manualInsertAt,
    manualDeleteAt,
    manualSearch,
    reset,
  };
}
