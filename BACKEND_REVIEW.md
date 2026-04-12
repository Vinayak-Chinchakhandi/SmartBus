# 🔍 BACKEND CODE REVIEW - RENDER DEPLOYMENT CHECKLIST

**Project:** SmartBus AI Backend (Node.js + Express + SQLite)  
**Target:** Render.com Free Tier  
**Review Date:** April 12, 2026

---

## 1. ✅ WHAT IS CORRECT (No Changes Needed)

### Server Configuration
- ✅ **Dynamic PORT**: Uses `process.env.PORT || 5000` correctly
- ✅ **Proper server startup**: `app.listen(PORT)` in separate `server.js` file
- ✅ **App exports**: `app.js` exports Express app properly
- ✅ **Environment loading**: `dotenv` configured at top of `server.js`

### Database Setup
- ✅ **Path handling**: Uses `path.join(__dirname, '../../database/smartbus.db')` - works in production
- ✅ **Schema loading**: `loadSchema()` runs automatically on DB connection
- ✅ **Foreign keys**: Enabled via `PRAGMA foreign_keys = ON`
- ✅ **SQL parameterization**: All queries use `?` placeholders (safe from SQL injection)
  ```javascript
  // ✅ GOOD - Parameterized
  db.all("SELECT * FROM stops WHERE route_id = ? ORDER BY stop_order", [routeId], callback)
  ```

### API Routes
- ✅ **Clean separation**: Controllers → Models → DB pattern
- ✅ **Proper routing**: Mounted routes cleanly in `app.js`
- ✅ **Health check**: `/api/health` endpoint implemented
- ✅ **JSON parsing**: `express.json()` middleware configured

### Dependencies
- ✅ **Production-safe**: No unnecessary dev dependencies listed under `dependencies`
  - express@^4.18.2
  - cors@^2.8.5
  - sqlite3@^5.1.6
  - dotenv@^16.3.1
- ✅ **Lightweight**: Minimal, focused stack

---

## 2. ⚠️ CRITICAL ISSUES (Must Fix Before Deployment)

### 🔴 ISSUE #1: CORS Hardcoded to localhost
**File:** `server/app.js`  
**Severity:** 🔴 BLOCKING - Frontend won't work on Render

```javascript
// ❌ CURRENT (BROKEN FOR RENDER)
app.use(cors({
  origin: 'http://localhost:5173'
}));
```

**Problem:** 
- On Render, frontend will be at a different URL
- CORS request will be rejected
- Frontend will show "Access denied" errors

---

### 🔴 ISSUE #2: SQLite File is Ephemeral on Render
**File:** `database/smartbus.db`  
**Severity:** 🔴 WARNING - Data loss on restart

**Problem:**
- Render's free tier doesn't persist files across dyno restarts (~15 mins idle)
- Any runtime data written to SQLite will be lost
- Database file itself exists but will revert to initial state

---

### 🔴 ISSUE #3: Database File Committed to Repo
**File:** `database/smartbus.db`  
**Severity:** 🟡 RISKY but acceptable

**Problem:**
- Binary file in git (bad practice)
- Should be generated at build time instead
- But acceptable for demo/MVP since data doesn't persist anyway

---

### 🟡 ISSUE #4: Insufficient Error Handling in Controllers
**File:** `server/controllers/*.js`  
**Severity:** 🟡 MEDIUM

```javascript
// ❌ CURRENT - Minimal error handling
exports.getStops = (req, res) => {
  const { routeId } = req.params;
  stopsModel.getStopsByRoute(routeId, (err, rows) => {
    if (err) return res.status(500).json(err);  // ❌ Returns raw error object
    res.json(rows);
  });
};
```

**Problems:**
- No validation of `routeId` (could be non-numeric, null, etc.)
- Error response is unparseable (raw SQLite error)
- No proper error message formatting
- No 404 handling if route doesn't exist

---

## 3. 🔧 EXACT FIXES REQUIRED

### FIX #1: Update CORS to Support Render

**File:** `server/app.js`

Replace this:
```javascript
app.use(cors({
  origin: 'http://localhost:5173'
}));
```

