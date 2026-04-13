import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

function Sidebar() {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const handleAdminAccess = () => {
    navigate('/admin-login');
  };

  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-6 flex-1">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Navigation</h2>
        <div className="space-y-2">
          <div>
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">User</h3>
            <nav className="space-y-1">
              <NavLink
                to="/tracking"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                Live Tracking
              </NavLink>
              <NavLink
                to="/route"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                Route Selection
              </NavLink>
              <NavLink
                to="/alerts"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                Alerts
              </NavLink>
              <NavLink
                to="/schedule"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                Schedule
              </NavLink>
            </nav>
          </div>
          {isAdmin && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">Admin</h3>
              <nav className="space-y-1">
                <NavLink
                  to="/admin/dashboard"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-sm font-medium ${
                      isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  Admin Dashboard
                </NavLink>
                <NavLink
                  to="/admin/monitor"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-sm font-medium ${
                      isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  Live Monitor
                </NavLink>
                <NavLink
                  to="/admin/routes"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-sm font-medium ${
                      isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  Route Management
                </NavLink>
                <NavLink
                  to="/admin/reroute"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-sm font-medium ${
                      isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  Reroute Control
                </NavLink>
                <NavLink
                  to="/admin/schedule"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-sm font-medium ${
                      isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  Schedule Management
                </NavLink>
              </nav>
            </div>
          )}
        </div>
      </div>
      <div className="p-6 border-t">
        {!isAdmin ? (
          <button
            onClick={handleAdminAccess}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Admin Access
          </button>
        ) : (
          <p className="text-sm text-green-600 font-medium">✓ Admin Access Granted</p>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;