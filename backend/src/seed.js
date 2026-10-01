require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const pool = require('./config/db');

async function seed() {
  const schema = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8');
  await pool.query('DROP TABLE IF EXISTS ratings, stores, users CASCADE');
  await pool.query('DROP TYPE IF EXISTS user_role CASCADE');
  await pool.query(schema);
  const password = await bcrypt.hash('Password1!', 10);
  const users = [
    ['System Administrator Account', 'admin@example.com', 'ADMIN'],
    ['Aarav Sharma Normal User', 'aarav@example.com', 'NORMAL_USER'],
    ['Meera Patel Normal User', 'meera@example.com', 'NORMAL_USER'],
    ['Northside Market Owner', 'owner1@example.com', 'STORE_OWNER'],
    ['City Center Grocer Owner', 'owner2@example.com', 'STORE_OWNER']
  ];
  const ids = {};
  for (const [name, email, role] of users) {
    const result = await pool.query('INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id', [name, email, password, '42 Example Avenue, Mumbai', role]);
    ids[email] = result.rows[0].id;
  }
  const stores = [
    ['Northside Market', 'northside@example.com', '12 Hill Road, Mumbai', ids['owner1@example.com']],
    ['City Center Grocer', 'citycenter@example.com', '88 Central Street, Mumbai', ids['owner2@example.com']],
    ['Green Basket Foods', 'greenbasket@example.com', '5 Lake View Road, Pune', ids['owner1@example.com']]
  ];
  const storeIds = [];
  for (const store of stores) {
    const result = await pool.query('INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING id', store);
    storeIds.push(result.rows[0].id);
  }
  await pool.query('INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, 5), ($1, $3, 4), ($4, $2, 3)', [ids['aarav@example.com'], storeIds[0], storeIds[1], ids['meera@example.com']]);
  console.log('Seed complete. All accounts use Password1!');
}

seed().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => pool.end());
