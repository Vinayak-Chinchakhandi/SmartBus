const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();

// ======================
// 🔥 REQUEST LOGGER (VERY IMPORTANT)
// ======================
app.use((req, res, next) => {
  console.log(`🔥 Incoming: ${req.method} ${req.url}`);
  next();
});

// ======================
// ✅ MIDDLEWARE
// ======================
app.use(cors());
app.use(express.json());

// ======================
// ✅ ROUTES
// ======================
const routesRoute = require('./routes/routes');
const stopsRoute = require('./routes/stops');
const busesRoute = require('./routes/buses');
const locationsRoute = require('./routes/locations');

app.use('/api/routes', routesRoute);
app.use('/api/stops', stopsRoute);
app.use('/api/buses', busesRoute);
app.use('/api/location', locationsRoute);

// ======================
// 🔥 HEALTH CHECK (SAFE)
// ======================
app.get('/api/health', (req, res) => {
  try {
    console.log("✅ HEALTH ROUTE HIT");

    res.status(200).json({
      status: 'ok',
      message: 'SmartBus backend running',
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error("❌ Health error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ======================
// ✅ ROOT ROUTE (IMPORTANT FOR RAILWAY)
// ======================
app.get('/', (req, res) => {
  res.send('SmartBus Backend is Running 🚀');
});

// ======================
// ✅ 404 HANDLER
// ======================
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    path: req.path
  });
});

// ======================
// 🔥 GLOBAL ERROR HANDLER
// ======================
app.use((err, req, res, next) => {
  console.error('❌ Express Error:', err);

  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

module.exports = app;