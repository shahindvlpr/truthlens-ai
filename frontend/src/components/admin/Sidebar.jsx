import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiHome, FiUsers, FiFileText, FiBarChart2, 
  FiSettings, FiLogOut, FiShield 
} from 'react-icons/fi';

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: <FiHome /> },
    { path: '/admin/users', label: 'Users', icon: <FiUsers /> },
    { path: '/admin/detections', label: 'Detections', icon: <FiFileText /> },
    { path: '/admin/stats', label: 'Statistics', icon: <FiBarChart2 /> },
    { path: '/admin/settings', label: 'Settings', icon: <FiSettings /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-72 bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen fixed left-0 top-0 text-white shadow-2xl">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
            <FiShield className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold">TruthLens AI</h1>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="p-4">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-300 ${
              isActive(item.path)
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/20 transition-all duration-300"
        >
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;