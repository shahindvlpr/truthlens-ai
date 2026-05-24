import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-blue-600">🔍 TruthLens AI</Link>
      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <span className="text-gray-600">Hi, {user.name}</span>
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-1 rounded">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-blue-600">Login</Link>
            <Link to="/register" className="bg-blue-600 text-white px-4 py-1 rounded">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;