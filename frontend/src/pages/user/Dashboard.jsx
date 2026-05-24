import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  FiActivity, FiAlertTriangle, FiCheckCircle, FiTrendingUp, 
  FiCalendar, FiClock, FiBarChart2, FiShield 
} from 'react-icons/fi';
import Card from '../../components/ui/Card';
import GradientText from '../../components/ui/GradientText';
import Button from '../../components/ui/Button';

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalChecks: 0, fakeCount: 0, realCount: 0, avgConfidence: 0, weeklyChecks: 0 });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const [statsRes, historyRes] = await Promise.all([
          axios.get(`${API_URL}/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/news/history`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setStats(statsRes.data.stats);
        setRecentActivity(historyRes.data.detections?.slice(0, 5) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { title: 'Total Detections', value: stats.totalChecks, icon: <FiActivity />, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { title: 'Fake News Found', value: stats.fakeCount, icon: <FiAlertTriangle />, color: 'from-red-500 to-orange-500', bg: 'bg-red-50 dark:bg-red-900/20' },
    { title: 'Real News', value: stats.realCount, icon: <FiCheckCircle />, color: 'from-green-500 to-emerald-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { title: 'Avg Confidence', value: `${stats.avgConfidence}%`, icon: <FiTrendingUp />, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative z-10">
            <p className="text-white/80 text-lg">Welcome back,</p>
            <h1 className="text-3xl md:text-4xl font-bold mt-1">{user?.name}</h1>
            <div className="flex items-center gap-2 mt-3">
              <FiShield />
              <span className="text-sm">Role: {user?.role === 'admin' ? 'Administrator' : 'Verified User'}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
          >
            <Card className="p-6 hover:shadow-2xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{card.title}</p>
                  <p className="text-3xl font-bold mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${card.bg} text-2xl`}>
                  {card.icon}
                </div>
              </div>
              <div className="mt-4 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full w-full bg-gradient-to-r ${card.color} rounded-full`} style={{ width: `${Math.min(100, (card.value / 100) * 100)}%` }}></div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
        <Card>
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FiClock className="text-blue-500" />
              Recent Activity
            </h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {recentActivity.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No detection yet. Start analyzing news!
              </div>
            ) : (
              recentActivity.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <div className="flex-1">
                    <p className="text-gray-700 dark:text-gray-300">{item.news_text?.substring(0, 100)}...</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.prediction === 'Fake' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {item.prediction}
                      </span>
                      <span className="text-gray-500">Confidence: {item.confidence}%</span>
                      <span className="text-gray-500">{new Date(item.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;