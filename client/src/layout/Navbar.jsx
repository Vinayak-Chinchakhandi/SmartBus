import React from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 sticky top-0 z-10 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-blue-600">SmartBus AI</h1>
      {isAdmin && (
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
        >
          Logout
        </button>
      )}
    </nav>
  );
}

export default Navbar;