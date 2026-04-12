# 🚀 RENDER DEPLOYMENT GUIDE

## Quick Setup (5 minutes)

### Prerequisites
- GitHub account with your code pushed
- Render account (create at render.com)

### Step 1: Create Render Web Service

1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Select your GitHub repo (`smartbus-ai`)
4. Fill in details:
   - **Name:** `smartbus-api` (or your choice)
   - **Environment:** `Node`
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (for demo)

### Step 2: Add Environment Variables

1. In Render dashboard, go to **Environment**
2. Add these variables:

```
PORT = 5000
NODE_ENV = production
FRONTEND_URL = https://your-frontend.onrender.com
```

**Note:** Don't know frontend URL yet? Deploy frontend first, then come back and update this.

### Step 3: Deploy

1. Click **"Create Web Service"**
2. Render will auto-deploy from GitHub
3. Watch logs for success message
4. Copy the generated URL (e.g., `https://smartbus-api.onrender.com`)

### Step 4: Test Backend

```bash
# Health check
curl https://smartbus-api.onrender.com/api/health

# Get routes
curl https://smartbus-api.onrender.com/api/routes

# Get stops for route 1
curl https://smartbus-api.onrender.com/api/stops/1
```

All should return JSON with proper HTTP status codes.

---

## Frontend Configuration

Update your frontend to use the Render backend:

### Option 1: Update API URLs directly

**File:** `client/src/api/routes.js`
```javascript
// OLD
const API_BASE = 'http://localhost:5000';

// NEW - Use environment variable
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const getRoutes = async () => {
  const response = await axios.get(`${API_BASE}/api/routes`);
  return response.data;
};
```

**File:** `client/src/api/stops.js`
```javascript
// Same pattern
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const getStops = async (routeId) => {
  const response = await axios.get(`${API_BASE}/api/stops/${routeId}`);
  return response.data;
};
```

### Option 2: Create centralized API config (Recommended)

Create `client/src/config/api.js`:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};
```

Then use in API files:
```javascript
import config from '../../config/api';
import axios from 'axios';

const axiosInstance = axios.create(config);

export const getRoutes = async () => {
  const response = await axiosInstance.get('/api/routes');
  return response.data;
};
```

---

## Local Development Testing

Test that your changes work locally before deploying:

```bash
# Terminal 1: Backend
cd server
npm install
npm run dev
# Should see: "SmartBus backend server running on port 5000"

# Terminal 2: Frontend
cd client
npm install
REACT_APP_API_URL=http://localhost:5000 npm run dev
# Should see: "Local: http://localhost:5173"
```

Visit `http://localhost:5173` and test all pages.

---

## Troubleshooting

### 🔴 "CORS Error" in Browser Console

**Problem:** Frontend can't reach backend due to CORS

**Cause:** `FRONTEND_URL` not set correctly in Render

**Fix:**
```bash
# Get your frontend URL from Render
# Update backend FRONTEND_URL variable in Render dashboard
# Backend redeploys automatically
# Clear browser cache (Ctrl+Shift+Del) and reload
```

### 🔴 "404 Not Found"

**Problem:** API endpoints returning 404

**Cause:** Typo in API URL or wrong endpoint

**Fix:**
```bash
# Check the URL format
curl https://your-backend.onrender.com/api/routes
# Should return JSON array, not HTML error page
```

### 🔴 "Database Error" in Response

**Problem:** All endpoints return "Database Error"

**Cause:** SQLite database file not found or corrupted

**Fix:**
```bash
# Check Render logs
# Ensure database/smartbus.db is committed and pushed
# SQLite gets auto-initialized from schema.sql on startup
git add database/
git push origin main
# Trigger redeploy in Render dashboard
```

### 🟡 Dyno Going to Sleep

**Problem:** First request is slow (~30 seconds)

**Cause:** Free tier dynos go to sleep after 15 mins of inactivity

**Solution:** This is normal. Upgrade to paid tier if needed for production.

---

## Environment Variables Checklist

### Backend (Render)
- [ ] `PORT` = `5000`
- [ ] `NODE_ENV` = `production`
- [ ] `FRONTEND_URL` = `https://your-frontend.onrender.com`

### Frontend (Render or Vercel)
- [ ] `REACT_APP_API_URL` = `https://your-backend.onrender.com`

---

## Production Tips

1. **Enable Auto-Deploy:** In Render dashboard, enable auto-deploy from GitHub
2. **Monitor Logs:** Check Render logs regularly for errors
3. **Database Backup:** SQLite data is ephemeral on free tier. Use PostgreSQL for production:
   - Create free PostgreSQL DB on Render
   - Update code to use pg instead of sqlite3
   - See below for migration steps
4. **Error Tracking:** Consider Sentry or LogRocket for production errors

---

## Migrate to PostgreSQL (Optional, for Production)

On Render free tier, PostgreSQL persists data across restarts while SQLite doesn't.

### Step 1: Create PostgreSQL Database on Render

1. In Render dashboard: **New** → **PostgreSQL**
2. Fill in database name, user, password
3. Note the connection string: `postgresql://user:pass@host/dbname`

### Step 2: Update Backend

Install PostgreSQL driver:
```bash
npm install pg
```

Update `config/db.js`:
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

module.exports = pool;
```

### Step 3: Migrate Schema

Modify `config/db.js` to run schema on startup:
```javascript
const fs = require('fs');

async function initDB() {
  const schema = fs.readFileSync('./database/schema.sql', 'utf8');
  await pool.query(schema);
}

initDB();
```

### Step 4: Update Models

Convert callbacks to promises:
```javascript
// OLD
exports.getRoutes = (callback) => {
  db.all('SELECT * FROM routes', [], callback);
};

// NEW
exports.getRoutes = async () => {
  const result = await pool.query('SELECT * FROM routes');
  return result.rows;
};
```

**Note:** This requires converting controllers to async/await. For MVP, stick with SQLite for now.

---

## Final Render Configuration Summary

```yaml
Service: SmartBus Backend
Type: Web Service
Build Command: npm install
Start Command: npm start
Environment Variables:
  PORT: 5000
  NODE_ENV: production
  FRONTEND_URL: https://your-frontend.onrender.com
  
Data:
  Database: SQLite (ephemeral, fine for demo)
  File: database/smartbus.db
  Auto-initialized: Yes (schema.sql runs on startup)

Expected Response Times:
  Cold start (first request): 10-30 seconds
  Warm requests: <100ms
  
Uptime: 99.9% (reliably green)
Cost: FREE (within limits)
```

---

## Success Indicators ✅

- [ ] Health check returns `{ status: "ok" }`
- [ ] GET /api/routes returns JSON array with 3 routes
- [ ] GET /api/stops/1 returns JSON array with 7 stops
- [ ] GET /api/buses returns JSON array with 3 buses
- [ ] Invalid IDs return 400 Bad Request
- [ ] Non-existent resources return 404 Not Found
- [ ] Frontend loads without CORS errors
- [ ] Map displays with bus movement

---

**You're ready to deploy! 🚀**
