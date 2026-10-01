const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { validateUserInput, parsePositiveId } = require('../utils/validation');

const router = express.Router();
router.use(requireAuth, requireRole('ADMIN'));

function sortClause(sortBy, order, allowed) {
  const column = allowed.includes(sortBy) ? sortBy : allowed[0];
  return ` ORDER BY ${column} ${order === 'desc' ? 'DESC' : 'ASC'}`;
}

router.get('/dashboard', async (req, res, next) => {
  try {
    const result = await pool.query("SELECT (SELECT COUNT(*) FROM users) AS \"totalUsers\", (SELECT COUNT(*) FROM stores) AS \"totalStores\", (SELECT COUNT(*) FROM ratings) AS \"totalRatings\"");
    res.json({ success: true, stats: result.rows[0] });
  } catch (error) { next(error); }
});

router.get('/users', async (req, res, next) => {
  try {
    const { name = '', email = '', role = '', sortBy = 'name', order = 'asc' } = req.query;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const values = [`%${name}%`, `%${email}%`];
    let query = 'SELECT id, name, email, address, role, created_at FROM users WHERE name ILIKE $1 AND email ILIKE $2';
    if (['ADMIN', 'NORMAL_USER', 'STORE_OWNER'].includes(role)) { values.push(role); query += ` AND role = $${values.length}`; }
    query += sortClause(sortBy, order, ['name', 'email', 'role', 'created_at']);
    values.push(limit, (page - 1) * limit);
    query += ` LIMIT $${values.length - 1} OFFSET $${values.length}`;
    const result = await pool.query(query, values);
    res.json({ success: true, users: result.rows, page, limit });
  } catch (error) { next(error); }
});

router.get('/users/:id', async (req, res, next) => {
  try {
    const id = parsePositiveId(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: 'Invalid user id' });
    const result = await pool.query('SELECT id, name, email, address, role, created_at FROM users WHERE id = $1', [id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: result.rows[0] });
  } catch (error) { next(error); }
});

router.post('/users', async (req, res, next) => {
  try {
    const { name, email, password, address, role } = req.body;
    const errors = validateUserInput({ name, email, password, address });
    if (!['ADMIN', 'NORMAL_USER', 'STORE_OWNER'].includes(role)) errors.role = 'Invalid role';
    if (Object.keys(errors).length) return res.status(400).json({ success: false, message: 'Please correct the form', errors });
    const result = await pool.query('INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role', [name.trim(), email.toLowerCase().trim(), await bcrypt.hash(password, 10), address.trim(), role]);
    res.status(201).json({ success: true, user: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ success: false, message: 'Email is already registered' });
    next(error);
  }
});

router.get('/stores', async (req, res, next) => {
  try {
    const { name = '', email = '', address = '', sortBy = 'name', order = 'asc' } = req.query;
    const values = [`%${name}%`, `%${email}%`, `%${address}%`];
    const query = `SELECT s.id, s.name, s.email, s.address, s.owner_id, u.name AS owner_name, COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS overall_rating FROM stores s JOIN users u ON u.id = s.owner_id LEFT JOIN ratings r ON r.store_id = s.id WHERE s.name ILIKE $1 AND s.email ILIKE $2 AND s.address ILIKE $3 GROUP BY s.id, u.name ORDER BY ${['name', 'email', 'address'].includes(sortBy) ? `s.${sortBy}` : 's.name'} ${order === 'desc' ? 'DESC' : 'ASC'}`;
    const result = await pool.query(query, values);
    res.json({ success: true, stores: result.rows });
  } catch (error) { next(error); }
});

router.post('/stores', async (req, res, next) => {
  try {
    const { name, email, address, ownerId } = req.body;
    const id = parsePositiveId(ownerId);
    if (!name || !email || !address || !id || address.length > 400) return res.status(400).json({ success: false, message: 'Store name, valid email, address, and owner are required' });
    const owner = await pool.query("SELECT id FROM users WHERE id = $1 AND role = 'STORE_OWNER'", [id]);
    if (!owner.rows[0]) return res.status(400).json({ success: false, message: 'ownerId must belong to a store owner' });
    const result = await pool.query('INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING *', [name.trim(), email.toLowerCase().trim(), address.trim(), id]);
    res.status(201).json({ success: true, store: result.rows[0] });
  } catch (error) { next(error); }
});

module.exports = router;
