const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ============ DATABASE CONNECTION ============
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'truthlens_db',
    waitForConnections: true,
    connectionLimit: 10
}).promise();

// Create tables
const initDB = async () => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    await db.query(`
        CREATE TABLE IF NOT EXISTS detections (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            news_text TEXT NOT NULL,
            prediction VARCHAR(10) NOT NULL,
            confidence DECIMAL(5,2) NOT NULL,
            toxicity_score DECIMAL(5,2) DEFAULT 0,
            sentiment VARCHAR(20) DEFAULT 'Neutral',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);
    
    // Insert test user if not exists (password: 123456)
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', ['test@test.com']);
    if (existing.length === 0) {
        const hashed = await bcrypt.hash('123456', 10);
        await db.query('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', 
            ['Test User', 'test@test.com', hashed]);
    }
    
    // Insert admin user if not exists (password: admin123)
    const [adminExists] = await db.query('SELECT id FROM users WHERE email = ?', ['admin@truthlens.com']);
    if (adminExists.length === 0) {
        const hashedAdmin = await bcrypt.hash('admin123', 10);
        await db.query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', 
            ['Admin User', 'admin@truthlens.com', hashedAdmin, 'admin']);
        console.log('✅ Admin user created (admin@truthlens.com / admin123)');
    }
    
    console.log('✅ Database ready');
};
initDB();

// ============ HEALTH CHECK ============
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Backend running' });
});

// ============ AUTH ROUTES ============
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, error: 'Email already exists' });
        }
        const hashed = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
            [name, email, hashed]
        );
        const token = jwt.sign({ id: result.insertId, email }, process.env.JWT_SECRET);
        res.json({ success: true, token, user: { id: result.insertId, name, email, role: 'user' } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        const valid = await bcrypt.compare(password, users[0].password_hash);
        if (!valid) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: users[0].id, email }, process.env.JWT_SECRET);
        res.json({ success: true, token, user: { id: users[0].id, name: users[0].name, email: users[0].email, role: users[0].role } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/auth/me', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, error: 'No token' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [users] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);
        if (users.length === 0) {
            return res.status(401).json({ success: false, error: 'User not found' });
        }
        res.json({ success: true, user: users[0] });
    } catch (err) {
        res.status(401).json({ success: false, error: 'Invalid token' });
    }
});

// ============ NEWS DETECTION ROUTES ============
app.post('/api/news/detect', async (req, res) => {
    const { news_text, prediction, confidence, toxicity_score, sentiment } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, error: 'No token' });
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [result] = await db.query(
            'INSERT INTO detections (user_id, news_text, prediction, confidence, toxicity_score, sentiment) VALUES (?, ?, ?, ?, ?, ?)',
            [decoded.id, news_text, prediction, confidence, toxicity_score || 0, sentiment || 'Neutral']
        );
        res.json({ success: true, detection_id: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/news/history', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, error: 'No token' });
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [detections] = await db.query(
            'SELECT id, news_text, prediction, confidence, toxicity_score, sentiment, created_at FROM detections WHERE user_id = ? ORDER BY created_at DESC',
            [decoded.id]
        );
        res.json({ success: true, detections });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/dashboard/stats', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, error: 'No token' });
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [total] = await db.query('SELECT COUNT(*) as count FROM detections WHERE user_id = ?', [decoded.id]);
        const [fake] = await db.query('SELECT COUNT(*) as count FROM detections WHERE user_id = ? AND prediction = "Fake"', [decoded.id]);
        const [real] = await db.query('SELECT COUNT(*) as count FROM detections WHERE user_id = ? AND prediction = "Real"', [decoded.id]);
        const [avg] = await db.query('SELECT AVG(confidence) as avg_conf FROM detections WHERE user_id = ?', [decoded.id]);
        
        res.json({
            success: true,
            stats: {
                totalChecks: total[0].count,
                fakeCount: fake[0].count,
                realCount: real[0].count,
                avgConfidence: Math.round(avg[0].avg_conf || 0)
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============ ML API PROXY ============
app.post('/api/ml/predict', async (req, res) => {
    const { text } = req.body;
    try {
        const response = await axios.post(`${process.env.ML_API_URL}/predict`, { text });
        res.json(response.data);
    } catch (err) {
        // Mock response if ML service not available
        res.json({
            prediction: Math.random() > 0.5 ? 'Fake' : 'Real',
            confidence: Math.floor(Math.random() * 30) + 70,
            toxicity_score: Math.floor(Math.random() * 50),
            sentiment: ['Positive', 'Negative', 'Neutral'][Math.floor(Math.random() * 3)]
        });
    }
});

// ============ ADMIN MIDDLEWARE ============
const requireAdmin = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [users] = await db.query('SELECT role FROM users WHERE id = ?', [decoded.id]);
        
        if (users.length === 0) {
            return res.status(401).json({ success: false, error: 'User not found' });
        }
        
        if (users[0].role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin access required' });
        }
        
        req.userId = decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }
};

// ============ ADMIN ROUTES ============

// Get all users (admin only)
app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT id, name, email, role, created_at, 
                   (SELECT COUNT(*) FROM detections WHERE user_id = users.id) as detection_count 
            FROM users 
            ORDER BY created_at DESC
        `);
        res.json({ success: true, users });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get single user (admin only)
