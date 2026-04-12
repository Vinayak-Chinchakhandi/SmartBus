-- ======================
-- ROUTES
-- ======================
INSERT OR IGNORE INTO routes (id, name) VALUES
(1, 'Borivali to College'),
(2, 'Kurla to College'),
(3, 'Colaba to College');

-- ======================
-- STOPS - ROUTE 1 (North → South)
-- ======================
INSERT OR IGNORE INTO stops (route_id, name, latitude, longitude, stop_order) VALUES
(1, 'Borivali East', 19.2290, 72.8570, 1),
(1, 'Kandivali East', 19.2048, 72.8508, 2),
(1, 'Malad East', 19.1865, 72.8484, 3),
(1, 'Goregaon East', 19.1551, 72.8493, 4),
(1, 'Jogeshwari East', 19.1340, 72.8488, 5),
(1, 'Andheri East', 19.1197, 72.8464, 6),
(1, 'College Campus', 19.1100, 72.8500, 7);

-- ======================
-- STOPS - ROUTE 2 (East → BKC → College)
-- ======================
INSERT OR IGNORE INTO stops (route_id, name, latitude, longitude, stop_order) VALUES
(2, 'Kurla Station', 19.0726, 72.8796, 1),
(2, 'Nehru Nagar', 19.0655, 72.8840, 2),
(2, 'BKC Entry', 19.0600, 72.8700, 3),
(2, 'BKC Central', 19.0585, 72.8650, 4),
(2, 'Kalina', 19.0735, 72.8615, 5),
(2, 'Santacruz East', 19.0800, 72.8460, 6),
(2, 'College Campus', 19.1100, 72.8500, 7);

-- ======================
-- STOPS - ROUTE 3 (South → North)
-- ======================
INSERT OR IGNORE INTO stops (route_id, name, latitude, longitude, stop_order) VALUES
(3, 'Colaba', 18.9067, 72.8147, 1),
(3, 'Churchgate', 18.9322, 72.8264, 2),
(3, 'Marine Lines', 18.9430, 72.8230, 3),
(3, 'Mumbai Central', 18.9690, 72.8195, 4),
(3, 'Worli', 19.0176, 72.8174, 5),
(3, 'Dadar', 19.0180, 72.8430, 6),
(3, 'Bandra East', 19.0607, 72.8656, 7),
(3, 'College Campus', 19.1100, 72.8500, 8);

-- ======================
-- BUSES
-- ======================
INSERT OR IGNORE INTO buses (id, bus_number, capacity, status) VALUES
(1, 'MH-01-AB-1234', 40, 'active'),
(2, 'MH-02-CD-5678', 35, 'active'),
(3, 'MH-03-EF-9012', 50, 'active');

-- ======================
-- TRIPS (Each bus assigned to route)
-- ======================
INSERT OR IGNORE INTO trips (id, bus_id, route_id, status) VALUES
(1, 1, 1, 'running'),
(2, 2, 2, 'running'),
(3, 3, 3, 'running');

-- ======================
-- INITIAL BUS LOCATIONS
-- (Start from first stop of each route)
-- ======================
INSERT OR IGNORE INTO bus_locations (bus_id, latitude, longitude, speed) VALUES
(1, 19.2290, 72.8570, 30),
(2, 19.0726, 72.8796, 25),
(3, 18.9067, 72.8147, 20);