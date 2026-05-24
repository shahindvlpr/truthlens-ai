import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { FiSearch, FiTrash2, FiFilter } from 'react-icons/fi';

const DetectionsList = () => {
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDetections();
  }, []);

  const fetchDetections = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/admin/detections', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setDetections(data.detections);
    } catch (err) {
      console.error('Failed to fetch detections:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteDetection = async (id) => {
    if (!window.confirm('Are you sure you want to delete this detection?')) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/admin/detections/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchDetections();
      }
    } catch (err) {
      console.error('Failed to delete detection:', err);
    }
  };

  const filteredDetections = detections.filter(detection => {
    const matchesSearch = detection.news_text?.toLowerCase().includes(search.toLowerCase()) ||
                          detection.user_name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || detection.prediction === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Detections</h1>
        <p className="text-gray-500">View and manage all news detections</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user or news content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('Fake')}
              className={`px-4 py-2 rounded-lg transition ${filter === 'Fake' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Fake
            </button>
            <button
              onClick={() => setFilter('Real')}
              className={`px-4 py-2 rounded-lg transition ${filter === 'Real' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Real
            </button>
          </div>
        </div>
      </div>

      {/* Detections Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">News Content</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Prediction</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Confidence</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDetections.map((detection) => (
                <tr key={detection.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">{detection.user_name}</p>
                      <p className="text-xs text-gray-500">{detection.user_email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-600 max-w-md line-clamp-2">{detection.news_text?.substring(0, 100)}...</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      detection.prediction === 'Fake' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {detection.prediction}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${detection.prediction === 'Fake' ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${detection.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{detection.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(detection.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => deleteDetection(detection.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DetectionsList;