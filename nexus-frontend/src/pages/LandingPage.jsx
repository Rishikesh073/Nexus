import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// DELETED: import Nav from "../components/Nav"; 
import Ticker from "../components/Ticker";
import AnimatedCounter from "../components/AnimatedCounter";
import { services, testimonials } from "../utils/mockData";

export default function LandingPage() {
  const navigate = useNavigate();
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [pricingHover, setPricingHover] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const pricingTiers = [
    {
      name: "STARTER", price: 199, color: "white", featured: false, desc: "Perfect for local businesses.",
      features: ["1 AI Campaign", "Meta Ads Only", "Basic Analytics", "Email Support"]
    },
    {
      name: "GROWTH", price: 299, color: "var(--orange)", featured: true, desc: "For scaling operations.",
      features: ["3 AI Campaigns", "Meta + Google Ads", "Advanced Analytics", "Priority Support"]
    },
    {
      name: "ENTERPRISE", price: 499, color: "white", featured: false, desc: "Full autonomous takeover.",
      features: ["Unlimited Campaigns", "Omnichannel Deployment", "Custom AI Models", "Dedicated Slack Channel"]
    }
  ];

  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx(i => (i + 1) % testimonials.length), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const h = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div>
      {/* DELETED THE <Nav /> TAG FROM HERE */}

      {/* Hero */}
      <div className="grid-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 40px 80px", position: "relative", overflow: "hidden" }}>

        {/* Navbar */}
        <nav style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 48px", borderBottom: "1px solid var(--border)", background: "rgba(8,8,8,0.9)", backdropFilter: "blur(20px)", zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", background: "var(--orange)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue'", fontSize: "20px" }}>N</div>
            <span style={{ fontFamily: "'Bebas Neue'", fontSize: "24px", letterSpacing: "0.1em" }}>NEXUS AI</span>
          </div>
          <div style={{ display: "flex", gap: "32px", alignItems: "center", fontSize: "14px", fontWeight: 500 }}>
            <button onClick={() => scrollToSection('services')} style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer" }}>Services</button>
            <button onClick={() => scrollToSection('pricing')} style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer" }}>Pricing</button>
            <button className="btn-primary" onClick={() => navigate("/login")} style={{ padding: "10px 24px", borderRadius: "8px" }}>CLIENT PORTAL</button>
          </div>
        </nav>

        {/* Cursor glow */}
        <div style={{
          position: "fixed", pointerEvents: "none", zIndex: 0,
          left: mousePos.x - 200, top: mousePos.y - 200,
          width: 400, height: 400,
          background: "radial-gradient(circle, rgba(255,85,0,0.08) 0%, transparent 70%)",
          borderRadius: "50%", transition: "all 0.1s ease",
        }} />

        <div style={{ textAlign: "center", maxWidth: "900px", position: "relative", zIndex: 1, marginTop: "60px" }}>
          <div style={{ marginBottom: "24px" }}>
            <span className="tag status-live" style={{ marginRight: "12px" }}>● LIVE</span>
            <span className="tag" style={{ background: "rgba(255,85,0,0.1)", color: "var(--orange)", border: "1px solid rgba(255,85,0,0.3)" }}>AI-POWERED AGENCY</span>
          </div>

          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(60px, 10vw, 130px)", lineHeight: 0.95, letterSpacing: "0.02em", marginBottom: "32px", animation: "slide-up 0.8s ease forwards" }}>
            <span style={{ display: "block" }}>DOMINATE</span>
            <span className="neon-text-orange" style={{ display: "block" }}>YOUR MARKET</span>
            <span style={{ display: "block", fontSize: "0.6em", color: "var(--text-dim)", fontFamily: "'Outfit', sans-serif", fontWeight: 300, letterSpacing: "0.05em" }}>WITH AI MARKETING AUTOMATION</span>
          </h1>

          <p style={{ fontSize: "18px", color: "var(--text-dim)", maxWidth: "600px", margin: "0 auto 48px", lineHeight: 1.7 }}>
            We build, launch, and scale your marketing campaigns using AI-driven automation. <strong style={{ color: "var(--text)" }}>Average client sees 3.2x ROI</strong> within 90 days.
          </p>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={() => navigate("/login")} style={{ padding: "18px 40px", borderRadius: "12px", fontSize: "16px" }}>
              START YOUR CAMPAIGN →
            </button>
          </div>

          <div style={{ display: "flex", gap: "60px", justifyContent: "center", marginTop: "80px", flexWrap: "wrap" }}>
            {[
              { value: 320, suffix: "%", label: "Avg ROI" },
              { value: 47, prefix: "$", suffix: "M+", label: "Ad Spend Managed" },
              { value: 140, suffix: "+", label: "Clients Scaled" },
              { value: 98, suffix: "%", label: "Client Retention" },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "52px", lineHeight: 1 }} className={i % 2 === 0 ? "neon-text-orange" : "neon-text-green"}>
                  <AnimatedCounter target={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-dimmer)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginTop: "4px" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Ticker />

      {/* Services Grid */}
      <section id="services" style={{ padding: "120px 60px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <p className="tag status-live" style={{ marginBottom: "20px", display: "inline-block" }}>OUR ARSENAL</p>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "72px", lineHeight: 1, letterSpacing: "0.02em" }}>
            EVERY CHANNEL.<br /><span className="neon-text-orange">EVERY PLATFORM.</span>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
          {services.map((s, i) => (
            <div key={i} className="card-hover" style={{ padding: "32px", borderRadius: "16px", background: "var(--card)", cursor: "default", animation: `slide-up 0.5s ease ${i * 0.08}s both` }}>
              <div style={{ fontSize: "36px", marginBottom: "16px", filter: `drop-shadow(0 0 10px ${s.color})` }}>{s.icon}</div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "28px", color: s.color, letterSpacing: "0.05em", marginBottom: "8px" }}>{s.label}</div>
              <div style={{ fontSize: "13px", color: "var(--text-dimmer)", lineHeight: 1.6 }}>AI-optimized campaigns with real-time performance tracking and automated scaling.</div>
            </div>
          ))}
        </div>
      </section>


      {/* Testimonials */}
      <section id="results" style={{ padding: "100px 60px", background: "var(--black2)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(255,85,0,0.05) 0%, transparent 70%)" }} />
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center", position: "relative" }}>
          <p className="tag" style={{ background: "rgba(255,85,0,0.1)", color: "var(--orange)", border: "1px solid rgba(255,85,0,0.3)", marginBottom: "40px", display: "inline-block" }}>CLIENT RESULTS</p>
          <div style={{ minHeight: "200px" }}>
            <div key={testimonialIdx} style={{ animation: "fade-in 0.5s ease" }}>
              <div style={{ fontSize: "20px", marginBottom: "12px" }}>{"★".repeat(testimonials[testimonialIdx].stars)}</div>
              <p style={{ fontSize: "24px", lineHeight: 1.6, color: "var(--text)", marginBottom: "32px", fontStyle: "italic" }}>
                "{testimonials[testimonialIdx].text}"
              </p>
              <div>
                <div style={{ fontWeight: 700, fontSize: "16px" }}>{testimonials[testimonialIdx].name}</div>
                <div style={{ color: "var(--text-dim)", fontSize: "14px" }}>{testimonials[testimonialIdx].role}</div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "40px" }}>
            {testimonials.map((_, i) => (
              <div key={i} onClick={() => setTestimonialIdx(i)} style={{
                width: i === testimonialIdx ? "32px" : "8px", height: "8px",
                borderRadius: "4px", background: i === testimonialIdx ? "var(--orange)" : "var(--border)",
                cursor: "pointer", transition: "all 0.3s ease",
              }} />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: "120px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "72px", letterSpacing: "0.02em" }}>
            TRANSPARENT PRICING
          </h2>
          <p style={{ color: "var(--text-dim)", fontSize: "18px" }}>No hidden fees. No surprises. Just results.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", maxWidth: "1000px", margin: "0 auto" }}>
          {pricingTiers.map((plan, i) => (
            <div key={i} className="card-hover" onMouseEnter={() => setPricingHover(i)} onMouseLeave={() => setPricingHover(null)}
              style={{
                padding: "40px", borderRadius: "20px",
                background: plan.featured ? `linear-gradient(135deg, rgba(255,85,0,0.1), rgba(255,122,0,0.05))` : "var(--card)",
                border: `1px solid ${plan.featured ? "var(--orange)" : "var(--border)"}`,
                position: "relative", overflow: "hidden",
                transform: plan.featured ? "scale(1.04)" : "scale(1)",
                boxShadow: plan.featured ? "0 0 60px rgba(255,85,0,0.2)" : "none",
              }}>
              {plan.featured && (
                <div style={{ position: "absolute", top: "20px", right: "20px", background: "var(--orange)", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em" }}>POPULAR</div>
              )}
              <div style={{ color: plan.color, fontSize: "14px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px", fontFamily: "'JetBrains Mono', monospace" }}>{plan.name}</div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "60px", lineHeight: 1, marginBottom: "8px", color: plan.color, textShadow: `0 0 20px ${plan.color}44` }}>
                ${plan.price.toLocaleString()}
              </div>
              <div style={{ color: "var(--text-dimmer)", fontSize: "13px", marginBottom: "32px" }}>/ month + ad spend</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "40px" }}>
                {plan.features.map((f, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
                    <span style={{ color: plan.color, fontSize: "12px" }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <button className={plan.featured ? "btn-primary" : "btn-ghost"} onClick={() => navigate("/login")}
                style={{ width: "100%", padding: "14px", borderRadius: "10px", fontSize: "14px", border: plan.featured ? "none" : "1px solid var(--border)" }}>
                GET STARTED →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "120px 60px", textAlign: "center", background: "var(--black2)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(255,85,0,0.1) 0%, transparent 60%)" }} />
        <div style={{ position: "relative" }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "80px", letterSpacing: "0.02em", marginBottom: "24px" }}>
            READY TO <span className="neon-text-orange">SCALE?</span>
          </h2>
          <p style={{ color: "var(--text-dim)", fontSize: "18px", marginBottom: "48px" }}>Join companies dominating their markets with NEXUS.</p>
          <button className="btn-primary" onClick={() => navigate("/login")} style={{ padding: "22px 60px", borderRadius: "14px", fontSize: "18px", animation: "pulse-orange 3s ease-in-out infinite" }}>
            INITIALIZE AI AGENT →
          </button>
        </div>
      </section>

      <footer style={{ padding: "60px", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>

          {/* THE SECRET DOOR: Double click this text to go to admin portal */}
          <div
            onDoubleClick={() => navigate("/admin-login")}
            style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "28px", letterSpacing: "0.1em", cursor: "pointer", userSelect: "none" }}
          >
            NEXUS
          </div>

          <div style={{ color: "var(--text-dimmer)", fontSize: "13px" }}>© 2024 NEXUS AI Agency. All rights reserved.</div>
          <div style={{ display: "flex", gap: "24px" }}>
            {["Privacy", "Terms", "Contact"].map(item => (
              <span key={item} style={{ color: "var(--text-dimmer)", fontSize: "13px", cursor: "pointer", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "var(--orange)"}
                onMouseLeave={e => e.target.style.color = "var(--text-dimmer)"}>{item}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}