const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { validateUserInput } = require('../utils/validation');

const router = express.Router();

function createToken(user) { return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' }); }
function publicUser(user) { return { id: user.id, name: user.name, email: user.email, address: user.address, role: user.role }; }

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, address } = req.body;
    const errors = validateUserInput({ name, email, password, address });
    if (Object.keys(errors).length) return res.status(400).json({ success: false, message: 'Please correct the form', errors });
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query('INSERT INTO users (name, email, password, address) VALUES ($1, $2, $3, $4) RETURNING id, name, email, address, role', [name.trim(), email.toLowerCase().trim(), hashedPassword, address.trim()]);
    const user = result.rows[0];
    res.status(201).json({ success: true, user: publicUser(user), token: createToken(user) });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ success: false, message: 'Email is already registered' });
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(req.body.password || '', user.password))) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    res.json({ success: true, user: publicUser(user), token: createToken(user) });
  } catch (error) { next(error); }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query('SELECT id, name, email, address, role FROM users WHERE id = $1', [req.user.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: result.rows[0] });
  } catch (error) { next(error); }
});

module.exports = router;