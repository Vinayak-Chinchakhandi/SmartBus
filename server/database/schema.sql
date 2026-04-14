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
-- BUSES (SIMPLIFIED)
-- ======================
CREATE TABLE IF NOT EXISTS buses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bus_number TEXT UNIQUE NOT NULL,
  route_id INTEGER NOT NULL,
  driver_name TEXT NOT NULL,
  driver_phone TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);

-- ======================
-- STOP LOGS (CORE FEATURE)
-- ======================
CREATE TABLE IF NOT EXISTS stop_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bus_id INTEGER NOT NULL,
  route_id INTEGER NOT NULL,
  stop_id INTEGER NOT NULL,
  arrival_time DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
  FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE CASCADE
);

-- ======================
-- TRIPS (ANALYTICS)
-- ======================
CREATE TABLE IF NOT EXISTS trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bus_id INTEGER NOT NULL,
  route_id INTEGER NOT NULL,
  trip_date DATE NOT NULL,
  trip_type TEXT CHECK(trip_type IN ('pickup', 'drop')) NOT NULL,
  status TEXT CHECK(status IN ('on_time', 'delayed')) DEFAULT 'on_time',

  FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);

-- ======================
-- SCHEDULES (WEEKLY)
-- ======================
CREATE TABLE IF NOT EXISTS schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  route_id INTEGER NOT NULL,
  day_of_week TEXT NOT NULL,
  trip_type TEXT CHECK(trip_type IN ('pickup', 'drop')) NOT NULL,
  pickup_time TIME NOT NULL,
  drop_time TIME NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);

-- ======================
-- ADMINS (AUTH)
-- ======================
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ======================
-- REROUTES
-- ======================
CREATE TABLE IF NOT EXISTS reroutes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  route_id INTEGER NOT NULL,
  reroute_path TEXT NOT NULL, -- JSON string
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);