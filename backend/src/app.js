require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const storeRoutes = require('./routes/stores');
const ownerRoutes = require('./routes/owner');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Store Rating API is running' });
});

app.get('/api/health/db', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ success: true, message: 'PostgreSQL connection is working' });
  } catch (error) {
    res.status(503).json({ success: false, message: 'PostgreSQL connection failed' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/owner', ownerRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((error, req, res, next) => {
  console.error(error);
  if (['28P01', '3D000', 'ECONNREFUSED'].includes(error.code)) {
    return res.status(503).json({ success: false, message: 'Database is not configured or unavailable. Check backend/.env and PostgreSQL.' });
  }
  res.status(500).json({ success: false, message: 'Unexpected server error' });
});

module.exports = app;
