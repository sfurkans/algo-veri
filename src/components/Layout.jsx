import Navbar from "./Navbar";
import ScrollToTop from "./ScrollToTop";
import "./Layout.css";

export default function Layout({ children }) {
  return (
    <div className="layout">
      <ScrollToTop />
      <Navbar />
      <main className="layout-main">{children}</main>
    </div>
  );
}
