export const campaigns = [
  { id: 1, name: "Luxury Watch Brand - Q1 Push", client: "ChronoLux Inc", status: "live", spend: 48200, roi: 340, leads: 1240, conversions: 89, channel: "Meta + Google", progress: 72 },
  { id: 2, name: "SaaS Startup - Product Launch", client: "Stackr Labs", status: "live", spend: 22100, roi: 280, leads: 640, conversions: 41, channel: "LinkedIn + Email", progress: 58 },
  { id: 3, name: "E-Commerce - Summer Sale", client: "Velvet Goods", status: "pending", spend: 0, roi: 0, leads: 0, conversions: 0, channel: "Meta + WhatsApp", progress: 15 },
  { id: 4, name: "Real Estate - Lead Gen", client: "Apex Realty", status: "live", spend: 31800, roi: 420, leads: 890, conversions: 67, channel: "Google + SEO", progress: 88 },
  { id: 5, name: "Fintech - App Downloads", client: "FlowPay", status: "paused", spend: 15400, roi: 190, leads: 320, conversions: 28, channel: "Google UAC", progress: 45 },
];

export const clients = [
  { id: 1, name: "ChronoLux Inc", contact: "Marcus Webb", email: "m.webb@chronolux.com", plan: "Enterprise", mrr: 8500, campaigns: 3, since: "Jan 2024", avatar: "CL" },
  { id: 2, name: "Stackr Labs", contact: "Priya Sharma", email: "priya@stackrlabs.io", plan: "Growth", mrr: 3200, campaigns: 2, since: "Mar 2024", avatar: "SL" },
  { id: 3, name: "Velvet Goods", contact: "Zoe Müller", email: "zoe@velvetgoods.co", plan: "Growth", mrr: 2800, campaigns: 1, since: "Apr 2024", avatar: "VG" },
  { id: 4, name: "Apex Realty", contact: "David Chen", email: "d.chen@apexrealty.com", plan: "Enterprise", mrr: 6200, campaigns: 2, since: "Feb 2024", avatar: "AR" },
  { id: 5, name: "FlowPay", contact: "Amara Diallo", email: "amara@flowpay.io", plan: "Starter", mrr: 1200, campaigns: 1, since: "May 2024", avatar: "FP" },
];

export const messages = [
  { from: "Marcus Webb", msg: "Love the Q1 results! ROI is insane.", time: "2m ago", avatar: "CL", unread: true },
  { from: "Priya Sharma", msg: "When does the LinkedIn campaign start?", time: "1h ago", avatar: "SL", unread: true },
  { from: "David Chen", msg: "Can we increase the Google budget?", time: "3h ago", avatar: "AR", unread: false },
  { from: "Amara Diallo", msg: "Need to pause for 2 weeks", time: "1d ago", avatar: "FP", unread: false },
];

export const monthlyData = [
  { month: "Jan", spend: 42000, revenue: 168000, leads: 3200 },
  { month: "Feb", spend: 48000, revenue: 192000, leads: 3800 },
  { month: "Mar", spend: 55000, revenue: 231000, leads: 4500 },
  { month: "Apr", spend: 61000, revenue: 280000, leads: 5100 },
  { month: "May", spend: 58000, revenue: 264000, leads: 4900 },
  { month: "Jun", spend: 72000, revenue: 360000, leads: 6200 },
];

export const tickerItems = ["NEXUS AI AGENCY", "MARKETING AUTOMATION", "ROI MAXIMIZATION", "LEAD GENERATION", "GOOGLE ADS", "META ADS", "EMAIL AUTOMATION", "SEO DOMINATION", "WHATSAPP MARKETING", "CRM PIPELINES"];

export const services = [
  { icon: "⚡", label: "Google Ads", color: "#00D4FF" },
  { icon: "◆", label: "Meta Ads", color: "#FF006E" },
  { icon: "✉", label: "Email Automation", color: "#00FF94" },
  { icon: "💬", label: "WhatsApp", color: "#FFE600" },
  { icon: "🔍", label: "SEO", color: "#FF5500" },
  { icon: "◉", label: "LinkedIn Ads", color: "#00D4FF" },
  { icon: "▲", label: "CRM Pipeline", color: "#FF006E" },
  { icon: "★", label: "Lead Gen", color: "#00FF94" },
];

export const testimonials = [
  { name: "Marcus Webb", role: "CEO, ChronoLux Inc", text: "NEXUS transformed our marketing completely. 340% ROI in Q1 alone. These guys are wizards.", stars: 5 },
  { name: "Priya Sharma", role: "CTO, Stackr Labs", text: "The automation workflows saved us 40hrs/week. Our pipeline has never been this healthy.", stars: 5 },
  { name: "David Chen", role: "CMO, Apex Realty", text: "920% increase in qualified leads. The AI targeting is unlike anything we've seen before.", stars: 5 },
];

export const pricing = [
  { name: "Starter", price: 1200, features: ["2 Channels", "1 Campaign", "Basic Analytics", "Email Support", "Weekly Reports"], color: "#888" },
  { name: "Growth", price: 3000, features: ["5 Channels", "5 Campaigns", "Advanced Analytics", "Slack Support", "AI Optimization", "CRM Integration"], color: "#FF5500", featured: true },
  { name: "Enterprise", price: 7500, features: ["All Channels", "Unlimited Campaigns", "Real-time Analytics", "Dedicated Manager", "Custom Workflows", "White-label Reports", "API Access"], color: "#00FF94" },
];

export const tasks = [
  { id: 1, title: "Design Meta Ad Creatives", campaign: "ChronoLux Q1", status: "done", assignee: "CTO", due: "Jun 10" },
  { id: 2, title: "Set Up Google Smart Bidding", campaign: "Apex Realty", status: "done", assignee: "CTO", due: "Jun 12" },
  { id: 3, title: "Launch Email Sequence v2", campaign: "Stackr Labs", status: "progress", assignee: "CEO", due: "Jun 14" },
  { id: 4, title: "Optimize Landing Page Copy", campaign: "ChronoLux Q1", status: "progress", assignee: "CEO", due: "Jun 15" },
  { id: 5, title: "Configure WhatsApp Flows", campaign: "Velvet Goods", status: "todo", assignee: "CTO", due: "Jun 18" },
  { id: 6, title: "Build Lead Scoring Model", campaign: "FlowPay", status: "todo", assignee: "CEO", due: "Jun 20" },
];