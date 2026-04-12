import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';

// USER
import Dashboard from '../pages/user/Dashboard';
import LiveTracking from '../pages/user/LiveTracking';
import RouteSelection from '../pages/user/RouteSelection';
import Alerts from '../pages/user/Alerts';
import MyTrip from '../pages/user/MyTrip';

// ADMIN
import AdminDashboard from '../pages/admin/Dashboard';
import LiveMonitor from '../pages/admin/LiveMonitor';
import RouteManagement from '../pages/admin/RouteManagement';
import RerouteControl from '../pages/admin/RerouteControl';
import Analytics from '../pages/admin/Analytics';

// LOGIN
import AdminLogin from '../pages/AdminLogin';

function AppRouter() {
  return (
    <Routes>

      {/* 🔐 ADMIN LOGIN (NO LAYOUT) */}
      <Route path="/admin-login" element={<AdminLogin />} />

      {/* 👤 USER ROUTES */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="tracking" element={<LiveTracking />} />
        <Route path="route" element={<RouteSelection />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="trip" element={<MyTrip />} />
      </Route>

      {/* 🔐 ADMIN ROUTES (PROTECTED FIRST, THEN LAYOUT) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="monitor" element={<LiveMonitor />} />
        <Route path="routes" element={<RouteManagement />} />
        <Route path="reroute" element={<RerouteControl />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>

    </Routes>
  );
}

export default AppRouter;