const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { parsePositiveId } = require('../utils/validation');

const router = express.Router();
router.use(requireAuth, requireRole('NORMAL_USER'));

router.get('/', async (req, res, next) => {
  try {
    const { search = '', name = '', address = '', sortBy = 'name', order = 'asc' } = req.query;
    const term = search || '';
    const sortColumn = ['name', 'address'].includes(sortBy) ? sortBy : 'name';
    const direction = order === 'desc' ? 'DESC' : 'ASC';
    const result = await pool.query(`SELECT s.id, s.name, s.email, s.address, COALESCE(ROUND(AVG(all_ratings.rating)::numeric, 2), 0) AS \"overallRating\", my_rating.rating AS \"myRating\" FROM stores s LEFT JOIN ratings all_ratings ON all_ratings.store_id = s.id LEFT JOIN ratings my_rating ON my_rating.store_id = s.id AND my_rating.user_id = $1 WHERE s.name ILIKE $2 AND s.name ILIKE $3 AND s.address ILIKE $4 GROUP BY s.id, my_rating.rating ORDER BY s.${sortColumn} ${direction}`, [req.user.id, `%${term}%`, `%${name}%`, `%${address}%`]);
    res.json({ success: true, stores: result.rows });
  } catch (error) { next(error); }
});

async function saveRating(req, res, next) {
  try {
    const storeId = parsePositiveId(req.params.storeId);
    const rating = Number(req.body.rating);
    if (!storeId || !Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Store id and rating from 1 to 5 are required' });
    const store = await pool.query('SELECT id FROM stores WHERE id = $1', [storeId]);
    if (!store.rows[0]) return res.status(404).json({ success: false, message: 'Store not found' });
    const result = await pool.query('INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3) ON CONFLICT (user_id, store_id) DO UPDATE SET rating = EXCLUDED.rating, updated_at = NOW() RETURNING *', [req.user.id, storeId, rating]);
    res.json({ success: true, rating: result.rows[0] });
  } catch (error) { next(error); }
}

router.post('/:storeId/ratings', saveRating);
router.put('/:storeId/ratings', saveRating);

module.exports = router;
