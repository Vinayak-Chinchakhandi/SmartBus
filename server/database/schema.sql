-- ======================
-- SmartBus AI Database Schema (FINAL)
-- ======================

-- ======================
-- ROUTES
-- ======================
CREATE TABLE IF NOT EXISTS routes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ======================
-- STOPS
-- ======================
CREATE TABLE IF NOT EXISTS stops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  route_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  stop_order INTEGER NOT NULL,
  
  -- 🔥 Prevent duplicates per route
  UNIQUE(route_id, stop_order),

  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);

-- ======================
-- BUSES
-- ======================
CREATE TABLE IF NOT EXISTS buses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bus_number TEXT UNIQUE NOT NULL,
  capacity INTEGER NOT NULL,
  status TEXT DEFAULT 'active'
);

-- ======================
-- BUS LOCATIONS
-- ======================
CREATE TABLE IF NOT EXISTS bus_locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bus_id INTEGER NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  speed REAL DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE
);

-- ======================
-- TRIPS
-- ======================
CREATE TABLE IF NOT EXISTS trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bus_id INTEGER NOT NULL,
  route_id INTEGER NOT NULL,
  start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'scheduled',

  FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);