With this:
```javascript
const allowedOrigins = [
  'http://localhost:5173',           // Local development
  'http://localhost:3000',           // Alternative local port
  process.env.FRONTEND_URL           // Production frontend (from Render)
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  }
}));
```

---

### FIX #2: Add Input Validation and Better Error Handling

**File:** `server/controllers/stopsController.js`

Replace:
```javascript
const stopsModel = require('../models/stopsModel');

exports.getStops = (req, res) => {
  const { routeId } = req.params;

  stopsModel.getStopsByRoute(routeId, (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
};
```

With:
```javascript
const stopsModel = require('../models/stopsModel');

exports.getStops = (req, res) => {
  const { routeId } = req.params;

  // ✅ Validate input
  if (!routeId || isNaN(routeId)) {
    return res.status(400).json({ 
      error: 'Invalid route ID',
      message: 'Route ID must be a valid number'
    });
  }

  stopsModel.getStopsByRoute(routeId, (err, rows) => {
    if (err) {
      console.error('Error fetching stops:', err);
      return res.status(500).json({ 
        error: 'Failed to fetch stops',
        message: 'Database error'
      });
    }

    // ✅ Return 404 if no stops found
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'No stops found for this route'
      });
    }

    res.status(200).json(rows);
  });
};
```

---

### FIX #3: Similar Fixes for Other Controllers

**File:** `server/controllers/locationsController.js`

Replace:
```javascript
const locationsModel = require('../models/locationsModel');

exports.getLocation = (req, res) => {
  const { busId } = req.params;

  locationsModel.getBusLocation(busId, (err, row) => {
    if (err) return res.status(500).json(err);
    res.json(row);
  });
};
```

With:
```javascript
const locationsModel = require('../models/locationsModel');

exports.getLocation = (req, res) => {
  const { busId } = req.params;

  // ✅ Validate input
  if (!busId || isNaN(busId)) {
    return res.status(400).json({ 
      error: 'Invalid bus ID',
      message: 'Bus ID must be a valid number'
    });
  }

  locationsModel.getBusLocation(busId, (err, row) => {
    if (err) {
      console.error('Error fetching location:', err);
      return res.status(500).json({ 
        error: 'Failed to fetch location',
        message: 'Database error'
      });
    }

    // ✅ Return 404 if location not found
    if (!row) {
      return res.status(404).json({
        error: 'Not found',
        message: 'No location data for this bus'
      });
    }

    res.status(200).json(row);
  });
};
```

---

### FIX #4: Update .env for Render

**File:** `server/.env`

Replace:
```
PORT=5000
```

With:
```
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**For Render deployment, add these variables in Render Dashboard:**
```
PORT = 5000
FRONTEND_URL = https://your-frontend.onrender.com
NODE_ENV = production
```

---

### FIX #5: Add Global Error Handler (Optional but Recommended)

**File:** `server/app.js`

Add at the end, before `module.exports = app;`:

```javascript
// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An error occurred' 
      : err.message
  });
});

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'Endpoint not found'
  });
});
```

---

## 4. 🚀 RENDER DEPLOYMENT CONFIGURATION

### Step 1: Prepare Render Settings

In Render Dashboard, create a **Web Service** with these settings:

| Setting | Value |
|---------|-------|
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Environment** | Node |
| **Node Version** | 18 (or 20) |

### Step 2: Set Environment Variables in Render

Go to **Environment** tab, add:

```
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.onrender.com
```

### Step 3: Database Strategy for Render

**Option A: Use Render's PostgreSQL (Recommended)** ⭐
- Free tier: 256MB storage, unlimited connections
- Persistent data across restarts
- Better than SQLite for production

**Option B: Keep SQLite (Current Approach)**
- Data resets on dyno restart (~15 mins idle)
- Fine for demo/testing
- No additional cost
- Data persists as long as dyno is awake

**For MVP/Demo, SQLite is fine.** But document this limitation.

### Step 4: Deploy on Render

```bash
# 1. Push code to GitHub (if not already)
git push origin main

# 2. Connect GitHub repo to Render
# - Go to Render Dashboard
# - New → Web Service
# - Select your GitHub repo
# - Configure build/start commands (from table above)
# - Add environment variables
# - Deploy

