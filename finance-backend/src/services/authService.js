const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query, run, queryOne } = require('../models/db');

/**
 * Register a new user.
 * Default role is 'viewer'. Admins can set other roles via the users API.
 */
const register = async ({ name, email, password, role = 'viewer' }) => {
  const existing = queryOne('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) {
    const err = new Error('Email already in use');
    err.status = 409;
    throw err;
  }

  const validRoles = ['viewer', 'analyst', 'admin'];
  if (!validRoles.includes(role)) {
    const err = new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    err.status = 400;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const id = uuidv4();
  const now = new Date().toISOString();

  run(
    `INSERT INTO users (id, name, email, password, role, status, created_at)
     VALUES (?, ?, ?, ?, ?, 'active', ?)`,
    [id, name, email, hashedPassword, role, now]
  );

  return queryOne('SELECT id, name, email, role, status, created_at FROM users WHERE id = ?', [id]);
};

/**
 * Login with email + password. Returns a signed JWT and the user profile.
 */
const login = async ({ email, password }) => {
  const user = queryOne('SELECT * FROM users WHERE email = ?', [email]);

  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  if (user.status !== 'active') {
    const err = new Error('Account is inactive');
    err.status = 403;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  const { password: _, ...safeUser } = user;
  return { token, user: safeUser };
};

module.exports = { register, login };
