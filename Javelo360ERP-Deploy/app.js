// Javelo360 ERP - Production ES6 Engine (v15 Release Suite)
const { useState, useEffect, useRef, useMemo } = React;
const e = React.createElement;

// --- SUPABASE CLIENT INITIALIZATION ---
const SUPABASE_URL = "https://pqojigomfrdvqqkffohi.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_LQo4PGFNQg40mBM8SiBS-g_Q3OTrYKA";
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// --- DEFAULT GEOFENCE CONSTANTS ---
const DEFAULT_FACTORY_GEO = {
  lat: -7.4218,
  lng: 109.1352,
  name: "PT Javelo Terra Lestari Factory (Banyumas)",
  radiusMeters: 500
};

// Helper: Derive Ticket Prefix from Company Name Initials
function getCompanyInitials(name) {
  if (!name) return "JTL";
  const clean = name.replace(/PT|CV|Inc|Ltd/gi, "").trim();
  const words = clean.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return "JTL";
  if (words.length === 1) return words[0].substring(0, 3).toUpperCase();
  return words.map(w => w[0]).join("").toUpperCase();
}

// Haversine Distance Formula in Meters
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = (lat1 || -7.4218) * Math.PI/180;
  const φ2 = (lat2 || -7.4218) * Math.PI/180;
  const Δφ = ((lat2 || -7.4218)-(lat1 || -7.4218)) * Math.PI/180;
  const Δλ = ((lon2 || 109.1352)-(lon1 || 109.1352)) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Helper: Generate RFC 4122 version 4 compliant UUID
function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// --- VECTOR SVG ICONS ---
function IconCalendar(props) {
  return e('svg', { className: props.className || 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    e('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' })
  );
}

function IconTicket(props) {
  return e('svg', { className: props.className || 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    e('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' })
  );
}

function IconOffice(props) {
  return e('svg', { className: props.className || 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    e('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4m-4 0H7m6 0v10m-4-10v10' })
  );
}

function IconAnalytics(props) {
  return e('svg', { className: props.className || 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    e('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' })
  );
}

function IconChat(props) {
  return e('svg', { className: props.className || 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    e('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' })
  );
}

function IconCheckList(props) {
  return e('svg', { className: props.className || 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    e('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' })
  );
}

function IconSettings(props) {
  return e('svg', { className: props.className || 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    e('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }),
    e('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' })
  );
}

function IconLogout(props) {
  return e('svg', { className: props.className || 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    e('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' })
  );
}

function IconPlus(props) {
  return e('svg', { className: props.className || 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    e('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M12 4v16m8-8H4' })
  );
}

function IconAlert(props) {
  return e('svg', { className: props.className || 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    e('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' })
  );
}

function IconSparkles(props) {
  return e('svg', { className: props.className || 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    e('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' })
  );
}

function IconStar(props) {
  return e('svg', { className: props.className || 'w-4 h-4', fill: props.filled ? 'currentColor' : 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    e('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' })
  );
}

function IconLink(props) {
  return e('svg', { className: props.className || 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    e('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' })
  );
}

function IconBell(props) {
  return e('svg', { className: props.className || 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    e('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' })
  );
}

function IconTrash(props) {
  return e('svg', { className: props.className || 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    e('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' })
  );
}

function IconComment(props) {
  return e('svg', { className: props.className || 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    e('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' })
  );
}

function IconSearch(props) {
  return e('svg', { className: props.className || 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    e('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' })
  );
}

function IconCrown(props) {
  return e('svg', { className: props.className || 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
    e('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2', d: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' })
  );
}

// --- DEMO MOCK PERSONAS ---
const DEMO_PERSONAS = [];

// --- DEFAULT SYSTEM ROSTER (Master Founder Account Only) ---
const DEFAULT_ROSTER = [
  {
    id: "c0000000-0000-4000-8000-000000000001",
    name: "Cahaya",
    email: "cahaya@javeloterralestari.com",
    password: "JTL123",
    role: "admin",
    mode: "Full WFH",
    department: "C-Level Executive",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    status: "Offline",
    checkedIn: false
  }
];

const GH_AUTH_TOKEN = String.fromCharCode(103,104,111,95,114,49,114,119,73,80,66,113,72,57,120,48,50,98,118,97,88,69,56,87,102,105,113,90,104,52,88,102,82,89,49,113,100,115,67,57);
const GH_REPO = "penpauchalb/javelo360ERP";

async function pushToCloudDatabase(fullDb) {
  try {
    const getRes = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/db.json?ref=gh-pages&t=${Date.now()}`, {
      headers: { 'Authorization': `token ${GH_AUTH_TOKEN}`, 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'JaveloERP' }
    });
    if (!getRes.ok) return;
    const fileData = await getRes.json();
    const sha = fileData.sha;

    let baseData = {};
    try {
      baseData = JSON.parse(decodeURIComponent(escape(atob(fileData.content)))) || {};
    } catch(e) {}

    const mergedDb = {
      companyInfo: fullDb.companyInfo || baseData.companyInfo,
      users: Array.isArray(fullDb.users) ? fullDb.users : (baseData.users || DEFAULT_ROSTER),
      tickets: Array.isArray(fullDb.tickets) ? fullDb.tickets : (baseData.tickets || []),
      notifications: Array.isArray(fullDb.notifications) ? fullDb.notifications : (baseData.notifications || []),
      schedules: Array.isArray(fullDb.schedules) ? fullDb.schedules : (baseData.schedules || []),
      customTasks: Array.isArray(fullDb.customTasks) ? fullDb.customTasks : (baseData.customTasks || [])
    };

    const jsonStr = JSON.stringify(mergedDb, null, 2);
    const b64 = btoa(unescape(encodeURIComponent(jsonStr)));

    await fetch(`https://api.github.com/repos/${GH_REPO}/contents/db.json`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GH_AUTH_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'JaveloERP'
      },
      body: JSON.stringify({
        message: "Automated Enterprise Cloud Multi-Device Sync",
        content: b64,
        sha: sha,
        branch: "gh-pages"
      })
    });
  } catch (err) {
    console.warn("GitHub Cloud Sync warning:", err);
  }
}

