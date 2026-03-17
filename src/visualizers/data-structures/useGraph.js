import { useState, useRef, useCallback, useEffect } from "react";

/* ── Preset graflar ───────────────────────────────────────────────────────── */
export const GRAPH_PRESETS = {
  basit: {
    label: "Basit Graf",
    tooltip: "5 düğüm, 6 kenar — bağlantılı yönsüz graf",
    directed: false,
    nodes: [
      { id: 0, label: "A", x: 200, y: 55  },
      { id: 1, label: "B", x: 75,  y: 165 },
      { id: 2, label: "C", x: 325, y: 165 },
      { id: 3, label: "D", x: 120, y: 275 },
      { id: 4, label: "E", x: 280, y: 275 },
    ],
    edges: [
      { id: 0, from: 0, to: 1 },
      { id: 1, from: 0, to: 2 },
      { id: 2, from: 1, to: 2 },
      { id: 3, from: 1, to: 3 },
      { id: 4, from: 2, to: 4 },
      { id: 5, from: 3, to: 4 },
    ],
  },
  tam: {
    label: "Tam Graf (K₄)",
    tooltip: "Her düğüm birbirine bağlı — 6 kenar",
    directed: false,
    nodes: [
      { id: 0, label: "A", x: 200, y: 65  },
      { id: 1, label: "B", x: 90,  y: 230 },
      { id: 2, label: "C", x: 310, y: 230 },
      { id: 3, label: "D", x: 200, y: 178 },
    ],
    edges: [
      { id: 0, from: 0, to: 1 },
      { id: 1, from: 0, to: 2 },
      { id: 2, from: 0, to: 3 },
      { id: 3, from: 1, to: 2 },
      { id: 4, from: 1, to: 3 },
      { id: 5, from: 2, to: 3 },
    ],
  },
  yonlu: {
    label: "Yönlü Graf (DAG)",
    tooltip: "Görev bağımlılıkları — yönlü asiklik graf",
    directed: true,
    nodes: [
      { id: 0, label: "A", x: 200, y: 55  },
      { id: 1, label: "B", x: 80,  y: 165 },
      { id: 2, label: "C", x: 320, y: 165 },
      { id: 3, label: "D", x: 130, y: 275 },
      { id: 4, label: "E", x: 270, y: 275 },
    ],
    edges: [
      { id: 0, from: 0, to: 1 },
      { id: 1, from: 0, to: 2 },
      { id: 2, from: 1, to: 3 },
      { id: 3, from: 2, to: 4 },
      { id: 4, from: 1, to: 4 },
      { id: 5, from: 3, to: 4 },
    ],
  },
};

/* ── Yardımcı fonksiyonlar ────────────────────────────────────────────────── */
const NODE_LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function getNextLabel(nodes) {
  const used = new Set(nodes.map((n) => n.label));
  for (const l of NODE_LABELS) {
    if (!used.has(l)) return l;
  }
  return "?";
}

/* Bir noktanın doğru parçasına minimum uzaklığı */
function pointToSegmentDist(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  return Math.sqrt((px - (x1 + t * dx)) ** 2 + (py - (y1 + t * dy)) ** 2);
}

const MIN_NODE_GAP = 54; // iki node merkezi arası minimum mesafe (2 × yarıçap + boşluk)

function getNewNodePos(nodes, edges) {
  const margin = 36;
  const W = 400, H = 310;

  if (nodes.length === 0) return { x: 200, y: 155 };

  const step    = 28;
  let bestPos   = { x: 200, y: 155 };
  let bestScore = 0;

  for (let x = margin; x <= W - margin; x += step) {
    for (let y = margin; y <= H - margin; y += step) {
      const minNodeDist = Math.min(
        ...nodes.map((n) => Math.sqrt((n.x - x) ** 2 + (n.y - y) ** 2))
      );

      // Herhangi bir node ile çakışıyorsa atla
      if (minNodeDist < MIN_NODE_GAP) continue;

      let minEdgeDist = Infinity;
      for (const edge of edges) {
        const from = nodes.find((n) => n.id === edge.from);
        const to   = nodes.find((n) => n.id === edge.to);
        if (!from || !to) continue;
        const d = pointToSegmentDist(x, y, from.x, from.y, to.x, to.y);
        if (d < minEdgeDist) minEdgeDist = d;
      }

      const score = Math.min(minNodeDist, minEdgeDist);
      if (score > bestScore) {
        bestScore = score;
        bestPos   = { x, y };
      }
    }
  }

  return bestPos;
}

/* ── Adjacency List ───────────────────────────────────────────────────────── */
export function buildAdjacencyList(nodes, edges, directed) {
  const list = {};
  nodes.forEach((n) => { list[n.id] = []; });
  edges.forEach((e) => {
    if (list[e.from] !== undefined) list[e.from].push(e.to);
    if (!directed && list[e.to] !== undefined) list[e.to].push(e.from);
  });
  return list;
}

