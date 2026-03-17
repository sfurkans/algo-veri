import { useState, useEffect, useCallback, useRef } from "react";

export const DIJKSTRA_PRESETS = {
  /*
   * Temel — 7 düğüm
   * Açgözlü seçimin neden her zaman doğru olduğunu gösterir.
   * A→C→B (6) doğrudan A→B (4+?) gibi yanıltıcı görünebilir;
   * birden fazla eşit mesafeli düğüm ve relaxation dalgaları vardır.
   *
   * Doğru en kısa mesafeler (A'dan):
   *   A=0  B=4  C=2  D=8  E=5  F=5  G=4
   */
  temel: {
    label: "Temel",
    tooltip: "7 düğüm — relaxation dalgalarını izle",
    nodes: [
      { id: 0, label: "A", x: 220, y: 48  },
      { id: 1, label: "B", x: 80,  y: 155 },
      { id: 2, label: "C", x: 360, y: 155 },
      { id: 3, label: "D", x: 35,  y: 300 },
      { id: 4, label: "E", x: 180, y: 300 },
      { id: 5, label: "F", x: 260, y: 300 },
      { id: 6, label: "G", x: 405, y: 300 },
    ],
    edges: [
      { id: 0, from: 0, to: 1, weight: 4 },
      { id: 1, from: 0, to: 2, weight: 2 },
      { id: 2, from: 1, to: 3, weight: 5 },
      { id: 3, from: 1, to: 4, weight: 1 },
      { id: 4, from: 2, to: 4, weight: 8 },
      { id: 5, from: 2, to: 5, weight: 3 },
      { id: 6, from: 2, to: 6, weight: 2 },
      { id: 7, from: 3, to: 4, weight: 3 },
      { id: 8, from: 4, to: 5, weight: 2 },
      { id: 9, from: 5, to: 6, weight: 1 },
    ],
    defaultStart: 0,
  },

  /*
   * Şehir Haritası — 8 düğüm
   * Şehir yol ağı; birden fazla rekabetçi yol mevcut.
   * H'ye ulaşmak için iki eşit maliyetli yol var (tie).
   *
   * Doğru en kısa mesafeler (A'dan):
   *   A=0  B=3  C=7  D=5  E=5  F=6  G=8  H=8
   */
  sehir: {
    label: "Şehir Haritası",
    tooltip: "8 düğüm — birden fazla rekabetçi yol",
    nodes: [
      { id: 0, label: "A", x: 80,  y: 55  },
      { id: 1, label: "B", x: 225, y: 55  },
      { id: 2, label: "C", x: 375, y: 55  },
      { id: 3, label: "D", x: 50,  y: 195 },
      { id: 4, label: "E", x: 205, y: 190 },
      { id: 5, label: "F", x: 360, y: 195 },
      { id: 6, label: "G", x: 120, y: 330 },
      { id: 7, label: "H", x: 295, y: 330 },
    ],
    edges: [
      { id: 0,  from: 0, to: 1, weight: 3 },
      { id: 1,  from: 0, to: 3, weight: 5 },
      { id: 2,  from: 1, to: 2, weight: 4 },
      { id: 3,  from: 1, to: 4, weight: 2 },
      { id: 4,  from: 2, to: 5, weight: 3 },
      { id: 5,  from: 3, to: 4, weight: 4 },
      { id: 6,  from: 3, to: 6, weight: 6 },
      { id: 7,  from: 4, to: 5, weight: 1 },
      { id: 8,  from: 4, to: 6, weight: 3 },
      { id: 9,  from: 4, to: 7, weight: 5 },
      { id: 10, from: 5, to: 7, weight: 2 },
      { id: 11, from: 6, to: 7, weight: 4 },
    ],
    defaultStart: 0,
  },

  /*
   * Ağırlıklı Izgara — 9 düğüm (3×3)
   * Sezgiye aykırı: A→B→E→F→C (6) doğrudan A→B→C'den (7) kısa.
   *
   * Doğru en kısa mesafeler (A'dan):
   *   A=0  B=1  C=6  D=4  E=4  F=5  G=5  H=6  I=8
   */
  izgara: {
    label: "Ağırlıklı Izgara",
    tooltip: "9 düğüm (3×3) — sezgiye aykırı en kısa yollar",
    nodes: [
      { id: 0, label: "A", x: 80,  y: 78  },
      { id: 1, label: "B", x: 220, y: 78  },
      { id: 2, label: "C", x: 360, y: 78  },
      { id: 3, label: "D", x: 80,  y: 198 },
      { id: 4, label: "E", x: 220, y: 198 },
      { id: 5, label: "F", x: 360, y: 198 },
      { id: 6, label: "G", x: 80,  y: 315 },
      { id: 7, label: "H", x: 220, y: 315 },
      { id: 8, label: "I", x: 360, y: 315 },
    ],
    edges: [
      { id: 0,  from: 0, to: 1, weight: 1 },
      { id: 1,  from: 1, to: 2, weight: 6 },
      { id: 2,  from: 3, to: 4, weight: 2 },
      { id: 3,  from: 4, to: 5, weight: 1 },
      { id: 4,  from: 6, to: 7, weight: 3 },
      { id: 5,  from: 7, to: 8, weight: 2 },
      { id: 6,  from: 0, to: 3, weight: 4 },
      { id: 7,  from: 3, to: 6, weight: 1 },
      { id: 8,  from: 1, to: 4, weight: 3 },
      { id: 9,  from: 4, to: 7, weight: 2 },
      { id: 10, from: 2, to: 5, weight: 1 },
      { id: 11, from: 5, to: 8, weight: 4 },
    ],
    defaultStart: 0,
  },
};