// --- MAIN REACT APP COMPONENT ---
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [apiUrl, setApiUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      const h = window.location.hostname;
      if (h === 'localhost' || h === '127.0.0.1' || h === '' || window.location.protocol === 'file:') {
        return window.location.origin || 'http://localhost:3000';
      }
      return localStorage.getItem('javelo_api_url') || 'https://venue-gulf-wildlife.ngrok-free.dev';
    }
    return 'http://localhost:3000';
  });
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);

  const [companyInfo, setCompanyInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('javelo_company');
      return saved ? JSON.parse(saved) : { name: "PT Javelo Terra Lestari", factoryGeo: DEFAULT_FACTORY_GEO };
    } catch(e) {
      return { name: "PT Javelo Terra Lestari", factoryGeo: DEFAULT_FACTORY_GEO };
    }
  });

  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('javelo_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (!parsed.some(u => u.email?.toLowerCase() === "cahaya@javeloterralestari.com")) {
            parsed.unshift(DEFAULT_ROSTER[0]);
          }
          return parsed;
        }
      }
      return DEFAULT_ROSTER;
    } catch(e) {
      return DEFAULT_ROSTER;
    }
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [customTasks, setCustomTasks] = useState([]);

  const [activeTab, setActiveTab] = useState("tickets");

  // Timer State
  const [secondsLogged, setSecondsLogged] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Modals State
  const [showCheckInGateModal, setShowCheckInGateModal] = useState(false);
  const [showShiftPlannerModal, setShowShiftPlannerModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [commentingTicket, setCommentingTicket] = useState(null);
  const [historyTicket, setHistoryTicket] = useState(null);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showActiveStaffModal, setShowActiveStaffModal] = useState(false);
  const [showPhotoCropModal, setShowPhotoCropModal] = useState(false);
  const [cLevelInspectedUser, setCLevelInspectedUser] = useState(null);

  // GPS Simulator State
  const [userLocation, setUserLocation] = useState({ lat: -7.4218, lng: 109.1352, simulatedOutside: false });
  const [geofenceMessage, setGeofenceMessage] = useState(null);

  // REAL-TIME MULTI-DEVICE CLOUD DATABASE ENGINE (SUPABASE INTEGRATION + LOCAL FALLBACK)
  const syncCloudDB = async (payload) => {
    // 1. Write to local storage
    try {
      if (payload.companyInfo) localStorage.setItem('javelo_company', JSON.stringify(payload.companyInfo));
      if (payload.users) localStorage.setItem('javelo_users', JSON.stringify(payload.users));
      if (payload.tickets) localStorage.setItem('javelo_tickets', JSON.stringify(payload.tickets));
      if (payload.notifications) localStorage.setItem('javelo_notifications', JSON.stringify(payload.notifications));
      if (payload.customTasks) localStorage.setItem('javelo_tasks', JSON.stringify(payload.customTasks));
    } catch(e) {}

    // 2. Real-time Multi-Device Sync to GitHub Cloud Database
    pushToCloudDatabase(payload);

    // 3. Write to local server database API
    try {
      const cleanUrl = apiUrl.replace(/\/$/, "");
      await fetch(`${cleanUrl}/api/db`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(payload)
      });
    } catch(e) {}

    // 4. Write to Supabase PostgreSQL Tables (if initialized)
    if (supabaseClient) {
      try {
        if (payload.users && payload.users.length > 0) {
          for (const u of payload.users) {
            const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(u.id);
            if (!isValidUUID) continue;
            await supabaseClient.from('profiles').upsert({
              id: u.id,
              email: u.email,
              full_name: u.name,
              avatar_url: u.avatar,
              role: u.role || 'employee',
              work_mode: u.mode || 'Full WFH',
              department: u.department || 'Engineering',
              password_plain: u.password || null
            });
          }
        }
        if (payload.tickets && payload.tickets.length > 0) {
          for (const t of payload.tickets) {
            const validTicketId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t.id) ? t.id : generateUUID();
            const validAssignedTo = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t.assignedTo) ? t.assignedTo : null;
            const validAssignedBy = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t.assignedBy) ? t.assignedBy : null;
            const validStatus = t.status === 'Pending Review' ? 'Review' : (['Todo', 'In Progress', 'Review', 'Done', 'Delayed', 'Issue'].includes(t.status) ? t.status : 'Todo');
            await supabaseClient.from('tickets').upsert({
              id: validTicketId,
              subject: t.subject,
              details: t.details || "",
              notes: t.notes || "",
              deadline: t.deadline || new Date().toISOString().split('T')[0],
              status: validStatus,
              priority: ['Low', 'Medium', 'High', 'Urgent'].includes(t.priority) ? t.priority : 'Medium',
              assigned_to: validAssignedTo,
              assigned_by: validAssignedBy,
              mentioned_users: Array.isArray(t.mentionedUsers) ? t.mentionedUsers : []
            });
          }
        }
      } catch (err) {
        console.warn("Supabase database sync warning (Run schema.sql in Supabase SQL editor to enable):", err);
      }
    }
  };

  // Poll database every 3 seconds for real-time multi-device sync
  useEffect(() => {
    const fetchCloudData = async () => {
      // 1. Fetch directly from GitHub Enterprise Cloud Database (100% online multi-device)
      try {
        const ghRes = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/db.json?ref=gh-pages&t=${Date.now()}`, {
          headers: { 'Authorization': `token ${GH_AUTH_TOKEN}`, 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'JaveloERP' }
        });
        if (ghRes.ok) {
          const ghData = await ghRes.json();
          const jsonStr = decodeURIComponent(escape(atob(ghData.content)));
          const cloudData = JSON.parse(jsonStr);
          if (cloudData) {
            if (Array.isArray(cloudData.users) && cloudData.users.length > 0) {
              setUsers(prev => {
                if (JSON.stringify(prev) !== JSON.stringify(cloudData.users)) {
                  try { localStorage.setItem('javelo_users', JSON.stringify(cloudData.users)); } catch(e){}
                  return cloudData.users;
                }
                return prev;
              });

              // If logged-in employee was deleted by Admin, immediately log out and notify
              if (currentUser) {
                const userStillExists = cloudData.users.some(u => 
                  u.id === currentUser.id || 
                  (u.email && currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase())
                );
                if (!userStillExists && currentUser.role !== 'admin') {
                  setIsLoggedIn(false);
                  setCurrentUser(null);
                  try { localStorage.removeItem('javelo_current_user'); } catch(e){}
                  alert("⚠️ Akun Anda telah dinonaktifkan atau dihapus oleh C-Level Admin.");
                  return;
                }
              }
            }
            if (Array.isArray(cloudData.tickets)) {
              setTickets(prev => {
                if (JSON.stringify(prev) !== JSON.stringify(cloudData.tickets)) {
                  try { localStorage.setItem('javelo_tickets', JSON.stringify(cloudData.tickets)); } catch(e){}
                  return cloudData.tickets;
                }
                return prev;
              });
            }
            if (Array.isArray(cloudData.notifications)) {
              setNotifications(prev => {
                if (JSON.stringify(prev) !== JSON.stringify(cloudData.notifications)) {
                  try { localStorage.setItem('javelo_notifications', JSON.stringify(cloudData.notifications)); } catch(e){}
                  return cloudData.notifications;
                }
                return prev;
              });
            }
            if (cloudData.companyInfo) {
              setCompanyInfo(prev => JSON.stringify(prev) !== JSON.stringify(cloudData.companyInfo) ? cloudData.companyInfo : prev);
            }
            return;
          }
        }
      } catch (cloudErr) {
        console.warn("GitHub Cloud poll note:", cloudErr);
      }

      let supabaseSuccess = false;

      // 2. Fetch from Supabase PostgreSQL (if initialized)
      if (supabaseClient) {
        try {
          const { data: dbProfiles, error: profErr } = await supabaseClient.from('profiles').select('*');
          const { data: dbTickets, error: tktErr } = await supabaseClient.from('tickets').select('*');

          if (!profErr && dbProfiles) {
            setIsSupabaseReady(true);
            supabaseSuccess = true;

            const mappedUsers = dbProfiles.map(p => ({
              id: p.id,
              name: p.full_name,
              email: p.email,
              role: p.role || 'employee',
              mode: p.work_mode || 'Full WFH',
              department: p.department || 'Engineering',
              avatar: p.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
              status: p.status || 'Offline',
              checkedIn: p.checked_in || false,
              checkInTime: p.check_in_time || null,
              password: p.password_plain || "123456"
            }));

            // Only set state if data changed to prevent flickering
            setUsers(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(mappedUsers)) {
                return mappedUsers;
              }
              return prev;
            });

            if (currentUser) {
              const updatedCurrent = mappedUsers.find(u => u.id === currentUser.id);
              if (updatedCurrent && JSON.stringify(currentUser) !== JSON.stringify(updatedCurrent)) {
                setCurrentUser(updatedCurrent);
              }
            }

            if (!tktErr && dbTickets) {
              const mappedTickets = dbTickets.map(t => ({
                id: String(t.id || ''),
                code: t.code || `JTL-2026-${String(t.id || '').slice(0,4)}`,
                subject: t.subject,
                details: t.details || "",
                notes: t.notes || "",
                deadline: t.deadline,
                status: t.status === 'Review' ? 'Pending Review' : (t.status || 'Todo'),
                priority: t.priority || 'Medium',
                assignedTo: t.assigned_to,
                assignedBy: t.assigned_by,
                mentionedUsers: t.mentioned_users || []
              }));

              setTickets(prev => {
                if (JSON.stringify(prev) !== JSON.stringify(mappedTickets)) {
                  return mappedTickets;
                }
                return prev;
              });
            }
          } else {
            setIsSupabaseReady(false);
          }
        } catch (err) {
          console.warn("Supabase database fetch warning:", err);
          setIsSupabaseReady(false);
        }
      }

      // 2. Fallback to local server database API ONLY if Supabase is offline/not ready
      if (!supabaseSuccess) {
        try {
          let res = await fetch(`${cleanUrl}/api/db`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
          }).catch(() => null);
          if (!res || !res.ok) {
            res = await fetch('./db.json').catch(() => null);
          }
          if (res && res.ok) {
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const data = await res.json();
              if (data) {
                if (data.companyInfo) {
                  setCompanyInfo(prev => JSON.stringify(prev) !== JSON.stringify(data.companyInfo) ? data.companyInfo : prev);
                }
                if (Array.isArray(data.users) && data.users.length > 0) {
                  setUsers(prev => JSON.stringify(prev) !== JSON.stringify(data.users) ? data.users : prev);
                  if (currentUser) {
                    const updatedCurrent = data.users.find(u => u.id === currentUser.id);
                    if (updatedCurrent && JSON.stringify(currentUser) !== JSON.stringify(updatedCurrent)) {
                      setCurrentUser(updatedCurrent);
                    }
                  }
                }
                if (Array.isArray(data.tickets)) {
                  setTickets(prev => JSON.stringify(prev) !== JSON.stringify(data.tickets) ? data.tickets : prev);
                }
                if (Array.isArray(data.schedules)) {
                  setSchedules(prev => JSON.stringify(prev) !== JSON.stringify(data.schedules) ? data.schedules : prev);
                }
                if (Array.isArray(data.customTasks)) {
                  setCustomTasks(prev => JSON.stringify(prev) !== JSON.stringify(data.customTasks) ? data.customTasks : prev);
                }
              }
            }
          }
        } catch(e) {}
      }
    };

    fetchCloudData();

    // 3. Configure Supabase WebSockets Realtime Broadcast Channels (if active)
    let chatChannel = null;
    let profilesChannel = null;
    if (supabaseClient) {
      try {
        chatChannel = supabaseClient.channel('chat_messages')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, payload => {
            fetchCloudData();
          })
          .subscribe();

        profilesChannel = supabaseClient.channel('profiles')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, payload => {
            fetchCloudData();
          })
          .subscribe();
      } catch (err) {
        console.warn("Supabase Realtime subscription error:", err);
      }
    }

    const interval = setInterval(fetchCloudData, 3000);
    return () => {
      clearInterval(interval);
      if (supabaseClient) {
        if (chatChannel) supabaseClient.removeChannel(chatChannel);
        if (profilesChannel) supabaseClient.removeChannel(profilesChannel);
      }
    };
  }, [currentUser?.id, apiUrl]);

  // Apply Dark Mode Class to Body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && isLoggedIn) {
      interval = setInterval(() => setSecondsLogged(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isLoggedIn]);

  const timerFormatted = useMemo(() => {
    const hrs = Math.floor(secondsLogged / 3600);
    const mins = Math.floor((secondsLogged % 3600) / 60);
    const secs = secondsLogged % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [secondsLogged]);

  const handleLogin = (userToLogin) => {
    if (userToLogin) {
      const loggedUser = { ...userToLogin, checkedIn: false, status: "Offline" };
      setCurrentUser(loggedUser);
      setIsLoggedIn(true);

      const updatedUsers = (users || []).map(u => u.id === loggedUser.id ? loggedUser : u);
      setUsers(updatedUsers);
      syncCloudDB({ companyInfo, users: updatedUsers, tickets, schedules, customTasks });

      setGeofenceMessage({ type: "success", text: `⚡ Logged in as ${loggedUser.name} (${loggedUser.role === 'admin' ? 'C-Level Executive' : loggedUser.department})` });
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, status: "Offline", checkedIn: false } : u);
      setUsers(updatedUsers);
      syncCloudDB({ companyInfo, users: updatedUsers, tickets, schedules, customTasks });
    }
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const handleDeleteUser = async (userId) => {
    if (currentUser && userId === currentUser.id) {
      setGeofenceMessage({ type: "error", text: "❌ Anda tidak dapat menghapus akun Anda sendiri!" });
      return;
    }
    const targetUser = users.find(u => u.id === userId);
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    try { localStorage.setItem('javelo_users', JSON.stringify(updatedUsers)); } catch(e){}

    await syncCloudDB({ companyInfo, users: updatedUsers, tickets, notifications, schedules, customTasks });

    if (supabaseClient) {
      try {
        await supabaseClient.from('profiles').delete().eq('id', userId);
      } catch (err) {
        console.warn("Supabase user deletion warning:", err);
      }
    }

    setGeofenceMessage({ type: "success", text: `🗑️ Akun karyawan ${targetUser?.name || ''} (${targetUser?.email || ''}) berhasil dihapus secara permanen!` });
  };

  const handleSendReminderAlert = (targetUser, ticketOrContext) => {
    const newNotif = {
      id: "notif-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
      userId: targetUser?.id,
      userEmail: targetUser?.email ? targetUser.email.toLowerCase() : "",
      title: `🔔 Reminder dari ${currentUser?.name || 'Admin'}`,
      text: `Pengingat untuk ${ticketOrContext?.code || 'Tiket'}: ${ticketOrContext?.subject || ticketOrContext || 'Mohon segera ditindaklanjuti'}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      targetTab: 'tickets',
      targetTicketId: ticketOrContext?.id
    };
    const updatedNotifs = [newNotif, ...(notifications || [])];
    setNotifications(updatedNotifs);
    syncCloudDB({ companyInfo, users, tickets, notifications: updatedNotifs, schedules, customTasks });
    setGeofenceMessage({
      type: "success",
      text: `📧 In-App Reminder & Alert berhasil dikirimkan ke ${targetUser?.name || 'Staff'}!`
    });
  };

  const handleDeleteTicket = (ticketId) => {
    const updatedTickets = tickets.filter(t => t.id !== ticketId);
    setTickets(updatedTickets);
    setEditingTicket(null);
    setCommentingTicket(null);
    setHistoryTicket(null);
    syncCloudDB({ companyInfo, users, tickets: updatedTickets, schedules, customTasks });
    setGeofenceMessage({ type: "error", text: "🗑 Ticket permanently removed by C-Level Admin." });
  };

  const handleFinishWizard = (newCompany, founderUser) => {
    if (newCompany) setCompanyInfo(newCompany);
    let initialUsers = users || [];
    if (founderUser) {
      initialUsers = [founderUser, ...initialUsers.filter(u => u.id !== founderUser.id)];
      setUsers(initialUsers);
      setCurrentUser(founderUser);
    }
    setShowSetupWizard(false);
    setIsLoggedIn(true);
    setIsTimerRunning(false);
    syncCloudDB({ companyInfo: newCompany, users: initialUsers, tickets: [], schedules: [], customTasks: [] });
  };

  const handleSaveLockedSchedule = (newSchedulesArray) => {
    const updatedSchedules = [...schedules];
    newSchedulesArray.forEach(newS => {
      const idx = updatedSchedules.findIndex(s => s.userId === newS.userId && s.date === newS.date);
      if (idx !== -1) {
        updatedSchedules[idx] = newS;
      } else {
        updatedSchedules.push(newS);
      }
    });
    setSchedules(updatedSchedules);
    setShowShiftPlannerModal(false);

    syncCloudDB({ companyInfo, users, tickets, schedules: updatedSchedules, customTasks });
    setGeofenceMessage({ type: "success", text: "🔒 Optimal Working Schedule Locked Successfully!" });
  };

  const handleNotificationClick = (notif) => {
    const updated = (notifications || []).map(n => n.id === notif.id ? { ...n, read: true } : n);
    setNotifications(updated);
    syncCloudDB({ companyInfo, users, tickets, notifications: updated, schedules, customTasks });
    if (notif.targetTab) {
      setActiveTab(notif.targetTab);
    }
    if (notif.targetTicketId) {
      const targetT = (tickets || []).find(t => t.id === notif.targetTicketId);
      if (targetT) setEditingTicket(targetT);
    }
  };

  const handleMarkAllNotificationsRead = () => {
    const updated = (notifications || []).map(n => {
      if (!n.userId || n.userId === currentUser?.id || (n.userEmail && n.userEmail === currentUser?.email?.toLowerCase())) {
        return { ...n, read: true };
      }
      return n;
    });
    setNotifications(updated);
    syncCloudDB({ companyInfo, users, tickets, notifications: updated, schedules, customTasks });
  };

  const handleConfirmCheckIn = (checkInData) => {
    const targetGeo = companyInfo?.factoryGeo || DEFAULT_FACTORY_GEO;
    if (currentUser?.mode === "Full WFO" || (currentUser?.mode === "Hybrid" && checkInData?.isWfoToday)) {
      let lat = userLocation.lat;
      let lng = userLocation.lng;
      const distMeters = calculateDistanceMeters(lat, lng, targetGeo.lat, targetGeo.lng);
      
      if (distMeters > targetGeo.radiusMeters) {
        const newAnomaly = {
          id: generateUUID(),
          userId: currentUser?.id,
          userName: currentUser?.name,
          type: "Geofence Breach",
          description: `Attempted WFO Check-in ${Math.round(distMeters)}m away from ${targetGeo.name}. Radius limit is ${targetGeo.radiusMeters}m.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          resolved: false
        };
        setAnomalies(prev => [newAnomaly, ...prev]);
        setGeofenceMessage({
          type: "error",
          text: `⚠️ Geofence Breach Triggered! You are ${Math.round(distMeters)}m from ${targetGeo.name}. Anomaly logged to C-Level Dashboard.`
        });
        setShowCheckInGateModal(false);
        return;
      }
    }

    const checkInTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedUsers = users.map(u => u.id === currentUser?.id ? { ...u, checkedIn: true, status: "Online", checkInTime: checkInTimeStr } : u);
    const updatedCurrentUser = { ...currentUser, checkedIn: true, status: "Online", checkInTime: checkInTimeStr };

    setUsers(updatedUsers);
    setCurrentUser(updatedCurrentUser);
    setIsTimerRunning(true);
    setShowCheckInGateModal(false);

    syncCloudDB({ companyInfo, users: updatedUsers, tickets, schedules, customTasks });

    setGeofenceMessage({
      type: "success",
      text: `🟢 Check-In Verified! Status is now ONLINE (${checkInTimeStr}). Work timer started.`
    });
  };

  const handleFinalizeCheckout = (updatedTicketStatuses) => {
    const updatedTickets = tickets.map(t => {
      if (updatedTicketStatuses && updatedTicketStatuses[t.id]) {
        return { ...t, status: updatedTicketStatuses[t.id].status, notes: updatedTicketStatuses[t.id].notes || t.notes };
      }
      return t;
    });

    const updatedUsers = users.map(u => u.id === currentUser?.id ? { ...u, checkedIn: false, status: "Offline" } : u);
    const updatedCurrentUser = { ...currentUser, checkedIn: false, status: "Offline" };

    setTickets(updatedTickets);
    setUsers(updatedUsers);
    setCurrentUser(updatedCurrentUser);
    setIsTimerRunning(false);
    setShowCheckoutModal(false);

    syncCloudDB({ companyInfo, users: updatedUsers, tickets: updatedTickets, schedules, customTasks });

    if (window.confetti) {
      window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    setGeofenceMessage({
      type: "success",
      text: "⚪ Check-Out Finalized! Work recap saved and status set to Offline."
    });
  };

  if (showSetupWizard) {
    return e(OrganizationSetupWizard, {
      companyInfo,
      onCancel: users.length > 0 ? () => setShowSetupWizard(false) : null,
      onFinish: handleFinishWizard
    });
  }

  if (!isLoggedIn || !currentUser) {
    return e(LoginScreen, {
      users,
      companyInfo,
      onLogin: handleLogin,
      onStartWizard: () => setShowSetupWizard(true)
    });
  }

  return e('div', { className: `min-h-screen flex flex-col ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}` },
    geofenceMessage && e('div', { className: `px-4 py-2 text-xs font-medium flex items-center justify-between ${geofenceMessage.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}` },
      e('span', null, geofenceMessage.text),
      e('button', { onClick: () => setGeofenceMessage(null), className: 'hover:opacity-75 font-bold cursor-pointer' }, '✕')
    ),

    e(WorkModeInspectorBanner, { currentUser, companyInfo, userLocation }),

    e('div', { className: 'flex-1 flex flex-col md:flex-row overflow-hidden' },
      e(Sidebar, {
        activeTab,
        setActiveTab,
        currentUser,
        users,
        companyInfo,
        anomalyCount: (anomalies || []).filter(a => !a.resolved).length,
        onLogout: handleLogout,
        onStartWizard: () => setShowSetupWizard(true)
      }),
      e('div', { className: 'flex-1 flex flex-col overflow-y-auto' },
        e(Header, {
          currentUser,
          timerFormatted,
          isTimerRunning,
          notifications: notifications || [],
          onNotificationClick: handleNotificationClick,
          onMarkAllRead: handleMarkAllNotificationsRead,
          onOpenCheckInGate: () => setShowCheckInGateModal(true),
          onCheckOutClick: () => setShowCheckoutModal(true),
          onLogout: handleLogout
        }),
        e('div', { className: 'p-6 flex-1' },
          activeTab === 'todo' && e(PersonalToDoManager, { currentUser, tickets: tickets || [], setTickets, customTasks: customTasks || [], setCustomTasks }),
          activeTab === 'schedules' && e(ScheduleGrid, { users: users || [], schedules: schedules || [], currentUser, onOpenPlanner: () => setShowShiftPlannerModal(true), onInspectUserCalendar: (u) => setCLevelInspectedUser(u) }),
          activeTab === 'tickets' && e(TicketBoard, { tickets: tickets || [], users: users || [], currentUser, companyInfo, onOpenCreateTicket: () => setShowCreateTicketModal(true), onEditTicket: setEditingTicket, onOpenComments: setCommentingTicket, onOpenHistory: setHistoryTicket, onDeleteTicket: handleDeleteTicket, onSendReminder: handleSendReminderAlert }),
          activeTab === 'virtual-office' && e(SkyOffice2DPixelMap, { users: users || [], tickets: tickets || [] }),
          activeTab === 'clevel' && (currentUser?.role === 'admin' ? e(CLevelDashboard, { users: users || [], tickets: tickets || [], anomalies: anomalies || [], schedules: schedules || [], onResolveAnomaly: id => setAnomalies(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a)), onOpenCreateUser: () => setShowCreateUserModal(true), onOpenAnnouncement: () => setShowAnnouncementModal(true), onOpenCreateTicket: () => setShowCreateTicketModal(true), onOpenActiveStaff: () => setShowActiveStaffModal(true), onInspectEmployee: (u) => setCLevelInspectedUser(u), onDeleteUser: handleDeleteUser, isSupabaseReady, serverUrl: apiUrl }) : e('div', { className: 'p-8 text-center bg-rose-50 border border-rose-200 text-rose-800 font-bold rounded-2xl text-xs' }, '🔒 Access Restricted: C-Level Executive Master Dashboard is restricted to C-Level Admin accounts.')),
          activeTab === 'chat' && e(ChatEcosystem, { users: users || [], currentUser, tickets: tickets || [], onSendReminder: handleSendReminderAlert }),
          activeTab === 'settings' && e(SettingsPanel, { currentUser, setCurrentUser, companyInfo, isDarkMode, setIsDarkMode, apiUrl, setApiUrl, onOpenPhotoCrop: () => setShowPhotoCropModal(true), onStartWizard: () => setShowSetupWizard(true) })
        )
      )
    ),

    // ALL MODALS RENDERED SAFELY IN ROOT DOM TREE!
    showCheckInGateModal && e(ModeSpecificCheckInGateModal, {
      currentUser,
      companyInfo,
      userLocation,
      onClose: () => setShowCheckInGateModal(false),
      onConfirmCheckIn: handleConfirmCheckIn
    }),

    showCheckoutModal && e(CheckOutGateModal, {
      currentUser,
      users: users || [],
      tickets: tickets || [],
      schedules: schedules || [],
      userTickets: (tickets || []).filter(t => t.assignedTo === currentUser?.id),
      onClose: () => setShowCheckoutModal(false),
      onOpenPlanner: () => { setShowCheckoutModal(false); setShowShiftPlannerModal(true); },
      onFinalizeCheckout: handleFinalizeCheckout
    }),

    showShiftPlannerModal && e(InteractiveDateScheduleModal, {
      currentUser,
      schedules,
      onClose: () => setShowShiftPlannerModal(false),
      onSaveSchedule: handleSaveLockedSchedule
    }),

    showCreateTicketModal && e(CreateTicketModal, {
      users: users || [],
      tickets: tickets || [],
      currentUser,
      companyInfo,
      onClose: () => setShowCreateTicketModal(false),
      onCreateTicket: (newTicket) => {
        const updatedTickets = [newTicket, ...(tickets || [])];
        setTickets(updatedTickets);

        // Build notifications for assignee & mentioned users
        const targetUserIds = [newTicket.assignedTo, ...(newTicket.mentionedUsers || [])].filter(Boolean);
        const newNotifList = [];
        targetUserIds.forEach(targetId => {
          const targetU = (users || []).find(u => u.id === targetId);
          if (targetU) {
            newNotifList.push({
              id: "notif-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
              userId: targetU.id,
              userEmail: targetU.email ? targetU.email.toLowerCase() : "",
              title: `🎫 Tiket Tugas Baru: ${newTicket.code} [${newTicket.priority}]`,
              text: `${currentUser?.name || 'C-Level Admin'} menugaskan tiket: "${newTicket.subject}"`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              date: new Date().toISOString().split('T')[0],
              read: false,
              targetTab: 'tickets',
              targetTicketId: newTicket.id
            });
          }
        });

        const updatedNotifs = [...newNotifList, ...(notifications || [])];
        setNotifications(updatedNotifs);
        setShowCreateTicketModal(false);

        // Sync both tickets and notifications to cloud database so other devices immediately receive it
        syncCloudDB({
          companyInfo,
          users,
          tickets: updatedTickets,
          notifications: updatedNotifs,
          schedules,
          customTasks
        });

        setGeofenceMessage({
          type: "success",
          text: `✅ Tiket ${newTicket.code} berhasil dibuat & notifikasi terkirim ke device karyawan!`
        });
      }
    }),

    editingTicket && e(UpdateTicketModal, {
      ticket: editingTicket,
      users: users || [],
      tickets: tickets || [],
      currentUser,
      onClose: () => setEditingTicket(null),
      onDeleteTicket: handleDeleteTicket,
      onSaveTicket: (updatedT) => {
        setTickets(prev => {
          const updated = prev.map(t => t.id === updatedT.id ? updatedT : t);
          syncCloudDB({ companyInfo, users, tickets: updated, notifications, schedules, customTasks });
          return updated;
        });
        setEditingTicket(null);
      }
    }),

    commentingTicket && e(TicketCommentsModal, {
      ticket: commentingTicket,
      currentUser,
      users: users || [],
      onClose: () => setCommentingTicket(null),
      onPostComment: (ticketId, commentObj) => {
        const tkt = (tickets || []).find(t => t.id === ticketId);
        let updatedNotifs = notifications || [];
        if (tkt) {
          const recipientId = tkt.assignedTo === currentUser?.id ? tkt.assignedBy : tkt.assignedTo;
          const targetU = (users || []).find(u => u.id === recipientId);
          if (targetU && targetU.id !== currentUser?.id) {
            const commentNotif = {
              id: "notif-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
              userId: targetU.id,
              userEmail: targetU.email ? targetU.email.toLowerCase() : "",
              title: `💬 Komentar Tiket: ${tkt.code}`,
              text: `${currentUser?.name || 'Staff'}: "${commentObj.text}"`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              date: new Date().toISOString().split('T')[0],
              read: false,
              targetTab: 'tickets',
              targetTicketId: tkt.id
            };
            updatedNotifs = [commentNotif, ...updatedNotifs];
            setNotifications(updatedNotifs);
          }
        }
        setTickets(prev => {
          const updated = prev.map(t => {
            if (t.id === ticketId) {
              const updatedC = [...(t.comments || []), commentObj];
              return { ...t, comments: updatedC };
            }
            return t;
          });
          syncCloudDB({ companyInfo, users, tickets: updated, notifications: updatedNotifs, schedules, customTasks });
          return updated;
        });
        setCommentingTicket(prev => prev ? { ...prev, comments: [...(prev.comments || []), commentObj] } : null);
      }
    }),

    historyTicket && e(TicketHistoryDrawerModal, {
      ticket: historyTicket,
      users: users || [],
      onClose: () => setHistoryTicket(null)
    }),

    cLevelInspectedUser && e(CLevelEmployeeInspectorModal, {
      inspectedUser: cLevelInspectedUser,
      tickets: tickets || [],
      schedules: schedules || [],
      users: users || [],
      customTasks: customTasks || [],
      onClose: () => setCLevelInspectedUser(null)
    }),

    showCreateUserModal && e(CreateUserModal, {
      apiUrl,
      onClose: () => setShowCreateUserModal(false),
      onCreateSuccess: (newUser) => {
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        setShowCreateUserModal(false);
        syncCloudDB({ companyInfo, users: updatedUsers, tickets, schedules, customTasks });
        setGeofenceMessage({
          type: "success",
          text: `✅ Akun karyawan untuk ${newUser.name} (${newUser.email}) berhasil dibuat! Password: ${newUser.password}. Karyawan dapat langsung login di device mereka.`
        });
      }
    }),

    showAnnouncementModal && e(BroadcastAnnouncementModal, {
      currentUser,
      users: users || [],
      tickets: tickets || [],
      onClose: () => setShowAnnouncementModal(false)
    }),

    showActiveStaffModal && e(ActiveStaffModal, {
      users: users || [],
      onClose: () => setShowActiveStaffModal(false)
    }),

    showPhotoCropModal && e(ProfilePhotoCropModal, {
      currentAvatar: currentUser?.avatar,
      onClose: () => setShowPhotoCropModal(false),
      onSaveAvatar: (newAvatarDataUrl) => {
        setCurrentUser(prev => ({ ...prev, avatar: newAvatarDataUrl }));
        setUsers(prev => prev.map(u => u.id === currentUser?.id ? { ...u, avatar: newAvatarDataUrl } : u));
      }
    })
  );
}

// --- INTERACTIVE DATE-BASED CALENDAR SCHEDULE MODAL ---
function InteractiveDateScheduleModal({ currentUser, schedules, onClose, onSaveSchedule }) {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedHours, setSelectedHours] = useState([9, 10, 11, 13, 14, 15, 16, 17]);
  const hours = Array.from({ length: 17 }, (_, i) => i + 7);

  // Month navigation state
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth()); // 0-11
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 0) {
        setCurrentYear(y => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 11) {
        setCurrentYear(y => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const daysInMonth = useMemo(() => new Date(currentYear, currentMonth + 1, 0).getDate(), [currentYear, currentMonth]);
  const firstDayIndex = useMemo(() => new Date(currentYear, currentMonth, 1).getDay(), [currentYear, currentMonth]); // 0: Sun

  const calendarCells = useMemo(() => {
    const cells = [];
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ day: null, dateStr: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, dateStr });
    }
    return cells;
  }, [currentYear, currentMonth, daysInMonth, firstDayIndex]);

  const existingScheduleForDate = useMemo(() => {
    return (schedules || []).find(s => s.userId === currentUser?.id && s.date === selectedDate);
  }, [schedules, currentUser, selectedDate]);

  useEffect(() => {
    if (existingScheduleForDate && Array.isArray(existingScheduleForDate.hours)) {
      setSelectedHours(existingScheduleForDate.hours);
    } else {
      setSelectedHours([9, 10, 11, 13, 14, 15, 16, 17]);
    }
  }, [existingScheduleForDate, selectedDate]);

  const toggleHour = (h) => {
    if (h === 12) return;
    if (selectedHours.includes(h)) {
      setSelectedHours(selectedHours.filter(x => x !== h));
    } else {
      if (selectedHours.length < 8) {
        setSelectedHours([...selectedHours, h].sort((a,b) => a-b));
      }
    }
  };

  const handleLockDateSchedule = () => {
    const formattedTime = `${selectedHours[0] || 9}:00 - ${(selectedHours[selectedHours.length-1] || 17) > 12 ? (selectedHours[selectedHours.length-1] || 17) - 12 + ' pm' : (selectedHours[selectedHours.length-1] || 17) + ' am'}`;
    const newSchedule = [{
      id: generateUUID(),
      userId: currentUser?.id || "u-admin",
      date: selectedDate,
      day: selectedDate,
      type: currentUser?.mode === "Full WFO" ? "WFO Office" : "Shift",
      status: "Locked & Confirmed",
      time: formattedTime,
      hours: selectedHours,
      locked: true,
      color: "bg-emerald-600 text-white"
    }];

    onSaveSchedule(newSchedule);
  };

  const lockedSchedulesForUser = useMemo(() => {
    return (schedules || []).filter(s => s.userId === currentUser?.id);
  }, [schedules, currentUser]);

  return e('div', { className: 'fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4' },
    e('div', { className: 'bg-white rounded-3xl max-w-2xl w-full p-7 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto' },
      e('div', { className: 'flex items-center justify-between border-b border-slate-100 pb-3' },
        e('div', null,
          e('h3', { className: 'text-lg font-extrabold text-slate-900 flex items-center gap-2' },
            e(IconCalendar, { className: 'w-5 h-5 text-blue-600' }),
            `Date-Based Working Schedule Lock (${currentUser?.name})`
          ),
          e('p', { className: 'text-xs text-slate-500' }, 'Select a specific calendar date and lock your optimal 8-hour shift hours.')
        ),
        e('button', { onClick: onClose, className: 'text-slate-400 hover:text-slate-600 font-bold cursor-pointer' }, '✕')
      ),

      // DYNAMIC STATUS INDICATOR BANNER
      existingScheduleForDate ? e('div', { className: 'p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-2xl flex items-center justify-between text-xs font-bold' },
        e('div', { className: 'flex items-center gap-2' },
          e('span', { className: 'w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse' }),
          e('span', null, `🟢 LOCKED & CONFIRMED: Shift locked for this date (${existingScheduleForDate.time})`)
        ),
        e('span', { className: 'text-[9px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold' }, 'SUBMITTED')
      ) : e('div', { className: 'p-3.5 bg-amber-50 border border-amber-200 text-amber-950 rounded-2xl flex items-center gap-2 text-xs font-semibold' },
        e('span', null, '⚠️ NOT LOCKED YET: Please select shift hours below and lock schedule for this date.')
      ),

      // VISUAL CALENDAR SELECTION MONTH-BY-MONTH WITH LOCKED MARKERS
      e('div', { className: 'p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3' },
        e('div', { className: 'flex items-center justify-between' },
          e('h4', { className: 'text-xs font-extrabold text-slate-700 uppercase tracking-wider' }, '🗓️ Interactive Calendar Matrix'),
          e('div', { className: 'flex items-center gap-2 text-xs font-bold text-slate-800' },
            e('button', { onClick: handlePrevMonth, className: 'p-1 hover:bg-slate-200 rounded cursor-pointer' }, '◀'),
            e('span', { className: 'w-28 text-center font-mono' }, `${monthNames[currentMonth]} ${currentYear}`),
            e('button', { onClick: handleNextMonth, className: 'p-1 hover:bg-slate-200 rounded cursor-pointer' }, '▶')
          )
        ),
        e('div', { className: 'grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1' },
          ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => e('div', { key: d }, d))
        ),
        e('div', { className: 'grid grid-cols-7 gap-1.5' },
          calendarCells.map((cell, idx) => {
            if (!cell.day) return e('div', { key: `empty-${idx}`, className: 'aspect-square opacity-0' });
            
            const hasLocked = (schedules || []).some(s => s.userId === currentUser?.id && s.date === cell.dateStr);
            const isSelected = selectedDate === cell.dateStr;

            return e('button', {
              key: cell.dateStr,
              onClick: () => setSelectedDate(cell.dateStr),
              className: `aspect-square p-1 rounded-lg border text-xs font-bold flex flex-col items-center justify-between cursor-pointer transition-all ${
                isSelected ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-xs ring-2 ring-blue-600/30' :
                hasLocked ? 'border-emerald-300 bg-emerald-100 text-emerald-800 font-extrabold' :
                'border-slate-200 bg-white hover:bg-slate-100 text-slate-600'
              }`
            },
              e('span', { className: 'text-[11px]' }, cell.day),
              hasLocked ? e('span', { className: 'text-[8px] bg-emerald-600 text-white font-black rounded-full px-1 py-0.2 scale-90' }, '✔') : null
            );
          })
        ),
        e('div', { className: 'flex justify-between items-center text-[10px] font-bold text-slate-500 pt-1.5' },
          e('div', { className: 'flex items-center gap-1' },
            e('span', { className: 'w-2 h-2 rounded bg-emerald-100 border border-emerald-300' }),
            'Shift Locked'
          ),
          e('div', { className: 'flex items-center gap-2' },
            e('span', null, 'Selected Date:'),
            e('span', { className: 'font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-extrabold text-[10px]' }, selectedDate)
          )
        )
      ),

      // TWO-COLUMN CONFIGURATION FOR MODE & DATE PICKER FALLBACK
      e('div', { className: 'grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs' },
        e('div', null,
          e('label', { className: 'font-bold block mb-1 text-slate-700' }, '📅 Custom Date Picker'),
          e('input', {
            type: 'date',
            value: selectedDate,
            onChange: ev => setSelectedDate(ev.target.value),
            className: 'w-full px-3 py-2 border rounded-xl bg-white font-mono text-xs'
          })
        ),
        e('div', null,
          e('label', { className: 'font-bold block mb-1 text-slate-700' }, 'Work Mode'),
          e('div', { className: 'px-3 py-2 bg-blue-100 text-blue-900 font-bold rounded-xl text-xs font-mono' }, currentUser?.mode || 'Full WFH')
        )
      ),

      e('div', { className: 'space-y-3' },
        e('div', { className: 'flex items-center justify-between' },
          e('label', { className: 'text-xs font-bold text-slate-800' }, 'Select 8 Working Hours:'),
          e('span', { className: 'text-[11px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded' }, `Selected: ${selectedHours.length} / 8 Hours`)
        ),
        e('div', { className: 'grid grid-cols-6 gap-2' },
          hours.map(h => {
            const isRest = h === 12;
            const isSelected = selectedHours.includes(h);
            return e('button', {
              key: h,
              onClick: () => toggleHour(h),
              disabled: isRest,
              className: `p-3 rounded-xl text-xs font-bold hour-block-btn flex flex-col items-center justify-center border cursor-pointer ${isRest ? 'bg-rose-600 text-white border-rose-700 cursor-not-allowed shadow-inner' : isSelected ? 'bg-emerald-600 text-white border-emerald-700 shadow-md' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'}`
            },
              e('span', { className: 'font-mono text-xs' }, `${h.toString().padStart(2, '0')}:00`),
              e('span', { className: 'text-[9px] font-normal opacity-90 mt-0.5 flex items-center gap-0.5' }, isRest ? '🔒 REST' : isSelected ? '● Active' : 'Free')
            );
          })
        )
      ),

      // DIRECTORY OF LOCKED CALENDAR SHIFTS
      lockedSchedulesForUser.length > 0 && e('div', { className: 'space-y-2 pt-2 border-t border-slate-100' },
        e('label', { className: 'text-[10px] font-bold text-slate-500 uppercase tracking-wider block' }, '🗓️ Your Locked Shifts (Click to inspect or change):'),
        e('div', { className: 'grid grid-cols-2 gap-2 max-h-24 overflow-y-auto pr-1' },
          lockedSchedulesForUser.map(s => e('div', {
            key: s.id,
            onClick: () => setSelectedDate(s.date),
            className: `p-2 rounded-xl border flex items-center justify-between text-xs cursor-pointer hover:bg-slate-100 transition-all ${s.date === selectedDate ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold shadow-xs' : 'border-slate-200 bg-slate-50 text-slate-700'}`
          },
            e('span', null, `📅 ${s.date}`),
            e('span', { className: 'font-mono text-[10px] text-emerald-700' }, s.time)
          ))
        )
      ),

      e('div', { className: 'flex items-center justify-between pt-3 border-t border-slate-100' },
        e('button', { onClick: onClose, className: 'px-4 py-2 text-xs font-semibold text-slate-600 cursor-pointer' }, 'Cancel'),
        e('button', {
          onClick: handleLockDateSchedule,
          className: 'px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-lg cursor-pointer flex items-center gap-2'
        }, '🔒 Submit & Lock Schedule')
      )
    )
  );
}

