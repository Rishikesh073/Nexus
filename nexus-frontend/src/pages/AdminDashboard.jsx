import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // LIVE DATA STATES
  const [adminUser] = useState({ name: "Admin", initials: "AD" });
  const [campaigns, setCampaigns] = useState([]);
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);
  
  // POPUP MODAL STATES
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: "", clientId: "", channel: "Google Ads", spend: 0, leads: 0, status: "live" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const safeGet = (url) => api.get(url).catch(err => {
          console.error(`Error fetching ${url}:`, err);
          setNetworkError(true);
          return { data: [] }; 
        });

        const [campRes, clientRes, taskRes, msgRes, reqRes] = await Promise.all([
          safeGet('/campaigns'),
          safeGet('/clients'),
          safeGet('/tasks'),
          safeGet('/messages'),
          safeGet('/service-requests') 
        ]);

        setCampaigns(campRes.data);
        setClients(clientRes.data);
        setTasks(taskRes.data);
        setMessages(msgRes.data);
        setServiceRequests(reqRes.data || []); 
      } catch (error) {
        console.error("Critical error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // APPROVE & DEPLOY LOGIC
  const handleApprove = async (request) => {
    try {
      await api.put(`/service-requests/${request.id}/approve`);
      setServiceRequests(prev => prev.map(req => req.id === request.id ? { ...req, status: 'approved' } : req));
      setSelectedRequest(null);
      alert("AI Agent deployed! The Client Dashboard is now synced to active mode.");
    } catch (error) {
      alert("Error approving request. Check console.");
    }
  };

  // SYNC CAMPAIGN TO CLIENT DASHBOARD
  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/campaigns', {
        ...newCampaign,
        createdAt: new Date().toISOString()
      });
      setCampaigns([...campaigns, { id: res.data.id, ...newCampaign }]);
      setShowCampaignModal(false);
      setNewCampaign({ name: "", clientId: "", channel: "Google Ads", spend: 0, leads: 0, status: "live" });
      alert("Campaign successfully deployed! This will instantly appear on the Client's dashboard.");
    } catch (error) {
      alert("Failed to create campaign.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/admin-login"); 
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const totalMRR = clients.reduce((a, c) => a + (Number(c.mrr) || 0), 0);
  const totalLeads = campaigns.reduce((a, c) => a + (Number(c.leads) || 0), 0);
  const totalSpend = campaigns.reduce((a, c) => a + (Number(c.spend) || 0), 0);

  const sidebarItems = [
    { id: "overview", icon: "⊡", label: "Overview" },
    { id: "requests", icon: "⚡", label: "AI Briefs", badge: serviceRequests.filter(r => r.status === 'pending_admin_review').length || null }, 
    { id: "clients", icon: "◉", label: "Clients", badge: clients.length || null },
    { id: "campaigns", icon: "▲", label: "Campaigns" },
    { id: "analytics", icon: "📊", label: "Analytics" },
    { id: "tasks", icon: "☑", label: "Task Board" },
    { id: "messages", icon: "✉", label: "Messages" },
  ];

  if (loading) return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--orange)" }}>LOADING ADMIN MAINFRAME...</div>;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: "250px", flexShrink: 0, background: "var(--black2)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", padding: "20px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", marginBottom: "8px" }}>
          <div style={{ width: "32px", height: "32px", background: "var(--orange)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue'", fontSize: "18px", boxShadow: "0 0 20px rgba(255,85,0,0.4)" }}>N</div>
          <div>
            <span style={{ fontFamily: "'Bebas Neue'", fontSize: "20px", letterSpacing: "0.1em", display: "block" }}>NEXUS</span>
            <span style={{ fontSize: "10px", color: "var(--orange)", fontFamily: "'JetBrains Mono'", letterSpacing: "0.1em" }}>ADMIN CONTROL</span>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "16px" }}>
          {sidebarItems.map(item => (
            <div key={item.id} className={`sidebar-item ${activeTab === item.id ? "active" : ""}`} onClick={() => setActiveTab(item.id)}>
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && <span style={{ marginLeft: "auto", background: activeTab === item.id ? "var(--orange)" : "var(--border)", color: activeTab === item.id ? "white" : "var(--text-dimmer)", borderRadius: "10px", padding: "1px 8px", fontSize: "11px", fontWeight: 700 }}>{item.badge}</span>}
            </div>
          ))}
        </nav>

        <div style={{ marginTop: "auto" }}>
          <button className="btn-ghost" onClick={() => navigate("/")} style={{ width: "100%", padding: "10px", borderRadius: "8px", fontSize: "12px", marginBottom: "8px" }}>← Back to Site</button>
          <button className="btn-ghost" onClick={handleLogout} style={{ width: "100%", padding: "10px", borderRadius: "8px", fontSize: "12px", color: "var(--neon-pink)", borderColor: "rgba(255,0,110,0.3)" }}>LOG OUT</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: "auto", background: "var(--black)", position: "relative" }}>
        
        {/* Network Error Banner */}
        {networkError && (
          <div style={{ background: "rgba(255,0,110,0.1)", color: "var(--neon-pink)", padding: "12px 32px", fontSize: "13px", borderBottom: "1px solid rgba(255,0,110,0.3)" }}>
            ⚠️ <strong>Backend Connection Failed:</strong> Ensure your Express server is running.
          </div>
        )}

        <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "rgba(8,8,8,0.9)", backdropFilter: "blur(20px)", zIndex: 100 }}>
          <div><h1 style={{ fontSize: "24px", fontWeight: 700 }}>{sidebarItems.find(s => s.id === activeTab)?.label}</h1></div>
          <button className="btn-primary" onClick={() => setShowCampaignModal(true)} style={{ padding: "10px 20px", borderRadius: "8px", fontSize: "13px" }}>+ DEPLOY CAMPAIGN</button>
        </div>

        <div style={{ padding: "32px" }}>
          
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
             <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                {[
                  { label: "Monthly Revenue", value: `$${totalMRR.toLocaleString()}`, color: "var(--neon-green)", icon: "◈" },
                  { label: "Total Clients", value: clients.length, color: "var(--neon-blue)", icon: "◉" },
                  { label: "Ad Spend Managed", value: `$${totalSpend.toLocaleString()}`, color: "var(--orange)", icon: "⚡" },
                  { label: "Total Leads", value: totalLeads.toLocaleString(), color: "var(--neon-pink)", icon: "★" },
                ].map((kpi, i) => (
                  <div key={i} className="card-hover" style={{ padding: "24px", borderRadius: "16px", background: "var(--card)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-dimmer)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono'" }}>{kpi.label}</span>
                      <span style={{ color: kpi.color, fontSize: "18px" }}>{kpi.icon}</span>
                    </div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: "40px", color: kpi.color, lineHeight: 1 }}>{kpi.value}</div>
                  </div>
                ))}
              </div>
          )}

          {/* AI REQUESTS TAB */}
          {activeTab === "requests" && (
            <div className="card-hover" style={{ borderRadius: "16px", background: "var(--card)", overflow: "hidden" }}>
              <div style={{ padding: "24px 24px 0" }}>
                <h3 style={{ fontWeight: 700, fontSize: "18px", marginBottom: "20px" }}>Pending AI Strategies</h3>
              </div>
              {serviceRequests.filter(r => r.status === 'pending_admin_review').length === 0 ? (
                 <div style={{ padding: "40px", textAlign: "center", color: "var(--text-dimmer)" }}>No pending AI service requests.</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th>Primary Goal</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceRequests.filter(r => r.status === 'pending_admin_review').map(req => (
                      <tr key={req.id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: "14px" }}>{req.clientName || 'N/A'}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-dimmer)" }}>{req.clientEmail || 'N/A'}</div>
                        </td>
                        <td><span style={{ fontSize: "13px", color: "var(--neon-blue)" }}>{req.requirements?.primaryGoal}</span></td>
                        <td><span className={`tag status-draft`}>PENDING REVIEW</span></td>
                        <td>
                          <button 
                            onClick={() => setSelectedRequest(req)}
                            className="btn-ghost" 
                            style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "11px", border: "1px solid var(--border)" }}>
                            VIEW BRIEF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* CLIENTS TAB (RESTORED) */}
          {activeTab === "clients" && (
            <div className="card-hover" style={{ borderRadius: "16px", background: "var(--card)", overflow: "hidden" }}>
              {clients.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "var(--text-dimmer)" }}>No clients registered yet.</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th>Email Address</th>
                      <th>Plan / MRR</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map(c => (
                      <tr key={c.id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: "14px" }}>{c.name || "N/A"}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: "13px", color: "var(--text-dim)" }}>{c.email}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: "11px", color: "var(--orange)", textTransform: "uppercase", fontWeight: 700 }}>{c.plan || "Pending"}</div>
                          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: "13px", color: "var(--neon-green)" }}>${(c.mrr || 0).toLocaleString()}</span>
                        </td>
                        <td>
                          <button className="btn-ghost" style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "11px", border: "1px solid var(--border)" }}>EDIT</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* CAMPAIGNS TAB (RESTORED) */}
          {activeTab === "campaigns" && (
            <div className="card-hover" style={{ borderRadius: "16px", background: "var(--card)", overflow: "hidden" }}>
              {campaigns.length === 0 ? <div style={{ padding: "40px", textAlign: "center", color: "var(--text-dimmer)" }}>No campaigns deployed.</div> : (
                <table>
                  <thead>
                    <tr><th>Campaign Name</th><th>Client ID</th><th>Status</th><th>Spend</th><th>Leads</th></tr>
                  </thead>
                  <tbody>
                    {campaigns.map(c => (
                      <tr key={c.id}>
                        <td><span style={{ fontWeight: 600 }}>{c.name}</span></td>
                        <td style={{ color: "var(--text-dim)", fontSize: "12px" }}>{c.clientId}</td>
                        <td><span className={`tag status-${c.status || 'draft'}`}>{(c.status || 'live').toUpperCase()}</span></td>
                        <td><span style={{ color: "var(--orange)", fontFamily: "'JetBrains Mono'" }}>${c.spend}</span></td>
                        <td><span style={{ color: "var(--neon-green)", fontFamily: "'JetBrains Mono'" }}>{c.leads}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TASKS TAB (RESTORED) */}
          {activeTab === "tasks" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                {["todo", "progress", "done"].map(status => (
                  <div key={status} style={{ padding: "20px", borderRadius: "16px", background: "var(--card)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                      <span style={{ fontFamily: "'JetBrains Mono'", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dimmer)" }}>
                        {status}
                      </span>
                    </div>
                    {tasks.filter(t => t.status === status).map((task, i) => (
                      <div key={i} style={{ padding: "16px", borderRadius: "10px", background: "var(--black3)", border: "1px solid var(--border)", marginBottom: "10px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 600 }}>{task.title}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-dimmer)", marginTop: "4px" }}>Client ID: {task.clientId || "N/A"}</div>
                      </div>
                    ))}
                    {tasks.filter(t => t.status === status).length === 0 && (
                         <div style={{ fontSize: "12px", color: "var(--text-dimmer)", textAlign: "center", padding: "10px" }}>Empty</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MESSAGES TAB (RESTORED) */}
          {activeTab === "messages" && (
            <div className="card-hover" style={{ borderRadius: "16px", background: "var(--card)", overflow: "hidden", display: "flex", flexDirection: "column", height: "calc(100vh - 200px)" }}>
              <div style={{ padding: "20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
                <h3 style={{ fontWeight: 700, fontSize: "15px" }}>Global Inbox</h3>
              </div>
              <div style={{ overflow: "auto", flex: 1 }}>
                {messages.length === 0 ? (
                   <div style={{ padding: "40px", textAlign: "center", color: "var(--text-dimmer)" }}>Inbox is empty.</div>
                ) : (
                  messages.map((m, i) => (
                    <div key={i} style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                            <span style={{ fontWeight: 600, fontSize: "13px", color: "var(--orange)" }}>{m.from || 'System'}</span>
                            <span style={{ fontSize: "11px", color: "var(--text-dimmer)", fontFamily: "'JetBrains Mono'" }}>{m.time}</span>
                          </div>
                          <p style={{ fontSize: "13px", color: "var(--text)", marginTop: "4px" }}>{m.msg}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === "analytics" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
               <div className="card-hover" style={{ padding: "24px", borderRadius: "16px", background: "var(--card)" }}>
                 <h3 style={{ marginBottom: "20px" }}>Revenue Overview</h3>
                 <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed var(--border)", borderRadius: "8px", color: "var(--text-dimmer)" }}>
                    [System Analytics Graphs Loading...]
                 </div>
               </div>
               <div className="card-hover" style={{ padding: "24px", borderRadius: "16px", background: "var(--card)" }}>
                 <h3 style={{ marginBottom: "20px" }}>Global Lead Generation</h3>
                 <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed var(--border)", borderRadius: "8px", color: "var(--text-dimmer)" }}>
                    [Performance Tracking Graphs Loading...]
                 </div>
               </div>
            </div>
          )}
          
        </div>

        {/* --- CAMPAIGN CREATION MODAL --- */}
        {showCampaignModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="card-hover" style={{ background: "var(--black2)", padding: "40px", borderRadius: "16px", maxWidth: "500px", width: "100%", position: "relative", border: "1px solid var(--border)" }}>
              <button onClick={() => setShowCampaignModal(false)} style={{ position: "absolute", top: "20px", right: "24px", background: "none", border: "none", color: "var(--text-dimmer)", fontSize: "24px", cursor: "pointer" }}>×</button>
              <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: "28px", color: "var(--neon-blue)", marginBottom: "24px" }}>DEPLOY AI CAMPAIGN</h2>
              
              <form onSubmit={handleCreateCampaign} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-dimmer)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Target Client</label>
                  <select required value={newCampaign.clientId} onChange={e => setNewCampaign({...newCampaign, clientId: e.target.value})} style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "var(--black)", color: "white", border: "1px solid var(--border)" }}>
                    <option value="">Select a Client...</option>
                    {clients.map(c => <option key={c.id} value={c.uid}>{c.name} ({c.email})</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-dimmer)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Campaign Name</label>
                  <input required type="text" placeholder="e.g., Q3 Retargeting" value={newCampaign.name} onChange={e => setNewCampaign({...newCampaign, name: e.target.value})} style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "var(--black)", color: "white", border: "1px solid var(--border)" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ fontSize: "11px", color: "var(--text-dimmer)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Current Spend</label>
                    <input type="number" required value={newCampaign.spend} onChange={e => setNewCampaign({...newCampaign, spend: Number(e.target.value)})} style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "var(--black)", color: "white", border: "1px solid var(--border)" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "var(--text-dimmer)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Leads Generated</label>
                    <input type="number" required value={newCampaign.leads} onChange={e => setNewCampaign({...newCampaign, leads: Number(e.target.value)})} style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "var(--black)", color: "white", border: "1px solid var(--border)" }} />
                  </div>
                </div>
                <button type="submit" className="btn-primary" style={{ padding: "14px", borderRadius: "8px", marginTop: "12px" }}>INJECT CAMPAIGN TO CLIENT</button>
              </form>
            </div>
          </div>
        )}

        {/* --- THE AI BRIEF POPUP MODAL --- */}
        {selectedRequest && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
            <div className="card-hover" style={{ background: "var(--black2)", padding: "40px", borderRadius: "16px", maxWidth: "600px", width: "100%", position: "relative", border: "1px solid rgba(255,85,0,0.3)" }}>
              <button onClick={() => setSelectedRequest(null)} style={{ position: "absolute", top: "20px", right: "24px", background: "transparent", border: "none", color: "var(--text-dimmer)", fontSize: "24px", cursor: "pointer" }}>×</button>
              
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                <div style={{ width: "40px", height: "40px", background: "var(--orange)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue'", fontSize: "20px" }}>⚡</div>
                <div>
                  <h2 style={{ fontFamily: "'Bebas Neue'", fontSize: "28px", color: "var(--orange)", lineHeight: 1 }}>CLIENT AI BRIEF</h2>
                  <div style={{ fontSize: "12px", color: "var(--text-dimmer)", fontFamily: "'JetBrains Mono'" }}>{selectedRequest.clientName}</div>
                </div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "32px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ fontSize: "10px", color: "var(--text-dimmer)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>Primary Goal</label>
                    <div style={{ padding: "12px", background: "rgba(0,255,148,0.1)", color: "var(--neon-green)", borderRadius: "8px", fontSize: "13px", border: "1px solid rgba(0,255,148,0.2)", fontWeight: 600 }}>
                      {selectedRequest.requirements?.primaryGoal}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: "10px", color: "var(--text-dimmer)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>Monthly Budget</label>
                    <div style={{ padding: "12px", background: "var(--black3)", borderRadius: "8px", fontSize: "13px", border: "1px solid var(--border)" }}>
                      ${selectedRequest.requirements?.monthlyBudget}
                    </div>
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ fontSize: "10px", color: "var(--text-dimmer)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>Business URL</label>
                    <div style={{ padding: "12px", background: "var(--black3)", borderRadius: "8px", fontSize: "13px", border: "1px solid var(--border)" }}>
                      {selectedRequest.requirements?.businessUrl || "Not Provided"}
                    </div>
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ fontSize: "10px", color: "var(--text-dimmer)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>Target Audience</label>
                    <div style={{ padding: "12px", background: "var(--black3)", borderRadius: "8px", fontSize: "13px", border: "1px solid var(--border)", minHeight: "60px" }}>
                      {selectedRequest.requirements?.targetAudience}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: "10px", color: "var(--text-dimmer)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>Secondary Goal</label>
                    <div style={{ padding: "12px", background: "var(--black3)", borderRadius: "8px", fontSize: "13px", border: "1px solid var(--border)" }}>
                      {selectedRequest.requirements?.secondaryGoal || "None"}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: "10px", color: "var(--text-dimmer)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "4px" }}>Requested Channels</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {selectedRequest.requirements?.channels?.map(channel => (
                        <span key={channel} style={{ padding: "4px 8px", background: "var(--black)", border: "1px solid var(--orange)", color: "var(--orange)", borderRadius: "12px", fontSize: "10px", fontWeight: 700 }}>
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button className="btn-primary" onClick={() => handleApprove(selectedRequest)} style={{ flex: 1, padding: "16px", borderRadius: "8px", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <span>APPROVE & DEPLOY AGENT</span>
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}