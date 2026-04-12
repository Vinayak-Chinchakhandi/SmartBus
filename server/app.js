const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();

// ✅ MIDDLEWARE FIRST
// Configure CORS for development and production
const allowedOrigins = [
  'http://localhost:5173',           // Local development
  'http://localhost:3000',           // Alternative local port
  process.env.FRONTEND_URL           // Production frontend
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
}));
app.use(express.json());

// ✅ ROUTES AFTER
const routesRoute = require('./routes/routes');
const stopsRoute = require('./routes/stops');
const busesRoute = require('./routes/buses');
const locationsRoute = require('./routes/locations');

app.use('/api/routes', routesRoute);
app.use('/api/stops', stopsRoute);
app.use('/api/buses', busesRoute);
app.use('/api/location', locationsRoute);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'SmartBus backend running',
    timestamp: new Date().toISOString()
  });
});

// ✅ Global 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    path: req.path
  });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  // Handle CORS errors
  if (err.message === 'CORS not allowed') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'CORS policy violation'
    });
  }
  
  res.status(err.status || 500).json({
    error: err.status ? err.message : 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An error occurred processing your request' 
      : err.message
  });
});

module.exports = app;