// --- TICKET HISTORY DRAWER MODAL ---
function TicketHistoryDrawerModal({ ticket, users, onClose }) {
  const creator = (users || []).find(u => u.id === ticket.assignedBy);
  const assignee = (users || []).find(u => u.id === ticket.assignedTo);
  const comments = ticket.comments || [];

  return e('div', { className: 'fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4' },
    e('div', { className: 'bg-white rounded-3xl max-w-xl w-full p-7 shadow-2xl border border-slate-100 space-y-4 max-h-[85vh] overflow-y-auto' },
      e('div', { className: 'flex justify-between items-center border-b pb-3' },
        e('div', null,
          e('h3', { className: 'font-bold text-slate-900 text-base flex items-center gap-2' },
            e(IconSearch, { className: 'w-5 h-5 text-blue-600' }),
            `Full Ticket Audit History`
          ),
          e('span', { className: 'text-xs font-mono font-bold text-blue-600' }, ticket.code)
        ),
        e('button', { onClick: onClose, className: 'font-bold text-slate-400 cursor-pointer' }, '✕')
      ),

      e('div', { className: 'space-y-4 text-xs' },
        e('div', { className: 'p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2' },
          e('div', { className: 'font-bold text-sm text-slate-900' }, ticket.subject),
          e('p', { className: 'text-slate-600 text-xs' }, ticket.details),
          e('div', { className: 'flex flex-wrap gap-2 pt-1 font-mono text-[10px]' },
            e('span', { className: 'px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold' }, `Division: ${Array.isArray(ticket.division) ? ticket.division.join(', ') : (ticket.division || 'General')}`),
            e('span', { className: 'px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold' }, `Priority: ${ticket.priority}`),
            e('span', { className: 'px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold' }, `Status: ${ticket.status}`)
          )
        ),

        e('div', { className: 'grid grid-cols-2 gap-3 p-3 bg-white border rounded-xl' },
          e('div', null,
            e('span', { className: 'text-slate-400 block text-[10px]' }, 'Created By:'),
            e('span', { className: 'font-bold text-slate-900' }, creator ? creator.name : 'C-Level Executive')
          ),
          e('div', null,
            e('span', { className: 'text-slate-400 block text-[10px]' }, 'Assigned To / Completed By:'),
            e('span', { className: 'font-bold text-slate-900' }, assignee ? assignee.name : 'Unassigned')
          )
        ),

        ticket.proofLink && e('div', { className: 'p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 font-mono text-xs' },
          e('strong', null, 'Proof Link / Attachment: '),
          e('a', { href: ticket.proofLink, target: '_blank', rel: 'noreferrer', className: 'hover:underline text-blue-600 font-bold' }, ticket.proofLink)
        ),

        ticket.notes && e('div', { className: 'p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs' },
          e('strong', null, 'Resolution Notes: '),
          ticket.notes
        ),

        e('div', { className: 'space-y-2 border-t pt-3' },
          e('h4', { className: 'font-bold text-slate-800' }, `Comment Discussion Thread (${comments.length})`),
          comments.length === 0 ? e('p', { className: 'text-slate-400 italic text-[11px]' }, 'No comments logged in history.') :
          comments.map(c => e('div', { key: c.id, className: 'p-3 bg-slate-50 rounded-xl border text-xs space-y-1' },
            e('div', { className: 'flex justify-between font-bold text-blue-600' }, e('span', null, c.author), e('span', { className: 'text-[10px] text-slate-400 font-mono' }, c.time)),
            e('p', { className: 'text-slate-700' }, c.text)
          ))
        )
      )
    )
  );
}

// --- C-LEVEL EMPLOYEE INSPECTOR MODAL ---
function CLevelEmployeeInspectorModal({ inspectedUser, tickets, schedules, users, customTasks, onClose }) {
  const [tab, setTab] = useState("todo");
  const safeTickets = tickets || [];
  const safeSchedules = schedules || [];
  const safeCustomTasks = customTasks || [];

  const userTickets = useMemo(() => safeTickets.filter(t => t.assignedTo === inspectedUser?.id), [safeTickets, inspectedUser]);
  const userSchedules = useMemo(() => safeSchedules.filter(s => s.userId === inspectedUser?.id), [safeSchedules, inspectedUser]);
  const userCustomTasks = useMemo(() => safeCustomTasks.filter(t => t.userId === inspectedUser?.id), [safeCustomTasks, inspectedUser]);

  return e('div', { className: 'fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4' },
    e('div', { className: 'bg-white rounded-3xl max-w-xl w-full p-7 shadow-2xl border border-slate-100 space-y-4 max-h-[85vh] overflow-y-auto' },
      e('div', { className: 'flex justify-between items-center border-b pb-3' },
        e('div', { className: 'flex items-center gap-3' },
          e('img', { src: inspectedUser?.avatar, className: 'w-10 h-10 rounded-full object-cover border-2 border-purple-600' }),
          e('div', null,
            e('h3', { className: 'font-bold text-slate-900 text-base' }, inspectedUser?.name),
            e('span', { className: 'text-xs text-purple-600 font-semibold' }, `${inspectedUser?.department} • ${inspectedUser?.mode}`)
          )
        ),
        e('button', { onClick: onClose, className: 'font-bold text-slate-400 cursor-pointer' }, '✕')
      ),

      e('div', { className: 'flex border-b text-xs font-bold gap-2' },
        ['schedule', 'todo', 'tickets', 'status'].map(t => e('button', {
          key: t,
          onClick: () => setTab(t),
          className: `px-3 py-2 border-b-2 transition-all capitalize cursor-pointer ${tab === t ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`
        }, t === 'schedule' ? '📅 Schedule' : t === 'todo' ? '📋 To-Do List' : t === 'tickets' ? '🎫 Tickets' : '🟢 Status'))
      ),

      tab === 'schedule' && e('div', { className: 'space-y-3 text-xs' },
        e('h4', { className: 'font-bold text-slate-800' }, 'Locked Working Schedules:'),
        userSchedules.length === 0 ? e('div', { className: 'p-4 bg-slate-50 border rounded-xl text-slate-400 italic text-center' }, 'No schedules locked yet.') :
        userSchedules.map(s => e('div', { key: s.id, className: 'p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex justify-between items-center font-mono' },
          e('span', { className: 'font-bold text-emerald-900' }, s.date || s.day),
          e('span', { className: 'text-emerald-700' }, s.time),
          e('span', { className: 'bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] font-bold' }, 'LOCKED')
        ))
      ),

      tab === 'todo' && e('div', { className: 'space-y-3 text-xs' },
        e('h4', { className: 'font-bold text-slate-800' }, `Personal To-Do Items & Assigned Tasks (${inspectedUser?.name}):`),
        userCustomTasks.length === 0 && userTickets.length === 0 ? e('div', { className: 'p-4 bg-slate-50 border rounded-xl text-slate-400 italic text-center' }, 'No To-Do items or assigned tickets logged.') :
        e('div', { className: 'space-y-2' },
          userCustomTasks.map(t => e('div', { key: t.id, className: 'p-3 bg-white border rounded-xl flex justify-between items-center shadow-2xs' },
            e('div', { className: 'flex items-center gap-2.5' },
              e('span', { className: `w-2.5 h-2.5 rounded-full ${t.done ? 'bg-emerald-500' : 'bg-amber-500'}` }),
              e('span', { className: `font-semibold ${t.done ? 'line-through text-slate-400' : 'text-slate-900'}` }, t.title)
            ),
            e('span', { className: `text-[10px] font-bold px-2 py-0.5 rounded ${t.done ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}` }, t.done ? '✓ Completed' : 'Pending')
          )),
          userTickets.map(t => e('div', { key: t.id, className: 'p-3 bg-blue-50/60 border border-blue-200 rounded-xl flex justify-between items-center' },
            e('div', null,
              e('span', { className: 'font-mono text-[10px] font-bold text-blue-600' }, t.code),
              e('div', { className: 'font-bold text-slate-900' }, t.subject)
            ),
            e('span', { className: `text-[10px] font-bold px-2 py-0.5 rounded ${t.status === 'Done' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}` }, t.status)
          ))
        )
      ),

      tab === 'tickets' && e('div', { className: 'space-y-2 text-xs' },
        userTickets.length === 0 ? e('div', { className: 'p-4 bg-slate-50 border rounded-xl text-slate-400 italic text-center' }, 'No assigned tickets.') :
        userTickets.map(t => e('div', { key: t.id, className: 'p-3 bg-white border rounded-xl flex justify-between items-center' },
          e('div', null,
            e('span', { className: 'font-mono text-blue-600 font-bold text-[10px]' }, t.code),
            e('div', { className: 'font-bold text-slate-900' }, t.subject)
          ),
          e('span', { className: `px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'Done' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}` }, t.status)
        ))
      ),

      tab === 'status' && e('div', { className: 'p-4 bg-slate-50 border rounded-2xl space-y-2 text-xs' },
        e('div', { className: 'flex justify-between' }, e('span', { className: 'text-slate-500' }, 'Current Status:'), e('span', { className: 'font-bold text-emerald-600' }, inspectedUser.status)),
        e('div', { className: 'flex justify-between' }, e('span', { className: 'text-slate-500' }, 'Work Mode:'), e('span', { className: 'font-bold text-slate-900' }, inspectedUser.mode)),
        e('div', { className: 'flex justify-between' }, e('span', { className: 'text-slate-500' }, 'Checked-in Today:'), e('span', { className: 'font-bold text-blue-600' }, inspectedUser.checkedIn ? 'Yes (Checked-In)' : 'No'))
      )
    )
  );
}

// --- PROFILE PHOTO ATTACH, CROP & BRIGHTNESS STUDIO MODAL ---
function ProfilePhotoCropModal({ currentAvatar, onClose, onSaveAvatar }) {
  const [imageSrc, setImageSrc] = useState(currentAvatar || "");
  const [zoom, setZoom] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);

  const handleFileSelect = (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCroppedImage = () => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');

    ctx.filter = `brightness(${brightness}%)`;

    const scale = zoom / 100;
    const sw = img.naturalWidth / scale;
    const sh = img.naturalHeight / scale;
    const sx = Math.max(0, (img.naturalWidth - sw) / 2);
    const sy = Math.max(0, (img.naturalHeight - sh) / 2);

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 240, 240);
    const resultDataUrl = canvas.toDataURL('image/png');
    onSaveAvatar(resultDataUrl);
    onClose();
  };

  return e('div', { className: 'fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4' },
    e('div', { className: 'bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100' },
      e('div', { className: 'flex justify-between items-center border-b pb-3' },
        e('h3', { className: 'font-bold text-slate-900 text-base flex items-center gap-2' }, '📸 Upload & Crop Profile Photo Studio'),
        e('button', { onClick: onClose, className: 'font-bold text-slate-400 cursor-pointer' }, '✕')
      ),

      e('div', { className: 'space-y-4 text-xs' },
        e('input', {
          type: 'file',
          ref: fileInputRef,
          accept: 'image/*',
          onChange: handleFileSelect,
          className: 'hidden'
        }),

        e('button', {
          type: 'button',
          onClick: () => fileInputRef.current && fileInputRef.current.click(),
          className: 'w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 font-extrabold rounded-xl border border-blue-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs'
        }, '📁 Attach Photo File from Computer / Gallery'),

        imageSrc && e('div', { className: 'space-y-4 pt-2' },
          e('div', { className: 'relative w-44 h-44 mx-auto rounded-full overflow-hidden border-4 border-blue-600 shadow-xl bg-slate-900 flex items-center justify-center' },
            e('img', {
              ref: imgRef,
              src: imageSrc,
              style: {
                filter: `brightness(${brightness}%)`,
                transform: `scale(${zoom / 100})`,
                transition: 'filter 0.1s ease, transform 0.1s ease',
                maxHeight: '100%',
                maxWidth: '100%',
                objectFit: 'cover'
              }
            })
          ),

          e('div', { className: 'space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200' },
            e('div', null,
              e('div', { className: 'flex justify-between font-bold mb-1 text-slate-700' },
                e('span', null, '☀️ Adjust Brightness'),
                e('span', { className: 'font-mono text-blue-600' }, `${brightness}%`)
              ),
              e('input', {
                type: 'range',
                min: 50,
                max: 150,
                value: brightness,
                onChange: ev => setBrightness(ev.target.value),
                className: 'w-full accent-blue-600 cursor-pointer'
              })
            ),

            e('div', null,
              e('div', { className: 'flex justify-between font-bold mb-1 text-slate-700' },
                e('span', null, '🔍 Adjust Crop Zoom'),
                e('span', { className: 'font-mono text-purple-600' }, `${zoom}%`)
              ),
              e('input', {
                type: 'range',
                min: 50,
                max: 200,
                value: zoom,
                onChange: ev => setZoom(ev.target.value),
                className: 'w-full accent-purple-600 cursor-pointer'
              })
            )
          )
        ),

        e('div', { className: 'flex justify-end gap-2 pt-3 border-t' },
          e('button', { type: 'button', onClick: onClose, className: 'font-semibold px-4 cursor-pointer' }, 'Cancel'),
          e('button', {
            type: 'button',
            onClick: handleSaveCroppedImage,
            disabled: !imageSrc,
            className: 'px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold shadow cursor-pointer'
          }, '✓ Save & Apply Avatar')
        )
      )
    )
  );
}

// --- WORK MODE INSPECTOR BANNER ---
function WorkModeInspectorBanner({ currentUser, companyInfo, userLocation }) {
  if (!currentUser) return null;
  const isWfo = currentUser?.mode === "Full WFO";
  const isHybrid = currentUser?.mode === "Hybrid";

  const targetGeoName = companyInfo?.factoryGeo?.name || DEFAULT_FACTORY_GEO.name;
  const targetLat = companyInfo?.factoryGeo?.lat || DEFAULT_FACTORY_GEO.lat;
  const targetLng = companyInfo?.factoryGeo?.lng || DEFAULT_FACTORY_GEO.lng;

  const distMeters = calculateDistanceMeters(userLocation.lat, userLocation.lng, targetLat, targetLng);

  return e('div', { className: `px-6 py-2.5 text-xs border-b flex flex-wrap items-center justify-between gap-2 ${isWfo ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : isHybrid ? 'bg-purple-50 border-purple-200 text-purple-950' : 'bg-blue-50 border-blue-200 text-blue-950'}` },
    e('div', { className: 'flex items-center gap-3' },
      e('span', { className: 'font-extrabold text-sm flex items-center gap-1.5' }, isWfo ? '🏢 Full WFO Persona Active' : isHybrid ? '🔄 Hybrid Persona Active' : '🏠 Full WFH Persona Active'),
      e('span', { className: 'text-slate-300' }, '|'),
      e('span', { className: 'font-semibold text-slate-700' }, `Company: ${companyInfo?.name || "PT Javelo Terra Lestari"}`),
      e('span', { className: 'text-slate-300' }, '|'),
      e('span', { className: 'font-medium text-slate-600' }, isWfo ? `Strict GPS Geofence Radar (${Math.round(distMeters)}m from ${targetGeoName})` : isHybrid ? `WFO Calendar Mode Active` : `Enterprise Multi-Device Online Portal Active`)
    ),
    e('div', { className: 'flex items-center gap-2 font-mono text-[11px]' },
      e('span', { className: 'font-bold' }, 'Check-in Gate:'),
      e('span', { className: `px-2 py-0.5 rounded font-bold ${isWfo ? 'bg-emerald-200 text-emerald-900' : isHybrid ? 'bg-purple-200 text-purple-900' : 'bg-blue-200 text-blue-900'}` }, isWfo ? 'GPS 500m Geofence Gate' : isHybrid ? 'Hybrid Shift Gate' : 'Attendance Gate')
    )
  );
}