const INF = Infinity;

function reconstructPath(targetId, prev, nodeMap) {
  const path = [];
  let cur = targetId;
  let guard = 0;
  while (cur !== null && cur !== undefined && guard < 50) {
    path.unshift(nodeMap[cur]?.label ?? "?");
    cur = prev[cur];
    guard++;
  }
  return path.join(" → ");
}

function generateSteps(nodes, edges, startId) {
  const steps = [];
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  const adj = Object.fromEntries(nodes.map((n) => [n.id, []]));
  edges.forEach((e) => {
    adj[e.from].push({ neighborId: e.to,   edgeId: e.id, weight: e.weight });
    adj[e.to  ].push({ neighborId: e.from, edgeId: e.id, weight: e.weight });
  });
  Object.values(adj).forEach((list) =>
    list.sort((a, b) =>
      (nodeMap[a.neighborId]?.label ?? "").localeCompare(nodeMap[b.neighborId]?.label ?? "")
    )
  );

  const distances  = Object.fromEntries(nodes.map((n) => [n.id, INF]));
  const prev       = Object.fromEntries(nodes.map((n) => [n.id, null]));
  const nodeStates = Object.fromEntries(nodes.map((n) => [n.id, "unvisited"]));
  const edgeStates = Object.fromEntries(edges.map((e) => [e.id, "default"]));
  const settled    = new Set();
  const unvisited  = new Set(nodes.map((n) => n.id));

  let activeNodeId  = null;
  let checkNeighbor = null;

  function label(id)   { return nodeMap[id]?.label ?? "?"; }
  function dStr(id)    { return distances[id] === INF ? "∞" : String(distances[id]); }

  function snap(description, detail, activeLine) {
    steps.push({
      nodeStates:   { ...nodeStates },
      edgeStates:   { ...edgeStates },
      distances:    { ...distances  },
      prev:         { ...prev       },
      settled:      [...settled     ],
      activeNodeId,
      checkNeighbor,
      description,
      detail,
      activeLine,
    });
  }

  // ── Başlatma ──────────────────────────────────────────────────
  snap("Tüm mesafeler sonsuz olarak başlatıldı", "dist[v] ← ∞  for v ∈ V", 0);

  distances[startId]  = 0;
  nodeStates[startId] = "updated";
  activeNodeId        = startId;
  snap(
    `"${label(startId)}" başlangıç — mesafe: 0`,
    `dist[${label(startId)}] ← 0`,
    1
  );

  // ── Ana döngü ─────────────────────────────────────────────────
  while (unvisited.size > 0) {
    let u = null, minDist = INF;
    for (const id of unvisited) {
      if (distances[id] < minDist) { minDist = distances[id]; u = id; }
    }
    if (u === null) break;

    activeNodeId    = u;
    nodeStates[u]   = "current";
    snap(
      `"${label(u)}" seçildi — mesafe: ${distances[u]}`,
      "İşlenmemişler arasından en küçük mesafeli düğüm",
      2
    );

    unvisited.delete(u);

    for (const { neighborId, edgeId, weight } of adj[u]) {
      if (settled.has(neighborId)) continue;

      checkNeighbor = neighborId;
      const oldDist = distances[neighborId];
      const newDist = distances[u] + weight;

      edgeStates[edgeId] = "checking";
      snap(
        `"${label(u)}" → "${label(neighborId)}"  (ağırlık: ${weight})`,
        `${distances[u]} + ${weight} = ${newDist}   ←→   mevcut: ${dStr(neighborId)}`,
        4
      );

      if (newDist < oldDist) {
        distances[neighborId] = newDist;
        prev[neighborId]      = u;
        edgeStates[edgeId]    = "relaxed";
        if (nodeStates[neighborId] !== "settled") nodeStates[neighborId] = "updated";
        const oldStr = oldDist === INF ? "∞" : String(oldDist);
        snap(
          `"${label(neighborId)}" güncellendi → ${newDist}`,
          `${newDist} < ${oldStr}  →  dist[${label(neighborId)}] ← ${newDist}`,
          5
        );
      } else {
        if (edgeStates[edgeId] !== "relaxed") edgeStates[edgeId] = "cross";
        snap(
          `"${label(neighborId)}" güncellenmedi`,
          `${newDist} ≥ ${dStr(neighborId)} — mevcut yol daha kısa`,
          6
        );
      }
    }

    checkNeighbor = null;
    settled.add(u);
    nodeStates[u] = "settled";
    const pathStr = reconstructPath(u, prev, nodeMap);
    snap(
      `"${label(u)}" kesinleşti — en kısa mesafe: ${distances[u]}`,
      `Yol: ${pathStr}`,
      3
    );
  }

  // ── En kısa yol ağacını vurgula ───────────────────────────────
  for (const [nodeIdStr, prevId] of Object.entries(prev)) {
    if (prevId === null) continue;
    const nodeId = Number(nodeIdStr);
    const edge = edges.find(
      (e) =>
        (e.from === nodeId && e.to === prevId) ||
        (e.to === nodeId && e.from === prevId)
    );
    if (edge) edgeStates[edge.id] = "shortest";
  }

  activeNodeId = null;
  const summary = nodes.map((n) => `${label(n.id)}: ${dStr(n.id)}`).join("  ·  ");
  snap("Dijkstra tamamlandı!", summary, 7);

  return steps;
}

