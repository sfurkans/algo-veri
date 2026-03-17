import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

/* ── Step generators ─────────────────────────────────────────── */
const HERO_ARRAY = [55, 30, 80, 20, 65, 40, 90, 15, 70, 45];

function generateBubbleSteps(arr) {
  const steps = [], a = [...arr], n = a.length;
  const done = new Set();
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      steps.push({ array: [...a], cmp: [j, j + 1], done: [...done] });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({ array: [...a], cmp: [j, j + 1], done: [...done] });
      }
    }
    done.add(n - 1 - i);
  }
  done.add(0);
  steps.push({ array: [...a], cmp: [], done: [...done] });
  return steps;
}


function generateInsertionSteps(arr) {
  const steps = [], a = [...arr], n = a.length;
  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;
    steps.push({ array: [...a], keyIdx: i, shifting: [] });
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j]; j--;
      steps.push({ array: [...a], keyIdx: j + 1, shifting: [j + 1] });
    }
    a[j + 1] = key;
    steps.push({ array: [...a], keyIdx: j + 1, shifting: [] });
  }
  steps.push({ array: [...a], keyIdx: -1, shifting: [] });
  return steps;
}

/* Binary Search: her çağrıda farklı sıralı dizi + hedef */
function generateBinarySearchSteps() {
  // 7 benzersiz rastgele sayı üret, sırala
  const pool = new Set();
  while (pool.size < 9) pool.add(Math.floor(Math.random() * 90) + 10);
  const a = [...pool].sort((x, y) => x - y);
  // hedef her zaman dizide olan bir eleman
  const target = a[Math.floor(Math.random() * a.length)];
  const steps = [], elim = new Set();
  let left = 0, right = a.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    for (let k = 0; k < 4; k++) steps.push({ a, target, left, right, mid, found: -1, elim: [...elim] });
    if (a[mid] === target) {
      for (let k = 0; k < 5; k++) steps.push({ a, target, left, right, mid, found: mid, elim: [...elim] });
      break;
    } else if (a[mid] < target) {
      for (let i = left; i <= mid; i++) elim.add(i);
      left = mid + 1;
    } else {
      for (let i = mid; i <= right; i++) elim.add(i);
      right = mid - 1;
    }
  }
  return steps;
}

/* Binary Tree: 7 düğümlü BST, inorder traversal */
const BT_NODES = [
  { val: 50, x: 80,  y: 12,  parent: null },
  { val: 25, x: 40,  y: 42,  parent: 0    },
  { val: 75, x: 120, y: 42,  parent: 0    },
  { val: 12, x: 20,  y: 72,  parent: 1    },
  { val: 38, x: 60,  y: 72,  parent: 1    },
  { val: 62, x: 100, y: 72,  parent: 2    },
  { val: 88, x: 140, y: 72,  parent: 2    },
];
const BT_INORDER = [3, 1, 4, 0, 5, 2, 6]; // inorder sırası (index)
function generateBinaryTreeSteps() {
  const steps = [];
  for (let i = 0; i <= BT_INORDER.length; i++) {
    const visited = BT_INORDER.slice(0, i);
    const current = i < BT_INORDER.length ? BT_INORDER[i] : -1;
    for (let k = 0; k < 4; k++) steps.push({ current, visited: [...visited] });
  }
  return steps;
}

/* ── Generic mini animation hook ────────────────────────────── */
function useMiniAnime(genFn, speed = 90) {
  const [state, setState] = useState(() => genFn()[0]);
  useEffect(() => {
    let timer, steps = genFn(), idx = 0;
    function tick() {
      if (idx >= steps.length) {
        timer = setTimeout(() => { steps = genFn(); idx = 0; timer = setTimeout(tick, 300); }, 2000);
        return;
      }
      setState(steps[idx++]);
      timer = setTimeout(tick, speed);
    }
    tick();
    return () => clearTimeout(timer);
  }, []);
  return state;
}

