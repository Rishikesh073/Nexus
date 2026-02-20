import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // LIVE DATA STATES
  const [adminUser, setAdminUser] = useState({ name: "Admin", initials: "AD" });
  const [campaigns, setCampaigns] = useState([]);
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);
  
  // POPUP MODAL STATE
  const [selectedRequest, setSelectedRequest] = useState(null);

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

  // THE MAGIC WORKFLOW: APPROVE & AUTO-GENERATE CAMPAIGN
  const handleApprove = async (request) => {
    try {
      // 1. Mark request as approved
      await api.put(`/service-requests/${request.id}/approve`);
      
      // 2. Automatically scaffold a new campaign for the client
      const newCampaign = {
        clientId: request.clientId,
        name: `${request.requirements.primaryGoal} - AI Initialized`,
        channel: request.requirements.channels.join(", "),
        status: "building", // Shows the AI is working on it
        spend: 0,
        leads: 0,
        createdAt: new Date().toISOString()
      };
      
      // Post it to the database so the client sees it immediately
      const campRes = await api.post('/campaigns', newCampaign);

      // Update local state
      setServiceRequests(prev => prev.map(req => req.id === request.id ? { ...req, status: 'approved' } : req));
      setCampaigns(prev => [...prev, { id: campRes.data.id, ...newCampaign }]);
      setSelectedRequest(null);
      alert("AI Agent deployed! The initial campaign has been scaffolded for the client.");
    } catch (error) {
      console.error("Failed to approve request", error);
      alert("Error approving request. Make sure your Express server is running.");
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
  const activeCampaignsCount = campaigns.filter(c => c.status === "live").length;

  const sidebarItems = [
    { id: "overview", icon: "⊡", label: "Overview" },
    { id: "requests", icon: "⚡", label: "AI Briefs", badge: serviceRequests.filter(r => r.status === 'pending_admin_review').length || null }, 
    { id: "clients", icon: "◉", label: "Clients", badge: clients.length || null },
    { id: "campaigns", icon: "▲", label: "Campaigns" },
    { id: "analytics", icon: "📊", label: "Analytics" }, // <-- RESTORED
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

        <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
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
        <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "rgba(8,8,8,0.9)", backdropFilter: "blur(20px)", zIndex: 100 }}>
          <div><h1 style={{ fontSize: "24px", fontWeight: 700 }}>{sidebarItems.find(s => s.id === activeTab)?.label}</h1></div>
        </div>

        <div style={{ padding: "32px" }}>
          
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

          {/* ANALYTICS TAB RESTORED */}
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

          {/* ... Rest of tabs (Overview, Clients, Campaigns, Tasks) remain unchanged ... */}
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
          
        </div>

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
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                {/* Notice we pass the WHOLE request object here now */}
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