export function useDijkstra() {
  const [activePreset, setActivePreset] = useState("temel");
  const [nodes, setNodes]               = useState(DIJKSTRA_PRESETS.temel.nodes);
  const [edges, setEdges]               = useState(DIJKSTRA_PRESETS.temel.edges);
  const [startNodeId, setStartNodeId]   = useState(DIJKSTRA_PRESETS.temel.defaultStart);
  const [steps, setSteps]               = useState([]);
  const [stepIndex, setStepIndex]       = useState(0);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [speed, setSpeed]               = useState(600);
  const intervalRef                     = useRef(null);

  useEffect(() => {
    const s = generateSteps(nodes, edges, startNodeId);
    setSteps(s);
    setStepIndex(0);
    setIsPlaying(false);
  }, [nodes, edges, startNodeId]);

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

  const togglePlay   = useCallback(() => {
    if (isDone) { setStepIndex(0); setIsPlaying(true); }
    else setIsPlaying((v) => !v);
  }, [isDone]);

  const stepForward  = useCallback(() => { setIsPlaying(false); setStepIndex((p) => Math.min(p + 1, totalSteps - 1)); }, [totalSteps]);
  const stepBackward = useCallback(() => { setIsPlaying(false); setStepIndex((p) => Math.max(p - 1, 0)); }, []);

  const loadPreset = useCallback((key) => {
    const p = DIJKSTRA_PRESETS[key];
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
