import { useState, useEffect } from "react";
import "./SplashScreen.css";

export default function SplashScreen({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const duration = 1000;
    let startTime = null;
    let raf;

    function animate(ts) {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      // Ease-out: hızlı başla, sona yakın yavaşla
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 2.5);
      setProgress(Math.round(eased * 100));

      if (t < 1) {
        raf = requestAnimationFrame(animate);
      } else {
        // Kısa bekleme sonrası fade-out
        setTimeout(() => {
          setFading(true);
          setTimeout(onDone, 750);
        }, 350);
      }
    }

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <div className={`splash${fading ? " splash-fading" : ""}`}>
      <div className="splash-content">

        {/* Logo ikonu */}
        <div className="splash-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 18 8 6 12 14 15 9 18 12 21 8"/>
            <line x1="4" y1="18" x2="21" y2="18" strokeOpacity="0.4"/>
          </svg>
        </div>

        {/* Site adı */}
        <div className="splash-name">
          <span className="splash-name-grad">Algoritma</span>
          <span className="splash-amp">&amp;</span>
          <span className="splash-name-grad">Veri</span>
        </div>

        <p className="splash-tagline">Görsel algoritmalar öğrenme platformu</p>

        {/* Yükleme çubuğu */}
        <div className="splash-bar-track">
          <div
            className="splash-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="splash-percent">{progress}%</div>

      </div>
    </div>
  );
}