/* ── Adjacency Matrix ─────────────────────────────────────────────────────── */
export function buildAdjacencyMatrix(nodes, edges, directed) {
  const idxMap = {};
  nodes.forEach((n, i) => { idxMap[n.id] = i; });
  const size = nodes.length;
  const mat = Array.from({ length: size }, () => Array(size).fill(0));
  edges.forEach((e) => {
    const fi = idxMap[e.from];
    const ti = idxMap[e.to];
    if (fi !== undefined && ti !== undefined) {
      mat[fi][ti] = 1;
      if (!directed) mat[ti][fi] = 1;
    }
  });
  return mat;
}

/* ── Ana hook ─────────────────────────────────────────────────────────────── */
export function useGraph() {
  const nodeIdRef = useRef(100);
  const edgeIdRef = useRef(100);

  const [activePreset, setActivePreset]     = useState("basit");
  const [nodes, setNodes]                   = useState(() => GRAPH_PRESETS.basit.nodes.map((n) => ({ ...n })));
  const [edges, setEdges]                   = useState(() => GRAPH_PRESETS.basit.edges.map((e) => ({ ...e })));
  const [directed, setDirected]             = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [highlightId, setHighlightId]       = useState(null); // "n{id}" | "e{id}"
  const [edgeMode, setEdgeMode]             = useState(false); // false | "from" | "to"
  const [edgeFrom, setEdgeFrom]             = useState(null);
  const [lastOp, setLastOp]                 = useState({ type: "idle" });

  /* Yeni eklenen öğeyi 2 sn sonra highlight'tan çıkar */
  useEffect(() => {
    if (!highlightId) return;
    const t = setTimeout(() => setHighlightId(null), 2000);
    return () => clearTimeout(t);
  }, [highlightId]);

  const adjList   = buildAdjacencyList(nodes, edges, directed);
  const adjMatrix = buildAdjacencyMatrix(nodes, edges, directed);

  /* ── Preset yükleme ─────────────────────────────────────────────────────── */
  const loadPreset = useCallback((key) => {
    const p = GRAPH_PRESETS[key];
    if (!p) return;
    setActivePreset(key);
    setNodes(p.nodes.map((n) => ({ ...n })));
    setEdges(p.edges.map((e) => ({ ...e })));
    setDirected(p.directed);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setHighlightId(null);
    setEdgeMode(false);
    setEdgeFrom(null);
    setLastOp({ type: "idle" });
  }, []);

  /* ── Düğüm tıklama ──────────────────────────────────────────────────────── */
  const handleNodeClick = useCallback((nodeId) => {
    /* Kenar ekleme modu — kaynak seçimi */
    if (edgeMode === "from") {
      const node = nodes.find((n) => n.id === nodeId);
      setEdgeFrom(nodeId);
      setEdgeMode("to");
      setLastOp({ type: "edgeFrom", description: `"${node?.label}" kaynak seçildi — hedef düğümü tıkla` });
      return;
    }

    /* Kenar ekleme modu — hedef seçimi */
    if (edgeMode === "to") {
      if (nodeId === edgeFrom) {
        setLastOp({ type: "error", description: "Kendine kenar eklenemez!" });
        return;
      }
      const exists = edges.some(
        (e) =>
          (e.from === edgeFrom && e.to === nodeId) ||
          (!directed && e.from === nodeId && e.to === edgeFrom)
      );
      if (exists) {
        setLastOp({ type: "error", description: "Bu kenar zaten mevcut!" });
        setEdgeMode(false);
        setEdgeFrom(null);
        return;
      }
      const fromNode = nodes.find((n) => n.id === edgeFrom);
      const toNode   = nodes.find((n) => n.id === nodeId);
      const newId    = ++edgeIdRef.current;
      setEdges((prev) => [...prev, { id: newId, from: edgeFrom, to: nodeId }]);
      setHighlightId(`e${newId}`);
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setLastOp({
        type: "addEdge",
        description: `Kenar eklendi: "${fromNode?.label}" ${directed ? "→" : "—"} "${toNode?.label}"`,
      });
      setEdgeMode(false);
      setEdgeFrom(null);
      return;
    }

    /* Normal mod — düğüm seç / seçimi kaldır */
    setSelectedEdgeId(null);
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
      setLastOp({ type: "idle" });
      return;
    }
    setSelectedNodeId(nodeId);
    const node         = nodes.find((n) => n.id === nodeId);
    const connEdges    = edges.filter((e) => e.from === nodeId || e.to === nodeId);
    const neighborIds  = new Set();
    connEdges.forEach((e) => {
      if (e.from === nodeId) neighborIds.add(e.to);
      if (e.to   === nodeId) neighborIds.add(e.from);
    });
    const neighborLabels = nodes.filter((n) => neighborIds.has(n.id)).map((n) => n.label);
    const degreeStr = directed
      ? `giriş: ${edges.filter((e) => e.to === nodeId).length}, çıkış: ${edges.filter((e) => e.from === nodeId).length}`
      : `derece: ${connEdges.length}`;
    setLastOp({
      type: "selectNode",
      description: `"${node?.label}" — ${degreeStr}${neighborLabels.length ? ` | komşular: ${neighborLabels.join(", ")}` : " | komşu yok"}`,
    });
  }, [edgeMode, edgeFrom, edges, nodes, directed, selectedNodeId]);

  /* ── Kenar tıklama ──────────────────────────────────────────────────────── */
  const handleEdgeClick = useCallback((edgeId) => {
    if (edgeMode !== false) return;
    setSelectedNodeId(null);
    if (selectedEdgeId === edgeId) {
      setSelectedEdgeId(null);
      setLastOp({ type: "idle" });
      return;
    }
    setSelectedEdgeId(edgeId);
    const edge     = edges.find((e) => e.id === edgeId);
    const fromNode = nodes.find((n) => n.id === edge?.from);
    const toNode   = nodes.find((n) => n.id === edge?.to);
    setLastOp({
      type: "selectEdge",
      description: `Kenar seçildi: "${fromNode?.label}" ${directed ? "→" : "—"} "${toNode?.label}" | Sil butonuyla kaldırabilirsin`,
    });
  }, [edgeMode, selectedEdgeId, edges, nodes, directed]);

  /* ── Düğüm ekle ─────────────────────────────────────────────────────────── */
  const addNode = useCallback(() => {
    if (nodes.length >= 15) {
      setLastOp({ type: "error", description: "Maksimum 15 düğüm eklenebilir!" });
      return;
    }
    const label = getNextLabel(nodes);
    const pos   = getNewNodePos(nodes, edges);
    const newId = ++nodeIdRef.current;
    setNodes((prev) => [...prev, { id: newId, label, ...pos }]);
    setHighlightId(`n${newId}`);
    setSelectedNodeId(newId);
    setSelectedEdgeId(null);
    setEdgeMode(false);
    setEdgeFrom(null);
    setLastOp({ type: "addNode", description: `Düğüm "${label}" eklendi` });
  }, [nodes, edges]);

  /* ── Kenar ekleme modunu başlat ─────────────────────────────────────────── */
  const startEdgeMode = useCallback(() => {
    setEdgeMode("from");
    setEdgeFrom(null);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setLastOp({ type: "edgeMode", description: "Kenar ekle — kaynak düğümü tıkla" });
  }, []);

  /* ── Modu iptal et ──────────────────────────────────────────────────────── */
  const cancelMode = useCallback(() => {
    setEdgeMode(false);
    setEdgeFrom(null);
    setLastOp({ type: "idle" });
  }, []);

  /* ── Seçiliyi sil ───────────────────────────────────────────────────────── */
  const removeSelected = useCallback(() => {
    if (selectedEdgeId !== null) {
      const edge     = edges.find((e) => e.id === selectedEdgeId);
      const fromNode = nodes.find((n) => n.id === edge?.from);
      const toNode   = nodes.find((n) => n.id === edge?.to);
      setEdges((prev) => prev.filter((e) => e.id !== selectedEdgeId));
      setSelectedEdgeId(null);
      setLastOp({
        type: "removeEdge",
        description: `Kenar silindi: "${fromNode?.label}" ${directed ? "→" : "—"} "${toNode?.label}"`,
      });
      return;
    }
    if (selectedNodeId !== null) {
      const node         = nodes.find((n) => n.id === selectedNodeId);
      const removedCount = edges.filter((e) => e.from === selectedNodeId || e.to === selectedNodeId).length;
      setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId));
      setEdges((prev) => prev.filter((e) => e.from !== selectedNodeId && e.to !== selectedNodeId));
      setSelectedNodeId(null);
      setLastOp({
        type: "removeNode",
        description: `"${node?.label}" silindi — ${removedCount} kenar da kaldırıldı`,
      });
      return;
    }
    setLastOp({ type: "error", description: "Silmek için önce bir düğüm veya kenar seç!" });
  }, [selectedEdgeId, selectedNodeId, edges, nodes, directed]);

  /* ── Yönlü/Yönsüz geçiş ────────────────────────────────────────────────── */
  const toggleDirected = useCallback(() => {
    setDirected((prev) => {
      const next = !prev;
      setLastOp({
        type: "toggleDirected",
        description: next
          ? "Yönlü mod aktif — kenarlar artık tek yönlü"
          : "Yönsüz mod aktif — kenarlar çift yönlü",
      });
      return next;
    });
  }, []);

  return {
    nodes,
    edges,
    directed,
    selectedNodeId,
    selectedEdgeId,
    highlightId,
    edgeMode,
    edgeFrom,
    lastOp,
    adjList,
    adjMatrix,
    activePreset,
    loadPreset,
    handleNodeClick,
    handleEdgeClick,
    addNode,
    startEdgeMode,
    cancelMode,
    removeSelected,
    toggleDirected,
  };
}
