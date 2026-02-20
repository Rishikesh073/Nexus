import { tickerItems } from "../utils/mockData";

export default function Ticker() {
  const items = [...tickerItems, ...tickerItems];
  return (
    <div style={{ overflow: "hidden", background: "var(--orange)", padding: "12px 0", position: "relative" }}>
      <div style={{ display: "flex", gap: "60px", animation: "ticker 30s linear infinite", width: "max-content" }}>
        {items.map((item, i) => (
          <span key={i} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: 700, letterSpacing: "0.15em", color: "white", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "20px" }}>
            ◆ {item}
          </span>
        ))}
      </div>
    </div>
  );
}