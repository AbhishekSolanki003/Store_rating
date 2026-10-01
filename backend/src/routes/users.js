const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { validatePassword } = require('../utils/validation');

const router = express.Router();

router.put('/password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!validatePassword(newPassword)) return res.status(400).json({ success: false, message: 'New password must be 8-16 characters with an uppercase letter and special character' });
    const result = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    if (!result.rows[0] || !(await bcrypt.compare(currentPassword || '', result.rows[0].password))) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    await pool.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [await bcrypt.hash(newPassword, 10), req.user.id]);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) { next(error); }
});

module.exports = router;