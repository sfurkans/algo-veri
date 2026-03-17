import { useState, useEffect, useRef, useCallback } from "react";

/* ── Ağaç düğümü ── */
function makeNode(val) { return { val, left: null, right: null }; }

function cloneTree(node) {
  if (!node) return null;
  return { val: node.val, left: cloneTree(node.left), right: cloneTree(node.right) };
}

/* ── BST silme (immutable) ── */
function bstDelete(root, val) {
  if (!root) return null;
  if (val < root.val) return { ...root, left: bstDelete(root.left, val) };
  if (val > root.val) return { ...root, right: bstDelete(root.right, val) };
  if (!root.left) return root.right;
  if (!root.right) return root.left;
  let succ = root.right;
  while (succ.left) succ = succ.left;
  return { ...root, val: succ.val, right: bstDelete(root.right, succ.val) };
}

/* ── BST ekleme (immutable) ── */
function bstInsert(root, val) {
  if (!root) return makeNode(val);
  if (val === root.val) return root;
  if (val < root.val) return { ...root, left: bstInsert(root.left, val) };
  return { ...root, right: bstInsert(root.right, val) };
}

/* ── Ağacı düz dizi olarak seri hale getir (x: inorder sırası, y: derinlik) ── */
function serializeTree(root) {
  if (!root) return [];
  const result = [];
  let xIdx = 0;
  const xMap = new Map();

  function inorderX(node) {
    if (!node) return;
    inorderX(node.left);
    xMap.set(node.val, xIdx++);
    inorderX(node.right);
  }
  inorderX(root);

  function dfs(node, depth, parentId, isLeft) {
    if (!node) return;
    result.push({ id: node.val, val: node.val, x: xMap.get(node.val), y: depth, parentId, isLeft });
    dfs(node.left,  depth + 1, node.val, true);
    dfs(node.right, depth + 1, node.val, false);
  }
  dfs(root, 0, null, null);
  return result;
}

