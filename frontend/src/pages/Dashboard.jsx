import React, { useState, useEffect } from 'react';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({ totalChecks: 0, fakeCount: 0, realCount: 0, avgConfidence: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:5000/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setStats(data.stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h1 style={{ marginBottom: '20px', fontSize: '28px' }}>Dashboard</h1>
        
        {/* Welcome Card */}
        <div style={{ 
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', 
          color: 'white', 
          padding: '25px', 
          borderRadius: '16px', 
          marginBottom: '30px' 
        }}>
          <p style={{ opacity: 0.9 }}>Welcome back,</p>
          <h2 style={{ margin: '5px 0', fontSize: '28px' }}>{user?.name}</h2>
          <p style={{ opacity: 0.9, fontSize: '14px', marginTop: '10px' }}>
            Role: {user?.role === 'admin' ? 'Administrator' : 'Verified User'}
          </p>
        </div>
        
        {/* Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px' 
        }}>
          <div style={{ backgroundColor: '#eff6ff', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '32px', color: '#3b82f6', margin: 0 }}>{stats.totalChecks}</h3>
            <p style={{ color: '#6b7280', marginTop: '8px' }}>Total Detections</p>
          </div>
          <div style={{ backgroundColor: '#fef2f2', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '32px', color: '#ef4444', margin: 0 }}>{stats.fakeCount}</h3>
            <p style={{ color: '#6b7280', marginTop: '8px' }}>Fake News Found</p>
          </div>
          <div style={{ backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '32px', color: '#22c55e', margin: 0 }}>{stats.realCount}</h3>
            <p style={{ color: '#6b7280', marginTop: '8px' }}>Real News</p>
          </div>
          <div style={{ backgroundColor: '#faf5ff', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '32px', color: '#8b5cf6', margin: 0 }}>{stats.avgConfidence}%</h3>
            <p style={{ color: '#6b7280', marginTop: '8px' }}>Avg Confidence</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;