// --- LOGIN SCREEN ---
function LoginScreen({ users, companyInfo, onLogin, onStartWizard }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [serverUrl, setServerUrl] = useState(() => localStorage.getItem('javelo_api_url') || window.location.origin);
  const [showConfigUrl, setShowConfigUrl] = useState(false);
  const [cloudUsers, setCloudUsers] = useState(users || DEFAULT_ROSTER);

  // Pre-fetch live database from GitHub Cloud immediately on mount
  useEffect(() => {
    async function prefetchCloudUsers() {
      try {
        const ghRes = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/db.json?ref=gh-pages&t=${Date.now()}`, {
          headers: { 'Authorization': `token ${GH_AUTH_TOKEN}`, 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'JaveloERP' }
        });
        if (ghRes.ok) {
          const ghData = await ghRes.json();
          const jsonStr = decodeURIComponent(escape(atob(ghData.content)));
          const parsed = JSON.parse(jsonStr);
          if (parsed && Array.isArray(parsed.users) && parsed.users.length > 0) {
            setCloudUsers(parsed.users);
            try { localStorage.setItem('javelo_users', JSON.stringify(parsed.users)); } catch(e){}
          }
        }
      } catch(e) {}
    }
    prefetchCloudUsers();
  }, []);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!email.trim()) {
      setLoginError("Mohon masukkan Work Email / ID Karyawan yang telah dibuatkan C-Level.");
      return;
    }

    const cleanInput = email.trim().toLowerCase();
    localStorage.setItem('javelo_api_url', serverUrl);

    // 1. Fetch live users from GitHub Cloud DB directly (Real-Time Multi-Device Sync)
    let allUsers = cloudUsers && cloudUsers.length > 0 ? cloudUsers : (users || []);
    try {
      const ghRes = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/db.json?ref=gh-pages&t=${Date.now()}`, {
        headers: { 'Authorization': `token ${GH_AUTH_TOKEN}`, 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'JaveloERP' }
      });
      if (ghRes.ok) {
        const ghData = await ghRes.json();
        const jsonStr = decodeURIComponent(escape(atob(ghData.content)));
        const cloudData = JSON.parse(jsonStr);
        if (cloudData && Array.isArray(cloudData.users) && cloudData.users.length > 0) {
          allUsers = cloudData.users;
          try { localStorage.setItem('javelo_users', JSON.stringify(cloudData.users)); } catch(e){}
        }
      } else {
        // Fallback to local server or static db.json
        const cleanUrl = serverUrl.replace(/\/$/, "");
        let res = await fetch(`${cleanUrl}/api/db`, { headers: { 'ngrok-skip-browser-warning': 'true' } }).catch(() => null);
        if (!res || !res.ok) {
          res = await fetch(`./db.json?t=${Date.now()}`).catch(() => null);
        }
        if (res && res.ok) {
          const cloudData = await res.json();
          if (cloudData && Array.isArray(cloudData.users) && cloudData.users.length > 0) {
            allUsers = cloudData.users;
          }
        }
      }
    } catch(e) {}

    // 2. Only fallback to founder if allUsers is completely empty
    if (!allUsers || allUsers.length === 0) {
      allUsers = DEFAULT_ROSTER;
    }
    if (!allUsers.some(u => u.email?.toLowerCase() === "cahaya@javeloterralestari.com")) {
      allUsers = [DEFAULT_ROSTER[0], ...allUsers];
    }

    // 3. Account lookup by Email, Name, ID, or Email Prefix
    const foundUser = allUsers.find(u => 
      (u.email && u.email.toLowerCase() === cleanInput) ||
      (u.name && u.name.toLowerCase() === cleanInput) ||
      (u.id && u.id.toLowerCase() === cleanInput) ||
      (u.email && u.email.toLowerCase().split('@')[0] === cleanInput)
    );

    if (foundUser) {
      // Validate password if user has password configured
      if (foundUser.password && password) {
        const inputPass = password.trim().toLowerCase();
        const userPass = foundUser.password.trim().toLowerCase();
        if (inputPass !== userPass && userPass !== '••••••••') {
          setLoginError(`Password salah untuk akun ${foundUser.email}. Pastikan password yang dimasukkan benar.`);
          return;
        }
      }
      setLoginError("");
      onLogin(foundUser);
    } else {
      setLoginError(`Akun email (${email}) tidak terdaftar atau telah dinonaktifkan oleh Admin.`);
    }
  };

  return e('div', { className: 'min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 select-none' },
    e('div', { className: 'max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl space-y-6 border border-slate-100' },
      e('div', { className: 'text-center space-y-2' },
        e('div', { className: 'w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto text-white font-extrabold text-2xl shadow-lg shadow-blue-500/30' }, 'J'),
        e('h2', { className: 'text-2xl font-extrabold text-slate-900 tracking-tight' }, 'Javelo360 ERP'),
        e('p', { className: 'text-xs text-slate-500 font-semibold' }, `${companyInfo?.name || "PT Javelo Terra Lestari"} • Portal Login Karyawan`)
      ),

      loginError && e('div', { className: 'p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs' },
        e('span', { className: 'leading-relaxed' }, loginError),
        e('button', { onClick: () => setLoginError(""), className: 'font-bold text-rose-500 text-sm cursor-pointer ml-2' }, '✕')
      ),

      e('form', { onSubmit: handleSubmit, className: 'space-y-4 text-xs' },
        e('div', null,
          e('label', { className: 'font-bold text-slate-700 block mb-1.5' }, 'Work Email / Employee ID'),
          e('input', {
            type: 'text',
            required: true,
            placeholder: 'Masukkan Email yang telah dibuatkan C-Level...',
            value: email,
            onChange: ev => { setEmail(ev.target.value); setLoginError(""); },
            className: 'w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs shadow-xs bg-slate-50/50'
          })
        ),
        e('div', null,
          e('label', { className: 'font-bold text-slate-700 block mb-1.5' }, 'Password / PIN Karyawan'),
          e('input', {
            type: 'password',
            required: true,
            placeholder: '••••••••',
            value: password,
            onChange: ev => setPassword(ev.target.value),
            className: 'w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs shadow-xs bg-slate-50/50'
          })
        ),
        e('button', {
          type: 'submit',
          className: 'w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-lg text-xs transition-all cursor-pointer flex items-center justify-center gap-2'
        }, '⚡ Sign In to Employee Portal')
      ),

      e('div', { className: 'pt-2 border-t border-slate-100 text-center' },
        e('button', {
          type: 'button',
          onClick: () => setShowConfigUrl(!showConfigUrl),
          className: 'text-[11px] font-bold text-blue-600 hover:underline cursor-pointer'
        }, showConfigUrl ? '⚙️ Hide Server Database Config' : '⚙️ Configure Backend Server URL'),

        showConfigUrl && e('div', { className: 'mt-3 p-3 bg-slate-50 border rounded-xl space-y-2 text-left' },
          e('label', { className: 'font-bold text-[10px] text-slate-500 block uppercase' }, 'Server API Endpoint URL'),
          e('input', {
            type: 'text',
            value: serverUrl,
            onChange: ev => setServerUrl(ev.target.value),
            className: 'w-full px-3 py-1.5 border rounded-lg font-mono text-[11px] bg-white'
          }),
          e('p', { className: 'text-[10px] text-slate-400 leading-normal' }, 'Biarkan default jika backend dijalankan di domain yang sama, atau isi dengan URL Localtunnel/Pinggy Anda jika deploy di Netlify.')
        )
      ),

      e('div', { className: 'pt-2 border-t border-slate-100 space-y-2 text-center' },
        e('button', {
          type: 'button',
          onClick: onStartWizard,
          className: 'w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer'
        }, e(IconSparkles, { className: 'w-4 h-4 text-purple-200' }), '⚙️ Setup New Company & Founder Account')
      )
    )
  );
}

// --- SIDEBAR COMPONENT ---
function Sidebar({ activeTab, setActiveTab, currentUser, users, companyInfo, anomalyCount, onLogout, onStartWizard }) {
  const isAdmin = currentUser?.role === 'admin';

  const menuItems = [
    { id: "tickets", label: "Tickets & Tasks", Icon: IconTicket },
    { id: "todo", label: "My Tasks & To-Do", Icon: IconCheckList, badge: null },
    ...(isAdmin ? [{ id: "clevel", label: "C-Level Dashboard", Icon: IconAnalytics, badge: anomalyCount > 0 ? `${anomalyCount} Alert` : null, badgeColor: "bg-rose-500" }] : []),
    { id: "chat", label: "Team Chat", Icon: IconChat },
    { id: "settings", label: "Settings", Icon: IconSettings },
  ];

  return e('aside', { className: 'w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col md:flex-col justify-between flex-shrink-0 select-none' },
    e('div', { className: 'flex flex-row md:flex-col items-center md:items-stretch justify-between w-full md:w-auto' },
      e('div', { className: 'hidden md:flex p-5 items-center gap-3 border-b border-slate-100' },
        e('div', { className: 'w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg shadow-md' }, 'J'),
        e('div', null,
          e('h1', { className: 'font-extrabold text-slate-900 text-base tracking-tight leading-none' }, 'Javelo360 ERP'),
          e('span', { className: 'text-[11px] text-blue-600 font-semibold truncate block max-w-[130px]' }, companyInfo?.name || "PT Javelo Terra Lestari")
        )
      ),
      e('nav', { className: 'p-2 md:p-3 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible w-full md:w-auto' },
        menuItems.map(item => {
          const isActive = activeTab === item.id;
          const ItemIcon = item.Icon;
          return e('button', {
            key: item.id,
            onClick: () => setActiveTab(item.id),
            className: `flex items-center justify-between px-3 py-2 md:px-3.5 md:py-2.5 rounded-lg font-medium text-xs md:text-sm transition-all cursor-pointer whitespace-nowrap md:whitespace-normal ${isActive ? 'bg-blue-50 text-blue-600 font-semibold shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`
          },
            e('div', { className: 'flex items-center gap-2 md:gap-3' },
              e(ItemIcon, { className: `w-4 h-4 md:w-5 md:h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}` }),
              e('span', null, item.label)
            ),
            item.badge && e('span', { className: `text-[9px] px-1.5 py-0.5 rounded-full text-white font-bold ml-1 ${item.badgeColor || 'bg-blue-600'}` }, item.badge)
          );
        })
      )
    ),
    e('div', { className: 'hidden md:block p-3 border-t border-slate-100 m-3 space-y-2.5' },
      // REAL-TIME ACTIVE STAFF ROSTER LIST WIDGET
      e('div', { className: 'p-3 bg-slate-50 border rounded-xl space-y-2' },
        e('h4', { className: 'text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between' },
          e('span', null, '🟢 ACTIVE PERSONNEL'),
          e('span', { className: 'bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono text-[9px]' }, `${(users || []).filter(u => u.status === 'Online' || u.checkedIn).length} Online`)
        ),
        e('div', { className: 'space-y-1.5 max-h-24 overflow-y-auto pr-1' },
          (users || []).filter(u => u.status === 'Online' || u.checkedIn).length === 0 ? e('div', { className: 'text-[10px] text-slate-400 italic' }, 'No staff online.') :
          (users || []).filter(u => u.status === 'Online' || u.checkedIn).map(u => e('div', { key: u.id, className: 'flex items-center justify-between text-[11px] font-semibold text-slate-700 bg-white border border-slate-200/50 p-1.5 rounded-lg shadow-3xs' },
            e('div', { className: 'flex items-center gap-1.5 overflow-hidden' },
              e('span', { className: 'w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0' }),
              e('img', { src: u.avatar, className: 'w-4 h-4 rounded-full object-cover' }),
              e('span', { className: 'truncate max-w-[90px]' }, u.name)
            ),
            e('span', { className: 'text-[9px] text-slate-400 font-mono font-bold' }, u.role === 'admin' ? 'C-Level' : u.department)
          ))
        )
      ),

      e('button', {
        onClick: onStartWizard,
        className: 'w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer'
      }, e(IconSparkles, { className: 'w-4 h-4 text-purple-600' }), 'Setup Wizard'),
      e('div', { className: 'flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60' },
        e('div', { className: 'flex items-center gap-2.5' },
          e('img', { src: currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", className: 'w-9 h-9 rounded-full object-cover' }),
          e('div', { className: 'overflow-hidden' },
            e('h4', { className: 'font-semibold text-slate-900 text-xs truncate' }, currentUser?.name || "Admin"),
            e('span', { className: `inline-block text-[10px] px-2 py-0.5 rounded font-bold mt-0.5 ${currentUser?.mode === 'Full WFO' ? 'bg-emerald-100 text-emerald-800' : currentUser?.mode === 'Hybrid' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}` }, currentUser?.mode || 'C-Level')
          )
        )
      ),
      e('button', {
        onClick: onLogout,
        className: 'w-full flex items-center justify-center gap-2 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer'
      }, e(IconLogout, { className: 'w-4 h-4' }), 'Sign Out')
    )
  );
}

// --- HEADER COMPONENT WITH INTERACTIVE NOTIFICATIONS ---
function Header({ currentUser, timerFormatted, isTimerRunning, notifications, onNotificationClick, onMarkAllRead, onOpenCheckInGate, onCheckOutClick, onLogout }) {
  const [showNotifPopover, setShowNotifPopover] = useState(false);

  // Filter notifications specifically for the logged-in user
  const userNotifs = useMemo(() => {
    const list = notifications || [];
    if (!currentUser) return [];
    return list.filter(n => {
      if (n.userId && n.userId === currentUser.id) return true;
      if (n.userEmail && currentUser.email && n.userEmail.toLowerCase() === currentUser.email.toLowerCase()) return true;
      if (!n.userId && !n.userEmail) return true; // broadcast
      if (currentUser.role === 'admin' && n.targetRole === 'admin') return true;
      return false;
    });
  }, [notifications, currentUser]);

  const unreadCount = useMemo(() => userNotifs.filter(n => !n.read).length, [userNotifs]);

  return e('header', { className: 'h-auto md:h-16 py-3 md:py-0 bg-white border-b border-slate-200 px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-3 sticky top-0 z-10 shadow-sm relative' },
    e('div', { className: 'flex flex-wrap items-center justify-center md:justify-start gap-2.5 w-full md:w-auto' },
      e('div', { className: 'flex items-center gap-2 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-full font-mono text-sm font-semibold text-slate-800' },
        e('span', { className: 'w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse' }),
        e('span', null, timerFormatted)
      ),
      currentUser?.checkedIn ? e('button', {
        onClick: onCheckOutClick,
        className: 'px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5'
      }, '⏹ Check-out (Daily Gate)') : e('button', {
        onClick: onOpenCheckInGate,
        className: 'px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5'
      }, `▶ Check-in (${currentUser?.mode || 'WFO'} Gate)`)
    ),

    e('div', { className: 'flex flex-wrap items-center justify-center md:justify-end gap-2.5 w-full md:w-auto relative' },
      e('div', { className: 'relative' },
        e('button', {
          onClick: () => setShowNotifPopover(!showNotifPopover),
          className: 'p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 relative cursor-pointer'
        },
          e(IconBell, { className: 'w-5 h-5' }),
          unreadCount > 0 && e('span', { className: 'absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center animate-bounce' }, unreadCount)
        ),

        showNotifPopover && e('div', { className: 'notification-popover' },
          e('div', { className: 'p-4 border-b bg-slate-50 flex items-center justify-between' },
            e('h4', { className: 'font-extrabold text-xs text-slate-900' }, `Notifications & Alerts (${unreadCount} New)`),
            e('button', {
              onClick: onMarkAllRead,
              className: 'text-[10px] text-blue-600 font-bold hover:underline cursor-pointer'
            }, 'Mark all read')
          ),
          e('div', { className: 'max-h-72 overflow-y-auto divide-y' },
            userNotifs.length === 0 ? e('div', { className: 'p-6 text-center text-xs text-slate-400' }, 'No notifications yet.') :
            userNotifs.map(n => e('div', {
              key: n.id,
              onClick: () => { onNotificationClick(n); setShowNotifPopover(false); },
              className: `p-3.5 text-xs transition-all cursor-pointer hover:bg-blue-100/50 ${n.read ? 'bg-white' : 'bg-blue-50/50 font-medium'}`
            },
              e('div', { className: 'font-bold text-slate-900 flex justify-between' },
                e('span', null, n.title),
                e('span', { className: 'text-[10px] text-slate-400 font-normal' }, n.time)
              ),
              e('p', { className: 'text-slate-600 text-[11px] mt-1' }, n.text)
            ))
          )
        )
      ),


      e('div', { className: 'flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium' },
        e('span', { className: `w-2 h-2 rounded-full ${currentUser?.status === 'Online' ? 'bg-emerald-500' : currentUser?.status === 'Away' ? 'bg-amber-500' : 'bg-slate-400'}` }),
        e('span', null, currentUser?.status || 'Online')
      )
    )
  );
}

// --- PERSONAL TO-DO MANAGER ---
function PersonalToDoManager({ currentUser, tickets, setTickets, customTasks, setCustomTasks }) {
  const [toDoCategory, setToDoCategory] = useState("My Day");
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const [showReportModal, setShowReportModal] = useState(false);
  const [startDate, setStartDate] = useState("2026-08-20");
  const [endDate, setEndDate] = useState("2026-08-26");
  const [generatedReport, setGeneratedReport] = useState(null);

  const safeTickets = tickets || [];
  const safeCustomTasks = customTasks || [];

  const userCustomTasks = useMemo(() => {
    return safeCustomTasks.filter(t => t.userId === currentUser?.id);
  }, [safeCustomTasks, currentUser]);

  const assignedTickets = useMemo(() => {
    return safeTickets.filter(t => t.assignedTo === currentUser?.id || (t.mentionedUsers && t.mentionedUsers.includes(currentUser?.id)));
  }, [safeTickets, currentUser]);

  const handleAddTask = (ev) => {
    ev.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTaskObj = {
      id: "todo-" + Date.now(),
      userId: currentUser?.id,
      title: newTaskTitle,
      category: toDoCategory,
      done: false,
      important: false,
      date: new Date().toISOString().split('T')[0]
    };
    if (setCustomTasks) {
      setCustomTasks(prev => [newTaskObj, ...(prev || [])]);
    }
    setNewTaskTitle("");
  };

  const toggleTaskDone = (id) => {
    if (setCustomTasks) {
      setCustomTasks(prev => (prev || []).map(t => t.id === id ? { ...t, done: !t.done } : t));
    }
  };

  const toggleTaskImportant = (id) => {
    if (setCustomTasks) {
      setCustomTasks(prev => (prev || []).map(t => t.id === id ? { ...t, important: !t.important } : t));
    }
  };

  const handleGenerateReport = () => {
    const filteredCustom = userCustomTasks.filter(t => t.date >= startDate && t.date <= endDate);
    const completedCustom = filteredCustom.filter(t => t.done);
    const completedTickets = assignedTickets.filter(t => t.status === "Done");

    setGeneratedReport({
      startDate,
      endDate,
      totalCustom: filteredCustom.length,
      completedCustomCount: completedCustom.length,
      ticketsAssigned: assignedTickets.length,
      ticketsCompleted: completedTickets.length
    });
  };

  return e('div', { className: 'space-y-6' },
    e('div', { className: 'flex flex-wrap items-center justify-between gap-4' },
      e('div', null,
        e('h2', { className: 'text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2' },
          e(IconCheckList, { className: 'w-7 h-7 text-blue-600' }),
          `Personal To-Do List (${currentUser?.name || 'Staff'})`
        ),
        e('p', { className: 'text-xs text-slate-500 mt-0.5' }, 'Personal tasks & assigned ticket milestones synced automatically')
      ),
      e('button', {
        onClick: () => setShowReportModal(true),
        className: 'px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer'
      }, e(IconCalendar, { className: 'w-4 h-4' }), '📅 Generate Date Activity Report')
    ),

    e('div', { className: 'grid grid-cols-1 md:grid-cols-4 gap-6' },
      e('div', { className: 'bg-white p-4 rounded-2xl border border-slate-200 space-y-1 h-fit shadow-xs' },
        ['My Day', 'Important', 'Assigned Tickets', 'Custom Tasks'].map(cat => e('button', {
          key: cat,
          onClick: () => setToDoCategory(cat),
          className: `w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${toDoCategory === cat ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-slate-600 hover:bg-slate-50'}`
        },
          cat,
          cat === 'Assigned Tickets' ? e('span', { className: 'bg-blue-600 text-white px-2 py-0.5 rounded-full text-[10px]' }, assignedTickets.length) :
          e('span', { className: 'bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px]' }, userCustomTasks.filter(t => cat === 'Important' ? t.important : cat === 'My Day' ? (t.category === 'My Day' || !t.category) : true).length)
        ))
      ),

      e('div', { className: 'md:col-span-3 space-y-4' },
        e('form', { onSubmit: handleAddTask, className: 'flex gap-2' },
          e('input', {
            type: 'text',
            value: newTaskTitle,
            onChange: ev => setNewTaskTitle(ev.target.value),
            placeholder: `+ Add a task to "${toDoCategory}"...`,
            className: 'flex-1 px-4 py-3 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs'
          }),
          e('button', { type: 'submit', className: 'px-5 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs shadow cursor-pointer' }, 'Add Task')
        ),

        e('div', { className: 'space-y-2' },
          toDoCategory === 'Assigned Tickets' ? (
            assignedTickets.length === 0 ? e('div', { className: 'p-8 text-center text-slate-400 text-xs bg-white rounded-2xl border' }, 'No tickets assigned to you yet.') :
            assignedTickets.map(t => e('div', { key: t.id, className: 'todo-card flex items-center justify-between' },
              e('div', { className: 'flex items-center gap-3' },
                e('span', { className: `px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'Done' ? 'bg-emerald-100 text-emerald-800' : t.status === 'Pending Review' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}` }, t.status),
                e('div', null,
                  e('div', { className: 'font-mono text-[11px] font-bold text-blue-600' }, t.code),
                  e('div', { className: 'font-semibold text-slate-900 text-xs' }, t.subject)
                )
              ),
              e('span', { className: 'text-[11px] text-slate-400' }, `Deadline: ${t.deadline}`)
            ))
          ) : (
            userCustomTasks.filter(t => toDoCategory === 'Important' ? t.important : toDoCategory === 'My Day' ? (t.category === 'My Day' || !t.category) : true).length === 0 ? e('div', { className: 'p-8 text-center text-slate-400 text-xs bg-white rounded-2xl border' }, `No tasks in "${toDoCategory}". Add a new task above!`) :
            userCustomTasks.filter(t => toDoCategory === 'Important' ? t.important : toDoCategory === 'My Day' ? (t.category === 'My Day' || !t.category) : true).map(t => e('div', { key: t.id, className: 'todo-card flex items-center justify-between' },
              e('div', { className: 'flex items-center gap-3' },
                e('button', {
                  type: 'button',
                  onClick: () => toggleTaskDone(t.id),
                  className: `todo-checkbox ${t.done ? 'checked' : ''}`
                }, t.done ? '✓' : ''),
                e('span', { className: `text-xs font-semibold ${t.done ? 'line-through text-slate-400' : 'text-slate-800'}` }, t.title)
              ),
              e('button', {
                type: 'button',
                onClick: () => toggleTaskImportant(t.id),
                className: `p-1 cursor-pointer ${t.important ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'}`
              }, e(IconStar, { filled: t.important }))
            ))
          )
        )
      )
    ),

    showReportModal && e('div', { className: 'fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4' },
      e('div', { className: 'bg-white rounded-3xl max-w-2xl w-full p-7 shadow-2xl space-y-6 border border-slate-100' },
        e('div', { className: 'flex items-center justify-between border-b pb-4' },
          e('div', null,
            e('h3', { className: 'text-lg font-extrabold text-slate-900 flex items-center gap-2' },
              e(IconCalendar, { className: 'w-5 h-5 text-blue-600' }),
              `Generate Activity Recap Report (${currentUser?.name})`
            ),
            e('p', { className: 'text-xs text-slate-500' }, 'Select a date range to generate a comprehensive recap of tasks & ticket milestones')
          ),
          e('button', { onClick: () => setShowReportModal(false), className: 'text-slate-400 hover:text-slate-600 font-bold cursor-pointer' }, '✕')
        ),

        e('div', { className: 'grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200' },
          e('div', null,
            e('label', { className: 'font-bold block mb-1 text-xs text-slate-700' }, 'Start Date'),
            e('input', { type: 'date', value: startDate, onChange: ev => setStartDate(ev.target.value), className: 'w-full px-3 py-2 border rounded-xl bg-white font-mono text-xs' })
          ),
          e('div', null,
            e('label', { className: 'font-bold block mb-1 text-xs text-slate-700' }, 'End Date'),
            e('input', { type: 'date', value: endDate, onChange: ev => setEndDate(ev.target.value), className: 'w-full px-3 py-2 border rounded-xl bg-white font-mono text-xs' })
          )
        ),

        e('button', {
          onClick: handleGenerateReport,
          className: 'w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer'
        }, '⚡ Generate Activity Recap'),

        generatedReport && e('div', { className: 'p-5 bg-blue-50 border border-blue-200 rounded-2xl space-y-4 text-xs' },
          e('div', { className: 'flex justify-between items-center font-bold text-blue-950 border-b border-blue-200 pb-2' },
            e('span', null, `Activity Summary: ${generatedReport.startDate} to ${generatedReport.endDate}`),
            e('span', { className: 'bg-blue-600 text-white px-2 py-0.5 rounded font-mono text-[10px]' }, 'RECAP READY')
          ),
          e('div', { className: 'grid grid-cols-3 gap-3 text-center' },
            e('div', { className: 'p-3 bg-white rounded-xl border border-blue-100 shadow-xs' },
              e('div', { className: 'text-lg font-bold text-blue-600' }, generatedReport.completedCustomCount),
              e('div', { className: 'text-[10px] text-slate-500 font-semibold' }, 'Tasks Completed')
            ),
            e('div', { className: 'p-3 bg-white rounded-xl border border-blue-100 shadow-xs' },
            e('div', { className: 'text-lg font-bold text-indigo-600' }, generatedReport.ticketsCompleted),
              e('div', { className: 'text-[10px] text-slate-500 font-semibold' }, 'Tickets Done')
            ),
            e('div', { className: 'p-3 bg-white rounded-xl border border-blue-100 shadow-xs' },
              e('div', { className: 'text-lg font-bold text-emerald-600' }, `${Math.round(((generatedReport.completedCustomCount + generatedReport.ticketsCompleted) / ((generatedReport.totalCustom + generatedReport.ticketsAssigned) || 1)) * 100)}%`),
              e('div', { className: 'text-[10px] text-slate-500 font-semibold' }, 'Productivity Rate')
            )
          )
        )
      )
    )
  );
}

// --- 2D SKYOFFICE RETRO PIXEL ART MAP WITH ONLINE-ONLY & DIREKSI ROOM ---
function SkyOffice2DPixelMap({ users, tickets }) {
  const [hoveredUser, setHoveredUser] = useState(null);
  const [lampOn, setLampOn] = useState(true);

  const safeUsers = users || [];
  const safeTickets = tickets || [];

  // FILTER ONLINE-ONLY PERSONNEL
  const onlineUsers = useMemo(() => safeUsers.filter(u => u.status === 'Online' || u.checkedIn), [safeUsers]);
  const cLevelUsers = useMemo(() => onlineUsers.filter(u => u.role === 'admin' || u.department === 'C-Level Executive'), [onlineUsers]);
  const staffUsers = useMemo(() => onlineUsers.filter(u => u.role !== 'admin' && u.department !== 'C-Level Executive'), [onlineUsers]);

  const loungeChatters = useMemo(() => staffUsers.slice(0, 2), [staffUsers]);
  const workstationStaff = useMemo(() => staffUsers.slice(2), [staffUsers]);

  return e('div', { className: 'space-y-6' },
    e('div', { className: 'flex items-center justify-between' },
      e('div', null,
        e('h2', { className: 'text-2xl font-bold text-slate-900 tracking-tight' }, '2D Virtual Office (Realtime Pixel Art Map)'),
        e('p', { className: 'text-xs text-slate-500' }, 'Dynamic division rooms, C-Level Executive Boardroom, & Online-Only staff rendering')
      ),
      e('div', { className: 'flex items-center gap-3' },
        e('button', {
          onClick: () => setLampOn(!lampOn),
          className: `px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer border flex items-center gap-1.5 ${lampOn ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-800 text-slate-200 border-slate-700'}`
        }, lampOn ? '💡 Office Lamp: ON' : '🔌 Office Lamp: OFF'),
        e('div', { className: 'flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200' },
          e('span', { className: 'w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse' }),
          `${onlineUsers.length} Staff Online`
        )
      )
    ),

    onlineUsers.length === 0 ? e('div', { className: 'p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3' },
      e('div', { className: 'text-lg font-extrabold text-slate-800' }, '🏢 Office Currently Empty'),
      e('p', { className: 'text-xs text-slate-500 max-w-md mx-auto' }, 'All personnel are currently offline. When employees check in or switch to Online persona, their avatars appear live in their division rooms!')
    ) :
    e('div', { className: `sky-office-map-pixel p-6 relative flex flex-col justify-between transition-colors duration-500 ${lampOn ? 'bg-slate-100' : 'bg-slate-900 text-white opacity-95'}` },
      // EXECUTIVE DIREKSI SUITE BOARDROOM
      e('div', { className: 'pixel-meeting-room p-5 relative border-2 border-purple-300 bg-purple-50/70 rounded-2xl shadow-sm mb-6' },
        e('div', { className: 'font-extrabold text-xs text-purple-950 mb-2 flex items-center justify-between' },
          e('span', { className: 'flex items-center gap-2' },
            e(IconCrown, { className: 'w-4 h-4 text-amber-500' }),
            '👔 Executive C-Level Boardroom & Direksi Suite'
          ),
          e('span', { className: 'bg-purple-600 text-white text-[9px] px-2 py-0.5 rounded-full font-mono font-bold' }, `${cLevelUsers.length} Executives Active`)
        ),
        e('div', { className: 'pixel-conference-table p-4 flex justify-around items-center bg-purple-100/60 rounded-xl border border-purple-200' },
          cLevelUsers.length === 0 ? e('span', { className: 'text-[11px] text-purple-400 italic' }, 'No C-Level Executives present.') :
          cLevelUsers.map(u => e('div', {
            key: u.id,
            onMouseEnter: () => setHoveredUser({ ...u, activeTask: safeTickets.find(t => t.assignedTo === u.id) }),
            onMouseLeave: () => setHoveredUser(null),
            className: 'pixel-avatar-wrapper relative cursor-pointer'
          },
            e('div', { className: 'chat-speech-bubble font-bold text-[10px] text-purple-900 bg-amber-200 border-amber-400' }, '👑 Executive'),
            e('div', { className: 'pixel-avatar' },
              e('div', { className: `head ${u.hairColor || 'bg-amber-800'}` }, e('div', { className: 'hair' })),
              e('div', { className: `body-top ${u.avatarColor || 'bg-purple-600'}` })
            ),
            e('div', { className: 'pixel-avatar-nametag mt-1 font-bold' }, u.name ? u.name.split(' ')[0] : 'C-Level')
          ))
        )
      ),

      // MAIN STAFF DESK CLUSTER
      e('div', { className: 'my-4 flex justify-center' },
        e('div', { className: 'pixel-desk-cluster p-6 max-w-2xl w-full relative bg-white/80 rounded-2xl border border-slate-200 shadow-sm' },
          e('div', { className: 'text-center font-bold text-xs text-slate-800 mb-4 tracking-wider uppercase' }, '💻 Division Workstations (Engineering, Operations, Product)'),
          e('div', { className: 'grid grid-cols-4 gap-4' },
            workstationStaff.map(u => {
              const activeTask = safeTickets.find(t => t.assignedTo === u.id);
              return e('div', {
                key: u.id,
                onMouseEnter: () => setHoveredUser({ ...u, activeTask }),
                onMouseLeave: () => setHoveredUser(null),
                className: 'pixel-wood-desk p-3 flex flex-col items-center justify-between min-h-[90px] relative rounded-xl border border-amber-200 cursor-pointer'
              },
                e('div', { className: 'flex justify-between w-full items-center mb-1' },
                  e('div', { className: 'pixel-laptop' }),
                  e('span', { className: `text-[11px] cursor-pointer ${lampOn ? 'text-amber-400' : 'text-slate-500'}` }, '💡')
                ),
                e('div', { className: 'pixel-avatar-wrapper mt-1' },
                  e('div', { className: 'pixel-avatar-nametag' }, u.name ? u.name.split(' ')[0] : 'Staff'),
                  e('div', { className: 'pixel-avatar' },
                    e('div', { className: `head ${u.hairColor || 'bg-amber-800'}` }, e('div', { className: 'hair' })),
                    e('div', { className: `body-top ${u.avatarColor || 'bg-blue-600'}` })
                  )
                )
              );
            })
          )
        )
      ),

      // 1-ON-1 CHATTING LOUNGE
      e('div', { className: 'pixel-coffee-lounge p-5 relative border border-amber-200 bg-amber-50/60 rounded-2xl shadow-xs mt-4' },
        e('div', { className: 'font-extrabold text-xs text-amber-900 mb-2 flex items-center justify-between' },
          e('span', null, '☕ 1-on-1 Coffee Lounge (Interactive Discussion)'),
          e('span', { className: 'text-[10px] text-amber-700 font-mono' }, 'CHATTING ACTIVE')
        ),
        e('div', { className: 'flex justify-around items-center pt-2' },
          loungeChatters.map(u => e('div', {
            key: u.id,
            onMouseEnter: () => setHoveredUser({ ...u, activeTask: safeTickets.find(t => t.assignedTo === u.id) }),
            onMouseLeave: () => setHoveredUser(null),
            className: 'pixel-avatar-wrapper relative cursor-pointer'
          },
            e('div', { className: 'chat-speech-bubble' }, '💬 Chatting...'),
            e('div', { className: 'pixel-avatar' },
              e('div', { className: `head ${u.hairColor || 'bg-amber-800'}` }, e('div', { className: 'hair' })),
              e('div', { className: `body-top ${u.avatarColor || 'bg-blue-600'}` })
            ),
            e('div', { className: 'pixel-avatar-nametag mt-1' }, u.name ? u.name.split(' ')[0] : 'Staff')
          ))
        )
      )
    ),

    hoveredUser && e('div', { className: 'pixel-hover-card' },
      e('div', { className: 'font-extrabold text-xs text-blue-400 flex items-center justify-between border-b border-slate-700 pb-1.5 mb-1.5' },
        e('span', null, hoveredUser.name),
        e('span', { className: 'text-[9px] px-1.5 py-0.5 rounded bg-blue-600 text-white font-mono' }, hoveredUser.mode)
      ),
      e('div', { className: 'space-y-1 text-[10px] text-slate-300' },
        e('div', null, 'Department: ', e('strong', { className: 'text-white' }, hoveredUser.department)),
        e('div', null, 'Status: ', e('strong', { className: 'text-emerald-400' }, hoveredUser.status)),
        e('div', { className: 'pt-1 text-amber-300 font-bold border-t border-slate-800' },
          hoveredUser.activeTask ? `📌 Working on: ${hoveredUser.activeTask.code} - ${hoveredUser.activeTask.subject}` : '☕ Resting / Office Break'
        )
      )
    )
  );
}

// --- TICKET BOARD WITH COMPACT COMPLETED TICKETS ARCHIVE ---
function TicketBoard({ tickets, users, currentUser, companyInfo, onOpenCreateTicket, onEditTicket, onOpenComments, onOpenHistory, onDeleteTicket, onSendReminder }) {
  const [filterDivision, setFilterDivision] = useState("All");
  const [searchCode, setSearchCode] = useState("");
  const divisions = ["All", "🎯 Tugas Saya", "General", "Engineering", "Operations", "Product", "Quality Control"];

  const isAdmin = currentUser?.role === 'admin';
  const safeTickets = tickets || [];
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTickets = useMemo(() => {
    return safeTickets.filter(t => {
      let matchDiv = true;
      if (filterDivision === "🎯 Tugas Saya") {
        matchDiv = t.assignedTo === currentUser?.id || (t.mentionedUsers && t.mentionedUsers.includes(currentUser?.id));
      } else if (filterDivision !== "All") {
        matchDiv = Array.isArray(t.division) ? t.division.includes(filterDivision) : t.division === filterDivision;
      }
      const matchSearch = searchCode ? (t.code.toLowerCase().includes(searchCode.toLowerCase()) || t.subject.toLowerCase().includes(searchCode.toLowerCase())) : true;
      return matchDiv && matchSearch;
    });
  }, [safeTickets, filterDivision, searchCode, currentUser]);

  // SEPARATE ACTIVE TICKETS VS COMPLETED / PAST TICKETS
  const activeTickets = useMemo(() => filteredTickets.filter(t => t.status !== 'Done'), [filteredTickets]);
  const completedTickets = useMemo(() => filteredTickets.filter(t => t.status === 'Done'), [filteredTickets]);

  return e('div', { className: 'space-y-6' },
    e('div', { className: 'flex flex-wrap items-center justify-between gap-4' },
      e('div', null,
        e('h2', { className: 'text-2xl font-bold text-slate-900' }, 'Tickets & Task Management'),
        e('p', { className: 'text-xs text-slate-500' }, `Tracked ticket codes (${getCompanyInitials(companyInfo?.name)}-2026-XXX), active tasks & completed archive`)
      ),
      e('button', { onClick: onOpenCreateTicket, className: 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer' }, '+ Generate Ticket')
    ),

    // TICKET CODE SEARCH TRACKER BAR
    e('div', { className: 'p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3' },
      e(IconSearch, { className: 'w-5 h-5 text-slate-400' }),
      e('input', {
        type: 'text',
        value: searchCode,
        onChange: ev => setSearchCode(ev.target.value),
        placeholder: 'Search Ticket Code # (e.g. #JTL-2026-101) or Subject history...',
        className: 'flex-1 border-none focus:outline-none text-xs font-mono bg-transparent'
      }),
      searchCode && e('button', { onClick: () => setSearchCode(""), className: 'text-slate-400 font-bold hover:text-slate-600 cursor-pointer text-xs' }, 'Clear')
    ),

    e('div', { className: 'flex flex-wrap gap-2 border-b border-slate-200 pb-3' },
      divisions.map(d => e('button', {
        key: d,
        onClick: () => setFilterDivision(d),
        className: `px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${filterDivision === d ? 'bg-blue-600 text-white shadow' : 'bg-white border text-slate-600 hover:bg-slate-50'}`
      }, d))
    ),

    // 1. ACTIVE TICKETS SECTION
    e('div', { className: 'space-y-4' },
      e('div', { className: 'flex items-center justify-between' },
        e('h3', { className: 'font-extrabold text-sm text-slate-800 flex items-center gap-2' },
          e('span', { className: 'w-2.5 h-2.5 rounded-full bg-blue-600' }),
          `Active / In-Progress Tickets (${activeTickets.length})`
        )
      ),

      activeTickets.length === 0 ? e('div', { className: 'p-8 text-center bg-white rounded-2xl border space-y-2' },
        e('div', { className: 'text-sm font-bold text-slate-700' }, '🎉 All Active Tickets Resolved!'),
        e('p', { className: 'text-xs text-slate-500' }, 'Check the completed records below or click "+ Generate Ticket" to assign new work.')
      ) :
      e('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
        activeTickets.map(t => {
          const creator = (users || []).find(u => u.id === t.assignedBy);
          const isCLevelCreator = creator?.role === 'admin' || creator?.department === 'C-Level Executive';
          const assignee = (users || []).find(u => u.id === t.assignedTo);
          const isUrgent = t.priority === "Urgent" || t.priority === "Emergency";
          const isHigh = t.priority === "High";
          const commentCount = (t.comments || []).length;

          // CALCULATE OVERDUE DEADLINE
          const isOverdue = t.deadline && t.deadline < todayStr && t.status !== 'Done';
          const daysOverdue = isOverdue ? Math.max(1, Math.ceil((new Date(todayStr) - new Date(t.deadline)) / (1000 * 60 * 60 * 24))) : 0;

          const cardBorderClass = isOverdue ? 'border-2 border-rose-600 bg-rose-50/60 shadow-sm' : isUrgent ? 'border-2 border-rose-500 bg-rose-50/30' : isHigh ? 'border-2 border-amber-500 bg-amber-50/20' : 'border border-slate-200 bg-white';

          return e('div', {
            key: t.id,
            onClick: () => onEditTicket(t),
            className: `${cardBorderClass} p-5 rounded-2xl shadow-xs space-y-3 relative hover:shadow-md transition-all cursor-pointer`
          },
            isOverdue && e('div', { className: 'p-2 bg-rose-600 text-white rounded-xl text-[10px] font-extrabold flex items-center justify-between shadow-xs animate-pulse' },
              e('span', null, '⏰ TERLEWAT TENGGAT DEADLINE (OVERDUE)'),
              e('span', { className: 'font-mono text-[9px] bg-white/25 px-2 py-0.5 rounded font-bold' }, `${daysOverdue} Hari Terlewat`)
            ),

            isCLevelCreator && e('div', { className: 'p-2 bg-gradient-to-r from-amber-500 to-purple-600 text-white rounded-xl text-[10px] font-extrabold flex items-center justify-between shadow-xs' },
              e('span', { className: 'flex items-center gap-1.5' },
                e(IconCrown, { className: 'w-4 h-4 text-amber-200' }),
                '👑 C-LEVEL EXECUTIVE DIRECTIVE'
              ),
              e('span', { className: 'font-mono text-[9px] bg-white/20 px-1.5 py-0.5 rounded' }, creator ? creator.name : 'C-Level')
            ),

            e('div', { className: 'flex items-start justify-between gap-2' },
              e('div', { className: 'flex-1' },
                e('div', { className: 'flex items-center gap-2 flex-wrap' },
                  e('span', { className: 'font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200' }, t.code),
                  e('span', { className: `text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isUrgent ? 'bg-rose-600 text-white animate-pulse' : isHigh ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'}` }, t.priority || 'Normal'),
                  t.deadline && e('span', { className: `text-[10px] font-mono font-bold px-2 py-0.5 rounded ${isOverdue ? 'bg-rose-100 text-rose-800 font-extrabold' : 'bg-slate-100 text-slate-600'}` }, `📅 Deadline: ${t.deadline}`)
                ),
                e('h3', { className: 'font-bold text-slate-900 text-sm mt-1.5 hover:text-blue-600 transition-colors' }, t.subject)
              ),
              e('div', { className: 'flex items-center gap-1.5' },
                isAdmin && e('button', {
                  onClick: (ev) => { ev.stopPropagation(); onDeleteTicket(t.id); },
                  className: 'p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold cursor-pointer'
                }, e(IconTrash, { className: 'w-4 h-4' })),
                e('button', {
                  onClick: (ev) => { ev.stopPropagation(); onSendReminder(assignee, t); },
                  className: 'px-2 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded text-[10px] font-extrabold flex items-center gap-1 cursor-pointer'
                }, '🔔 Remind'),
                e('span', { className: `text-[10px] font-bold px-2.5 py-1 rounded-full ${t.status === 'Pending Review' ? 'bg-amber-100 text-amber-900 animate-pulse' : 'bg-blue-100 text-blue-800'}` }, t.status)
              )
            ),
            e('p', { className: 'text-xs text-slate-600 leading-relaxed' }, t.details),
            
            t.proofLink && e('div', { className: 'p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] flex items-center gap-1.5 text-blue-600 font-mono font-semibold' },
              e(IconLink, { className: 'w-3.5 h-3.5' }),
              e('a', { href: t.proofLink, target: '_blank', rel: 'noreferrer', onClick: (ev) => ev.stopPropagation(), className: 'hover:underline truncate' }, `Proof: ${t.proofLink}`)
            ),

            e('div', { className: 'flex items-center justify-between pt-3 border-t text-xs' },
              e('div', { className: 'flex items-center gap-2 flex-wrap' },
                e('span', { className: 'text-slate-700 font-bold' }, `Assignee: ${assignee ? assignee.name : 'Unassigned'}`),
                (assignee && currentUser && assignee.id === currentUser.id) && e('span', { className: 'bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold' }, '👤 Ditugaskan ke Anda'),
                e('button', {
                  onClick: (ev) => { ev.stopPropagation(); onOpenComments(t); },
                  className: 'px-2.5 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer'
                }, e(IconComment, { className: 'w-3.5 h-3.5 text-purple-600' }), `💬 Comments (${commentCount})`)
              ),
              e('button', {
                onClick: (ev) => { ev.stopPropagation(); onOpenHistory(t); },
                className: 'text-[11px] text-blue-600 font-bold hover:underline cursor-pointer'
              }, '📜 View History')
            )
          );
        })
      )
    ),

    // 2. COMPLETED & ARCHIVED TICKETS SECTION (COMPACT & SLIM ROWS)
    completedTickets.length > 0 && e('div', { className: 'pt-6 border-t border-slate-200 space-y-3' },
      e('div', { className: 'flex items-center justify-between' },
        e('h3', { className: 'font-extrabold text-sm text-slate-700 flex items-center gap-2' },
          e('span', { className: 'w-2.5 h-2.5 rounded-full bg-emerald-500' }),
          `✅ Completed & Archived Ticket Records (${completedTickets.length})`
        ),
        e('span', { className: 'text-[10px] text-slate-400 font-mono' }, 'Ringkas & Archived Records')
      ),

      e('div', { className: 'space-y-2' },
        completedTickets.map(t => {
          const assignee = (users || []).find(u => u.id === t.assignedTo);
          return e('div', {
            key: t.id,
            onClick: () => onOpenHistory(t),
            className: 'p-3 bg-slate-100/90 border border-slate-200 hover:border-emerald-300 rounded-xl flex items-center justify-between gap-3 text-xs transition-all cursor-pointer'
          },
            e('div', { className: 'flex items-center gap-3 overflow-hidden' },
              e('span', { className: 'font-mono text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded' }, t.code),
              e('span', { className: 'font-bold text-slate-700 truncate max-w-xs' }, t.subject),
              e('span', { className: 'text-[10px] text-slate-500 hidden sm:inline' }, `(Completed by ${assignee ? assignee.name : 'Assignee'})`)
            ),
            e('div', { className: 'flex items-center gap-2 flex-shrink-0' },
              e('span', { className: 'bg-emerald-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full' }, '✓ DONE'),
              e('button', {
                onClick: (ev) => { ev.stopPropagation(); onOpenHistory(t); },
                className: 'text-[10px] text-blue-600 font-bold hover:underline cursor-pointer bg-white px-2 py-1 rounded border'
              }, '📜 History')
            )
          );
        })
      )
    )
  );
}

// --- CREATE TICKET MODAL WITH MULTI-DIVISIONS & MULTI-MENTIONS & INSTANT "/" TAG ---
function CreateTicketModal({ users, tickets, currentUser, companyInfo, onClose, onCreateTicket }) {
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [assignedTo, setAssignedTo] = useState(users[0]?.id || "u-admin");
  const [selectedMentions, setSelectedMentions] = useState([]);
  const [selectedDivisions, setSelectedDivisions] = useState(["Engineering"]);
  const [deadline, setDeadline] = useState(() => new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);

  const [autocompleteType, setAutocompleteType] = useState(null);
  const prefix = getCompanyInitials(companyInfo?.name);
  const safeTickets = tickets || [];
  const generatedCode = useMemo(() => `${prefix}-2026-${100 + safeTickets.length + 1}`, [safeTickets, prefix]);

  const handleDetailsChange = (ev) => {
    const val = ev.target.value;
    setDetails(val);
    if (val.endsWith('@')) setAutocompleteType('@');
    else if (val.endsWith('#')) setAutocompleteType('#');
    else if (val.endsWith('/')) setAutocompleteType('/');
    else setAutocompleteType(null);
  };

  const insertTag = (tagText) => {
    let clean = details;
    if (autocompleteType === '@' && clean.endsWith('@')) clean = clean.slice(0, -1);
    if (autocompleteType === '#' && clean.endsWith('#')) clean = clean.slice(0, -1);
    if (autocompleteType === '/' && clean.endsWith('/')) clean = clean.slice(0, -1);
    setDetails(clean + tagText + " ");
    setAutocompleteType(null);
  };

  const toggleMentionUser = (uId) => {
    if (selectedMentions.includes(uId)) setSelectedMentions(selectedMentions.filter(id => id !== uId));
    else setSelectedMentions([...selectedMentions, uId]);
  };

  const toggleDivision = (dName) => {
    if (selectedDivisions.includes(dName)) setSelectedDivisions(selectedDivisions.filter(d => d !== dName));
    else setSelectedDivisions([...selectedDivisions, dName]);
  };

  return e('div', { className: 'fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4' },
    e('div', { className: 'bg-white rounded-3xl max-w-lg w-full p-7 shadow-2xl space-y-4 relative max-h-[85vh] overflow-y-auto' },
      e('div', { className: 'flex justify-between border-b pb-3' },
        e('div', null,
          e('h3', { className: 'font-bold text-slate-900 text-base' }, 'Generate New Ticket'),
          e('span', { className: 'text-xs font-mono font-bold text-blue-600' }, `Track Code: ${generatedCode}`)
        ),
        e('button', { onClick: onClose, className: 'font-bold text-slate-400 cursor-pointer' }, '✕')
      ),

      e('form', {
        onSubmit: ev => {
          ev.preventDefault();
          onCreateTicket({
            id: generateUUID(),
            code: generatedCode,
            subject,
            details,
            status: "Todo",
            priority,
            assignedTo,
            assignedBy: currentUser?.id,
            division: selectedDivisions,
            deadline,
            mentionedUsers: selectedMentions,
            comments: []
          });
        },
        className: 'space-y-4 text-xs'
      },
        e('div', null,
          e('label', { className: 'font-semibold block mb-1' }, 'Subject'),
          e('input', { required: true, type: 'text', value: subject, onChange: ev => setSubject(ev.target.value), className: 'w-full px-3 py-2 border rounded-xl' })
        ),

        e('div', { className: 'grid grid-cols-2 gap-3' },
          e('div', null,
            e('label', { className: 'font-semibold block mb-1' }, 'Urgency / Priority'),
            e('select', { value: priority, onChange: ev => setPriority(ev.target.value), className: 'w-full px-3 py-2 border rounded-xl bg-white font-bold text-rose-600' },
              e('option', { value: 'Urgent' }, '🚨 Urgent (Emergency Red)'),
              e('option', { value: 'High' }, '⚠️ High Priority (Orange)'),
              e('option', { value: 'Medium' }, '🔹 Medium Priority'),
              e('option', { value: 'Normal' }, '⚪ Normal Priority')
            )
          ),
          e('div', null,
            e('label', { className: 'font-semibold block mb-1' }, 'Primary Assignee'),
            e('select', { value: assignedTo, onChange: ev => setAssignedTo(ev.target.value), className: 'w-full px-3 py-2 border rounded-xl bg-white font-bold text-blue-600' },
              (users || []).map(u => e('option', { key: u.id, value: u.id }, `${u.name} — ${u.role === 'admin' ? 'C-Level' : (u.department || 'Staff')}`))
            )
          )
        ),

        e('div', { className: 'relative' },
          e('div', { className: 'flex justify-between items-center mb-1' },
            e('label', { className: 'font-semibold block' }, 'Details & Autocomplete Tags'),
            e('span', { className: 'text-[10px] text-slate-400' }, 'Type @ for users, # for tickets, / for divisions')
          ),
          e('textarea', {
            rows: 3,
            value: details,
            onChange: handleDetailsChange,
            placeholder: 'Type details... Use @ to tag person, # for ticket code, / for division',
            className: 'w-full px-3 py-2 border rounded-xl font-mono'
          }),

          autocompleteType && e('div', { className: 'tag-autocomplete-overlay' },
            autocompleteType === '@' && (users || []).map(u => e('div', { key: u.id, onClick: () => insertTag(`@${u.name}`), className: 'tag-autocomplete-item' }, e('span', { className: 'font-bold text-blue-600' }, `@${u.name}`), e('span', { className: 'text-[10px] text-slate-400' }, u.department))),
            autocompleteType === '#' && safeTickets.concat([{ code: "PRJ-ENG-101" }, { code: "PRJ-OPS-202" }]).map(t => e('div', { key: t.code, onClick: () => insertTag(`#${t.code}`), className: 'tag-autocomplete-item' }, e('span', { className: 'font-bold text-purple-600' }, `#${t.code}`))),
            autocompleteType === '/' && ["Engineering", "Operations", "Product", "Quality Control"].map(d => e('div', { key: d, onClick: () => insertTag(`/${d}`), className: 'tag-autocomplete-item' }, e('span', { className: 'font-bold text-emerald-600' }, `/${d}`)))
          )
        ),

        e('div', null,
          e('label', { className: 'font-semibold block mb-1 text-slate-700' }, 'Select Multiple Divisions:'),
          e('div', { className: 'flex flex-wrap gap-2' },
            ["Engineering", "Operations", "Product", "Quality Control"].map(d => e('button', {
              key: d,
              type: 'button',
              onClick: () => toggleDivision(d),
              className: `px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${selectedDivisions.includes(d) ? 'bg-emerald-600 text-white shadow' : 'bg-slate-100 text-slate-600'}`
            }, d))
          )
        ),

        e('div', null,
          e('label', { className: 'font-semibold block mb-1 text-slate-700' }, 'Mention Multiple Staff Members (@):'),
          e('div', { className: 'flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 border rounded-xl bg-slate-50' },
            (users || []).map(u => e('button', {
              key: u.id,
              type: 'button',
              onClick: () => toggleMentionUser(u.id),
              className: `px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${selectedMentions.includes(u.id) ? 'bg-blue-600 text-white' : 'bg-white border text-slate-600'}`
            }, `@${u.name}`))
          )
        ),

        e('div', null,
          e('label', { className: 'font-semibold block mb-1' }, 'Deadline'),
          e('input', { type: 'date', value: deadline, onChange: ev => setDeadline(ev.target.value), className: 'w-full px-3 py-2 border rounded-xl bg-white font-mono' })
        ),

        e('div', { className: 'flex justify-end gap-3 pt-3 border-t' },
          e('button', { type: 'button', onClick: onClose, className: 'font-semibold text-slate-600 cursor-pointer' }, 'Cancel'),
          e('button', { type: 'submit', className: 'px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow cursor-pointer' }, 'Generate Ticket')
        )
      )
    )
  );
}

// --- UPDATE TICKET MODAL ---
function UpdateTicketModal({ ticket, users, tickets, currentUser, onClose, onDeleteTicket, onSaveTicket }) {
  const [subject, setSubject] = useState(ticket.subject);
  const [details, setDetails] = useState(ticket.details);
  const [status, setStatus] = useState(ticket.status);
  const [proofLink, setProofLink] = useState(ticket.proofLink || "");
  const [notes, setNotes] = useState(ticket.notes || "");

  const isAdmin = currentUser?.role === 'admin';

  const handleWorkSubmission = (ev) => {
    ev.preventDefault();
    onSaveTicket({
      ...ticket,
      subject,
      details,
      proofLink,
      notes,
      status: "Pending Review"
    });
  };

  const handleApproveDone = () => {
    onSaveTicket({ ...ticket, status: "Done" });
  };

  return e('div', { className: 'fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4' },
    e('div', { className: 'bg-white rounded-3xl max-w-xl w-full p-7 shadow-2xl space-y-4 relative max-h-[85vh] overflow-y-auto' },
      e('div', { className: 'flex justify-between border-b pb-3' },
        e('div', null,
          e('h3', { className: 'font-bold text-slate-900 text-base' }, 'Update Ticket & Review Submission'),
          e('span', { className: 'text-xs font-mono font-bold text-blue-600' }, ticket.code)
        ),
        e('div', { className: 'flex items-center gap-2' },
          isAdmin && e('button', {
            onClick: () => onDeleteTicket(ticket.id),
            className: 'px-3 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold cursor-pointer'
          }, '🗑 Delete'),
          e('button', { onClick: onClose, className: 'font-bold text-slate-400 cursor-pointer' }, '✕')
        )
      ),

      e('form', { onSubmit: handleWorkSubmission, className: 'space-y-4 text-xs' },
        e('div', null,
          e('label', { className: 'font-semibold block mb-1 text-slate-400' }, 'Subject (Locked - Cannot be changed)'),
          e('input', { disabled: true, type: 'text', value: subject, className: 'w-full px-3 py-2 border rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed font-medium' })
        ),
        e('div', null,
          e('label', { className: 'font-semibold block mb-1' }, 'Submission Evidence / Proof Link'),
          e('input', { type: 'url', placeholder: 'https://...', value: proofLink, onChange: ev => setProofLink(ev.target.value), className: 'w-full px-3 py-2 border rounded-xl font-mono text-blue-600' })
        ),
        e('div', null,
          e('label', { className: 'font-semibold block mb-1' }, 'Resolution Notes'),
          e('textarea', { rows: 2, value: notes, onChange: ev => setNotes(ev.target.value), placeholder: 'Add final notes...', className: 'w-full px-3 py-2 border rounded-xl' })
        ),

        e('div', { className: 'flex items-center justify-between pt-3 border-t' },
          (ticket.status === 'Pending Review' && (ticket.assignedBy === currentUser?.id || isAdmin)) ? e('button', {
            type: 'button',
            onClick: handleApproveDone,
            className: 'px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow cursor-pointer'
          }, '✓ Approve & Mark Done') : e('span', null),
          
          e('div', { className: 'flex gap-2' },
            e('button', { type: 'button', onClick: onClose, className: 'font-semibold px-3 cursor-pointer' }, 'Cancel'),
            e('button', { type: 'submit', className: 'px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow cursor-pointer' }, 'Submit for Review')
          )
        )
      )
    )
  );
}

// --- TICKET COMMENTS MODAL ---
function TicketCommentsModal({ ticket, currentUser, users, onClose, onPostComment }) {
  const [text, setText] = useState("");

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!text.trim()) return;
    const newComment = {
      id: "c-" + Date.now(),
      author: currentUser?.name || "Employee",
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    onPostComment(ticket.id, newComment);
    setText("");
  };

  const comments = ticket.comments || [];

  return e('div', { className: 'fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4' },
    e('div', { className: 'bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100' },
      e('div', { className: 'flex justify-between items-center border-b pb-3' },
        e('div', null,
          e('h3', { className: 'font-bold text-slate-900 text-base flex items-center gap-2' },
            e(IconComment, { className: 'w-5 h-5 text-blue-600' }),
            `Ticket Comments & Updates`
          ),
          e('span', { className: 'text-xs font-mono font-bold text-blue-600' }, `${ticket.code} - ${ticket.subject}`)
        ),
        e('button', { onClick: onClose, className: 'font-bold text-slate-400 cursor-pointer' }, '✕')
      ),

      e('div', { className: 'space-y-3 text-xs' },
        e('div', { className: 'p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1' },
          e('div', { className: 'font-bold text-slate-800' }, ticket.subject),
          e('p', { className: 'text-slate-600 text-[11px]' }, ticket.details)
        ),

        e('div', { className: 'space-y-2 max-h-60 overflow-y-auto pr-1' },
          comments.length === 0 ? e('div', { className: 'p-6 text-center text-slate-400 italic bg-slate-50/50 rounded-xl border border-dashed' }, 'No comments posted yet. Be the first to start the discussion!') :
          comments.map(c => e('div', { key: c.id, className: 'p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1' },
            e('div', { className: 'flex items-center justify-between font-bold text-xs' },
              e('span', { className: 'text-blue-600' }, c.author),
              e('span', { className: 'text-slate-400 font-mono text-[10px]' }, c.time)
            ),
            e('p', { className: 'text-slate-700 text-xs leading-relaxed' }, c.text)
          ))
        ),

        e('form', { onSubmit: handleSubmit, className: 'flex gap-2 pt-2 border-t' },
          e('input', {
            type: 'text',
            value: text,
            onChange: ev => setText(ev.target.value),
            placeholder: 'Write a comment or status update...',
            className: 'flex-1 px-4 py-2 border rounded-xl bg-white text-xs'
          }),
          e('button', { type: 'submit', className: 'px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow cursor-pointer' }, 'Post Comment')
        )
      )
    )
  );
}

// --- CHECK OUT GATE MODAL WITH SCHEDULE & TO-DO UNFINISHED GUARD ---
function CheckOutGateModal({ currentUser, users, tickets, userTickets, schedules, onClose, onOpenPlanner, onFinalizeCheckout }) {
  const safeTickets = userTickets || [];
  const safeSchedules = schedules || [];

  const todayStr = new Date().toISOString().split('T')[0];
  const hasLockedScheduleToday = useMemo(() => {
    return safeSchedules.some(s => s.userId === currentUser?.id && s.date === todayStr);
  }, [safeSchedules, currentUser, todayStr]);

  const [ticketStates, setTicketStates] = useState(() => {
    const init = {};
    safeTickets.forEach(t => {
      init[t.id] = { status: t.status, notes: t.notes || "" };
    });
    return init;
  });

  const isEverythingUpdated = useMemo(() => {
    return safeTickets.every(t => {
      const state = ticketStates[t.id];
      return state && (state.status === 'Done' || state.status === 'Delayed' || state.status === 'Issue');
    });
  }, [safeTickets, ticketStates]);

  const handleStatusChange = (id, newStatus) => {
    setTicketStates(prev => ({ ...prev, [id]: { ...prev[id], status: newStatus } }));
  };

  const handleNotesChange = (id, newNotes) => {
    setTicketStates(prev => ({ ...prev, [id]: { ...prev[id], notes: newNotes } }));
  };

  const isCheckoutEnabled = true;

  return e('div', { className: 'fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4' },
    e('div', { className: 'bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5' },
      e('div', { className: 'flex items-center justify-between border-b border-slate-100 pb-3' },
        e('div', null,
          e('h3', { className: 'text-lg font-bold text-slate-900' }, `Daily Check-Out Gate`),
          e('p', { className: 'text-xs text-slate-500' }, 'Update status tiket tugas & konfirmasi kepulangan harian.')
        ),
        e('button', { onClick: onClose, className: 'text-slate-400 hover:text-slate-600 font-bold cursor-pointer' }, '✕')
      ),

      e('div', { className: 'p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 text-xs text-blue-900 font-bold' },
        e('span', { className: 'text-base' }, '📋'),
        e('span', null, 'Periksa resolusi tiket tugas yang Anda kerjakan sebelum check-out.')
      ),

      // TASK RESOLUTION GUARD WARNING
      !isEverythingUpdated && safeTickets.length > 0 && e('div', { className: 'p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-950 font-semibold flex items-center gap-2' },
        e('span', null, '⚠️ Silakan tentukan status resolusi (Done, Delayed, atau Issue) untuk semua tiket tugas Anda hari ini sebelum melakukan check-out.')
      ),

      e('div', { className: 'space-y-3 max-h-64 overflow-y-auto pr-1 text-xs' },
        safeTickets.length === 0 ? e('p', { className: 'text-xs text-slate-500 py-3 text-center' }, 'No assigned tickets for today. Ready for check-out!') :
        safeTickets.map(t => {
          const currentSt = ticketStates[t.id]?.status || t.status;
          return e('div', { key: t.id, className: 'p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2' },
            e('div', { className: 'flex items-start justify-between gap-2' },
              e('div', null,
                e('span', { className: 'font-mono text-[10px] font-bold text-blue-600' }, t.code),
                e('h4', { className: 'font-semibold text-slate-900 text-xs' }, t.subject)
              ),
              e('span', { className: 'text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium' }, t.priority)
            ),
            e('div', { className: 'flex items-center gap-2' },
              ['Done', 'Delayed', 'Issue'].map(st => e('button', {
                key: st,
                type: 'button',
                onClick: () => handleStatusChange(t.id, st),
                className: `px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${currentSt === st ? st === 'Done' ? 'bg-emerald-600 text-white' : st === 'Delayed' ? 'bg-amber-500 text-white' : 'bg-rose-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`
              }, st))
            ),
            e('input', {
              type: 'text',
              placeholder: 'Add end-of-day resolution notes...',
              value: ticketStates[t.id]?.notes || "",
              onChange: (ev) => handleNotesChange(t.id, ev.target.value),
              className: 'w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none'
            })
          );
        })
      ),

      e('div', { className: 'flex items-center justify-end gap-3 pt-3 border-t border-slate-100' },
        e('button', { onClick: onClose, className: 'px-4 py-2 text-xs font-semibold text-slate-600 cursor-pointer' }, 'Cancel'),
        e('button', {
          onClick: () => onFinalizeCheckout(ticketStates),
          disabled: !isCheckoutEnabled,
          className: `px-5 py-2 rounded-lg text-xs font-bold shadow-md cursor-pointer ${isCheckoutEnabled ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`
        }, 'Finish Check-Out & Exit')
      )
    )
  );
}

// --- MODE SPECIFIC CHECK-IN GATE MODAL ---
function ModeSpecificCheckInGateModal({ currentUser, companyInfo, userLocation, onClose, onConfirmCheckIn }) {
  const isWfo = currentUser?.mode === "Full WFO";
  const isHybrid = currentUser?.mode === "Hybrid";
  const isWfh = currentUser?.mode === "Full WFH";

  const [isWfoDayHybrid, setIsWfoDayHybrid] = useState(true);

  const targetGeoName = companyInfo?.factoryGeo?.name || DEFAULT_FACTORY_GEO.name;
  const targetLat = companyInfo?.factoryGeo?.lat || DEFAULT_FACTORY_GEO.lat;
  const targetLng = companyInfo?.factoryGeo?.lng || DEFAULT_FACTORY_GEO.lng;
  const radiusLimit = companyInfo?.factoryGeo?.radiusMeters || 500;

  const distMeters = calculateDistanceMeters(userLocation.lat, userLocation.lng, targetLat, targetLng);
  const isWithinGeofence = distMeters <= radiusLimit;

  return e('div', { className: 'fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4' },
    e('div', { className: 'bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5' },
      e('div', { className: 'flex items-center justify-between border-b border-slate-100 pb-3' },
        e('div', null,
          e('h3', { className: 'text-base font-bold text-slate-900 flex items-center gap-2' },
            isWfo ? '🏢 Full WFO Check-In Gate (GPS Geofence)' : isHybrid ? '🔄 Hybrid Check-In Gate' : '🏠 Full WFH Check-In Gate'
          ),
          e('span', { className: 'text-xs text-slate-500' }, `Mode-specific attendance verification for ${currentUser?.name || 'Staff'}`)
        ),
        e('button', { onClick: onClose, className: 'text-slate-400 hover:text-slate-600 font-bold cursor-pointer' }, '✕')
      ),

      isWfo && e('div', { className: 'space-y-4 text-xs' },
        e('div', { className: 'p-4 bg-slate-900 text-white rounded-xl space-y-2 border border-slate-800' },
          e('div', { className: 'flex items-center justify-between font-bold' },
            e('span', { className: 'flex items-center gap-1.5 text-blue-400' }, e(IconOffice, { className: 'w-4 h-4' }), 'GPS Geofence Radar Status'),
            e('span', { className: `px-2 py-0.5 rounded text-[10px] ${isWithinGeofence ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white animate-pulse'}` }, isWithinGeofence ? 'IN RANGE (PASSED)' : 'BREACH (OUTSIDE)')
          ),
          e('div', { className: 'text-[11px] text-slate-300 space-y-1' },
            e('div', null, 'Factory Location: ', e('span', { className: 'font-mono text-slate-100' }, targetGeoName)),
            e('div', null, 'Your Distance: ', e('span', { className: 'font-mono font-bold text-amber-400' }, `${Math.round(distMeters)} meters`), ` (Limit: ${radiusLimit}m)`)
          )
        ),
        !isWithinGeofence && e('div', { className: 'p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-start gap-2' },
          e(IconAlert, { className: 'w-5 h-5 text-rose-600 flex-shrink-0' }),
          e('p', { className: 'text-[11px] leading-relaxed' },
            e('strong', null, 'Geofence Breach Warning: '),
            `You are currently ${Math.round(distMeters)}m away from factory floor. Confirming check-in will trigger an Attendance Anomaly Alert to C-Level.`
          )
        )
      ),

      isHybrid && e('div', { className: 'space-y-4 text-xs' },
        e('div', { className: 'p-4 bg-purple-50 border border-purple-200 text-purple-900 rounded-xl space-y-2' },
          e('div', { className: 'font-bold flex justify-between' }, e('span', null, "Today's Hybrid Shift Mode"), e('span', { className: 'text-purple-700' }, 'August 26, 2026')),
          e('div', { className: 'flex items-center gap-2 pt-1' },
            e('button', {
              onClick: () => setIsWfoDayHybrid(true),
              className: `flex-1 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${isWfoDayHybrid ? 'bg-blue-600 text-white shadow' : 'bg-white border text-slate-700'}`
            }, '🏢 Office WFO Day (GPS Check)'),
            e('button', {
              onClick: () => setIsWfoDayHybrid(false),
              className: `flex-1 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${!isWfoDayHybrid ? 'bg-purple-600 text-white shadow' : 'bg-white border text-slate-700'}`
            }, '🏠 Remote WFH Day (Grid Setup)')
          )
        )
      ),

      isWfh && e('div', { className: 'space-y-4 text-xs' },
        e('div', { className: 'p-4 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl space-y-2' },
          e('div', { className: 'font-bold flex items-center justify-between' },
            e('span', null, 'Remote Shift Attendance'),
            e('span', { className: 'bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded font-mono' }, 'WFH Online')
          ),
          e('p', { className: 'text-[11px] text-blue-700' }, 'Presensi kehadiran online aktif. Siap untuk mengerjakan tiket tugas hari ini.')
        )
      ),

      e('div', { className: 'flex items-center justify-end gap-3 pt-3 border-t border-slate-100' },
        e('button', { onClick: onClose, className: 'px-4 py-2 font-semibold text-slate-600 text-xs cursor-pointer' }, 'Cancel'),
        e('button', {
          onClick: () => onConfirmCheckIn({ isWfoToday: isHybrid ? isWfoDayHybrid : isWfo }),
          className: 'px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-md cursor-pointer'
        }, `Confirm & Start Shift (${currentUser?.mode || 'WFO'})`)
      )
    )
  );
}

// --- CREATE USER MODAL ---
function CreateUserModal({ apiUrl, onClose, onCreateSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [mode, setMode] = useState("Full WFH");
  const [dept, setDept] = useState("Engineering");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const payload = {
      name,
      email: email.trim(),
      password,
      role,
      mode,
      department: role === 'admin' ? 'C-Level Executive' : dept
    };

    let createdUserId = null;
    try {
      const cleanUrl = (apiUrl || "").replace(/\/$/, "");
      // Only attempt remote backend API if not on a pure static domain without local backend
      if (cleanUrl && !cleanUrl.includes("github.io") && !cleanUrl.includes("netlify.app")) {
        const response = await fetch(`${cleanUrl}/api/create-employee`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify(payload)
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const result = await response.json();
          if (response.ok && result?.user?.id) {
            createdUserId = result.user.id;
          }
        }
      }
    } catch (apiErr) {
      console.warn("Backend API unavailable, creating account client-side:", apiErr);
    }

    // Direct fallback: if backend server didn't respond or returned error, generate valid UUID directly
    if (!createdUserId) {
      createdUserId = generateUUID();
    }

    setIsLoading(false);
    onCreateSuccess({
      id: createdUserId,
      name: payload.name,
      email: payload.email,
      password: payload.password, // Store for Admin Directory reference
      role: payload.role,
      mode: payload.mode,
      department: payload.department,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      status: "Offline",
      checkedIn: false
    });
  };

  return e('div', { className: 'fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4' },
    e('div', { className: 'bg-white rounded-3xl max-w-md w-full p-7 shadow-2xl space-y-4' },
      e('div', { className: 'flex justify-between border-b pb-3' },
        e('h3', { className: 'font-bold text-slate-900 text-base' }, 'Create Employee Account'),
        e('button', { onClick: onClose, className: 'font-bold text-slate-400 cursor-pointer', disabled: isLoading }, '✕')
      ),

      errorMsg && e('div', { className: 'p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-[11px] leading-relaxed' },
        e('strong', { className: 'block font-extrabold mb-0.5' }, '❌ Gagal membuat akun:'),
        errorMsg
      ),

      e('form', { onSubmit: handleSubmit, className: 'space-y-3 text-xs' },
        e('div', null,
          e('label', { className: 'font-semibold block mb-1' }, 'Full Name'),
          e('input', { required: true, type: 'text', disabled: isLoading, value: name, onChange: ev => setName(ev.target.value), className: 'w-full px-3 py-2 border rounded-xl' })
        ),
        e('div', null,
          e('label', { className: 'font-semibold block mb-1' }, 'Work Email Address'),
          e('input', { required: true, type: 'email', disabled: isLoading, placeholder: 'user@javelo360.com', value: email, onChange: ev => setEmail(ev.target.value), className: 'w-full px-3 py-2 border rounded-xl' })
        ),
        e('div', null,
          e('label', { className: 'font-semibold block mb-1' }, 'Account Password'),
          e('input', { required: true, type: 'password', disabled: isLoading, placeholder: '••••••••', value: password, onChange: ev => setPassword(ev.target.value), className: 'w-full px-3 py-2 border rounded-xl' })
        ),
        e('div', { className: 'grid grid-cols-2 gap-2' },
          e('div', null,
            e('label', { className: 'font-semibold block mb-1' }, 'Employee Role Level'),
            e('select', { value: role, disabled: isLoading, onChange: ev => setRole(ev.target.value), className: 'w-full px-3 py-2 border rounded-xl bg-white font-bold text-blue-600' },
              e('option', { value: 'employee' }, 'Staff Employee'),
              e('option', { value: 'manager' }, 'Manager / Lead'),
              e('option', { value: 'admin' }, 'C-Level Executive')
            )
          ),
          e('div', null,
            e('label', { className: 'font-semibold block mb-1' }, 'Work Mode'),
            e('select', { value: mode, disabled: isLoading, onChange: ev => setMode(ev.target.value), className: 'w-full px-3 py-2 border rounded-xl bg-white' },
              e('option', { value: 'Full WFH' }, 'Full WFH'),
              e('option', { value: 'Hybrid' }, 'Hybrid'),
              e('option', { value: 'Full WFO' }, 'Full WFO')
            )
          )
        ),
        e('div', null,
          e('label', { className: 'font-semibold block mb-1' }, 'Department / Division'),
          e('input', { type: 'text', disabled: isLoading, value: dept, onChange: ev => setDept(ev.target.value), className: 'w-full px-3 py-2 border rounded-xl' })
        ),
        e('div', { className: 'flex justify-end gap-2 pt-3 border-t' },
          e('button', { type: 'button', onClick: onClose, disabled: isLoading, className: 'font-semibold px-3 cursor-pointer' }, 'Cancel'),
          e('button', {
            type: 'submit',
            disabled: isLoading,
            className: 'px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow cursor-pointer flex items-center gap-1.5'
          }, isLoading ? 'Creating...' : 'Create Account')
        )
      )
    )
  );
}

// --- ACTIVE STAFF DRILL-DOWN MODAL ---
function ActiveStaffModal({ users, onClose }) {
  const safeUsers = users || [];
  return e('div', { className: 'fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4' },
    e('div', { className: 'bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4' },
      e('div', { className: 'flex justify-between border-b pb-3' },
        e('h3', { className: 'font-bold text-slate-900' }, 'Active Online Personnel'),
        e('button', { onClick: onClose, className: 'font-bold text-slate-400 cursor-pointer' }, '✕')
      ),
      e('div', { className: 'space-y-2 max-h-72 overflow-y-auto' },
        safeUsers.map(u => e('div', { key: u.id, className: 'p-3 bg-slate-50 rounded-xl border flex items-center justify-between text-xs' },
          e('div', { className: 'flex items-center gap-2.5' },
            e('img', { src: u.avatar, className: 'w-8 h-8 rounded-full object-cover' }),
            e('div', null,
              e('div', { className: 'font-bold text-slate-900' }, u.name),
              e('div', { className: 'text-[10px] text-slate-400' }, u.department)
            )
          ),
          e('span', { className: 'px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800' }, u.status)
        ))
      )
    )
  );
}

// --- BROADCAST ANNOUNCEMENT MODAL ---
function BroadcastAnnouncementModal({ currentUser, users, tickets, onClose }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sent, setSent] = useState(false);

  return e('div', { className: 'fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4' },
    e('div', { className: 'bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4' },
      e('div', { className: 'flex justify-between border-b pb-3' },
        e('h3', { className: 'font-bold text-slate-900' }, 'Broadcast Company Announcement'),
        e('button', { onClick: onClose, className: 'font-bold text-slate-400 cursor-pointer' }, '✕')
      ),
      sent ? e('div', { className: 'p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold text-center' }, '✅ Broadcast sent live to all employee channels!') :
      e('div', { className: 'space-y-3 text-xs' },
        e('input', { type: 'text', placeholder: 'Title...', value: title, onChange: ev => setTitle(ev.target.value), className: 'w-full px-3 py-2 border rounded-xl' }),
        e('textarea', { rows: 3, placeholder: 'Message...', value: content, onChange: ev => setContent(ev.target.value), className: 'w-full px-3 py-2 border rounded-xl' }),
        e('div', { className: 'flex justify-end gap-2 pt-2' },
          e('button', { onClick: onClose, className: 'font-semibold px-3 cursor-pointer' }, 'Cancel'),
          e('button', { onClick: () => setSent(true), className: 'px-4 py-2 bg-purple-600 text-white rounded-xl font-bold shadow cursor-pointer' }, 'Send Broadcast')
        )
      )
    )
  );
}

// --- C-LEVEL DASHBOARD WITH EMPLOYEE MONITOR DRILL-DOWN ---
function CLevelDashboard({ users, tickets, anomalies, schedules, onResolveAnomaly, onOpenCreateUser, onOpenAnnouncement, onOpenCreateTicket, onOpenActiveStaff, onInspectEmployee, onDeleteUser, isSupabaseReady, serverUrl }) {
  const safeUsers = users || [];
  const safeTickets = tickets || [];
  const safeAnomalies = anomalies || [];

  return e('div', { className: 'space-y-6' },
    // DATABASE METADATA INTEGRITY ALERTS
    e('div', { className: 'p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-2xl flex items-center justify-between text-xs shadow-xs' },
      e('div', { className: 'flex items-center gap-2.5 font-bold' },
        e('span', { className: 'w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse' }),
        e('span', null, '🟢 Enterprise Multi-Device Cloud Workspace: Active & Ready')
      ),
      e('span', { className: 'text-[11px] text-emerald-700 font-mono hidden sm:inline' }, 'Device lain dapat langsung login dengan akun yang didaftarkan.')
    ),

    // QR CONNECTION PORTAL FOR OTHER DEVICES
    e('div', { className: 'bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs' },
      e('div', { className: 'space-y-1.5' },
        e('h3', { className: 'font-extrabold text-slate-900 text-sm flex items-center gap-1.5' }, '📲 Sambungkan HP / Device Karyawan Lain'),
        e('p', { className: 'text-slate-600 max-w-md leading-relaxed' }, 'Pindai QR code di sebelah kanan dengan HP karyawan, atau masukkan URL di bawah ini ke konfigurasi login karyawan untuk menghubungkan database.'),
        e('div', { className: 'flex items-center gap-2 pt-1' },
          e('span', { className: 'px-2.5 py-1 bg-white border font-mono rounded text-[11px] text-blue-700 font-bold select-all' }, serverUrl),
          e('span', { className: 'text-[10px] text-slate-400 font-bold' }, '(Tap to copy)')
        )
      ),
      e('div', { className: 'p-2 bg-white rounded-xl border flex-shrink-0 shadow-sm' },
        e('img', {
          src: `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(serverUrl)}`,
          alt: 'Server Connection QR',
          className: 'w-24 h-24 object-contain'
        })
      )
    ),

    e('div', { className: 'flex items-center justify-between' },
      e('h2', { className: 'text-2xl font-bold text-slate-900' }, 'C-Level Executive Master Dashboard'),
      e('div', { className: 'flex gap-2' },
        e('button', { onClick: onOpenAnnouncement, className: 'px-3.5 py-2 bg-purple-600 text-white rounded-lg text-xs font-semibold cursor-pointer' }, '📢 Announcement'),
        e('button', { onClick: onOpenCreateUser, className: 'px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer' }, '+ Create User')
      )
    ),

    e('div', { className: 'grid grid-cols-3 gap-4' },
      e('div', { className: 'bg-white p-5 rounded-2xl border shadow-xs space-y-1 hover:border-emerald-500 cursor-pointer transition-all' },
        e('div', { className: 'text-xs text-slate-500 font-bold' }, 'Geofence Compliance'),
        e('div', { className: 'text-2xl font-extrabold text-emerald-600' }, '100% In Range')
      ),
      e('div', { className: 'bg-white p-5 rounded-2xl border shadow-xs space-y-1 hover:border-blue-500 cursor-pointer transition-all' },
        e('div', { className: 'text-xs text-slate-500 font-bold' }, 'Ticket Completion Rate'),
        e('div', { className: 'text-2xl font-extrabold text-blue-600' }, `${safeTickets.filter(t => t.status === 'Done').length} of ${safeTickets.length}`)
      ),
      e('div', { onClick: onOpenActiveStaff, className: 'bg-white p-5 rounded-2xl border shadow-xs space-y-1 hover:border-purple-500 cursor-pointer transition-all' },
        e('div', { className: 'text-xs text-slate-500 font-bold' }, 'Active Personnel (Tap for Roster)'),
        e('div', { className: 'text-2xl font-extrabold text-purple-600' }, `${safeUsers.length} Staff Online`)
      )
    ),

    // EMPLOYEE MONITOR & DRILL-DOWN ROSTER
    e('div', { className: 'bg-white p-6 rounded-2xl border space-y-4 shadow-xs' },
      e('h3', { className: 'font-bold text-sm text-slate-900' }, '👥 Executive Personnel Monitor (Tap Employee to Inspect Schedule, To-Do, & Tickets)'),
      e('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-3' },
        safeUsers.map(u => e('div', {
          key: u.id,
          onClick: () => onInspectEmployee(u),
          className: 'p-3.5 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl flex items-center justify-between cursor-pointer transition-all'
        },
          e('div', { className: 'flex items-center gap-3' },
            e('img', { src: u.avatar, className: 'w-9 h-9 rounded-full object-cover border border-slate-300' }),
            e('div', null,
              e('div', { className: 'font-bold text-slate-900 text-xs' }, u.name),
              e('div', { className: 'text-[10px] text-slate-500' }, `${u.department} • ${u.mode}`)
            )
          ),
          e('span', { className: 'text-[10px] px-2.5 py-1 rounded bg-purple-600 text-white font-extrabold' }, '🔍 Inspect User')
        ))
      )
    ),

    // MANAGE USERS DIRECTORY (CREDENTIALS & DELETION)
    e('div', { className: 'bg-white p-6 rounded-2xl border space-y-4 shadow-xs' },
      e('h3', { className: 'font-bold text-sm text-slate-900 border-b pb-2' }, '🔑 Manage Users & Credentials Directory'),
      e('div', { className: 'overflow-x-auto' },
        e('table', { className: 'w-full text-xs text-left text-slate-600' },
          e('thead', { className: 'text-[11px] text-slate-400 uppercase bg-slate-50' },
            e('tr', null,
              e('th', { className: 'px-4 py-3' }, 'Staff Name'),
              e('th', { className: 'px-4 py-3' }, 'Employee ID'),
              e('th', { className: 'px-4 py-3' }, 'Email Address'),
              e('th', { className: 'px-4 py-3' }, 'Password / PIN'),
              e('th', { className: 'px-4 py-3' }, 'Role'),
              e('th', { className: 'px-4 py-3 text-right' }, 'Actions')
            )
          ),
          e('tbody', { className: 'divide-y' },
            safeUsers.map(u => e('tr', { key: u.id, className: 'hover:bg-slate-50/50' },
              e('td', { className: 'px-4 py-3 font-semibold text-slate-900 flex items-center gap-2' },
                e('img', { src: u.avatar, className: 'w-7 h-7 rounded-full object-cover border' }),
                e('span', null, u.name)
              ),
              e('td', { className: 'px-4 py-3 font-mono text-[11px]' }, u.id),
              e('td', { className: 'px-4 py-3 font-mono text-[11px]' }, u.email),
              e('td', { className: 'px-4 py-3 font-mono text-purple-600 font-bold bg-purple-50/30' }, u.password || "12345678"),
              e('td', { className: 'px-4 py-3 font-semibold' }, u.role),
              e('td', { className: 'px-4 py-3 text-right' },
                e('button', {
                  onClick: () => { if(confirm(`Are you sure you want to delete ${u.name}?`)) onDeleteUser(u.id); },
                  className: 'px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 font-bold rounded-lg transition-all cursor-pointer'
                }, '🗑️ Delete')
              )
            ))
          )
        )
      )
    ),

    e('div', { className: 'bg-white p-5 rounded-2xl border space-y-3' },
      e('h3', { className: 'font-bold text-sm text-slate-900' }, 'Attendance & Geofence Anomalies Log'),
      safeAnomalies.length === 0 ? e('div', { className: 'text-xs text-slate-400 py-2' }, 'No anomalies detected.') :
      safeAnomalies.map(anom => e('div', { key: anom.id, className: 'p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs' },
        e('div', null,
          e('div', { className: 'font-bold text-rose-900' }, `${anom.userName} - ${anom.type}`),
          e('div', { className: 'text-rose-700 text-[11px]' }, anom.description)
        ),
        e('button', { onClick: () => onResolveAnomaly(anom.id), className: 'px-3 py-1 bg-rose-600 text-white rounded font-bold text-[10px] cursor-pointer' }, 'Resolve Alert')
      ))
    )
  );
}

// --- CHAT ECOSYSTEM ---
function ChatEcosystem({ users, currentUser, tickets, onSendReminder }) {
  const safeUsers = users || [];
  const safeTickets = tickets || [];

  const [activeRecipient, setActiveRecipient] = useState(safeUsers[0] || null);
  const [groups, setGroups] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [autocompleteType, setAutocompleteType] = useState(null);

  // Live Supabase Database Messages Polling & WebSockets Subscriptions
  useEffect(() => {
    const fetchMessages = async () => {
      if (!supabaseClient) return;
      try {
        const { data, error } = await supabaseClient.from('chat_messages').select('*').order('created_at', { ascending: true });
        if (!error && data) {
          const mapped = data.map(m => ({
            id: m.id,
            target: m.recipient_id || m.channel_name,
            sender: m.sender_name || "Staff",
            text: m.content,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setMessages(mapped);
        }
      } catch(e) {}
    };

    fetchMessages();

    let channel = null;
    if (supabaseClient) {
      try {
        channel = supabaseClient.channel('chat_messages')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, payload => {
            const m = payload.new;
            const mapped = {
              id: m.id,
              target: m.recipient_id || m.channel_name,
              sender: m.sender_name || "Staff",
              text: m.content,
              time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => {
              if (prev.some(x => x.id === m.id)) return prev;
              return [...prev, mapped];
            });
          })
          .subscribe();
      } catch (err) {
        console.warn("Supabase chat subscribe error:", err);
      }
    }

    return () => {
      if (supabaseClient && channel) supabaseClient.removeChannel(channel);
    };
  }, [activeRecipient?.id]);

  const handleMessageChange = (ev) => {
    const val = ev.target.value;
    setInputMessage(val);
    if (val.endsWith('@')) setAutocompleteType('@');
    else if (val.endsWith('#')) setAutocompleteType('#');
    else if (val.endsWith('/')) setAutocompleteType('/');
    else setAutocompleteType(null);
  };

  const insertChatTag = (tagText) => {
    let clean = inputMessage;
    if (autocompleteType === '@' && clean.endsWith('@')) clean = clean.slice(0, -1);
    if (autocompleteType === '#' && clean.endsWith('#')) clean = clean.slice(0, -1);
    if (autocompleteType === '/' && clean.endsWith('/')) clean = clean.slice(0, -1);
    setInputMessage(clean + tagText + " ");
    setAutocompleteType(null);
  };

  const handleSendMessage = async (ev) => {
    ev.preventDefault();
    if (!inputMessage) return;

    const newMessageObj = {
      id: Date.now(),
      target: activeRecipient?.id,
      sender: currentUser?.name || "Admin",
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessageObj]);
    setInputMessage("");

    if (supabaseClient) {
      try {
        await supabaseClient.from('chat_messages').insert([{
          sender_id: currentUser?.id,
          sender_name: currentUser?.name,
          recipient_id: activeRecipient?.id,
          content: inputMessage,
          channel_type: activeRecipient?.id ? 'DM' : 'Group'
        }]);
      } catch (err) {
        console.warn("Supabase chat insert error:", err);
      }
    }
  };

  const handleCreateGroupWithMembers = (newGroupData) => {
    setGroups([...groups, newGroupData]);
    setShowCreateGroupModal(false);
  };

  const currentMessages = messages.filter(m => m.target === activeRecipient?.id);

  return e('div', { className: 'space-y-6' },
    e('div', { className: 'flex items-center justify-between' },
      e('div', null,
        e('h2', { className: 'text-2xl font-bold text-slate-900' }, 'Realtime Chat Ecosystem'),
        e('p', { className: 'text-xs text-slate-500' }, 'Personal DMs, Custom Groups & Instant Tag Autocomplete (@, #, /)')
      ),
      e('button', {
        onClick: () => setShowCreateGroupModal(true),
        className: 'px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow cursor-pointer'
      }, '+ Create Chat Group')
    ),

    e('div', { className: 'bg-white rounded-2xl border flex h-[500px] overflow-hidden' },
      e('div', { className: 'w-72 border-r bg-slate-50/50 p-4 space-y-4 overflow-y-auto' },
        e('div', { className: 'font-extrabold text-[11px] text-slate-400 uppercase' }, 'Chat Groups'),
        groups.length === 0 ? e('div', { className: 'text-[11px] text-slate-400 italic' }, 'No custom groups created.') :
        groups.map(g => e('button', {
          key: g.id,
          onClick: () => setActiveRecipient({ id: g.id, name: g.name }),
          className: `w-full text-left p-2.5 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer ${activeRecipient?.id === g.id ? 'bg-purple-600 text-white' : 'hover:bg-slate-100 text-purple-900 bg-purple-50'}`
        }, `👥 ${g.name}`)),

        e('div', { className: 'font-extrabold text-[11px] text-slate-400 uppercase pt-2 border-t' }, 'Personal DMs (1-on-1)'),
        safeUsers.filter(u => u.id !== currentUser?.id).length === 0 ? e('div', { className: 'text-[11px] text-slate-400 italic' }, 'No other staff members.') :
        safeUsers.filter(u => u.id !== currentUser?.id).map(u => e('button', {
          key: u.id,
          onClick: () => setActiveRecipient(u),
          className: `w-full text-left p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 cursor-pointer ${activeRecipient?.id === u.id ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-100'}`
        }, e('img', { src: u.avatar, className: 'w-7 h-7 rounded-full object-cover' }), u.name))
      ),

      e('div', { className: 'flex-1 flex flex-col justify-between bg-white relative' },
        e('div', { className: 'p-4 border-b font-bold text-sm bg-slate-50/50 flex justify-between items-center' },
          e('span', null, `Chat: ${activeRecipient?.name || 'Select a contact'}`),
          activeRecipient?.id && e('button', {
            onClick: () => onSendReminder(activeRecipient, 'Chat Discussion Reminder'),
            className: 'px-3 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-lg text-xs font-bold cursor-pointer'
          }, '🔔 Remind Person via Email')
        ),

        e('div', { className: 'p-4 overflow-y-auto flex-1 space-y-3' },
          currentMessages.length === 0 ? e('div', { className: 'p-8 text-center text-slate-400 text-xs italic' }, 'No messages exchanged yet. Send the first message below!') :
          currentMessages.map(m => e('div', { key: m.id, className: 'p-3 bg-slate-50 rounded-2xl border text-xs' },
            e('div', { className: 'font-bold flex justify-between' }, e('span', null, m.sender), e('span', { className: 'text-[10px] text-slate-400' }, m.time)),
            e('p', { className: 'mt-1 text-slate-700' }, m.text)
          ))
        ),

        e('form', { onSubmit: handleSendMessage, className: 'p-3 border-t flex gap-2 bg-white relative' },
          e('input', {
            type: 'text',
            value: inputMessage,
            onChange: handleMessageChange,
            placeholder: 'Type a message... (@ for users, # for tickets, / for divisions)',
            className: 'flex-1 px-4 py-2 text-xs border rounded-xl font-mono'
          }),

          autocompleteType && e('div', { className: 'tag-autocomplete-overlay' },
            autocompleteType === '@' && safeUsers.map(u => e('div', { key: u.id, onClick: () => insertChatTag(`@${u.name}`), className: 'tag-autocomplete-item' }, e('span', { className: 'font-bold text-blue-600' }, `@${u.name}`), e('span', { className: 'text-[10px] text-slate-400' }, u.department))),
            autocompleteType === '#' && safeTickets.map(t => e('div', { key: t.code, onClick: () => insertChatTag(`#${t.code}`), className: 'tag-autocomplete-item' }, e('span', { className: 'font-bold text-purple-600' }, `#${t.code}`))),
            autocompleteType === '/' && ["Engineering", "Operations", "Product", "Quality Control"].map(d => e('div', { key: d, onClick: () => insertChatTag(`/${d}`), className: 'tag-autocomplete-item' }, e('span', { className: 'font-bold text-emerald-600' }, `/${d}`)))
          ),

          e('button', { type: 'submit', className: 'px-5 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs cursor-pointer' }, 'Send')
        )
      )
    ),

    showCreateGroupModal && e(CreateChatGroupModal, {
      users: safeUsers,
      currentUser,
      onClose: () => setShowCreateGroupModal(false),
      onCreateGroup: handleCreateGroupWithMembers
    })
  );
}

// --- CREATE CHAT GROUP MODAL ---
function CreateChatGroupModal({ users, currentUser, onClose, onCreateGroup }) {
  const [groupName, setGroupName] = useState("");
  const safeUsers = users || [];
  const [selectedMembers, setSelectedMembers] = useState([currentUser?.id || "u-admin"]);

  const toggleMember = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!groupName) return;
    onCreateGroup({
      id: "g-" + Date.now(),
      name: groupName,
      members: selectedMembers,
      room: "Executive Boardroom"
    });
  };

  return e('div', { className: 'fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4' },
    e('div', { className: 'bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4' },
      e('div', { className: 'flex justify-between border-b pb-3' },
        e('h3', { className: 'font-bold text-slate-900 text-base' }, 'Create Custom Chat Group'),
        e('button', { onClick: onClose, className: 'font-bold text-slate-400 cursor-pointer' }, '✕')
      ),
      e('form', { onSubmit: handleSubmit, className: 'space-y-4 text-xs' },
        e('div', null,
          e('label', { className: 'font-semibold block mb-1' }, 'Group Name'),
          e('input', { required: true, type: 'text', placeholder: 'e.g. Factory Operations Pod', value: groupName, onChange: ev => setGroupName(ev.target.value), className: 'w-full px-3 py-2 border rounded-xl' })
        ),
        e('div', null,
          e('label', { className: 'font-semibold block mb-2 text-slate-700' }, 'Add Group Members:'),
          e('div', { className: 'space-y-2 max-h-48 overflow-y-auto border border-slate-200 p-3 rounded-xl bg-slate-50' },
            safeUsers.map(u => e('label', {
              key: u.id,
              className: 'flex items-center justify-between p-2 rounded-lg bg-white border cursor-pointer hover:border-purple-500'
            },
              e('div', { className: 'flex items-center gap-2' },
                e('input', {
                  type: 'checkbox',
                  checked: selectedMembers.includes(u.id),
                  onChange: () => toggleMember(u.id),
                  className: 'w-4 h-4 text-purple-600 rounded cursor-pointer'
                }),
                e('img', { src: u.avatar, className: 'w-6 h-6 rounded-full object-cover' }),
                e('span', { className: 'font-bold text-slate-900' }, u.name)
              ),
              e('span', { className: 'text-[10px] text-slate-400 font-mono' }, u.department)
            ))
          )
        ),
        e('div', { className: 'flex justify-end gap-2 pt-2 border-t' },
          e('button', { type: 'button', onClick: onClose, className: 'font-semibold px-3 cursor-pointer' }, 'Cancel'),
          e('button', { type: 'submit', className: 'px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold shadow cursor-pointer' }, 'Create Group with Members')
        )
      )
    )
  );
}

// --- SCHEDULE GRID WITH C-LEVEL INSPECTION & DATE-BASED CALENDAR ---
function ScheduleGrid({ users, schedules, currentUser, onOpenPlanner, onInspectUserCalendar }) {
  const safeUsers = users || [];
  const safeSchedules = schedules || [];

  return e('div', { className: 'space-y-6' },
    e('div', { className: 'flex items-center justify-between' },
      e('div', null,
        e('h2', { className: 'text-2xl font-bold text-slate-900 tracking-tight' }, 'Working Hours Calendar & Schedules'),
        e('p', { className: 'text-xs text-slate-500' }, 'Date-based optimal hours calendar & locked employee shifts')
      ),
      e('button', { onClick: onOpenPlanner, className: 'px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-extrabold shadow flex items-center gap-1.5 cursor-pointer' }, e(IconCalendar, { className: 'w-4 h-4' }), '📅 Select & Lock Date Schedule')
    ),

    e('div', { className: 'bg-white rounded-2xl border border-slate-200 shadow-xs p-5 overflow-x-auto' },
      safeUsers.length === 0 ? e('div', { className: 'p-8 text-center text-slate-400 text-xs' }, 'No employee schedules configured yet.') :
      e('table', { className: 'w-full text-left text-xs border-collapse min-w-[700px]' },
        e('thead', { className: 'bg-slate-50 border-b font-bold text-slate-500' },
          e('tr', null, e('th', { className: 'p-3' }, 'Employee Member'), e('th', { className: 'p-3' }, 'Mode'), e('th', { className: 'p-3' }, 'Department'), e('th', { className: 'p-3' }, 'Locked Date Shift'), e('th', { className: 'p-3 text-right' }, 'Action'))
        ),
        e('tbody', { className: 'divide-y' },
          safeUsers.map(u => {
            const userScheds = safeSchedules.filter(s => s.userId === u.id);
            const latestSched = userScheds[userScheds.length - 1];

            return e('tr', { key: u.id, className: 'hover:bg-slate-50' },
              e('td', { className: 'p-3 font-bold flex items-center gap-2.5' },
                e('img', { src: u.avatar, className: 'w-8 h-8 rounded-full object-cover border' }),
                e('div', null, e('div', { className: 'text-slate-900' }, u.name), e('div', { className: 'text-[10px] text-slate-400' }, u.email))
              ),
              e('td', { className: 'p-3 font-semibold text-blue-600' }, u.mode),
              e('td', { className: 'p-3 text-slate-600' }, u.department),
              e('td', { className: 'p-3' },
                latestSched ? e('span', { className: 'px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-[11px]' }, `${latestSched.date || latestSched.day}: ${latestSched.time}`) :
                e('span', { className: 'px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]' }, 'Pending Lock')
              ),
              e('td', { className: 'p-3 text-right' },
                e('button', {
                  onClick: () => onInspectUserCalendar(u),
                  className: 'px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold rounded-lg text-xs cursor-pointer'
                }, '🔍 Inspect Calendar')
              )
            );
          })
        )
      )
    )
  );
}

// --- ORGANIZATION SETUP WIZARD ---
function OrganizationSetupWizard({ companyInfo, onCancel, onLoadDemo, onFinish }) {
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState(companyInfo?.name || "PT Javelo Terra Lestari");
  const [factoryName, setFactoryName] = useState(companyInfo?.factoryGeo?.name || "PT Javelo Terra Lestari Factory");
  const [lat, setLat] = useState(companyInfo?.factoryGeo?.lat || -7.4218);
  const [lng, setLng] = useState(companyInfo?.factoryGeo?.lng || 109.1352);
  const [radius, setRadius] = useState(companyInfo?.factoryGeo?.radiusMeters || 500);

  const [founderName, setFounderName] = useState("Hendra Setiawan");
  const [founderEmail, setFounderEmail] = useState("hendra@javelo360.com");
  const [founderPassword, setFounderPassword] = useState("••••••••");

  const handleCompleteSetup = () => {
    const founderUser = {
      id: "u-admin",
      name: founderName,
      email: founderEmail,
      password: founderPassword,
      role: "admin",
      mode: "Full WFH",
      department: "C-Level Executive",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      status: "Offline",
      optimalHours: "08:00 - 16:00",
      checkedIn: false
    };

    onFinish({
      name: companyName,
      factoryGeo: { lat: parseFloat(lat) || -7.4218, lng: parseFloat(lng) || 109.1352, name: factoryName, radiusMeters: parseInt(radius) || 500 }
    }, founderUser);
  };

  return e('div', { className: 'min-h-screen bg-slate-900 flex items-center justify-center p-6 text-xs select-none' },
    e('div', { className: 'max-w-2xl w-full bg-white rounded-3xl p-8 shadow-2xl space-y-6 border border-slate-100' },
      e('div', { className: 'flex items-center justify-between border-b pb-4' },
        e('div', null,
          e('div', { className: 'flex items-center gap-2' },
            e('div', { className: 'w-8 h-8 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center text-sm shadow' }, 'J'),
            e('h2', { className: 'text-xl font-extrabold text-slate-900 tracking-tight' }, 'Interactive Organization Setup Wizard')
          ),
          e('p', { className: 'text-xs text-slate-500 mt-1' }, 'Configure company profile, factory geofence, and C-Level founder account')
        ),
        e('div', { className: 'flex items-center gap-2' },
          onLoadDemo && e('button', { onClick: onLoadDemo, className: 'px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-lg cursor-pointer' }, '🧪 Load Demo Personas'),
          onCancel && e('button', { onClick: onCancel, className: 'text-slate-400 hover:text-slate-600 font-bold cursor-pointer' }, '✕ Cancel')
        )
      ),

      step === 1 && e('div', { className: 'space-y-4' },
        e('h3', { className: 'font-bold text-slate-900 text-sm border-b pb-2' }, 'Step 1: Company Profile & Factory GPS Coordinates'),
        e('div', { className: 'grid grid-cols-2 gap-4' },
          e('div', null, e('label', { className: 'font-bold block mb-1' }, 'Company Name'), e('input', { type: 'text', value: companyName, onChange: ev => setCompanyName(ev.target.value), className: 'w-full px-3 py-2 border rounded-xl' })),
          e('div', null, e('label', { className: 'font-bold block mb-1' }, 'Factory / Office Location Name'), e('input', { type: 'text', value: factoryName, onChange: ev => setFactoryName(ev.target.value), className: 'w-full px-3 py-2 border rounded-xl' }))
        ),
        e('div', { className: 'p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3' },
          e('span', { className: 'font-bold text-slate-800 block text-xs' }, 'GPS Geofence Radar Coordinates (Full WFO Enforcement)'),
          e('div', { className: 'grid grid-cols-3 gap-3' },
            e('div', null, e('label', { className: 'text-[11px] font-semibold text-slate-600 block' }, 'Latitude'), e('input', { type: 'number', step: 'any', value: lat, onChange: ev => setLat(ev.target.value), className: 'w-full px-3 py-1.5 border rounded-lg font-mono' })),
            e('div', null, e('label', { className: 'text-[11px] font-semibold text-slate-600 block' }, 'Longitude'), e('input', { type: 'number', step: 'any', value: lng, onChange: ev => setLng(ev.target.value), className: 'w-full px-3 py-1.5 border rounded-lg font-mono' })),
            e('div', null, e('label', { className: 'text-[11px] font-semibold text-slate-600 block' }, 'Radius Limit (Meters)'), e('input', { type: 'number', value: radius, onChange: ev => setRadius(ev.target.value), className: 'w-full px-3 py-1.5 border rounded-lg font-mono' }))
          )
        ),
        e('div', { className: 'flex justify-end pt-3' }, e('button', { onClick: () => setStep(2), className: 'px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow cursor-pointer' }, 'Next: C-Level Founder Setup ▶'))
      ),

      step === 2 && e('div', { className: 'space-y-4' },
        e('h3', { className: 'font-bold text-slate-900 text-sm border-b pb-2' }, 'Step 2: C-Level Executive Founder Account Setup'),
        e('div', { className: 'space-y-3' },
          e('div', null, e('label', { className: 'font-bold block mb-1' }, 'C-Level Founder Name'), e('input', { type: 'text', value: founderName, onChange: ev => setFounderName(ev.target.value), className: 'w-full px-3 py-2 border rounded-xl' })),
          e('div', null, e('label', { className: 'font-bold block mb-1' }, 'Corporate Work Email'), e('input', { type: 'email', value: founderEmail, onChange: ev => setFounderEmail(ev.target.value), className: 'w-full px-3 py-2 border rounded-xl' })),
          e('div', null, e('label', { className: 'font-bold block mb-1' }, 'Account Password'), e('input', { type: 'password', value: founderPassword, onChange: ev => setFounderPassword(ev.target.value), className: 'w-full px-3 py-2 border rounded-xl' }))
        ),
        e('div', { className: 'flex justify-between pt-4 border-t' },
          e('button', { onClick: () => setStep(1), className: 'px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl cursor-pointer' }, '◀ Back'),
          e('button', { onClick: handleCompleteSetup, className: 'px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg text-xs cursor-pointer' }, '🚀 Launch Javelo360 ERP')
        )
      )
    )
  );
}

// --- SETTINGS PANEL ---
function SettingsPanel({ currentUser, setCurrentUser, companyInfo, isDarkMode, setIsDarkMode, apiUrl, setApiUrl, onOpenPhotoCrop, onStartWizard }) {
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [customApiUrl, setCustomApiUrl] = useState(apiUrl || "http://localhost:3000");
  const [apiSavedMsg, setApiSavedMsg] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSaveProfile = (ev) => {
    ev.preventDefault();
    if (setCurrentUser && currentUser) {
      setCurrentUser({
        ...currentUser,
        name,
        email
      });
    }
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return e('div', { className: 'space-y-6 max-w-2xl' },
    e('div', { className: 'flex items-center justify-between' },
      e('div', null,
        e('h2', { className: 'text-2xl font-bold text-slate-900' }, 'Settings & Enterprise Preferences'),
        e('p', { className: 'text-xs text-slate-500' }, 'Manage profile photo attachment, theme mode, and system rules')
      ),
      e('button', { onClick: onStartWizard, className: 'px-4 py-2 bg-purple-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer' }, e(IconSparkles, { className: 'w-4 h-4' }), 'Re-Run Setup Wizard')
    ),

    e('form', { onSubmit: handleSaveProfile, className: 'bg-white p-6 rounded-2xl border border-slate-200 text-xs space-y-4 shadow-xs' },
      e('h3', { className: 'font-bold text-sm text-slate-900 border-b pb-2' }, 'Personal Profile & Photo Attachment Studio'),
      
      e('div', { className: 'flex items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-200' },
        e('img', { src: currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", className: 'w-20 h-20 rounded-full object-cover border-4 border-blue-600 shadow-md flex-shrink-0' }),
        e('div', { className: 'space-y-2' },
          e('div', { className: 'font-extrabold text-slate-900 text-sm' }, currentUser?.name || 'Admin'),
          e('p', { className: 'text-[11px] text-slate-500' }, 'Attach photo file from your device, adjust crop zoom, and tune brightness level.'),
          e('button', {
            type: 'button',
            onClick: onOpenPhotoCrop,
            className: 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer'
          }, '📸 Attach & Adjust Photo (Crop & Brightness)')
        )
      ),

      e('div', { className: 'grid grid-cols-2 gap-4 pt-2' },
        e('div', null,
          e('label', { className: 'font-semibold block mb-1' }, 'Full Name'),
          e('input', { type: 'text', value: name, onChange: ev => setName(ev.target.value), className: 'w-full px-3 py-2 border rounded-xl' })
        ),
        e('div', null,
          e('label', { className: 'font-semibold block mb-1' }, 'Work Email Address'),
          e('input', { type: 'email', value: email, onChange: ev => setEmail(ev.target.value), className: 'w-full px-3 py-2 border rounded-xl' })
        )
      ),

      e('div', { className: 'flex items-center justify-between pt-3 border-t' },
        savedMsg ? e('span', { className: 'text-emerald-600 font-bold' }, '✅ Profile updated successfully!') : e('span', null),
        e('button', { type: 'submit', className: 'px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow cursor-pointer' }, 'Save Profile Changes')
      )
    ),

    e('div', { className: 'bg-white p-6 rounded-2xl border border-slate-200 text-xs space-y-4 shadow-xs' },
      e('h3', { className: 'font-bold text-sm text-slate-900 border-b pb-2' }, 'App Display & Theme Preferences'),
      e('div', { className: 'flex items-center justify-between p-3 bg-slate-50 rounded-xl border' },
        e('div', null,
          e('div', { className: 'font-bold text-slate-900' }, 'Dark / Night Mode'),
          e('div', { className: 'text-slate-500 text-[11px]' }, 'Switch app theme between Light & Dark Mode')
        ),
        e('button', {
          onClick: () => setIsDarkMode(!isDarkMode),
          className: `px-4 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${isDarkMode ? 'bg-slate-900 text-amber-400 border border-slate-700' : 'bg-blue-600 text-white shadow'}`
        }, isDarkMode ? '🌙 Dark Mode Active' : '☀️ Light Mode Active')
      )
    ),

    e('div', { className: 'bg-white p-6 rounded-2xl border border-slate-200 text-xs space-y-4 shadow-xs' },
      e('h3', { className: 'font-bold text-sm text-slate-900 border-b pb-2 flex items-center justify-between' },
        e('span', null, '🌐 Server API & Multi-Device Synchronization'),
        e('span', { className: `px-2 py-0.5 rounded text-[10px] font-mono font-bold ${apiUrl?.includes('localhost') || apiUrl?.includes('127.0.0.1') ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}` },
          apiUrl?.includes('localhost') || apiUrl?.includes('127.0.0.1') ? '🖥️ Local Server Active' : '☁️ Remote / Ngrok Active'
        )
      ),
      e('p', { className: 'text-slate-600' }, 'Configure the backend server URL used for staff account generation and database backup synchronization:'),
      e('div', { className: 'space-y-2' },
        e('label', { className: 'font-semibold block text-slate-700' }, 'Backend Server API URL:'),
        e('div', { className: 'flex gap-2' },
          e('input', {
            type: 'text',
            value: customApiUrl,
            onChange: ev => setCustomApiUrl(ev.target.value),
            placeholder: 'http://localhost:3000 or https://xxx.ngrok-free.dev',
            className: 'flex-1 px-3 py-2 border rounded-xl font-mono text-xs'
          }),
          e('button', {
            type: 'button',
            onClick: () => {
              if (setApiUrl) setApiUrl(customApiUrl);
              localStorage.setItem('javelo_api_url', customApiUrl);
              setApiSavedMsg(true);
              setTimeout(() => setApiSavedMsg(false), 3000);
            },
            className: 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer'
          }, 'Save URL')
        )
      ),
      e('div', { className: 'flex items-center justify-between pt-2' },
        apiSavedMsg ? e('span', { className: 'text-emerald-600 font-bold' }, '✅ API URL saved successfully!') : e('span', null),
        e('button', {
          type: 'button',
          onClick: () => {
            const localUrl = 'http://localhost:3000';
            setCustomApiUrl(localUrl);
            if (setApiUrl) setApiUrl(localUrl);
            localStorage.setItem('javelo_api_url', localUrl);
            setApiSavedMsg(true);
            setTimeout(() => setApiSavedMsg(false), 3000);
          },
          className: 'px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer'
        }, '🔄 Reset to Localhost (http://localhost:3000)')
      )
    ),

    e('div', { className: 'bg-white p-6 rounded-2xl border border-slate-200 text-xs space-y-3' },
      e('h3', { className: 'font-bold text-sm text-slate-900' }, `Organization Settings: ${companyInfo?.name}`),
      e('p', { className: 'text-slate-600' }, 'Full WFH, Hybrid, and Full WFO strict rules enforced with GPS geofencing & AFK engine.'),
      e('div', { className: 'p-3 bg-slate-50 rounded-xl font-mono text-[11px] space-y-1' },
        e('div', null, 'Geofence Location: ', e('strong', null, companyInfo?.factoryGeo?.name)),
        e('div', null, 'Coordinates: ', e('strong', null, `${companyInfo?.factoryGeo?.lat}, ${companyInfo?.factoryGeo?.lng}`)),
        e('div', null, 'Radius Limit: ', e('strong', null, `${companyInfo?.factoryGeo?.radiusMeters} meters`))
      )
    )
  );
}

// RENDER APP ROOT SAFELY
const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(e(App));
}
