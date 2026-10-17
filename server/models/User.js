const { getPool } = require('../config/db');
const { user } = require('./helpers');
const fields = 'id, name, email, password_hash, role, blood_group, allergies, chronic_diseases, emergency_contact, reset_token, reset_token_expiry, created_at, updated_at';
async function one(sql, params = []) { const [rows] = await getPool().execute(sql, params); return user(rows[0]); }
async function findByEmail(email) { return one(`SELECT ${fields} FROM users WHERE email = ?`, [email]); }
async function findById(id) { return one(`SELECT ${fields} FROM users WHERE id = ?`, [id]); }
async function findDoctorById(id) { return one(`SELECT ${fields} FROM users WHERE id = ? AND role = 'doctor'`, [id]); }
async function create({ name, email, password, role = 'patient' }) { const [result] = await getPool().execute('INSERT INTO users (name, email, password_hash, role, allergies, chronic_diseases) VALUES (?, ?, ?, ?, ?, ?)', [name, email, password, role, JSON.stringify([]), JSON.stringify([])]); return findById(result.insertId); }
async function listDoctors() { const [rows] = await getPool().execute("SELECT id, name, email, password_hash, role, blood_group, allergies, chronic_diseases, emergency_contact, reset_token, reset_token_expiry, created_at, updated_at FROM users WHERE role = 'doctor' ORDER BY name"); return rows.map(user); }
async function updateProfile(id, values) { await getPool().execute('UPDATE users SET name = ?, blood_group = ?, allergies = ?, chronic_diseases = ?, emergency_contact = ? WHERE id = ?', [values.name, values.bloodGroup || null, JSON.stringify(values.allergies || []), JSON.stringify(values.chronicDiseases || []), JSON.stringify(values.emergencyContact || null), id]); return findById(id); }
async function setResetToken(id, token, expiresAt) { await getPool().execute('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?', [token, expiresAt, id]); }
async function findValidResetToken(token) { return one(`SELECT ${fields} FROM users WHERE reset_token = ? AND reset_token_expiry > UTC_TIMESTAMP()`, [token]); }
async function resetPassword(id, password) { await getPool().execute('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?', [password, id]); }
module.exports = { findByEmail, findById, findDoctorById, create, listDoctors, updateProfile, setResetToken, findValidResetToken, resetPassword };