/* ── Adım üreteci ── */
function generateSteps(operations, initialRoot = null) {
  const steps = [];
  let root = cloneTree(initialRoot);
  const stats = { inserts: 0, searches: 0, deletes: 0, comparisons: 0 };

  function snap(extra) {
    steps.push({
      nodes: serializeTree(root),
      highlightId: null,
      compareId: null,
      newId: null,
      deleteId: null,
      traversalOrder: [],
      stats: { ...stats },
      description: "",
      detail: "",
      activeLine: null,
      phase: "idle",
      ...extra,
    });
  }

  for (const op of operations) {

    /* ── INSERT ── */
    if (op.op === "insert") {
      const val = op.val;

      if (!root) {
        root = makeNode(val);
        stats.inserts++;
        snap({
          phase: "insert_done",
          newId: val,
          description: `INSERT(${val}) — Kök düğüm oluşturuldu`,
          detail: `Ağaç boştu. ${val} kök (root) düğüm oldu.`,
          activeLine: 3,
        });
        continue;
      }

      /* Tekrar kontrolü */
      let chk = root;
      let dup = false;
      while (chk) {
        if (val === chk.val) { dup = true; break; }
        chk = val < chk.val ? chk.left : chk.right;
      }
      if (dup) {
        snap({
          phase: "already_exists",
          compareId: val,
          description: `INSERT(${val}) — Zaten mevcut!`,
          detail: `BST'de tekrarlı değer eklenemez. ${val} atlandı.`,
          activeLine: 6,
        });
        continue;
      }

      /* Adım adım ekleme */
      let current = root;
      while (current) {
        stats.comparisons++;
        if (val < current.val) {
          snap({
            phase: "traverse_compare",
            compareId: current.val,
            description: `INSERT(${val}): ${val} < ${current.val} → sola git`,
            detail: `${val} küçük olduğu için sol alt ağaca iniyoruz`,
            activeLine: 8,
          });
          if (!current.left) {
            root = bstInsert(root, val);
            stats.inserts++;
            snap({
              phase: "insert_done",
              newId: val,
              description: `INSERT(${val}) — ${current.val}'in sol çocuğu oldu`,
              detail: `Sol pozisyon boştu. ${val} buraya yerleşti.`,
              activeLine: 9,
            });
            break;
          }
          current = current.left;
        } else {
          snap({
            phase: "traverse_compare",
            compareId: current.val,
            description: `INSERT(${val}): ${val} > ${current.val} → sağa git`,
            detail: `${val} büyük olduğu için sağ alt ağaca iniyoruz`,
            activeLine: 11,
          });
          if (!current.right) {
            root = bstInsert(root, val);
            stats.inserts++;
            snap({
              phase: "insert_done",
              newId: val,
              description: `INSERT(${val}) — ${current.val}'in sağ çocuğu oldu`,
              detail: `Sağ pozisyon boştu. ${val} buraya yerleşti.`,
              activeLine: 12,
            });
            break;
          }
          current = current.right;
        }
      }
    }

    /* ── SEARCH ── */
    else if (op.op === "search") {
      const val = op.val;
      stats.searches++;

      if (!root) {
        snap({ phase: "node_not_found", description: `SEARCH(${val}) — Ağaç boş`, detail: `Aranacak düğüm yok.`, activeLine: 16 });
        continue;
      }

      snap({ phase: "traverse_start", description: `SEARCH(${val}) başlıyor`, detail: `Kökten başlayarak ${val} aranıyor`, activeLine: 16 });

      let current = root;
      let found = false;
      while (current) {
        stats.comparisons++;
        if (val === current.val) {
          snap({ phase: "node_found", highlightId: val, description: `SEARCH(${val}) → BULUNDU!`, detail: `${val} düğümü ağaçta mevcut.`, activeLine: 18 });
          found = true;
          break;
        } else if (val < current.val) {
          snap({ phase: "traverse_compare", compareId: current.val, description: `SEARCH(${val}): ${val} < ${current.val} → sola git`, detail: `Sol alt ağacı kontrol et`, activeLine: 19 });
          current = current.left;
        } else {
          snap({ phase: "traverse_compare", compareId: current.val, description: `SEARCH(${val}): ${val} > ${current.val} → sağa git`, detail: `Sağ alt ağacı kontrol et`, activeLine: 20 });
          current = current.right;
        }
      }
      if (!found) {
        snap({ phase: "node_not_found", description: `SEARCH(${val}) → BULUNAMADI`, detail: `${val} bu BST'de mevcut değil.`, activeLine: 21 });
      }
    }

    /* ── INORDER ── */
    else if (op.op === "inorder") {
      if (!root) { snap({ phase: "node_not_found", description: "INORDER — Ağaç boş", detail: "Gezinilecek düğüm yok." }); continue; }
      snap({ phase: "traverse_start", traversalOrder: [], description: "INORDER başlıyor (Sol → Kök → Sağ)", detail: "BST'de inorder gezinme sıralı çıktı verir", activeLine: 24 });
      const order = [];
      function inorderFn(node) {
        if (!node) return;
        inorderFn(node.left);
        order.push(node.val);
        snap({ phase: "traverse_visit", highlightId: node.val, traversalOrder: [...order], description: `INORDER — ${node.val} ziyaret edildi`, detail: `Sıra: ${order.join(" → ")}`, activeLine: 25 });
        inorderFn(node.right);
      }
      inorderFn(root);
    }

    /* ── PREORDER ── */
    else if (op.op === "preorder") {
      if (!root) { snap({ phase: "node_not_found", description: "PREORDER — Ağaç boş", detail: "Gezinilecek düğüm yok." }); continue; }
      snap({ phase: "traverse_start", traversalOrder: [], description: "PREORDER başlıyor (Kök → Sol → Sağ)", detail: "Kök önce ziyaret edilir, ardından alt ağaçlar", activeLine: 29 });
      const order2 = [];
      function preorderFn(node) {
        if (!node) return;
        order2.push(node.val);
        snap({ phase: "traverse_visit", highlightId: node.val, traversalOrder: [...order2], description: `PREORDER — ${node.val} ziyaret edildi`, detail: `Sıra: ${order2.join(" → ")}`, activeLine: 30 });
        preorderFn(node.left);
        preorderFn(node.right);
      }
      preorderFn(root);
    }

    /* ── DELETE ── */
    else if (op.op === "delete") {
      const val = op.val;
      if (!root) {
        snap({ phase: "node_not_found", description: `DELETE(${val}) — Ağaç boş`, detail: "Silinecek düğüm yok.", activeLine: 38 });
        continue;
      }
      snap({ phase: "traverse_start", description: `DELETE(${val}) başlıyor`, detail: `Kökten başlayarak ${val} aranıyor`, activeLine: 38 });
      let cur = root;
      let found = false;
      while (cur) {
        stats.comparisons++;
        if (val === cur.val) {
          found = true;
          const hasLeft  = !!cur.left;
          const hasRight = !!cur.right;
          if (!hasLeft && !hasRight) {
            snap({ phase: "delete_leaf", deleteId: val, description: `DELETE(${val}) — Yaprak düğüm`, detail: `Çocuğu yok, doğrudan silinir.`, activeLine: 39 });
          } else if (!hasLeft || !hasRight) {
            const child = hasLeft ? cur.left : cur.right;
            snap({ phase: "delete_one_child", deleteId: val, compareId: child.val, description: `DELETE(${val}) — Tek çocuklu`, detail: `${child.val} çocuğu ile yer değiştirilir.`, activeLine: 40 });
          } else {
            let succ = cur.right;
            while (succ.left) succ = succ.left;
            snap({ phase: "delete_two_children", deleteId: val, compareId: succ.val, description: `DELETE(${val}) — İki çocuklu`, detail: `Inorder successor: ${succ.val}. ${val} yerine ${succ.val} yazılır.`, activeLine: 41 });
          }
          root = bstDelete(root, val);
          stats.deletes++;
          snap({ phase: "delete_done", description: `DELETE(${val}) tamamlandı`, detail: `Ağaç yeniden düzenlendi.`, activeLine: 42 });
          break;
        } else if (val < cur.val) {
          snap({ phase: "traverse_compare", compareId: cur.val, description: `DELETE(${val}): ${val} < ${cur.val} → sola git`, detail: `Sol alt ağacı kontrol et`, activeLine: 38 });
          cur = cur.left;
        } else {
          snap({ phase: "traverse_compare", compareId: cur.val, description: `DELETE(${val}): ${val} > ${cur.val} → sağa git`, detail: `Sağ alt ağacı kontrol et`, activeLine: 38 });
          cur = cur.right;
        }
      }
      if (!found) {
        snap({ phase: "node_not_found", description: `DELETE(${val}) → BULUNAMADI`, detail: `${val} bu BST'de mevcut değil.`, activeLine: 38 });
      }
    }

    /* ── POSTORDER ── */
    else if (op.op === "postorder") {
      if (!root) { snap({ phase: "node_not_found", description: "POSTORDER — Ağaç boş", detail: "Gezinilecek düğüm yok." }); continue; }
      snap({ phase: "traverse_start", traversalOrder: [], description: "POSTORDER başlıyor (Sol → Sağ → Kök)", detail: "Alt ağaçlar önce, kök en son ziyaret edilir", activeLine: 34 });
      const order3 = [];
      function postorderFn(node) {
        if (!node) return;
        postorderFn(node.left);
        postorderFn(node.right);
        order3.push(node.val);
        snap({ phase: "traverse_visit", highlightId: node.val, traversalOrder: [...order3], description: `POSTORDER — ${node.val} ziyaret edildi`, detail: `Sıra: ${order3.join(" → ")}`, activeLine: 35 });
      }
      postorderFn(root);
    }
  }

  return { steps, finalRoot: root };
}

