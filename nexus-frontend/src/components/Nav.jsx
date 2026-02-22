import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      padding: "0 40px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      height: "70px",
      background: scrolled ? "rgba(8,8,8,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid var(--border)" : "none",
      transition: "all 0.3s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }} onClick={() => navigate("/")}>
        <div style={{
          width: "36px", height: "36px", background: "var(--orange)",
          borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Bebas Neue', cursive", fontSize: "20px", color: "white",
          boxShadow: "0 0 20px rgba(255,85,0,0.5)"
        }}>N</div>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "24px", letterSpacing: "0.1em" }}>NEXUS</span>
      </div>
      <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
        {["Services", "Pricing", "Results"].map(item => (
          <span key={item} style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-dim)", cursor: "pointer", transition: "color 0.2s" }}
            onClick={() => {
              const el = document.getElementById(item.toLowerCase());
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            onMouseEnter={e => e.target.style.color = "var(--orange)"}
            onMouseLeave={e => e.target.style.color = "var(--text-dim)"}>{item}</span>
        ))}
      </div>
      <div style={{ display: "flex", gap: "12px" }}>
        <button className="btn-ghost" onClick={() => navigate("/client")} style={{ padding: "10px 20px", borderRadius: "8px", fontSize: "13px" }}>
          Client Portal
        </button>
        <button className="btn-primary" onClick={() => navigate("/admin")} style={{ padding: "10px 20px", borderRadius: "8px", fontSize: "13px" }}>
          Admin →
        </button>
      </div>
    </nav>
  );
}