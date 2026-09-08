const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const ROOT_DIR = path.join(__dirname, '..');
const DB_PATH = path.join(ROOT_DIR, 'db.json');

const SUPABASE_URL = "https://pqojigomfrdvqqkffohi.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_LQo4PGFNQg40mBM8SiBS-g_Q3OTrYKA";

// Load environment variables from .env file if it exists
if (fs.existsSync(path.join(ROOT_DIR, '.env'))) {
  try {
    const envFile = fs.readFileSync(path.join(ROOT_DIR, '.env'), 'utf8');
    envFile.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
        process.env[key] = value;
      }
    });
    console.log("Successfully loaded environment variables from .env file.");
  } catch (err) {
    console.warn("Failed to load .env file:", err.message);
  }
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // --- REAL-TIME MULTI-DEVICE CLOUD DATABASE API ENDPOINTS ---
  if (reqUrl === '/api/db' || reqUrl === '/api/sync' || reqUrl === '/api/users') {
    if (req.method === 'GET') {
      fs.readFile(DB_PATH, 'utf8', (err, data) => {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        if (err || !data) {
          res.end(JSON.stringify({ companyInfo: null, users: [], tickets: [], messages: [], schedules: [], customTasks: [] }));
        } else {
          res.end(data);
        }
      });
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          fs.writeFileSync(DB_PATH, JSON.stringify(parsed, null, 2));
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, timestamp: Date.now() }));
        } catch(e) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: "Invalid JSON Payload: " + e.message }));
        }
      });
      return;
    }
  }

  // --- SERVER-SIDE SECURE EMPLOYEES SIGN-UP (SUPABASE AUTH BYPASS PROXY) ---
  if (reqUrl === '/api/create-employee') {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: "Method Not Allowed" }));
      return;
    }

    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const { email, password, name, role, mode, department } = payload;

        if (!email || !password || !name) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: "Missing required fields: email, password, name" }));
          return;
        }

        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!serviceKey) {
          res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: "SUPABASE_SERVICE_ROLE_KEY is not configured in .env file on the server. Please add it first." }));
          return;
        }

        // 1. Create User in Supabase auth.users
        const authData = JSON.stringify({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: name }
        });

        const authHeaders = {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Length': Buffer.byteLength(authData)
        };

        const parsedUrl = new URL(`${SUPABASE_URL}/auth/v1/admin/users`);
        
        const makeRequest = (urlOpts, headers, dataPayload) => {
          return new Promise((resolve, reject) => {
            const reqOpts = {
              hostname: urlOpts.hostname,
              path: urlOpts.pathname,
              method: 'POST',
              headers
            };
            const clientReq = https.request(reqOpts, (clientRes) => {
              let resBody = '';
              clientRes.on('data', chunk => resBody += chunk);
              clientRes.on('end', () => {
                resolve({ status: clientRes.statusCode, body: resBody });
              });
            });
            clientReq.on('error', reject);
            clientReq.write(dataPayload);
            clientReq.end();
          });
        };

        let uuid = null;
        try {
          console.log(`[Supabase Admin] Attempting online user auth for ${email}...`);
          const authResult = await makeRequest(parsedUrl, authHeaders, authData);
          if (authResult.status >= 200 && authResult.status < 300) {
            const authUser = JSON.parse(authResult.body);
            uuid = authUser.id;
            console.log(`[Supabase Admin] Online auth user created. ID: ${uuid}`);
            const profileData = JSON.stringify({
              id: uuid,
              email,
              full_name: name,
              role: role || 'employee',
              work_mode: mode || 'Full WFH',
              department: department || 'Engineering',
              password_plain: password
            });
            const profileHeaders = {
              'Content-Type': 'application/json',
              'apikey': serviceKey,
              'Authorization': `Bearer ${serviceKey}`,
              'Content-Length': Buffer.byteLength(profileData)
            };
            const profileUrl = new URL(`${SUPABASE_URL}/rest/v1/profiles`);
            await makeRequest(profileUrl, profileHeaders, profileData);
          } else {
            console.warn("[Supabase Admin] Online creation rejected, will use local storage:", authResult.status, authResult.body);
          }
        } catch(supaErr) {
          console.warn("[Supabase Admin] Supabase offline/unreachable (" + supaErr.message + "), creating account in local database.");
        }

        // If UUID not generated by online Supabase, generate a valid RFC UUID locally
        if (!uuid) {
          const crypto = require('crypto');
          uuid = crypto.randomUUID();
        }

        // Persist to local db.json
        try {
          let currentDb = { companyInfo: null, users: [], tickets: [], messages: [], schedules: [], customTasks: [] };
          if (fs.existsSync(DB_PATH)) {
            try { currentDb = JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch(e) {}
          }
          if (!Array.isArray(currentDb.users)) currentDb.users = [];
          const newUser = {
            id: uuid,
            name,
            email,
            password,
            role: role || 'employee',
            mode: mode || 'Full WFH',
            department: department || 'Engineering',
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
            status: "Offline",
            checkedIn: false
          };
          const existingIdx = currentDb.users.findIndex(u => u.id === uuid || u.email === email);
          if (existingIdx !== -1) {
            currentDb.users[existingIdx] = newUser;
          } else {
            currentDb.users.push(newUser);
          }
          fs.writeFileSync(DB_PATH, JSON.stringify(currentDb, null, 2));
          console.log(`[Local Server] Saved account ${email} (${name}) into local db.json successfully.`);
        } catch(e) {
          console.error("[Local Server] Error updating db.json:", e);
        }

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, user: { id: uuid, email, name, role } }));

      } catch(err) {
        console.error("[Supabase Admin] Proxy exception:", err.message);
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  let filePath;
  if (reqUrl === '/' || reqUrl === '/index.html') {
    filePath = path.join(ROOT_DIR, 'index.html');
  } else if (reqUrl === '/manifest.json') {
    filePath = fs.existsSync(path.join(ROOT_DIR, 'manifest.json')) ? path.join(ROOT_DIR, 'manifest.json') : path.join(PUBLIC_DIR, 'manifest.json');
  } else if (reqUrl === '/sw.js') {
    filePath = fs.existsSync(path.join(ROOT_DIR, 'sw.js')) ? path.join(ROOT_DIR, 'sw.js') : path.join(PUBLIC_DIR, 'sw.js');
  } else if (reqUrl === '/styles.css') {
    filePath = fs.existsSync(path.join(ROOT_DIR, 'styles.css')) ? path.join(ROOT_DIR, 'styles.css') : path.join(PUBLIC_DIR, 'styles.css');
  } else if (reqUrl === '/app.js') {
    filePath = fs.existsSync(path.join(ROOT_DIR, 'app.js')) ? path.join(ROOT_DIR, 'app.js') : path.join(PUBLIC_DIR, 'app.js');
  } else {
    filePath = fs.existsSync(path.join(ROOT_DIR, reqUrl)) ? path.join(ROOT_DIR, reqUrl) : path.join(PUBLIC_DIR, reqUrl);
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'text/plain';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(ROOT_DIR, 'index.html'), (err2, indexContent) => {
          if (err2) {
            res.writeHead(404);
            res.end('404 Not Found');
          } else {
            res.writeHead(200, { 
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
            });
            res.end(indexContent);
          }
        });
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Javelo360 ERP Multi-Device Server Active on Port ${PORT}`);
  console.log(`👉 Real-time Database API: http://localhost:${PORT}/api/db`);
  console.log(`=======================================================`);
});
