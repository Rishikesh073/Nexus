import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, ADMIN_EMAILS } from "../contexts/AuthContext";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await loginWithGoogle();
      if (!ADMIN_EMAILS.includes(result.user.email)) {
        throw new Error("Unauthorized access. Admin privileges required.");
      }
      navigate("/admin");
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

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
      <div className="card-hover" style={{ padding: "40px", borderRadius: "16px", background: "var(--card)", maxWidth: "400px", width: "100%", border: "1px solid rgba(255,85,0,0.3)", position: "relative" }}>

        <button
          onClick={() => navigate("/")}
          style={{
            position: "absolute", top: "20px", left: "20px",
            background: "transparent", border: "none", color: "var(--text-dim)",
            cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px",
            transition: "color 0.2s"
          }}
          onMouseEnter={e => e.target.style.color = "var(--orange)"}
          onMouseLeave={e => e.target.style.color = "var(--text-dim)"}
        >
          ← Back
        </button>

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

        {/* Google Sign-In Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "24px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,85,0,0.2)" }} />
          <span style={{ fontSize: "12px", color: "var(--text-dimmer)", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono'" }}>OR</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,85,0,0.2)" }} />
        </div>

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: "100%", padding: "14px", borderRadius: "8px", fontSize: "14px",
            background: "var(--black3)", border: "1px solid rgba(255,85,0,0.3)",
            color: "var(--text)", cursor: "pointer", fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--orange)"; e.currentTarget.style.background = "rgba(255,85,0,0.05)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,85,0,0.3)"; e.currentTarget.style.background = "var(--black3)"; }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          ADMIN GOOGLE LOGIN
        </button>
      </div>
    </div>
  );
}