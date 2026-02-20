export default function MiniBarChart({ data, color = "#FF5500", keyName = "spend" }) {
  const max = Math.max(...data.map(d => d[keyName]));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "60px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", height: "100%" }}>
          <div style={{
            flex: 1, width: "100%", borderRadius: "3px 3px 0 0",
            background: `linear-gradient(to top, ${color}, ${color}88)`,
            height: `${(d[keyName] / max) * 100}%`,
            minHeight: "4px",
            transition: "height 1s ease",
            boxShadow: `0 0 8px ${color}44`,
          }} className="chart-bar" />
        </div>
      ))}
    </div>
  );
}