import { Routes, Route, Navigate } from "react-router-dom";

import AdminLogin from "../pages/AdminLogin";
import MainLayout from "../layout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

import AdminDashboard from "../pages/admin/Dashboard";
import LiveMonitor from "../pages/admin/LiveMonitor";
import RouteManagement from "../pages/admin/RouteManagement";
import RerouteControl from "../pages/admin/RerouteControl";
import ScheduleManagement from "../pages/admin/ScheduleManagement";

function AppRouter() {
  return (
    <Routes>
      {/* DEFAULT REDIRECT */}
      <Route path="/" element={<Navigate to="/admin-login" />} />

      {/* LOGIN */}
      <Route path="/admin-login" element={<AdminLogin />} />

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="monitor" element={<LiveMonitor />} />
        <Route path="routes" element={<RouteManagement />} />
        <Route path="reroute" element={<RerouteControl />} />
        <Route path="schedule" element={<ScheduleManagement />} />
      </Route>
    </Routes>
  );
}

export default AppRouter;