app.get('/api/admin/users/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const [users] = await db.query(`
            SELECT id, name, email, role, created_at,
                   (SELECT COUNT(*) FROM detections WHERE user_id = users.id) as detection_count 
            FROM users 
            WHERE id = ?
        `, [id]);
        
        if (users.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.json({ success: true, user: users[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Update user role (admin only)
app.put('/api/admin/users/:id/role', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ success: false, error: 'Invalid role. Must be "user" or "admin"' });
    }
    
    try {
        // Check if user exists
        const [users] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        
        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        res.json({ success: true, message: 'User role updated successfully' });
    } catch (err) {
        console.error('Error updating role:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Delete user (admin only)
app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (parseInt(id) === req.userId) {
        return res.status(400).json({ success: false, error: 'You cannot delete your own account' });
    }
    
    try {
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get all detections (admin only)
app.get('/api/admin/detections', requireAdmin, async (req, res) => {
    try {
        const [detections] = await db.query(`
            SELECT d.*, u.name as user_name, u.email as user_email 
            FROM detections d 
            JOIN users u ON d.user_id = u.id 
            ORDER BY d.created_at DESC
        `);
        res.json({ success: true, detections });
    } catch (err) {
        console.error('Error fetching detections:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get single detection (admin only)
app.get('/api/admin/detections/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const [detections] = await db.query(`
            SELECT d.*, u.name as user_name, u.email as user_email 
            FROM detections d 
            JOIN users u ON d.user_id = u.id 
            WHERE d.id = ?
        `, [id]);
        
        if (detections.length === 0) {
            return res.status(404).json({ success: false, error: 'Detection not found' });
        }
        res.json({ success: true, detection: detections[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Delete detection (admin only)
app.delete('/api/admin/detections/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM detections WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Detection not found' });
        }
        
        res.json({ success: true, message: 'Detection deleted successfully' });
    } catch (err) {
        console.error('Error deleting detection:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get system statistics (admin only)
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
    try {
        const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM users');
        const [totalDetections] = await db.query('SELECT COUNT(*) as count FROM detections');
        const [fakeDetections] = await db.query("SELECT COUNT(*) as count FROM detections WHERE prediction = 'Fake'");
        const [realDetections] = await db.query("SELECT COUNT(*) as count FROM detections WHERE prediction = 'Real'");
        const [todayDetections] = await db.query("SELECT COUNT(*) as count FROM detections WHERE DATE(created_at) = CURDATE()");
        const [avgConfidence] = await db.query('SELECT AVG(confidence) as avg FROM detections');
        const [recentUsers] = await db.query('SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)');
        
        res.json({
            success: true,
            stats: {
                totalUsers: totalUsers[0].count,
                totalDetections: totalDetections[0].count,
                fakeDetections: fakeDetections[0].count,
                realDetections: realDetections[0].count,
                todayDetections: todayDetections[0].count,
                avgConfidence: Math.round(avgConfidence[0].avg || 0),
                newUsersThisWeek: recentUsers[0].count
            }
        });
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get recent activity (admin only)
app.get('/api/admin/recent-activity', requireAdmin, async (req, res) => {
    try {
        const [recentDetections] = await db.query(`
            SELECT d.*, u.name as user_name 
            FROM detections d 
            JOIN users u ON d.user_id = u.id 
            ORDER BY d.created_at DESC 
            LIMIT 10
        `);
        
        const [recentUsers] = await db.query(`
            SELECT id, name, email, role, created_at 
            FROM users 
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        
        res.json({
            success: true,
            recentDetections,
            recentUsers
        });
    } catch (err) {
        console.error('Error fetching recent activity:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.url}` });
});

// Error handler middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(5000, () => {
    console.log('\n========================================');
    console.log('🚀 TruthLens Backend Server Running');
    console.log('========================================');
    console.log(`📍 API URL: http://localhost:5000`);
    console.log(`❤️  Health: http://localhost:5000/health`);
    console.log(`👑 Admin API: http://localhost:5000/api/admin`);
    console.log('========================================\n');
});