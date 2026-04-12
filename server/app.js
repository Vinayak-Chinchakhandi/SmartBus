const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();

// ======================
// ✅ MIDDLEWARE
// ======================

// 🔥 Allow all origins (fixes Railway 502 issue)
app.use(cors());

// Parse JSON
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
// ✅ HEALTH CHECK (IMPORTANT)
// ======================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'SmartBus backend running',
    timestamp: new Date().toISOString()
  });
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
// ✅ GLOBAL ERROR HANDLER
// ======================
app.use((err, req, res, next) => {
  console.error('Error:', err.message);

  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : err.message
  });
});


// ======================
// EXPORT
// ======================
module.exports = app;