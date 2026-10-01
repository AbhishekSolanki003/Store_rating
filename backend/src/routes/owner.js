const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireRole('STORE_OWNER'));

router.get('/dashboard', async (req, res, next) => {
  try {
    const storesResult = await pool.query('SELECT s.id, s.name, COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS average_rating FROM stores s LEFT JOIN ratings r ON r.store_id = s.id WHERE s.owner_id = $1 GROUP BY s.id, s.name ORDER BY s.name', [req.user.id]);
    const ratingsResult = await pool.query('SELECT s.id AS store_id, r.rating, r.created_at, u.name AS user_name, u.email AS user_email FROM stores s JOIN ratings r ON r.store_id = s.id JOIN users u ON u.id = r.user_id WHERE s.owner_id = $1 ORDER BY r.created_at DESC', [req.user.id]);
    const stores = {};
    for (const row of storesResult.rows) {
      stores[row.id] = { id: row.id, name: row.name, averageRating: row.average_rating, ratings: [] };
    }
    for (const row of ratingsResult.rows) {
      stores[row.store_id].ratings.push({ userName: row.user_name, email: row.user_email, rating: row.rating, date: row.created_at });
    }
    res.json({ success: true, stores: Object.values(stores) });
  } catch (error) { next(error); }
});

module.exports = router;
