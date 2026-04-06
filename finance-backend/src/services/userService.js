const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { query, run, queryOne } = require('../models/db');

const SAFE_FIELDS = 'id, name, email, role, status, created_at, updated_at';

const getAllUsers = () => {
  return query(`SELECT ${SAFE_FIELDS} FROM users ORDER BY created_at DESC`);
};

const getUserById = (id) => {
  const user = queryOne(`SELECT ${SAFE_FIELDS} FROM users WHERE id = ?`, [id]);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return user;
};

/**
 * Create a new user (admin only).
 */
const createUser = async ({ name, email, password, role = 'viewer' }) => {
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

  return queryOne(`SELECT ${SAFE_FIELDS} FROM users WHERE id = ?`, [id]);
};

/**
 * Update user name, role, or status (admin only).
 */
const updateUser = (id, { name, role, status }) => {
  const user = queryOne('SELECT id FROM users WHERE id = ?', [id]);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const validRoles = ['viewer', 'analyst', 'admin'];
  if (role && !validRoles.includes(role)) {
    const err = new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    err.status = 400;
    throw err;
  }

  const validStatuses = ['active', 'inactive'];
  if (status && !validStatuses.includes(status)) {
    const err = new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    err.status = 400;
    throw err;
  }

  const now = new Date().toISOString();
  const fields = [];
  const values = [];

  if (name) { fields.push('name = ?'); values.push(name); }
  if (role) { fields.push('role = ?'); values.push(role); }
  if (status) { fields.push('status = ?'); values.push(status); }
  fields.push('updated_at = ?'); values.push(now);
  values.push(id);

  run(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);

  return queryOne(`SELECT ${SAFE_FIELDS} FROM users WHERE id = ?`, [id]);
};

/**
 * Delete a user. Prevents self-deletion.
 */
const deleteUser = (id, requestingUserId) => {
  if (id === requestingUserId) {
    const err = new Error('You cannot delete your own account');
    err.status = 400;
    throw err;
  }

  const user = queryOne('SELECT id FROM users WHERE id = ?', [id]);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  run('DELETE FROM users WHERE id = ?', [id]);
  return { message: 'User deleted successfully' };
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
