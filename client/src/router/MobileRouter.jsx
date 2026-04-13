import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';

// USER ONLY
import LiveTracking from '../pages/user/LiveTracking';
import RouteSelection from '../pages/user/RouteSelection';
import Alerts from '../pages/user/Alerts';
import Schedule from '../pages/user/Schedule';

function MobileRouter() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<LiveTracking />} />
        <Route path="tracking" element={<LiveTracking />} />
        <Route path="route" element={<RouteSelection />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="schedule" element={<Schedule />} />
      </Route>
    </Routes>
  );
}

export default MobileRouter;