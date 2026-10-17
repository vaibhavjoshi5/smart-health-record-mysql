const { getPool } = require('../config/db');
const { appointment } = require('./helpers');
const select = 'SELECT a.*, p.name AS patient_name, d.name AS doctor_name FROM appointments a INNER JOIN users p ON p.id = a.patient_id INNER JOIN users d ON d.id = a.doctor_id';
async function create({ patientId, doctorId, date, time }) { const [result] = await getPool().execute('INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time) VALUES (?, ?, ?, ?)', [patientId, doctorId, date, time]); return findById(result.insertId); }
async function findById(id) { const [rows] = await getPool().execute(`${select} WHERE a.id = ?`, [id]); return appointment(rows[0]); }
async function findByPatient(patientId) { const [rows] = await getPool().execute(`${select} WHERE a.patient_id = ? ORDER BY a.appointment_date DESC, a.appointment_time DESC`, [patientId]); return rows.map(appointment); }
async function findByDoctor(doctorId) { const [rows] = await getPool().execute(`${select} WHERE a.doctor_id = ? ORDER BY a.appointment_date DESC, a.appointment_time DESC`, [doctorId]); return rows.map(appointment); }
async function updateStatus(id, doctorId, status) { const [result] = await getPool().execute('UPDATE appointments SET status = ? WHERE id = ? AND doctor_id = ?', [status, id, doctorId]); return result.affectedRows ? findById(id) : null; }
async function cancel(id) { await getPool().execute("UPDATE appointments SET status = 'cancelled' WHERE id = ?", [id]); return findById(id); }
module.exports = { create, findById, findByPatient, findByDoctor, updateStatus, cancel };