# 3. Monitor logs
# - Check Render dashboard for deployment status
# - View logs in real-time
```

### Step 5: Update Frontend CORS for Render

In `client/src/api/routes.js` and `client/src/api/stops.js`:

Replace hardcoded localhost URLs:
```javascript
// ❌ OLD
const response = await axios.get('http://localhost:5000/api/routes');

// ✅ NEW
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const response = await axios.get(`${API_URL}/api/routes`);
```

Add `.env` to frontend:
```
REACT_APP_API_URL=https://your-backend.onrender.com
```

---

## 5. 📋 FINAL DEPLOYMENT CHECKLIST

### Before Pushing to Render:

- [ ] **FIX #1:** Update CORS in `server/app.js`
- [ ] **FIX #2:** Add validation to `stopsController.js`
- [ ] **FIX #3:** Add validation to `locationsController.js`
- [ ] **FIX #4:** Update `server/.env`
- [ ] **FIX #5:** Add error handlers to `app.js` (optional but recommended)
- [ ] Verify package.json has correct start command: `"start": "node server.js"`
- [ ] Test locally: `npm run dev` for development, `npm start` for production
- [ ] Verify no console.log statements leak sensitive data
- [ ] Check `database/` folder exists and is committed

### Render Setup:

- [ ] Create Web Service on Render
- [ ] Connect GitHub repo
- [ ] Add build command: `npm install`
- [ ] Add start command: `npm start`
- [ ] Set environment variables (PORT, FRONTEND_URL, NODE_ENV)
- [ ] Deploy and monitor logs
- [ ] Update frontend FRONTEND_URL to point to Render backend
- [ ] Test all API endpoints from production frontend

---

## 6. SUMMARY TABLE

| Issue | File | Fix | Priority | Time |
|-------|------|-----|----------|------|
| CORS hardcoded | `app.js` | Add env variable | 🔴 Critical | 5 min |
| No input validation | `controllers/*.js` | Add isNaN checks | 🟡 Medium | 15 min |
| Bad error messages | `controllers/*.js` | Format error responses | 🟡 Medium | 10 min |
| No 404 handling | `controllers/*.js` | Check null results | 🟡 Medium | 10 min |
| No global error handler | `app.js` | Add middleware | 🟢 Optional | 5 min |
| DB file ephemeral | SQLite | Document or migrate to PostgreSQL | ℹ️ Info | N/A |

**Total Implementation Time:** ~45 minutes

---

## 7. POST-DEPLOYMENT TESTING

Once deployed on Render:

```bash
# Test health check
curl https://your-backend.onrender.com/api/health

# Test routes endpoint
curl https://your-backend.onrender.com/api/routes

# Test with invalid input (should return 400)
curl https://your-backend.onrender.com/api/stops/invalid

# Test with non-existent ID (should return 404)
curl https://your-backend.onrender.com/api/stops/999
```

---

## 8. PERFORMANCE NOTES

### Current Status:
- ✅ No N+1 queries
- ✅ Parameterized queries (safe & efficient)
- ✅ Lightweight dependencies

### Potential Improvements (Not needed for MVP):
- Connection pooling (for higher traffic)
- Response caching (GET endpoints could be cached)
- Database indexing (on frequently queried fields)

For demo with 3 buses, current setup is **more than sufficient**.

---

## 9. SECURITY NOTES

### Current Status:
- ✅ No SQL injection (parameterized queries)
- ✅ No hardcoded credentials
- ✅ CORS enabled (can be restricted)
- ✅ No sensitive data in error messages (with fix #5)

### Best Practices Applied:
- Input validation (with fixes)
- Proper HTTP status codes
- Error logging (doesn't expose internals)

---

## ✨ CONCLUSION

**Backend is ~90% ready for deployment.** 

Main blockers (marked with 🔴):
1. CORS must be fixed for Render frontend
2. SQLite file scope must be understood (ephemeral, OK for demo)

All fixes are simple and require no architectural changes.

**Estimated fix time: 45 minutes**

**Estimated deployment time: 5-10 minutes**

