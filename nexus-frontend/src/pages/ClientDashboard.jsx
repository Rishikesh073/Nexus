import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // LIVE DATA STATES
  const [clientData, setClientData] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatMsg, setChatMsg] = useState("");
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI INTAKE FORM STATES
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [intakeStep, setIntakeStep] = useState("form"); // "form" | "submitting" | "success"
  const [intakeError, setIntakeError] = useState("");
  const [intakeData, setIntakeData] = useState({
    businessUrl: "",
    targetAudience: "",
    monthlyBudget: "",
    primaryGoal: "Lead Generation",
    secondaryGoal: "Brand Awareness",
    channels: []
  });

  const availableGoals = [
    "Lead Generation", "Direct E-commerce Sales", "Brand Awareness",
    "Website Traffic", "App Installs", "Local Store Foot Traffic", "Community Engagement"
  ];
  const availableChannels = [
    "Google Ads", "Meta (Facebook/Instagram)", "Instagram (Specific)",
    "LinkedIn B2B", "SEO", "Email Automation", "TikTok"
  ];

  // FETCH LIVE DATA ON MOUNT
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      try {
        const safeGet = (url) => api.get(url).catch(() => ({ data: [] }));

        const [campRes, reqRes, clientsRes, taskRes, msgRes] = await Promise.all([
          safeGet('/campaigns'),
          safeGet('/service-requests'),
          safeGet('/clients'),
          safeGet('/tasks'),
          safeGet('/messages')
        ]);

        // STRICT DATA SILOS
        setCampaigns(campRes.data.filter(c => c.clientId === currentUser.uid));
        setMyRequests(reqRes.data.filter(r => r.clientId === currentUser.uid));
        setTasks(taskRes.data.filter(t => t.clientId === currentUser.uid));
        setChatHistory(msgRes.data.filter(m => m.clientId === currentUser.uid || m.to === currentUser.uid));

        const myProfile = clientsRes.data.find(c => c.uid === currentUser.uid);
        if (myProfile) setClientData(myProfile);

      } catch (error) {
        console.error("Critical error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const sendMessage = async () => {
    if (!chatMsg.trim()) return;
    const newMsg = {
      clientId: currentUser.uid,
      from: currentUser?.displayName || "User",
      msg: chatMsg, type: "user", unread: true,
      avatar: currentUser?.photoURL || "U",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatHistory(h => [...h, newMsg]);
    setChatMsg("");
    try { await api.post('/messages', newMsg); } catch (e) { }
  };

  const closeIntakeForm = () => {
    setShowIntakeForm(false);
    setIntakeStep("form");
    setIntakeError("");
  };

  const submitIntakeForm = async (e) => {
    e.preventDefault();
    setIntakeError("");

    // Validation
    if (intakeData.targetAudience.trim().length < 10) {
      setIntakeError("Target audience must be at least 10 characters. Be specific!");
      return;
    }
    const budget = Number(intakeData.monthlyBudget);
    if (!budget || budget < 100) {
      setIntakeError("Monthly budget must be at least $100.");
      return;
    }
    if (intakeData.channels.length === 0) {
      setIntakeError("Select at least one marketing channel.");
      return;
    }
    if (intakeData.primaryGoal === intakeData.secondaryGoal) {
      setIntakeError("Primary and secondary goals must be different.");
      return;
    }

    setIntakeStep("submitting");
    try {
      await api.post('/service-requests', {
        clientId: currentUser?.uid,
        clientName: currentUser?.displayName,
        clientEmail: currentUser?.email,
        requirements: {
          ...intakeData,
          monthlyBudget: budget
        },
        status: "pending_admin_review",
        submittedAt: new Date().toISOString()
      });

      // Refresh requests
      const reqRes = await api.get('/service-requests').catch(() => ({ data: [] }));
      setMyRequests(reqRes.data.filter(r => r.clientId === currentUser?.uid));

      setIntakeStep("success");

      // Auto-close after 3 seconds
      setTimeout(() => {
        closeIntakeForm();
        setIntakeData({ businessUrl: "", targetAudience: "", monthlyBudget: "", primaryGoal: "Lead Generation", secondaryGoal: "Brand Awareness", channels: [] });
      }, 3000);

    } catch (error) {
      setIntakeStep("form");
      setIntakeError("Connection failed. Make sure the backend server is running on port 5000.");
    }
  };

  const totalSpend = campaigns.reduce((sum, c) => sum + (Number(c.spend) || 0), 0);
  const totalLeads = campaigns.reduce((sum, c) => sum + (Number(c.leads) || 0), 0);
  const liveCampaignsCount = campaigns.filter(c => c.status === "live").length;

  const sidebarItems = [
    { id: "overview", icon: "⊡", label: "Overview" },
    { id: "campaigns", icon: "◉", label: "Live Campaigns" },
    { id: "analytics", icon: "▲", label: "Analytics" },
    { id: "tasks", icon: "☑", label: "Tasks" },
    { id: "chat", icon: "✉", label: "Support Chat" },
    { id: "profile", icon: "◆", label: "My Profile" },
  ];

  if (loading) return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--orange)" }}>LOADING NEXUS SECURE PORTAL...</div>;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: "240px", flexShrink: 0, background: "var(--black2)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", padding: "20px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", marginBottom: "32px" }}>
          <div style={{ width: "32px", height: "32px", background: "var(--orange)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue'", fontSize: "18px" }}>N</div>
          <span style={{ fontFamily: "'Bebas Neue'", fontSize: "20px", letterSpacing: "0.1em" }}>NEXUS</span>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {sidebarItems.map(item => (
            <div key={item.id} className={`sidebar-item ${activeTab === item.id ? "active" : ""}`} onClick={() => setActiveTab(item.id)}>
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div style={{ marginTop: "auto", padding: "12px", borderRadius: "12px", background: "var(--black3)", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
              <span style={{ fontSize: "14px", fontWeight: 700 }}>{currentUser?.displayName?.charAt(0) || "U"}</span>
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{currentUser?.displayName}</div>
              <div style={{ fontSize: "10px", color: "var(--orange)", fontFamily: "'JetBrains Mono'", letterSpacing: "0.1em", textTransform: "uppercase" }}>TIER: {clientData?.plan || "PENDING"}</div>
            </div>
          </div>
        </div>

        <button className="btn-ghost" onClick={handleLogout} style={{ marginTop: "8px", width: "100%", padding: "10px", borderRadius: "8px", fontSize: "12px", color: "var(--neon-pink)", borderColor: "rgba(255,0,110,0.3)" }}>
          LOG OUT
        </button>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: "auto", background: "var(--black)" }}>
        <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "rgba(8,8,8,0.9)", backdropFilter: "blur(20px)", zIndex: 100 }}>
          <div><h1 style={{ fontSize: "24px", fontWeight: 700 }}>{sidebarItems.find(s => s.id === activeTab)?.label}</h1></div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "20px", background: "rgba(0,255,148,0.1)", border: "1px solid rgba(0,255,148,0.2)" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--neon-green)", animation: "pulse-green 2s infinite" }} />
            <span style={{ fontSize: "12px", color: "var(--neon-green)", fontFamily: "'JetBrains Mono'" }}>{liveCampaignsCount} CAMPAIGNS LIVE</span>
          </div>
        </div>

        <div style={{ padding: "32px" }}>

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                <div className="card-hover" style={{ padding: "24px", borderRadius: "16px", background: "var(--card)" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-dimmer)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono'" }}>Active Campaigns</div>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: "42px", color: "var(--neon-green)" }}>{campaigns.length}</div>
                </div>
                <div className="card-hover" style={{ padding: "24px", borderRadius: "16px", background: "var(--card)" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-dimmer)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono'" }}>Total Ad Spend</div>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: "42px", color: "var(--orange)" }}>${totalSpend.toLocaleString()}</div>
                </div>
                <div className="card-hover" style={{ padding: "24px", borderRadius: "16px", background: "var(--card)" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-dimmer)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono'" }}>Leads Generated</div>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: "42px", color: "var(--neon-blue)" }}>{totalLeads.toLocaleString()}</div>
                </div>
              </div>

              <div className="card-hover" style={{ padding: "28px", borderRadius: "16px", background: "var(--card)", marginTop: "16px" }}>
                <h3 style={{ fontWeight: 700, fontSize: "16px", marginBottom: "24px" }}>System Status</h3>
                {campaigns.length === 0 ? (
                  myRequests.length > 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 20px" }}>
                      <div style={{ fontSize: "40px", marginBottom: "16px", color: myRequests[0]?.status === 'approved' ? "var(--neon-green)" : "var(--orange)" }}>
                        {myRequests[0]?.status === 'approved' ? "🚀" : "⏳"}
                      </div>
                      <h4 style={{ fontSize: "20px", marginBottom: "8px", fontFamily: "'Bebas Neue'", letterSpacing: "0.05em" }}>
                        {myRequests[0]?.status === 'approved' ? "AI AGENT DEPLOYED" : "INITIALIZATION IN PROGRESS"}
                      </h4>
                      <p style={{ color: "var(--text-dim)", fontSize: "14px", marginBottom: "24px", maxWidth: "450px", margin: "0 auto 24px" }}>
                        {myRequests[0]?.status === 'approved'
                          ? "Your strategy has been approved! The AI Agent is currently generating your campaigns. They will appear here shortly."
                          : "Your AI Marketing Agent is currently reviewing your business parameters. You will be notified once the strategy is approved and deployed by our team."}
                      </p>
                      <div style={{ display: "inline-block", padding: "8px 16px", background: "var(--black3)", border: "1px solid var(--border)", borderRadius: "20px", fontSize: "12px", color: "var(--text-dimmer)" }}>
                        STATUS: <span style={{ color: myRequests[0]?.status === 'approved' ? "var(--neon-green)" : "var(--orange)", fontWeight: 700 }}>
                          {myRequests[0]?.status === 'approved' ? "APPROVED - BUILDING CAMPAIGNS" : "PENDING ADMIN REVIEW"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "60px 20px" }}>
                      <div style={{ fontSize: "40px", marginBottom: "16px" }}>⚡</div>
                      <h4 style={{ fontSize: "20px", marginBottom: "8px", fontFamily: "'Bebas Neue'", letterSpacing: "0.05em" }}>NO CAMPAIGNS DETECTED</h4>
                      <p style={{ color: "var(--text-dim)", fontSize: "14px", marginBottom: "24px", maxWidth: "400px", margin: "0 auto 24px" }}>
                        Your AI Marketing Agent is standing by. Provide your business requirements to initialize your custom strategy.
                      </p>
                      <button className="btn-primary" onClick={() => setShowIntakeForm(true)} style={{ padding: "16px 32px", borderRadius: "8px", fontSize: "14px" }}>
                        INITIALIZE AI AGENT →
                      </button>
                    </div>
                  )
                ) : (
                  <div style={{ color: "var(--neon-green)", textAlign: "center", padding: "40px" }}>{campaigns.length} Active Campaigns Running Globally</div>
                )}
              </div>
            </div>
          )}

          {/* CAMPAIGNS TAB */}
          {activeTab === "campaigns" && (
            <div className="card-hover" style={{ borderRadius: "16px", background: "var(--card)", overflow: "hidden" }}>
              {campaigns.length === 0 ? <div style={{ padding: "40px", textAlign: "center", color: "var(--text-dimmer)" }}>Waiting for Admin to deploy AI campaigns.</div> : (
                <table>
                  <thead>
                    <tr><th>Campaign</th><th>Channel</th><th>Status</th><th>Spend</th><th>Leads Generated</th></tr>
                  </thead>
                  <tbody>
                    {campaigns.map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                        <td><span style={{ fontSize: "12px", color: "var(--text-dim)", fontFamily: "'JetBrains Mono'" }}>{c.channel || "Google Ads"}</span></td>
                        <td><span className={`tag status-live`}>LIVE</span></td>
                        <td style={{ fontFamily: "'JetBrains Mono'" }}>${c.spend}</td>
                        <td style={{ fontFamily: "'JetBrains Mono'", color: "var(--neon-green)" }}>{c.leads}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* DYNAMIC ANALYTICS TAB */}
          {activeTab === "analytics" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <h3 style={{ fontWeight: 700, fontSize: "18px" }}>Campaign Performance Analytics</h3>

              {campaigns.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", background: "var(--card)", borderRadius: "16px", border: "1px dashed var(--border)", color: "var(--text-dimmer)" }}>
                  Waiting for AI Agent to deploy campaigns to generate analytics.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                  {/* Leads Bar Chart */}
                  <div className="card-hover" style={{ background: "var(--card)", padding: "32px", borderRadius: "16px", border: "1px solid var(--border)" }}>
                    <h4 style={{ fontSize: "14px", color: "var(--text-dimmer)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "24px" }}>Leads by Campaign</h4>
                    <div style={{ display: "flex", gap: "16px", alignItems: "flex-end", height: "250px" }}>
                      {campaigns.map(c => {
                        const heightPercentage = Math.min((c.leads / Math.max(...campaigns.map(cp => cp.leads || 1))) * 100, 100) || 5;
                        return (
                          <div key={`lead-${c.id}`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                            <div style={{ fontSize: "12px", color: "var(--neon-green)", fontFamily: "'JetBrains Mono'" }}>{c.leads}</div>
                            <div style={{ width: "100%", height: `${heightPercentage}%`, background: "linear-gradient(to top, var(--neon-green), #00ff94)", borderRadius: "4px 4px 0 0", minHeight: "10px", transition: "height 1s ease" }}></div>
                            <div style={{ fontSize: "10px", color: "var(--text-dimmer)", textAlign: "center", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", width: "100%" }}>{c.name}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Spend Bar Chart */}
                  <div className="card-hover" style={{ background: "var(--card)", padding: "32px", borderRadius: "16px", border: "1px solid var(--border)" }}>
                    <h4 style={{ fontSize: "14px", color: "var(--text-dimmer)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "24px" }}>Ad Spend Allocation</h4>
                    <div style={{ display: "flex", gap: "16px", alignItems: "flex-end", height: "250px" }}>
                      {campaigns.map(c => {
                        const heightPercentage = Math.min((c.spend / Math.max(...campaigns.map(cp => cp.spend || 1))) * 100, 100) || 5;
                        return (
                          <div key={`spend-${c.id}`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                            <div style={{ fontSize: "12px", color: "var(--orange)", fontFamily: "'JetBrains Mono'" }}>${c.spend}</div>
                            <div style={{ width: "100%", height: `${heightPercentage}%`, background: "linear-gradient(to top, var(--orange), #FF7A00)", borderRadius: "4px 4px 0 0", minHeight: "10px", transition: "height 1s ease" }}></div>
                            <div style={{ fontSize: "10px", color: "var(--text-dimmer)", textAlign: "center", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", width: "100%" }}>{c.name}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TASKS TAB */}
          {activeTab === "tasks" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                {["todo", "progress", "done"].map(status => (
                  <div key={status} style={{ padding: "20px", borderRadius: "16px", background: "var(--card)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: status === "done" ? "var(--neon-green)" : status === "progress" ? "var(--orange)" : "var(--text-dimmer)" }} />
                      <span style={{ fontFamily: "'JetBrains Mono'", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dimmer)" }}>{status}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {tasks.filter(t => t.status === status).map((task, i) => (
                        <div key={i} style={{ padding: "16px", borderRadius: "10px", background: "var(--black3)", border: "1px solid var(--border)" }}>
                          <div style={{ fontSize: "13px", fontWeight: 600 }}>{task.title}</div>
                        </div>
                      ))}
                      {tasks.filter(t => t.status === status).length === 0 && <div style={{ fontSize: "12px", color: "var(--text-dimmer)", textAlign: "center", padding: "10px" }}>Empty</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHAT TAB */}
          {activeTab === "chat" && (
            <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 200px)" }}>
              <div className="card-hover" style={{ flex: 1, borderRadius: "16px", background: "var(--card)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ flex: 1, overflow: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  {chatHistory.length === 0 ? <div style={{ margin: "auto", color: "var(--text-dimmer)" }}>Start a conversation with our team...</div> : (
                    chatHistory.map((m, i) => (
                      <div key={i} style={{ display: "flex", flexDirection: m.type === "user" ? "row-reverse" : "row", gap: "12px", alignItems: "flex-start" }}>
                        <div style={{ padding: "12px 16px", borderRadius: m.type === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px", background: m.type === "user" ? "var(--orange)" : "var(--black3)", fontSize: "14px" }}>
                          {m.msg}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", gap: "12px" }}>
                  <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Type your message..." style={{ flex: 1, padding: "12px 16px", borderRadius: "10px", fontSize: "14px" }} />
                  <button className="btn-primary" onClick={sendMessage} style={{ padding: "12px 24px", borderRadius: "10px", fontSize: "14px" }}>SEND</button>
                </div>
              </div>
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="card-hover" style={{ padding: "32px", borderRadius: "16px", background: "var(--card)", maxWidth: "600px" }}>
              <h3 style={{ fontWeight: 700, marginBottom: "24px" }}>Company Profile</h3>
              <div style={{ padding: "16px", background: "rgba(255,85,0,0.1)", border: "1px solid rgba(255,85,0,0.3)", borderRadius: "12px", marginBottom: "24px" }}>
                <div style={{ fontSize: "11px", color: "var(--orange)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono'", marginBottom: "4px" }}>Active Subscription Tier</div>
                <div style={{ fontSize: "24px", fontFamily: "'Bebas Neue'", color: "white" }}>{clientData?.plan || "Awaiting Setup"}</div>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", color: "var(--text-dimmer)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono'", display: "block", marginBottom: "6px" }}>Company Name</label>
                <input readOnly value={currentUser?.displayName || ""} style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", fontSize: "14px", background: "var(--black3)", border: "1px solid var(--border)", color: "var(--text-dim)" }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* THE AI INTAKE MODAL (Full form restored) */}
      {showIntakeForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", overflow: "auto", padding: "40px 20px" }}>
          <div className="card-hover" style={{ background: "var(--black2)", padding: "40px", borderRadius: "20px", maxWidth: "600px", width: "100%", position: "relative", maxHeight: "90vh", overflowY: "auto", border: "1px solid rgba(255,85,0,0.15)" }}>

            <button onClick={closeIntakeForm} style={{ position: "absolute", top: "20px", right: "24px", background: "transparent", border: "none", color: "var(--text-dimmer)", fontSize: "24px", cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "var(--orange)"}
              onMouseLeave={e => e.target.style.color = "var(--text-dimmer)"}
            >×</button>

            {/* SUCCESS STATE */}
            {intakeStep === "success" && (
              <div style={{ textAlign: "center", padding: "60px 20px", animation: "fade-in 0.5s ease" }}>
                <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(0,255,148,0.1)", border: "2px solid var(--neon-green)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: "36px" }}>✓</div>
                <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: "32px", marginBottom: "12px", color: "var(--neon-green)" }}>BRIEFING RECEIVED</h2>
                <p style={{ color: "var(--text-dim)", fontSize: "14px", lineHeight: 1.7, maxWidth: "400px", margin: "0 auto 24px" }}>
                  Your AI Marketing Agent is now analyzing your business parameters. Our admin team will review the strategy and deploy your campaigns.
                </p>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", background: "rgba(0,255,148,0.08)", border: "1px solid rgba(0,255,148,0.2)", borderRadius: "20px", fontSize: "12px", color: "var(--neon-green)", fontFamily: "'JetBrains Mono'" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--neon-green)", animation: "pulse-green 2s infinite" }} />
                  STATUS: PENDING ADMIN REVIEW
                </div>
              </div>
            )}

            {/* SUBMITTING STATE */}
            {intakeStep === "submitting" && (
              <div style={{ textAlign: "center", padding: "80px 20px", animation: "fade-in 0.3s ease" }}>
                <div style={{ width: "60px", height: "60px", border: "3px solid var(--border)", borderTopColor: "var(--orange)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 24px" }} />
                <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: "28px", marginBottom: "8px", color: "var(--orange)" }}>INITIALIZING AI AGENT...</h2>
                <p style={{ color: "var(--text-dimmer)", fontSize: "13px" }}>Transmitting your business data securely</p>
              </div>
            )}

            {/* FORM STATE */}
            {intakeStep === "form" && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <div style={{ width: "40px", height: "40px", background: "var(--orange)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>⚡</div>
                  <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: "32px", color: "var(--orange)" }}>AI AGENT BRIEFING</h2>
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-dim)", marginBottom: "28px", lineHeight: 1.6 }}>Help our AI understand your business context. All strategies are reviewed by our team before launch.</p>

                {intakeError && (
                  <div style={{ background: "rgba(255,0,110,0.08)", color: "var(--neon-pink)", padding: "12px 16px", borderRadius: "10px", fontSize: "13px", marginBottom: "20px", border: "1px solid rgba(255,0,110,0.2)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>⚠</span> {intakeError}
                  </div>
                )}

                <form onSubmit={submitIntakeForm} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                  <div>
                    <label style={{ fontSize: "11px", color: "var(--text-dimmer)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono'", display: "block", marginBottom: "6px" }}>Business URL <span style={{ color: "var(--text-dimmer)", fontStyle: "italic", textTransform: "none" }}>(optional)</span></label>
                    <input
                      type="url"
                      placeholder="https://yourbusiness.com"
                      value={intakeData.businessUrl}
                      onChange={e => setIntakeData({ ...intakeData, businessUrl: e.target.value })}
                      style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", background: "var(--black)", color: "white", border: "1px solid var(--border)", transition: "border-color 0.2s" }}
                      onFocus={e => e.target.style.borderColor = "var(--orange)"}
                      onBlur={e => e.target.style.borderColor = "var(--border)"}
                    />
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <label style={{ fontSize: "11px", color: "var(--text-dimmer)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono'" }}>Target Audience Profile *</label>
                      <span style={{ fontSize: "11px", color: intakeData.targetAudience.length >= 10 ? "var(--neon-green)" : "var(--text-dimmer)", fontFamily: "'JetBrains Mono'" }}>{intakeData.targetAudience.length}/10 min</span>
                    </div>
                    <textarea
                      required
                      placeholder="e.g. Local homeowners aged 30-55 in metro areas looking for home renovation services..."
                      value={intakeData.targetAudience}
                      onChange={e => setIntakeData({ ...intakeData, targetAudience: e.target.value })}
                      style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", minHeight: "90px", resize: "vertical", background: "var(--black)", color: "white", border: `1px solid ${intakeData.targetAudience.length >= 10 ? "rgba(0,255,148,0.3)" : "var(--border)"}`, transition: "border-color 0.2s", fontFamily: "inherit", lineHeight: 1.5 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "11px", color: "var(--text-dimmer)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono'", display: "block", marginBottom: "6px" }}>Monthly Ad Budget ($) *</label>
                    <input
                      type="number" required placeholder="Minimum $100"
                      min="100"
                      value={intakeData.monthlyBudget}
                      onChange={e => setIntakeData({ ...intakeData, monthlyBudget: e.target.value })}
                      style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", background: "var(--black)", color: "white", border: "1px solid var(--border)", transition: "border-color 0.2s" }}
                      onFocus={e => e.target.style.borderColor = "var(--orange)"}
                      onBlur={e => e.target.style.borderColor = "var(--border)"}
                    />
                    {intakeData.monthlyBudget && Number(intakeData.monthlyBudget) > 0 && (
                      <div style={{ fontSize: "11px", color: "var(--text-dimmer)", marginTop: "6px", fontFamily: "'JetBrains Mono'" }}>
                        Estimated daily: <span style={{ color: "var(--neon-green)" }}>${(Number(intakeData.monthlyBudget) / 30).toFixed(0)}/day</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={{ fontSize: "11px", color: "var(--text-dimmer)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono'", display: "block", marginBottom: "6px" }}>Primary Goal *</label>
                      <select
                        value={intakeData.primaryGoal}
                        onChange={e => setIntakeData({ ...intakeData, primaryGoal: e.target.value })}
                        style={{ width: "100%", padding: "12px", borderRadius: "10px", background: "var(--black)", color: "white", border: "1px solid var(--border)" }}>
                        {availableGoals.map(g => <option key={`pri-${g}`} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: "11px", color: "var(--text-dimmer)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono'", display: "block", marginBottom: "6px" }}>Secondary Goal</label>
                      <select
                        value={intakeData.secondaryGoal}
                        onChange={e => setIntakeData({ ...intakeData, secondaryGoal: e.target.value })}
                        style={{ width: "100%", padding: "12px", borderRadius: "10px", background: "var(--black)", color: "white", border: "1px solid var(--border)" }}>
                        {availableGoals.map(g => <option key={`sec-${g}`} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <label style={{ fontSize: "11px", color: "var(--text-dimmer)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono'" }}>Preferred Channels *</label>
                      <span style={{ fontSize: "11px", color: intakeData.channels.length > 0 ? "var(--neon-green)" : "var(--text-dimmer)", fontFamily: "'JetBrains Mono'" }}>{intakeData.channels.length} selected</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {availableChannels.map(channel => (
                        <div
                          key={channel}
                          onClick={() => {
                            const isSelected = intakeData.channels.includes(channel);
                            const newChannels = isSelected
                              ? intakeData.channels.filter(c => c !== channel)
                              : [...intakeData.channels, channel];
                            setIntakeData({ ...intakeData, channels: newChannels });
                          }}
                          style={{
                            padding: "8px 16px", borderRadius: "20px", fontSize: "12px", cursor: "pointer",
                            transition: "all 0.2s ease",
                            background: intakeData.channels.includes(channel) ? "var(--orange)" : "var(--black3)",
                            color: intakeData.channels.includes(channel) ? "white" : "var(--text-dim)",
                            border: `1px solid ${intakeData.channels.includes(channel) ? "var(--orange)" : "var(--border)"}`,
                            transform: intakeData.channels.includes(channel) ? "scale(1.05)" : "scale(1)",
                            boxShadow: intakeData.channels.includes(channel) ? "0 0 12px rgba(255,85,0,0.3)" : "none"
                          }}>
                          {intakeData.channels.includes(channel) ? "✓ " : ""}{channel}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary bar */}
                  {(intakeData.channels.length > 0 || intakeData.monthlyBudget) && (
                    <div style={{ padding: "14px 16px", borderRadius: "10px", background: "rgba(255,85,0,0.05)", border: "1px solid rgba(255,85,0,0.15)", fontSize: "12px", color: "var(--text-dim)", fontFamily: "'JetBrains Mono'", display: "flex", flexWrap: "wrap", gap: "16px" }}>
                      {intakeData.monthlyBudget && <span>Budget: <strong style={{ color: "var(--orange)" }}>${Number(intakeData.monthlyBudget).toLocaleString()}/mo</strong></span>}
                      {intakeData.channels.length > 0 && <span>Channels: <strong style={{ color: "var(--neon-green)" }}>{intakeData.channels.length}</strong></span>}
                      <span>Goal: <strong style={{ color: "var(--neon-blue)" }}>{intakeData.primaryGoal}</strong></span>
                    </div>
                  )}

                  <button type="submit" className="btn-primary" style={{ padding: "16px", borderRadius: "10px", fontSize: "15px", marginTop: "4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    ⚡ SUBMIT FOR AI ANALYSIS
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}