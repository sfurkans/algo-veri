import { useState, useEffect, useCallback, useRef } from "react";

/* ── Preset graflar ───────────────────────────────────────────────────────── */
export const DFS_PRESETS = {
  agac: {
    label: "Ağaç Benzeri",
    tooltip: "DFS derine inerek ilerler — BFS ile kıyasla",
    nodes: [
      { id: 0, label: "A", x: 200, y: 45  },
      { id: 1, label: "B", x: 90,  y: 145 },
      { id: 2, label: "C", x: 310, y: 145 },
      { id: 3, label: "D", x: 35,  y: 255 },
      { id: 4, label: "E", x: 150, y: 255 },
      { id: 5, label: "F", x: 250, y: 255 },
      { id: 6, label: "G", x: 365, y: 255 },
    ],
    edges: [
      { id: 0, from: 0, to: 1 },
      { id: 1, from: 0, to: 2 },
      { id: 2, from: 1, to: 3 },
      { id: 3, from: 1, to: 4 },
      { id: 4, from: 2, to: 5 },
      { id: 5, from: 2, to: 6 },
    ],
    defaultStart: 0,
  },
  dongusel: {
    label: "Döngülü Graf",
    tooltip: "Geri kenarlar — DFS döngü tespitinde güçlüdür",
    nodes: [
      { id: 0, label: "A", x: 200, y: 45  },
      { id: 1, label: "B", x: 75,  y: 155 },
      { id: 2, label: "C", x: 325, y: 155 },
      { id: 3, label: "D", x: 75,  y: 265 },
      { id: 4, label: "E", x: 200, y: 265 },
      { id: 5, label: "F", x: 325, y: 265 },
    ],
    edges: [
      { id: 0, from: 0, to: 1 },
      { id: 1, from: 0, to: 2 },
      { id: 2, from: 1, to: 3 },
      { id: 3, from: 1, to: 4 },
      { id: 4, from: 2, to: 4 },
      { id: 5, from: 2, to: 5 },
      { id: 6, from: 3, to: 4 },
      { id: 7, from: 4, to: 5 },
    ],
    defaultStart: 0,
  },
  izgara: {
    label: "Izgara Graf",
    tooltip: "Izgara üzerinde DFS — BFS'ten farklı yol izler",
    nodes: [
      { id: 0, label: "A", x: 80,  y: 90  },
      { id: 1, label: "B", x: 200, y: 90  },
      { id: 2, label: "C", x: 320, y: 90  },
      { id: 3, label: "D", x: 80,  y: 220 },
      { id: 4, label: "E", x: 200, y: 220 },
      { id: 5, label: "F", x: 320, y: 220 },
    ],
    edges: [
      { id: 0, from: 0, to: 1 },
      { id: 1, from: 1, to: 2 },
      { id: 2, from: 3, to: 4 },
      { id: 3, from: 4, to: 5 },
      { id: 4, from: 0, to: 3 },
      { id: 5, from: 1, to: 4 },
      { id: 6, from: 2, to: 5 },
    ],
    defaultStart: 0,
  },
};

