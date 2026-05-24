import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { 
  FiUsers, FiFileText, FiAlertTriangle, FiTrendingUp, 
  FiActivity, FiCalendar, FiUserCheck 
} from 'react-icons/fi';

const StatCard = ({ title, value, icon, color, trend }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {trend && (
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <FiTrendingUp /> +{trend} from last week
            </p>
          )}
        </div>
        <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center shadow-md`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDetections: 0,
    fakeDetections: 0,
    todayDetections: 0,
    avgConfidence: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentDetections, setRecentDetections] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [statsRes, usersRes, detectionsRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/admin/detections', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const detectionsData = await detectionsRes.json();

      if (statsData.success) setStats(statsData.stats);
      if (usersData.success) setRecentUsers(usersData.users.slice(0, 5));
      if (detectionsData.success) setRecentDetections(detectionsData.detections.slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: <FiUsers className="text-white text-xl" />, color: 'from-blue-500 to-cyan-500', trend: '12' },
    { title: 'Total Detections', value: stats.totalDetections, icon: <FiFileText className="text-white text-xl" />, color: 'from-purple-500 to-pink-500', trend: '8' },
    { title: 'Fake Detections', value: stats.fakeDetections, icon: <FiAlertTriangle className="text-white text-xl" />, color: 'from-red-500 to-orange-500' },
    { title: 'Today\'s Detections', value: stats.todayDetections, icon: <FiCalendar className="text-white text-xl" />, color: 'from-green-500 to-emerald-500' },
    { title: 'Avg Confidence', value: `${stats.avgConfidence}%`, icon: <FiActivity className="text-white text-xl" />, color: 'from-indigo-500 to-purple-500' },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {statCards.map((card, idx) => (
          <StatCard key={idx} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FiUserCheck className="text-indigo-500" />
              Recent Users
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentUsers.map((user) => (
              <div key={user.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                <div>
                  <p className="font-medium text-gray-800">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role}
                  </span>
                  <span className="text-xs text-gray-400">{user.detection_count} detections</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Detections */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FiFileText className="text-indigo-500" />
              Recent Detections
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentDetections.map((detection) => (
              <div key={detection.id} className="px-6 py-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-800">{detection.user_name}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    detection.prediction === 'Fake' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {detection.prediction}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{detection.news_text?.substring(0, 100)}...</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>Confidence: {detection.confidence}%</span>
                  <span>{new Date(detection.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;