/* ── Generic mini card ───────────────────────────────────────── */
function MiniCard({ label, state, getBarClass, posClass }) {
  const max = Math.max(...state.array);
  return (
    <div className={`hero-mini-card ${posClass}`} aria-hidden>
      <div className="hmc-label">{label}</div>
      <div className="hero-bars">
        {state.array.map((val, i) => (
          <div key={i} className="hbar-wrap">
            <div className={`hbar ${getBarClass(state, i)}`} style={{ height: `${(val / max) * 100}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Four algorithm mini cards ───────────────────────────────── */
function BubbleMiniCard({ posClass }) {
  const s = useMiniAnime(() => generateBubbleSteps(HERO_ARRAY), 90);
  return <MiniCard label="Bubble Sort" state={s} posClass={posClass}
    getBarClass={(s, i) => s.done.includes(i) ? "hbar-done" : s.cmp.includes(i) ? "hbar-cmp" : ""} />;
}

function BinaryTreeMiniCard({ posClass }) {
  const s = useMiniAnime(() => generateBinaryTreeSteps(), 160);
  const R = 10;
  return (
    <div className={`hero-mini-card ${posClass}`} aria-hidden>
      <div className="hmc-label">Binary Tree</div>
      <svg width="160" height="90" viewBox="0 0 160 90">
        {/* Bağlantı çizgileri */}
        {BT_NODES.map((node, i) => node.parent !== null && (
          <line key={i}
            x1={node.x} y1={node.y}
            x2={BT_NODES[node.parent].x} y2={BT_NODES[node.parent].y}
            stroke="#e2e8f0" strokeWidth="1.5"
          />
        ))}
        {/* Düğümler */}
        {BT_NODES.map((node, i) => {
          const isVisited = s.visited.includes(i);
          const isCurrent = s.current === i;
          return (
            <g key={i}>
              <circle
                cx={node.x} cy={node.y} r={R}
                fill={isCurrent ? "#6366f1" : isVisited ? "#22c55e" : "#f8fafc"}
                stroke={isCurrent ? "#4f46e5" : isVisited ? "#16a34a" : "#cbd5e1"}
                strokeWidth="1.5"
                style={{ transition: "fill 0.2s, stroke 0.2s" }}
              />
              <text x={node.x} y={node.y + 4} textAnchor="middle"
                fontSize="8" fontWeight="700"
                fill={isCurrent || isVisited ? "#fff" : "#64748b"}
                style={{ transition: "fill 0.2s" }}
              >{node.val}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function InsertionMiniCard({ posClass }) {
  const s = useMiniAnime(() => generateInsertionSteps(HERO_ARRAY), 85);
  return <MiniCard label="Insertion Sort" state={s} posClass={posClass}
    getBarClass={(s, i) => i === s.keyIdx ? "hbar-cmp" : s.shifting.includes(i) ? "hbar-shifting" : ""} />;
}

function BinarySearchMiniCard({ posClass }) {
  const s = useMiniAnime(() => generateBinarySearchSteps(), 380);
  if (!s.a) return null;
  return (
    <div className={`hero-mini-card ${posClass}`} aria-hidden>
      <div className="hmc-label">Binary Search</div>
      <div className="hmc-bs-target">Hedef: <strong>{s.target}</strong></div>
      <div className="hmc-bs-row">
        {s.a.map((val, i) => {
          const isFound  = s.found === i;
          const isMid    = !isFound && s.mid === i;
          const isElim   = s.elim.includes(i);
          const isActive = !isElim && i >= s.left && i <= s.right;
          return (
            <div key={i} className={`hmc-bs-box ${isFound ? "hmc-bs-found" : isMid ? "hmc-bs-mid" : isElim ? "hmc-bs-elim" : isActive ? "hmc-bs-active" : ""}`}>
              <span>{val}</span>
              {isMid && <div className="hmc-bs-pointer">↑</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Data ─────────────────────────────────────────────────────── */
const INFO_CARDS = [
  {
    color: "indigo",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><path d="M17.5 17.5m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0"/>
        <path d="M10 6.5h4M6.5 10v4M17.5 10v3.5"/>
      </svg>
    ),
    title: "Algoritma Nedir?",
    body: "Bir problemi adım adım çözen, iyi tanımlanmış talimatlar dizisidir. Tıpkı bir yemek tarifi gibi — belirli girdiler alır, belirli bir sırayla işler ve tutarlı çıktılar üretir.",
    pill: "Girdi → İşlem → Çıktı",
  },
  {
    color: "violet",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>
        <line x1="12" y1="3" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="21"/>
        <line x1="3" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="21" y2="12"/>
      </svg>
    ),
    title: "Amacı Nedir?",
    body: "Doğru, verimli ve tekrarlanabilir çözümler üretmektir. İyi bir algoritma en az kaynakla en kısa sürede doğru sonuca ulaşır; ölçeklenebilir ve öngörülebilir davranış sergiler.",
    pill: "Doğruluk · Verimlilik · Ölçek",
  },
  {
    color: "emerald",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
        <line x1="12" y1="2" x2="12" y2="22" opacity=".4"/>
      </svg>
    ),
    title: "Yazılımdaki Önemi",
    body: "Her yazılım ürünü algoritmalara dayanır. Google'ın arama sıralaması, Spotify'ın öneri sistemi, GPS navigasyon — hepsi karmaşık algoritmaların gerçek dünya yansımalarıdır.",
    pill: "Arama · Öneri · Navigasyon",
  },
];

const DS_CARDS = [
  {
    color: "indigo",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
        <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
      </svg>
    ),
    title: "Veri Yapısı Nedir?",
    body: "Verileri organize eden, saklayan ve yöneten yapılardır. Kitaplıkta kitapları düzenlemek gibi — doğru yapı, veriye hızlı ve verimli erişimi mümkün kılar.",
    pill: "Organize · Sakla · Eriş",
  },
  {
    color: "violet",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
    title: "Amacı Nedir?",
    body: "Veriyi verimli saklayarak hızlı erişim, ekleme ve silme işlemleri sağlamaktır. Doğru veri yapısı seçimi, O(n²) bir problemi O(log n)'e indirebilir.",
    pill: "Hız · Bellek · Verimlilik",
  },
  {
    color: "emerald",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="4" rx="1"/><rect x="2" y="10" width="20" height="4" rx="1"/><rect x="2" y="17" width="20" height="4" rx="1"/>
      </svg>
    ),
    title: "Yazılımdaki Önemi",
    body: "Tarayıcılar geri butonu için yığın, işletim sistemleri görev planlaması için kuyruk, veritabanları sorgular için ağaç kullanır. Her sistem bir veri yapısı üzerine kuruludur.",
    pill: "Stack · Queue · Tree",
  },
];

const STATS = [
  { value: "11", label: "Algoritma",        color: "indigo",  path: null       },
  { value: "6",  label: "Veri Yapısı",      color: "violet",  path: null       },
  { value: "𝑂",  label: "Big O Rehberi",    color: "bigo",    path: "/big-o"   },
  { value: "✦",  label: "Basit Anlatım",     color: "kids",    path: "/basit"   },
  { value: "∞",  label: "Yazılımın Temeli", color: "emerald", path: null       },
];

const STEPS = [
  {
    n: "01", color: "indigo",
    title: "Algoritma Seç",
    desc: "İlgini çeken algoritmayı kategorilerden seç — sıralama, arama veya veri yapısı.",
  },
  {
    n: "02", color: "violet",
    title: "Adım Adım İzle",
    desc: "Play'e bas veya kendi hızında manuel olarak adım adım ilerle, geri al.",
  },
  {
    n: "03", color: "emerald",
    title: "Kavramı Özümse",
    desc: "Pseudocode, açıklamalar, karmaşıklık grafikleri ve istatistiklerle derinlemesine anla.",
  },
];

const CATEGORIES = [
  {
    title: "Sıralama Algoritmaları",
    desc: "Dizilerin nasıl sıralandığını adım adım görselleştir.",
    icon: "↕", color: "indigo",
    items: [
      { label: "Bubble Sort",    path: "/sorting/bubble-sort",    badge: "O(n²)",      done: true  },
      { label: "Selection Sort", path: "/sorting/selection-sort", badge: "O(n²)",      done: true  },
      { label: "Insertion Sort", path: "/sorting/insertion-sort", badge: "O(n²)",      done: true  },
      { label: "Merge Sort",     path: "/sorting/merge-sort",     badge: "O(n log n)", done: true  },
      { label: "Quick Sort",     path: "/sorting/quick-sort",     badge: "O(n log n)", done: true  },
      { label: "Heap Sort",      path: "/sorting/heap-sort",      badge: "O(n log n)", done: true  },
    ],
  },
  {
    title: "Arama Algoritmaları",
    desc: "Eleman arama yöntemlerini interaktif olarak keşfet.",
    icon: "⌕", color: "violet",
    items: [
      { label: "Linear Search", path: "/searching/linear-search", badge: "O(n)",     done: true },
      { label: "Binary Search", path: "/searching/binary-search", badge: "O(log n)", done: true },
    ],
  },
  {
    title: "Graf Algoritmaları",
    desc: "Graf gezinme ve en kısa yol algoritmalarını animasyonla izle.",
    icon: "⬡", color: "sky",
    items: [
      { label: "BFS",      path: "/searching/bfs",      badge: "O(V+E)",        done: true },
      { label: "DFS",      path: "/searching/dfs",      badge: "O(V+E)",        done: true },
      { label: "Dijkstra", path: "/searching/dijkstra", badge: "O((V+E) log V)", done: true },
    ],
  },
  {
    title: "Veri Yapıları",
    desc: "Temel veri yapılarını görsel olarak anla ve dene.",
    icon: "⬡", color: "emerald",
    items: [
      { label: "Stack",       path: "/data-structures/stack",       badge: "LIFO",     done: true },
      { label: "Queue",       path: "/data-structures/queue",       badge: "FIFO",     done: true },
      { label: "Linked List", path: "/data-structures/linked-list", badge: "O(n)",     done: true },
      { label: "Binary Tree", path: "/data-structures/binary-tree", badge: "O(log n)", done: true },
      { label: "Hash Table",  path: "/data-structures/hash-table",  badge: "O(1)",     done: true },
      { label: "Graph",       path: "/data-structures/graph",       badge: "O(V+E)",   done: true },
    ],
  },
];

/* ── Component ───────────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="home">

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-wm" aria-hidden>Algoritma <span className="hero-wm-amp">&amp;</span> Veri</div>

        {/* Background layers */}
        <div className="hero-bg">
          <div className="hero-grid" />
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-orb orb-3" />
        </div>

        {/* Floating complexity pills */}
        <div className="hero-pill hp-1" aria-hidden>O(1)</div>
        <div className="hero-pill hp-2" aria-hidden>O(n²)</div>
        <div className="hero-pill hp-3" aria-hidden>O(n log n)</div>
        <div className="hero-pill hp-4" aria-hidden>O(log n)</div>
        <div className="hero-pill hp-5" aria-hidden>O(n)</div>
        <div className="hero-pill hp-6" aria-hidden>LIFO</div>
        <div className="hero-pill hp-7" aria-hidden>FIFO</div>

        {/* Floating algorithm cards — 2 left, 2 right */}
        <BinaryTreeMiniCard   posClass="hmc-l1" />
        <InsertionMiniCard    posClass="hmc-l2" />
        <BubbleMiniCard       posClass="hmc-r1" />
        <BinarySearchMiniCard posClass="hmc-r2" />

        {/* Center content */}
        <div className="hero-center">
          <div className="hero-badge">
            <span className="badge-pulse" />
            Eğitici &amp; İnteraktif
          </div>
          <h1 className="hero-title">
            Algoritmaları ve Veri Yapılarını
            <br />
            <em className="hero-gradient">Görsel Olarak</em>
            <br />
            Öğren
          </h1>
          <p className="hero-desc">
            Sıralama, arama ve veri yapılarını adım adım animasyonlarla keşfet.
            Her algoritmayı kendi hızında takip et, kontrol et ve anla.
          </p>
          <div className="hero-actions">
            <Link to="/sorting/bubble-sort" className="btn btn-primary">
              Hemen Başla
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <a href="#categories" className="btn btn-ghost">Kategorilere Bak</a>
          </div>
          <div className="hero-stats">
            {STATS.map((s) => {
              const inner = (
                <>
                  <span className={`stat-val sv-${s.color}`}>{s.value}</span>
                  <span className="stat-lbl">{s.label}</span>
                </>
              );
              return s.path ? (
                <Link key={s.label} to={s.path} className={`stat-item si-${s.color} stat-item-link`}>{inner}</Link>
              ) : (
                <div key={s.label} className={`stat-item si-${s.color}`}>{inner}</div>
              );
            })}
          </div>
        </div>

        {/* Bottom marquee */}
        <div className="hero-marquee" aria-hidden>
          <div className="marquee-fade-l" />
          <div className="marquee-inner">
            {[0, 1].map(k => (
              <span key={k} className="marquee-track">
                {[
                  { text: "Bubble Sort",    cls: "" },
                  { text: "O(n²)",          cls: "mq-red" },
                  { text: "Selection Sort", cls: "" },
                  { text: "Stack",          cls: "mq-emerald" },
                  { text: "Merge Sort",     cls: "" },
                  { text: "O(n log n)",     cls: "mq-indigo" },
                  { text: "Quick Sort",     cls: "" },
                  { text: "Özyineleme",     cls: "mq-violet" },
                  { text: "Insertion Sort", cls: "" },
                  { text: "Queue",          cls: "mq-emerald" },
                  { text: "Linear Search",  cls: "" },
                  { text: "O(log n)",       cls: "mq-indigo" },
                  { text: "Binary Search",  cls: "" },
                  { text: "Linked List",    cls: "mq-emerald" },
                  { text: "Böl & Fethet",   cls: "mq-violet" },
                  { text: "Binary Tree",    cls: "mq-emerald" },
                  { text: "O(n)",           cls: "mq-indigo" },
                  { text: "Heap Sort",      cls: "" },
                  { text: "O(V+E)",         cls: "mq-indigo" },
                  { text: "BFS",            cls: "" },
                  { text: "Hash Table",     cls: "mq-emerald" },
                  { text: "DFS",            cls: "" },
                  { text: "Graf",           cls: "mq-violet" },
                  { text: "Dijkstra",       cls: "" },
                  { text: "Graph",          cls: "mq-emerald" },
                  { text: "O(1)",           cls: "mq-indigo" },
                ].map(({ text, cls }) => (
                  <span key={text} className={`mq-item ${cls}`}>{text}</span>
                ))}
              </span>
            ))}
          </div>
          <div className="marquee-fade-r" />
        </div>

      </section>

      {/* ── Temel Kavramlar ── */}
      <section className="info-sec">
        <div className="container">
          <div className="info-two-col">

            {/* Sol: Algoritmalar */}
            <div className="info-col">
              <div className="info-col-header">
                <div className="sec-tag">Algoritmalar</div>
                <h2 className="info-col-title">Algoritmalar Hakkında</h2>
                <p className="info-col-desc">Yazılım dünyasının temel taşlarını anlamak, daha iyi kod yazmanın ilk adımıdır.</p>
              </div>
              <div className="info-col-cards">
                {INFO_CARDS.map((card, i) => (
                  <div key={card.title} className={`info-card ic-${card.color}`} style={{ animationDelay: `${i * 0.13}s` }}>
                    <div className={`ic-icon-wrap iw-${card.color}`}>{card.icon}</div>
                    <h3 className="ic-title">{card.title}</h3>
                    <p className="ic-body">{card.body}</p>
                    <div className="ic-pill">{card.pill}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ayraç */}
            <div className="info-divider" />

            {/* Orta: Veri Yapıları */}
            <div className="info-col">
              <div className="info-col-header">
                <div className="sec-tag">Veri Yapıları</div>
                <h2 className="info-col-title">Veri Yapıları Hakkında</h2>
                <p className="info-col-desc">Verileri doğru yapıda saklamak, algoritmaların gücünü katlarca artırır.</p>
              </div>
              <div className="info-col-cards">
                {DS_CARDS.map((card, i) => (
                  <div key={card.title} className={`info-card ic-${card.color}`} style={{ animationDelay: `${i * 0.13 + 0.2}s` }}>
                    <div className={`ic-icon-wrap iw-${card.color}`}>{card.icon}</div>
                    <h3 className="ic-title">{card.title}</h3>
                    <p className="ic-body">{card.body}</p>
                    <div className="ic-pill">{card.pill}</div>
                  </div>
                ))}
              </div>
            </div>


          </div>

          {/* Nasıl Kullanılır? — iki sütunun altında yatay */}
          <div className="howto-below">
            <div className="howto-below-header">
              <div className="sec-tag">Kullanım</div>
              <h2 className="info-col-title">Nasıl Kullanılır?</h2>
            </div>
            <div className="steps-row">
              {STEPS.map((step) => (
                <div key={step.n} className="step-card">
                  <div className={`step-num sn-${step.color}`}>{step.n}</div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── Categories ── */}
      <section className="cat-sec" id="categories">
        <div className="container">
          <div className="sec-header">
            <div className="sec-tag">İçerik</div>
            <h2 className="sec-title">Kategoriler</h2>
            <p className="sec-desc">İlgini çeken kategoriyi seç ve öğrenmeye başla.</p>
          </div>
          <div className="cat-grid">
            {CATEGORIES.map((cat) => (
              <div key={cat.title} className={`cat-card cc-${cat.color}`}>
                <div className="cc-header">
                  <div className={`cc-icon-wrap ci-${cat.color}`}>{cat.icon}</div>
                  <div>
                    <h3 className="cc-title">{cat.title}</h3>
                    <p className="cc-desc">{cat.desc}</p>
                  </div>
                </div>
                <ul className="cc-list">
                  {cat.items.map((item) => (
                    <li key={item.path}>
                      <Link to={item.path} className={`cc-link ${item.done ? "" : "cc-link-soon"}`}>
                        <span className="cc-link-label">
                          {item.label}
                          {!item.done && <span className="cc-soon-tag">yakında</span>}
                        </span>
                        <span className="cc-badge">{item.badge}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Big O Kartı */}
            <Link to="/big-o" className="cat-card cc-bigo cat-feature-card">
              <div className="cc-header">
                <div className="cc-icon-wrap ci-bigo">𝑂</div>
                <div>
                  <h3 className="cc-title">Big O Notasyonu</h3>
                  <p className="cc-desc">Algoritmaların hız ve verimlilik dili. Sıfırdan, günlük hayat örnekleriyle.</p>
                </div>
              </div>
              <div className="cfc-complexity-row">
                {["O(1)","O(log n)","O(n)","O(n log n)","O(n²)","O(2ⁿ)"].map((c, i) => (
                  <span key={c} className={`cfc-badge cfc-c${i}`}>{c}</span>
                ))}
              </div>
              <div className="cfc-footer">
                <span className="cfc-cta">Sayfaya Git →</span>
              </div>
            </Link>

            {/* Karşılaştırma Kartı */}
            <Link to="/karsilastir" className="cat-card cc-cmp cat-feature-card">
              <div className="cc-header">
                <div className="cc-icon-wrap ci-cmp">⇄</div>
                <div>
                  <h3 className="cc-title">Algoritma Karşılaştırması</h3>
                  <p className="cc-desc">İki sıralama algoritmasını aynı anda çalıştır, performanslarını yan yana karşılaştır.</p>
                </div>
              </div>
              <div className="cfc-topics-row">
                {["Bubble Sort", "Selection Sort", "Insertion Sort", "Merge Sort", "Quick Sort", "Heap Sort"].map((t) => (
                  <span key={t} className="cfc-topic">{t}</span>
                ))}
              </div>
              <div className="cfc-footer">
                <span className="cfc-cta">Sayfaya Git →</span>
              </div>
            </Link>

            {/* Basit Anlatım Kartı */}
            <Link to="/basit" className="cat-card cc-kids cat-feature-card">
              <div className="cc-header">
                <div className="cc-icon-wrap ci-kids">📚</div>
                <div>
                  <h3 className="cc-title">Başlangıç Rehberi</h3>
                  <p className="cc-desc">Hiçbir şey bilmiyorum diyen için. Tüm konular sade dille, adım adım, görselli anlatım.</p>
                </div>
              </div>
              <div className="cfc-topics-row">
                {["Sıralama","Arama","Stack","Queue","Linked List","Binary Tree"].map((t) => (
                  <span key={t} className="cfc-topic">{t}</span>
                ))}
              </div>
              <div className="cfc-footer">
                <span className="cfc-cta">Sayfaya Git →</span>
              </div>
            </Link>

          </div>
        </div>
      </section>


    </div>
  );
}