/* ── DFS Adım Üreteci ─────────────────────────────────────────────────────── */
function generateSteps(nodes, edges, startId) {
  const steps = [];
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  // Komşuluk listesi (label sırasıyla sıralı)
  const adj = Object.fromEntries(nodes.map((n) => [n.id, []]));
  edges.forEach((e) => {
    adj[e.from].push({ neighborId: e.to, edgeId: e.id });
    adj[e.to].push({ neighborId: e.from, edgeId: e.id });
  });
  Object.values(adj).forEach((list) =>
    list.sort((a, b) =>
      (nodeMap[a.neighborId]?.label ?? "").localeCompare(nodeMap[b.neighborId]?.label ?? "")
    )
  );

  const nodeStates  = Object.fromEntries(nodes.map((n) => [n.id, "unvisited"]));
  const edgeStates  = Object.fromEntries(edges.map((e) => [e.id, "default"]));
  let stack         = [];
  let visitOrder    = [];
  let activeNodeId  = null;
  let checkNeighbor = null;

  function label(id) { return nodeMap[id]?.label ?? "?"; }
  function stackStr() {
    return stack.length ? `[${stack.map(label).join(", ")}]` : "[ boş ]";
  }

  function snap(description, detail, activeLine) {
    steps.push({
      nodeStates:   { ...nodeStates },
      edgeStates:   { ...edgeStates },
      stack:        [...stack],
      visitOrder:   [...visitOrder],
      activeNodeId,
      checkNeighbor,
      description,
      detail,
      activeLine,
    });
  }

  // Başlangıç
  snap("Başlangıç düğümü seçildi", `"${label(startId)}" başlangıç noktası`, 0);

  nodeStates[startId] = "stacked";
  stack.push(startId);
  activeNodeId = startId;
  snap(
    `"${label(startId)}" yığına eklendi`,
    `Yığın: ${stackStr()}`,
    1
  );

  while (stack.length > 0) {
    const curId = stack.pop();
    activeNodeId = curId;
    nodeStates[curId] = "visiting";
    snap(
      `"${label(curId)}" yığından çıkarıldı`,
      `Yığın: ${stackStr()} | Komşular incelenecek`,
      3
    );

    // Komşuları ters sırada dolaş: en küçük label en üstte kalır → recursive DFS sırasıyla aynı
    const neighbors = [...adj[curId]].reverse();

    for (const { neighborId, edgeId } of neighbors) {
      checkNeighbor = neighborId;

      if (nodeStates[neighborId] === "unvisited") {
        edgeStates[edgeId] = "checking";
        snap(
          `"${label(neighborId)}" komşusu kontrol ediliyor`,
          "Henüz ziyaret edilmemiş — yığına eklenecek",
          5
        );
        nodeStates[neighborId] = "stacked";
        edgeStates[edgeId]     = "tree";
        stack.push(neighborId);
        snap(
          `"${label(neighborId)}" yığına eklendi`,
          `Yığın: ${stackStr()}`,
          6
        );
      } else {
        if (edgeStates[edgeId] === "default") edgeStates[edgeId] = "back";
        const skipMsg =
          nodeStates[neighborId] === "stacked"
            ? `"${label(neighborId)}" zaten yığında`
            : `"${label(neighborId)}" zaten ziyaret edildi`;
        snap(skipMsg, "Bu komşu atlanıyor", 8);
      }
    }

    checkNeighbor = null;
    nodeStates[curId] = "visited";
    visitOrder.push(curId);
    snap(
      `"${label(curId)}" ziyaret tamamlandı`,
      `Ziyaret sırası: ${visitOrder.map(label).join(" → ")}`,
      4
    );
  }

  activeNodeId = null;
  snap(
    "DFS tamamlandı!",
    `Toplam ${visitOrder.length} düğüm ziyaret edildi: ${visitOrder.map(label).join(" → ")}`,
    null
  );

  return steps;
}

/* ── Ana hook ─────────────────────────────────────────────────────────────── */
export function useDFS() {
  const [activePreset, setActivePreset] = useState("agac");
  const [nodes, setNodes]               = useState(DFS_PRESETS.agac.nodes);
  const [edges, setEdges]               = useState(DFS_PRESETS.agac.edges);
  const [startNodeId, setStartNodeId]   = useState(DFS_PRESETS.agac.defaultStart);
  const [steps, setSteps]               = useState([]);
  const [stepIndex, setStepIndex]       = useState(0);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [speed, setSpeed]               = useState(600);
  const intervalRef                     = useRef(null);

  // Adımları yeniden üret
  useEffect(() => {
    const s = generateSteps(nodes, edges, startNodeId);
    setSteps(s);
    setStepIndex(0);
    setIsPlaying(false);
  }, [nodes, edges, startNodeId]);

  const current    = steps[stepIndex] ?? null;
  const totalSteps = steps.length;
  const isDone     = stepIndex >= totalSteps - 1;

  // Otomatik oynatma
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

  const togglePlay = useCallback(() => {
    if (isDone) {
      setStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((v) => !v);
    }
  }, [isDone]);

  const stepForward  = useCallback(() => { setIsPlaying(false); setStepIndex((p) => Math.min(p + 1, totalSteps - 1)); }, [totalSteps]);
  const stepBackward = useCallback(() => { setIsPlaying(false); setStepIndex((p) => Math.max(p - 1, 0)); }, []);

  const loadPreset = useCallback((key) => {
    const p = DFS_PRESETS[key];
    if (!p) return;
    setActivePreset(key);
    setNodes(p.nodes);
    setEdges(p.edges);
    setStartNodeId(p.defaultStart);
  }, []);

  const changeStart = useCallback((nodeId) => {
    if (isPlaying) return;
    setStartNodeId(nodeId);
  }, [isPlaying]);

  return {
    nodes, edges,
    current, stepIndex, totalSteps, isDone,
    isPlaying, speed, setSpeed,
    activePreset, loadPreset,
    startNodeId, changeStart,
    togglePlay, stepForward, stepBackward,
  };
}
