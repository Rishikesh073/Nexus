import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; 
import { useAuth } from "../contexts/AuthContext";
import MiniLineChart from "../components/MiniLineChart";
// Note: If you still use MiniBarChart in the analytics tab, keep the import.
// import MiniBarChart from "../components/MiniBarChart";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth(); // Grabbing the live Google user and logout function!
  const [activeTab, setActiveTab] = useState("overview");
  
  // LIVE DATA STATES
  const [campaigns, setCampaigns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatMsg, setChatMsg] = useState("");
  const [myRequests, setMyRequests] = useState([]); // <-- REQUESTS STATE
  const [loading, setLoading] = useState(true);

  // AI INTAKE FORM STATES
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [intakeData, setIntakeData] = useState({
    businessUrl: "", 
    targetAudience: "",
    monthlyBudget: "",
    primaryGoal: "Lead Generation",
    secondaryGoal: "Brand Awareness",
    channels: []
  });

  const availableGoals = [
    "Lead Generation", 
    "Direct E-commerce Sales", 
    "Brand Awareness", 
    "Website Traffic", 
    "App Installs", 
    "Local Store Foot Traffic",
    "Community Engagement"
  ];

  const availableChannels = [
    "Google Ads", 
    "Meta (Facebook/Instagram)", 
    "Instagram (Specific)", 
    "LinkedIn B2B", 
    "SEO", 
    "Email Automation", 
    "TikTok"
  ];

  // FETCH LIVE DATA ON MOUNT
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [campRes, taskRes, msgRes, reqRes] = await Promise.all([
          api.get('/campaigns'),
          api.get('/tasks'),
          api.get('/messages'),
          api.get('/service-requests') // <-- FETCH REQUESTS
        ]);
        
        setCampaigns(campRes.data);
        setTasks(taskRes.data);
        setChatHistory(msgRes.data);
        
        if (currentUser) {
          setMyRequests(reqRes.data.filter(r => r.clientId === currentUser.uid));
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login"); 
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const sendMessage = async () => {
    if (!chatMsg.trim()) return;
    
    const newMsg = { 
      from: currentUser?.displayName || "User", 
      msg: chatMsg, 
      type: "user", 
      unread: true, 
      avatar: currentUser?.photoURL || "U",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatHistory(h => [...h, newMsg]);
    setChatMsg("");

    try {
      await api.post('/messages', newMsg);
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const submitIntakeForm = async (e) => {
    e.preventDefault();
    try {
      await api.post('/service-requests', {
        clientId: currentUser?.uid,
        clientName: currentUser?.displayName,
        clientEmail: currentUser?.email,
        requirements: intakeData,
        status: "pending_admin_review",
        submittedAt: new Date().toISOString()
      });
      
      setShowIntakeForm(false);
      
      // Auto-refresh the requests so the UI switches to "Pending" instantly
      const reqRes = await api.get('/service-requests');
      setMyRequests(reqRes.data.filter(r => r.clientId === currentUser?.uid));
      
      alert("Requirements sent to the NEXUS AI Agent. Our Admin team will review and approve shortly!");
    } catch (error) {
      console.error("Error submitting form", error);
      alert("There was an error submitting your request. Please try again.");
    }
  };

  // DYNAMIC CALCULATIONS
  const totalSpend = campaigns.reduce((sum, c) => sum + (Number(c.spend) || 0), 0);
  const totalLeads = campaigns.reduce((sum, c) => sum + (Number(c.leads) || 0), 0);
  const liveCampaignsCount = campaigns.filter(c => c.status === "live").length;

  const sidebarItems = [
    { id: "overview", icon: "⊡", label: "Overview" },
    { id: "campaigns", icon: "◉", label: "Campaigns" },
    { id: "analytics", icon: "▲", label: "Analytics" },
    { id: "tasks", icon: "☑", label: "Tasks" },
    { id: "chat", icon: "✉", label: "Chat" },
    { id: "profile", icon: "◆", label: "Profile" },
  ];

  if (loading) {
    return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--orange)" }}>LOADING NEXUS SECURE PORTAL...</div>;
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: "240px", flexShrink: 0, background: "var(--black2)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", padding: "20px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", marginBottom: "32px" }}>
          <div style={{ width: "32px", height: "32px", background: "var(--orange)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue'", fontSize: "18px" }}>N</div>
          <span style={{ fontFamily: "'Bebas Neue'", fontSize: "20px", letterSpacing: "0.1em" }}>NEXUS</span>
        </div>

        <div style={{ fontSize: "10px", color: "var(--text-dimmer)", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'JetBrains Mono'", padding: "0 12px", marginBottom: "12px" }}>Client Portal</div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {sidebarItems.map(item => (
            <div key={item.id} className={`sidebar-item ${activeTab === item.id ? "active" : ""}`} onClick={() => setActiveTab(item.id)}>
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        {/* LIVE GOOGLE PROFILE SECTION */}
        <div style={{ marginTop: "auto", padding: "12px", borderRadius: "12px", background: "var(--black3)", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "14px", fontWeight: 700 }}>U</span>
              )}
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "140px" }}>
                {currentUser?.displayName || "NEXUS Client"}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-dimmer)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "140px" }}>
                {currentUser?.email}
              </div>
            </div>
          </div>
        </div>

        <button className="btn-ghost" onClick={() => navigate("/")} style={{ marginTop: "12px", width: "100%", padding: "10px", borderRadius: "8px", fontSize: "12px" }}>
          ← Back to Site
        </button>

        {/* LOG OUT BUTTON */}
        <button className="btn-ghost" onClick={handleLogout} style={{ marginTop: "8px", width: "100%", padding: "10px", borderRadius: "8px", fontSize: "12px", color: "var(--neon-pink)", borderColor: "rgba(255,0,110,0.3)" }}>
          LOG OUT
        </button>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: "auto", background: "var(--black)" }}>
        {/* Header */}
        <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "rgba(8,8,8,0.9)", backdropFilter: "blur(20px)", zIndex: 100 }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 700 }}>
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "campaigns" && "My Campaigns"}
              {activeTab === "analytics" && "Analytics"}
              {activeTab === "tasks" && "Task Board"}
              {activeTab === "chat" && "Support Chat"}
              {activeTab === "profile" && "My Profile"}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "20px", background: "rgba(0,255,148,0.1)", border: "1px solid rgba(0,255,148,0.2)" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--neon-green)", animation: "pulse-green 2s infinite" }} />
              <span style={{ fontSize: "12px", color: "var(--neon-green)", fontFamily: "'JetBrains Mono'" }}>{liveCampaignsCount} CAMPAIGNS LIVE</span>
            </div>
          </div>
        </div>

        <div style={{ padding: "32px" }}>
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* KPI cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                {[
                  { label: "Active Campaigns", value: liveCampaignsCount, color: "var(--neon-green)", icon: "▲" },
                  { label: "Total Ad Spend", value: `$${totalSpend.toLocaleString()}`, color: "var(--neon-blue)", icon: "◈" },
                  { label: "Leads Generated", value: totalLeads.toLocaleString(), color: "var(--orange)", icon: "◉" },
                  { label: "Pending Tasks", value: tasks.filter(t => t.status !== 'done').length, color: "var(--neon-pink)", icon: "★" },
                ].map((kpi, i) => (
                  <div key={i} className="card-hover" style={{ padding: "24px", borderRadius: "16px", background: "var(--card)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-dimmer)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono'" }}>{kpi.label}</span>
                      <span style={{ color: kpi.color, fontSize: "18px" }}>{kpi.icon}</span>
                    </div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: "42px", lineHeight: 1, color: kpi.color }}>
                      {kpi.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Campaign status & AI INITIALIZER WITH DYNAMIC STATUS */}
              <div className="card-hover" style={{ padding: "28px", borderRadius: "16px", background: "var(--card)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                  <h3 style={{ fontWeight: 700, fontSize: "16px" }}>Active Campaigns</h3>
                  {campaigns.length > 0 && <button className="btn-ghost" style={{ padding: "6px 14px", borderRadius: "6px", fontSize: "12px" }} onClick={() => setActiveTab("campaigns")}>View All</button>}
                </div>
                
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
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {campaigns.slice(0, 3).map((c, i) => (
                      <div key={i} style={{ padding: "16px", borderRadius: "12px", background: "var(--black3)", border: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <span style={{ fontWeight: 600, fontSize: "14px" }}>{c.name}</span>
                          <span className={`tag status-${c.status || 'draft'}`}>{(c.status || 'draft').toUpperCase()}</span>
                        </div>
                        <div style={{ display: "flex", gap: "20px" }}>
                          <span style={{ fontSize: "12px", color: "var(--text-dimmer)" }}>Spend: <strong style={{ color: "var(--text)" }}>${(c.spend || 0).toLocaleString()}</strong></span>
                          <span style={{ fontSize: "12px", color: "var(--text-dimmer)" }}>Leads: <strong style={{ color: "var(--neon-green)" }}>{c.leads || 0}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CHAT TAB */}
          {activeTab === "chat" && (
            <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 200px)" }}>
              <div className="card-hover" style={{ flex: 1, borderRadius: "16px", background: "var(--card)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--orange)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue'", fontSize: "18px" }}>N</div>
                  <div style={{ fontWeight: 700, fontSize: "15px" }}>Support Chat</div>
                </div>

                <div style={{ flex: 1, overflow: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  {chatHistory.length === 0 ? (
                    <div style={{ margin: "auto", color: "var(--text-dimmer)" }}>Start a conversation with our team...</div>
                  ) : (
                    chatHistory.map((m, i) => (
                      <div key={i} style={{ display: "flex", flexDirection: m.type === "user" ? "row-reverse" : "row", gap: "12px", alignItems: "flex-start" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: m.type === "user" ? "var(--border)" : "var(--black3)", border: m.type !== "user" ? "1px solid var(--border)" : "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, flexShrink: 0, overflow: "hidden" }}>
                          {m.type === "user" ? (
                            currentUser?.photoURL ? <img src={currentUser.photoURL} alt="User" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "U"
                          ) : "N"}
                        </div>
                        <div style={{ maxWidth: "70%" }}>
                          <div style={{ padding: "12px 16px", borderRadius: m.type === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px", background: m.type === "user" ? "var(--orange)" : "var(--black3)", border: m.type !== "user" ? "1px solid var(--border)" : "none", fontSize: "14px", lineHeight: 1.5 }}>
                            {m.msg}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text-dimmer)", marginTop: "4px", textAlign: m.type === "user" ? "right" : "left", fontFamily: "'JetBrains Mono'" }}>{m.time}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", gap: "12px" }}>
                  <input
                    value={chatMsg}
                    onChange={e => setChatMsg(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendMessage()}
                    placeholder="Type your message..."
                    style={{ flex: 1, padding: "12px 16px", borderRadius: "10px", fontSize: "14px" }}
                  />
                  <button className="btn-primary" onClick={sendMessage} style={{ padding: "12px 24px", borderRadius: "10px", fontSize: "14px" }}>SEND</button>
                </div>
              </div>
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
                      <span style={{ fontFamily: "'JetBrains Mono'", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dimmer)" }}>
                        {status === "progress" ? "In Progress" : status}
                      </span>
                      <span style={{ marginLeft: "auto", background: "var(--black3)", borderRadius: "10px", padding: "2px 8px", fontSize: "11px", fontFamily: "'JetBrains Mono'" }}>
                        {tasks.filter(t => t.status === status).length}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {tasks.filter(t => t.status === status).map((task, i) => (
                        <div key={i} style={{ padding: "16px", borderRadius: "10px", background: "var(--black3)", border: "1px solid var(--border)", cursor: "pointer" }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>{task.title}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-dimmer)", fontFamily: "'JetBrains Mono'" }}>{task.campaign}</div>
                        </div>
                      ))}
                      {tasks.filter(t => t.status === status).length === 0 && (
                         <div style={{ fontSize: "12px", color: "var(--text-dimmer)", textAlign: "center", padding: "10px" }}>Empty</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CAMPAIGNS TAB */}
          {activeTab === "campaigns" && (
            <div className="card-hover" style={{ borderRadius: "16px", background: "var(--card)", overflow: "hidden" }}>
              <div style={{ padding: "24px 24px 0" }}>
                <h3 style={{ fontWeight: 700, fontSize: "18px", marginBottom: "20px" }}>All Campaigns</h3>
              </div>
              {campaigns.length === 0 ? (
                 <div style={{ padding: "40px", textAlign: "center", color: "var(--text-dimmer)" }}>No campaigns found.</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Campaign</th>
                      <th>Channel</th>
                      <th>Status</th>
                      <th>Spend</th>
                      <th>Leads</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map(c => (
                      <tr key={c.id}>
                        <td><div style={{ fontWeight: 600, fontSize: "14px" }}>{c.name}</div></td>
                        <td><span style={{ fontSize: "12px", color: "var(--text-dim)", fontFamily: "'JetBrains Mono'" }}>{c.channel}</span></td>
                        <td><span className={`tag status-${c.status || 'draft'}`}>{(c.status || 'draft').toUpperCase()}</span></td>
                        <td><span style={{ fontFamily: "'JetBrains Mono'", fontSize: "13px" }}>${(c.spend || 0).toLocaleString()}</span></td>
                        <td><span style={{ fontFamily: "'JetBrains Mono'", fontSize: "13px" }}>{(c.leads || 0).toLocaleString()}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px", maxWidth: "600px" }}>
              <div className="card-hover" style={{ padding: "32px", borderRadius: "16px", background: "var(--card)" }}>
                <h3 style={{ fontWeight: 700, marginBottom: "24px" }}>Company Profile</h3>
                {[
                  { label: "Company Name", field: "name", value: currentUser?.displayName || "" },
                  { label: "Contact Person", field: "contact", value: currentUser?.displayName || "" },
                  { label: "Email Address", field: "email", value: currentUser?.email || "" },
                ].map((f, i) => (
                  <div key={i} style={{ marginBottom: "16px" }}>
                    <label style={{ fontSize: "11px", color: "var(--text-dimmer)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono'", display: "block", marginBottom: "6px" }}>{f.label}</label>
                    <input 
                      defaultValue={f.value} 
                      placeholder={`Enter ${f.label.toLowerCase()}`}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", fontSize: "14px" }} 
                    />
                  </div>
                ))}
                <button className="btn-primary" style={{ padding: "12px 24px", borderRadius: "8px", fontSize: "13px", marginTop: "8px" }}>SAVE PROFILE</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* THE AI INTAKE MODAL */}
      {showIntakeForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", overflow: "auto", padding: "40px 20px" }}>
          <div className="card-hover" style={{ background: "var(--black2)", padding: "40px", borderRadius: "16px", maxWidth: "600px", width: "100%", position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
            
            <button onClick={() => setShowIntakeForm(false)} style={{ position: "absolute", top: "20px", right: "24px", background: "transparent", border: "none", color: "var(--text-dimmer)", fontSize: "24px", cursor: "pointer" }}>×</button>
            
            <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: "32px", marginBottom: "8px", color: "var(--orange)" }}>AI AGENT BRIEFING</h2>
            <p style={{ fontSize: "13px", color: "var(--text-dim)", marginBottom: "32px" }}>Help our AI understand your business context. Our team reviews all strategies before launch.</p>
            
            <form onSubmit={submitIntakeForm} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              <div>
                <label style={{ fontSize: "11px", color: "var(--text-dimmer)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono'", display: "block", marginBottom: "6px" }}>Business URL (Optional)</label>
                <input 
                  type="url" 
                  placeholder="https://... (Leave blank if not applicable)" 
                  value={intakeData.businessUrl}
                  onChange={e => setIntakeData({...intakeData, businessUrl: e.target.value})}
                  style={{ width: "100%", padding: "12px", borderRadius: "8px" }} 
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "var(--text-dimmer)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono'", display: "block", marginBottom: "6px" }}>Target Audience Profile *</label>
                <textarea 
                  required
                  placeholder="e.g. Local homeowners aged 30-55 looking for landscaping..." 
                  value={intakeData.targetAudience}
                  onChange={e => setIntakeData({...intakeData, targetAudience: e.target.value})}
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", minHeight: "80px", resize: "vertical" }} 
                />
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "var(--text-dimmer)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono'", display: "block", marginBottom: "6px" }}>Monthly Ad Budget ($) *</label>
                <input 
                  type="number"
                  required
                  placeholder="e.g. 5000" 
                  value={intakeData.monthlyBudget}
                  onChange={e => setIntakeData({...intakeData, monthlyBudget: e.target.value})}
                  style={{ width: "100%", padding: "12px", borderRadius: "8px" }} 
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-dimmer)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono'", display: "block", marginBottom: "6px" }}>Primary Goal *</label>
                  <select 
                    value={intakeData.primaryGoal}
                    onChange={e => setIntakeData({...intakeData, primaryGoal: e.target.value})}
                    style={{ width: "100%", padding: "12px", borderRadius: "8px" }}>
                    {availableGoals.map(g => <option key={`pri-${g}`} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-dimmer)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono'", display: "block", marginBottom: "6px" }}>Secondary Goal</label>
                  <select 
                    value={intakeData.secondaryGoal}
                    onChange={e => setIntakeData({...intakeData, secondaryGoal: e.target.value})}
                    style={{ width: "100%", padding: "12px", borderRadius: "8px" }}>
                    {availableGoals.map(g => <option key={`sec-${g}`} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "var(--text-dimmer)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono'", display: "block", marginBottom: "10px" }}>Preferred Channels *</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {availableChannels.map(channel => (
                    <div 
                      key={channel}
                      onClick={() => {
                        const isSelected = intakeData.channels.includes(channel);
                        const newChannels = isSelected 
                          ? intakeData.channels.filter(c => c !== channel) 
                          : [...intakeData.channels, channel];
                        setIntakeData({...intakeData, channels: newChannels});
                      }}
                      style={{ 
                        padding: "8px 16px", borderRadius: "20px", fontSize: "12px", cursor: "pointer", transition: "all 0.2s",
                        background: intakeData.channels.includes(channel) ? "var(--orange)" : "var(--black3)",
                        color: intakeData.channels.includes(channel) ? "white" : "var(--text-dim)",
                        border: `1px solid ${intakeData.channels.includes(channel) ? "var(--orange)" : "var(--border)"}`
                      }}>
                      {channel}
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={intakeData.channels.length === 0} style={{ padding: "16px", borderRadius: "8px", fontSize: "15px", marginTop: "12px", opacity: intakeData.channels.length === 0 ? 0.5 : 1 }}>
                SUBMIT FOR AI ANALYSIS
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}