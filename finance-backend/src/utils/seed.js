require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { initDb, run, query } = require('../models/db');

const USERS = [
  { name: 'Alice Admin',   email: 'admin@finance.dev',   password: 'admin123',   role: 'admin'   },
  { name: 'Ana Analyst',   email: 'analyst@finance.dev', password: 'analyst123', role: 'analyst' },
  { name: 'Victor Viewer', email: 'viewer@finance.dev',  password: 'viewer123',  role: 'viewer'  },
];

const CATEGORIES = ['Salary', 'Freelance', 'Rent', 'Utilities', 'Groceries', 'Transport', 'Healthcare', 'Entertainment', 'Investment', 'Miscellaneous'];

function randomBetween(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function randomDate(start, end) {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString().split('T')[0];
}

async function seed() {
  await initDb();

  // Clear existing data
  run('DELETE FROM transactions');
  run('DELETE FROM users');
  console.log('🗑  Cleared existing data');

  // Seed users
  const userIds = {};
  for (const u of USERS) {
    const id = uuidv4();
    const hashed = await bcrypt.hash(u.password, 10);
    run(
      `INSERT INTO users (id, name, email, password, role, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'active', ?)`,
      [id, u.name, u.email, hashed, u.role, new Date().toISOString()]
    );
    userIds[u.role] = id;
    console.log(`👤 Created ${u.role}: ${u.email} / ${u.password}`);
  }

  // Seed transactions (60 records spread across last 12 months)
  const now = new Date();
  const yearAgo = new Date(now);
  yearAgo.setFullYear(now.getFullYear() - 1);

  const INCOME_CATEGORIES  = ['Salary', 'Freelance', 'Investment'];
  const EXPENSE_CATEGORIES = ['Rent', 'Utilities', 'Groceries', 'Transport', 'Healthcare', 'Entertainment', 'Miscellaneous'];

  let count = 0;
  for (let i = 0; i < 60; i++) {
    const isIncome = Math.random() > 0.45;
    const type     = isIncome ? 'income' : 'expense';
    const category = isIncome
      ? INCOME_CATEGORIES[Math.floor(Math.random() * INCOME_CATEGORIES.length)]
      : EXPENSE_CATEGORIES[Math.floor(Math.random() * EXPENSE_CATEGORIES.length)];
    const amount   = isIncome ? randomBetween(500, 8000) : randomBetween(50, 2000);
    const date     = randomDate(yearAgo, now);
    const createdBy = userIds['admin'];
    const id       = uuidv4();
    const ts       = new Date().toISOString();

    run(
      `INSERT INTO transactions (id, amount, type, category, date, notes, created_by, deleted, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      [id, amount, type, category, date, `${category} ${type} entry`, createdBy, ts, ts]
    );
    count++;
  }

  console.log(`💳 Inserted ${count} transactions`);
  console.log('\n✅ Seed complete! You can now run: npm start');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
