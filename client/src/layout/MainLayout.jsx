import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function MainLayout() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 📱 MOBILE LAYOUT
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen">

        {/* 🔝 TOP BAR */}
        <div className="flex justify-between items-center px-4 py-3 bg-white shadow">
          <h1 className="text-lg font-bold">🚌 SDM Connect</h1>
          <button onClick={() => navigate('/alerts')} className="text-xl">
            🔔
          </button>
        </div>

        {/* 📄 CONTENT */}
        <div className="flex-1 overflow-auto p-3">
          <Outlet />
        </div>

        {/* 🔻 BOTTOM NAV */}
        <div className="flex justify-around items-center bg-white border-t py-2">
          <button onClick={() => navigate('/tracking')} className={navStyle(location, '/tracking')}>
            📍
            <span className="text-xs">Track</span>
          </button>
          <button onClick={() => navigate('/route')} className={navStyle(location, '/route')}>
            🛣️
            <span className="text-xs">Route</span>
          </button>
          <button onClick={() => navigate('/schedule')} className={navStyle(location, '/schedule')}>
            🕒
            <span className="text-xs">Schedule</span>
          </button>
        </div>
      </div>
    );
  }

  // 💻 DESKTOP (UNCHANGED)
  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Navbar />

        <div className="p-4 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

// 🔥 active nav style
function navStyle(location, path) {
  return `flex flex-col items-center text-sm ${
    location.pathname.includes(path)
      ? 'text-blue-600 font-semibold'
      : 'text-gray-500'
  }`;
}

export default MainLayout;