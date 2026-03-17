import { Link } from "react-router-dom";
import "./UnderConstruction.css";

export default function UnderConstruction({ title }) {
  return (
    <div className="uc-page">
      <div className="uc-card">

        {/* Animated icon */}
        <div className="uc-icon-wrap">
          <div className="uc-gear uc-gear-big">⚙</div>
          <div className="uc-gear uc-gear-small">⚙</div>
          <div className="uc-helmet">🪖</div>
        </div>

        <div className="uc-tape">TADİLATTA</div>

        <h1 className="uc-title">{title}</h1>
        <p className="uc-desc">
          Bu sayfa şu an yapım aşamasında.<br />
          Yakında burada interaktif bir görselleştirici olacak.
        </p>

        <div className="uc-progress">
          <div className="uc-progress-bar" />
        </div>
        <span className="uc-progress-label">Geliştirme devam ediyor…</span>

        <Link to="/" className="uc-back">
          ← Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
