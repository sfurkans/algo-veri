import { Link, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import "./Navbar.css";

const navItems = [
  {
    label: "Sıralama",
    color: "indigo",
    icon: "↕",
    children: [
      { label: "Bubble Sort",    path: "/sorting/bubble-sort",    badge: "O(n²)",      done: true  },
      { label: "Selection Sort", path: "/sorting/selection-sort", badge: "O(n²)",      done: true  },
      { label: "Insertion Sort", path: "/sorting/insertion-sort", badge: "O(n²)",      done: true  },
      { label: "Merge Sort",     path: "/sorting/merge-sort",     badge: "O(n log n)", done: true  },
      { label: "Quick Sort",     path: "/sorting/quick-sort",     badge: "O(n log n)", done: true  },
      { label: "Heap Sort",      path: "/sorting/heap-sort",      badge: "O(n log n)", done: true  },
    ],
  },
  {
    label: "Arama",
    color: "violet",
    icon: "⌕",
    children: [
      { label: "Linear Search", path: "/searching/linear-search", badge: "O(n)",     done: true },
      { label: "Binary Search", path: "/searching/binary-search", badge: "O(log n)", done: true },
    ],
  },
  {
    label: "Graf Algoritmaları",
    color: "sky",
    icon: "⬡",
    children: [
      { label: "BFS", path: "/searching/bfs", badge: "O(V+E)", done: true },
      { label: "DFS",      path: "/searching/dfs",      badge: "O(V+E)",        done: true },
      { label: "Dijkstra", path: "/searching/dijkstra", badge: "O((V+E) log V)", done: true },
    ],
  },
  {
    label: "Veri Yapıları",
    color: "emerald",
    icon: "⬡",
    children: [
      { label: "Stack",       path: "/data-structures/stack",       badge: "LIFO",     done: true },
      { label: "Queue",       path: "/data-structures/queue",       badge: "FIFO",     done: true },
      { label: "Linked List", path: "/data-structures/linked-list", badge: "O(n)",     done: true },
      { label: "Binary Tree", path: "/data-structures/binary-tree", badge: "O(log n)", done: true },
      { label: "Hash Table",   path: "/data-structures/hash-table",  badge: "O(1)",     done: true },
      { label: "Graph",        path: "/data-structures/graph",       badge: "O(V+E)",   done: true },
    ],
  },
];

function scrollTop() {
  window.scrollTo(0, 0);
}

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openMobileSection, setOpenMobileSection] = useState(null);
  const location = useLocation();
  const closeTimer = useRef(null);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setOpenMobileSection(null);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  function handleMouseEnter(label) {
    clearTimeout(closeTimer.current);
    setOpenMenu(label);
  }

  function handleMouseLeave() {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 150);
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={scrollTop}>
          <div className="logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 18 8 6 12 14 15 9 18 12 21 8"/>
              <line x1="4" y1="18" x2="21" y2="18" strokeOpacity="0.35"/>
            </svg>
          </div>
          <span className="logo-text">Algoritma <span className="logo-amp">&amp;</span> Veri</span>
        </Link>

        {/* Desktop Menu */}
        <ul className="navbar-menu">
          {navItems.map((item) => {
            const isActiveSection = item.children.some(c => location.pathname === c.path);
            return (
            <li
              key={item.label}
              className={`navbar-item ${openMenu === item.label ? "nav-open" : ""}`}
              onMouseEnter={() => handleMouseEnter(item.label)}
              onMouseLeave={handleMouseLeave}
            >
              <button className={`navbar-btn nb-${item.color} ${isActiveSection ? `nb-active nb-active-${item.color}` : ""}`}>
                <span className={`nb-icon-badge nb-badge-${item.color}`}>{item.icon}</span>
                <span className={`nb-label nb-label-${item.color}`}>{item.label}</span>
                <svg className="nb-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {openMenu === item.label && (
                <div className={`navbar-dropdown nd-${item.color}`}>
                  <div className={`nd-header ndh-${item.color}`}>
                    <span className="nd-header-icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.children.map((child) => (
                    <Link
                      key={child.path}
                      to={child.path}
                      className={`dropdown-link ${location.pathname === child.path ? "dl-active" : ""} ${!child.done ? "dl-soon" : ""}`}
                      onClick={() => { setOpenMenu(null); scrollTop(); }}
                    >
                      <span className="dl-label">{child.label}</span>
                      <span className="dl-badge">{child.badge}</span>
                    </Link>
                  ))}
                </div>
              )}
            </li>
            );
          })}
        </ul>

        {/* Desktop CTA */}
        <div className="navbar-cta-group">
          <Link to="/big-o" className={`navbar-btn nb-bigo navbar-simple-cta ${location.pathname === "/big-o" ? "nb-active nb-active-bigo" : ""}`} onClick={scrollTop}>
            <span className="nb-icon-badge nb-badge-bigo">𝑂</span>
            <span className="nb-label nb-label-bigo">Big O</span>
          </Link>
          <Link to="/karsilastir" className={`navbar-btn nb-compare navbar-simple-cta ${location.pathname === "/karsilastir" ? "nb-active nb-active-compare" : ""}`} onClick={scrollTop}>
            <span className="nb-icon-badge nb-badge-compare">⇄</span>
            <span className="nb-label nb-label-compare">Karşılaştır</span>
          </Link>
          <Link to="/basit" className={`navbar-btn nb-simple navbar-simple-cta ${location.pathname === "/basit" ? "nb-active nb-active-simple" : ""}`} onClick={scrollTop}>
            <span className="nb-icon-badge nb-badge-simple">📚</span>
            <span className="nb-label nb-label-simple">Başlangıç</span>
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className={`hamburger ${isMobileOpen ? "ham-open" : ""}`}
          onClick={() => setIsMobileOpen((v) => !v)}
          aria-label="Menüyü aç/kapat"
          aria-expanded={isMobileOpen}
        >
          <span className="ham-line" />
          <span className="ham-line" />
          <span className="ham-line" />
        </button>
      </div>

      {/* Mobil Menü */}
      <div className={`mobile-menu ${isMobileOpen ? "mob-visible" : ""}`}>
        <div className="mob-overlay" onClick={() => setIsMobileOpen(false)} />

        <div className="mob-panel">
          {navItems.map((item) => {
            const isOpen = openMobileSection === item.label;
            const hasActive = item.children.some(c => location.pathname === c.path);
            return (
              <div key={item.label} className="mob-section">
                <button
                  className={`mob-section-header mobh-${item.color} ${isOpen ? "mob-sec-open" : ""} ${hasActive ? "mob-sec-active" : ""}`}
                  onClick={() => setOpenMobileSection(isOpen ? null : item.label)}
                >
                  <span className="mob-section-icon">{item.icon}</span>
                  <span className="mob-sec-label">{item.label}</span>
                  <svg className="mob-sec-chevron" width="14" height="14" viewBox="0 0 12 12" fill="none">
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {isOpen && (
                  <div className="mob-links">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`mob-link ${location.pathname === child.path ? "mob-link-active" : ""} ${!child.done ? "dl-soon" : ""}`}
                        onClick={() => { setIsMobileOpen(false); scrollTop(); }}
                      >
                        <span className="mob-link-label">{child.label}</span>
                        <span className="dl-badge">{child.badge}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <Link
            to="/big-o"
            className="mob-cta-btn mob-bigo-btn"
            onClick={() => { setIsMobileOpen(false); scrollTop(); }}
          >
            <span>𝑂</span>
            <span>Big O Notasyonu</span>
          </Link>
          <Link
            to="/karsilastir"
            className="mob-cta-btn mob-compare-btn"
            onClick={() => { setIsMobileOpen(false); scrollTop(); }}
          >
            <span>⇄</span>
            <span>Karşılaştırma Modu</span>
          </Link>
          <Link
            to="/basit"
            className="mob-cta-btn"
            onClick={() => { setIsMobileOpen(false); scrollTop(); }}
          >
            <span>📚</span>
            <span>Başlangıç Rehberi</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
