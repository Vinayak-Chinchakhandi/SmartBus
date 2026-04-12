require('dotenv').config();

// 🔥 CRITICAL DEBUG (ADD THIS)
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION:', err);
});

const app = require('./app');

const PORT = process.env.PORT || 8080;

// 🔥 IMPORTANT (Railway)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SmartBus backend running on port ${PORT}`);
});