/* ── Hook ── */
export function useBinaryTree() {
  const [steps,     setSteps]     = useState([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed,     setSpeed]     = useState(700);
  const timerRef    = useRef(null);
  const settledRoot = useRef(null);

  const current      = stepIndex >= 0 && steps.length > 0 ? steps[stepIndex] : null;
  const isDone       = steps.length > 0 && stepIndex === steps.length - 1;
  const canPlay      = steps.length > 0;
  const settledNodes = steps.length > 0 ? steps[steps.length - 1].nodes : [];

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
  const togglePlay   = useCallback(() => {
    if (!canPlay) return;
    if (stepIndex >= steps.length - 1) { setStepIndex(0); setIsPlaying(true); }
    else setIsPlaying(p => !p);
  }, [canPlay, stepIndex, steps.length]);

  function _load(ops, fromRoot, autoPlay = false) {
    clearInterval(timerRef.current);
    const { steps: newSteps, finalRoot } = generateSteps(ops, fromRoot);
    settledRoot.current = finalRoot;
    setSteps(newSteps);
    setStepIndex(-1);
    setIsPlaying(autoPlay);
  }

  function autoPlayPreset(ops) { _load(ops, null, true); }
  function manualInsert(val)   { _load([{ op: "insert",   val }], settledRoot.current, true); }
  function manualSearch(val)   { _load([{ op: "search",   val }], settledRoot.current, true); }
  function manualDelete(val)   { _load([{ op: "delete",    val }], settledRoot.current, true); }
  function manualInorder()     { _load([{ op: "inorder"       }], settledRoot.current, true); }
  function manualPreorder()    { _load([{ op: "preorder"      }], settledRoot.current, true); }
  function manualPostorder()   { _load([{ op: "postorder"     }], settledRoot.current, true); }

  function reset() {
    clearInterval(timerRef.current);
    settledRoot.current = null;
    setSteps([]);
    setStepIndex(-1);
    setIsPlaying(false);
  }

  return {
    current, settledNodes,
    stepIndex, totalSteps: steps.length,
    isPlaying, isDone, canPlay,
    speed, setSpeed,
    togglePlay, stepForward, stepBackward,
    autoPlayPreset,
    manualInsert, manualSearch, manualDelete,
    manualInorder, manualPreorder, manualPostorder,
    reset,
  };
}
