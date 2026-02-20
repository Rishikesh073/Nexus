import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, ADMIN_EMAILS } from "../contexts/AuthContext";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Verify it's an admin email BEFORE trying to log in
      if (!ADMIN_EMAILS.includes(email)) {
        throw new Error("Unauthorized access. Admin privileges required.");
      }
      
      await login(email, password);
      navigate("/admin");
      
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--black)", padding: "20px" }}>
      <div className="card-hover" style={{ padding: "40px", borderRadius: "16px", background: "var(--card)", maxWidth: "400px", width: "100%", border: "1px solid rgba(255,85,0,0.3)" }}>
        
        <div style={{ width: "48px", height: "48px", background: "var(--black)", border: "2px solid var(--orange)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue'", fontSize: "28px", color: "var(--orange)", margin: "0 auto 24px" }}>N</div>
        <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: "32px", letterSpacing: "0.05em", marginBottom: "8px", textAlign: "center", color: "var(--orange)" }}>
          SYSTEM OVERRIDE
        </h2>
        <p style={{ color: "var(--text-dim)", fontSize: "14px", marginBottom: "32px", textAlign: "center", fontFamily: "'JetBrains Mono'" }}>
          Admin Mainframe Access
        </p>
        
        {error && <div style={{ background: "rgba(255,0,110,0.1)", color: "var(--neon-pink)", padding: "12px", borderRadius: "8px", fontSize: "13px", marginBottom: "20px", border: "1px solid rgba(255,0,110,0.3)" }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "11px", color: "var(--orange)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono'", display: "block", marginBottom: "6px" }}>Admin Email</label>
            <input 
              required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "var(--black3)", color: "white", border: "1px solid var(--border)" }} 
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "var(--orange)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono'", display: "block", marginBottom: "6px" }}>Passcode</label>
            <input 
              required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "var(--black3)", color: "white", border: "1px solid var(--border)" }} 
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: "14px", borderRadius: "8px", fontSize: "15px", marginTop: "12px", opacity: loading ? 0.7 : 1 }}>
            {loading ? "AUTHENTICATING..." : "INITIALIZE LOGIN"}
          </button>
        </form>
      </div>
    </div>
  );
}