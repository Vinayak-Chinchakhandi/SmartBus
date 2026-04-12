import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function MainLayout() {
  return (
    <div className="flex h-screen">

      {/* Sidebar */}
      <Sidebar />

      {/* Right Section */}
      <div className="flex flex-col flex-1">

        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <div className="p-4 overflow-auto">
          <Outlet />   {/* 🔥 THIS IS REQUIRED */}
        </div>

      </div>
    </div>
  );
}

export default MainLayout;