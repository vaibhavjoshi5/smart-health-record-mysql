const { getPool } = require('../config/db');
function map(row) { return { _id: String(row.id), id: String(row.id), room: row.room, sender: row.sender, message: row.message, fileUrl: row.file_url, fileName: row.file_name, createdAt: row.created_at }; }
async function create({ room, sender, message, fileUrl, fileName }) { const [result] = await getPool().execute('INSERT INTO chat_messages (room, sender, message, file_url, file_name) VALUES (?, ?, ?, ?, ?)', [room, sender, message || null, fileUrl || null, fileName || null]); const [rows] = await getPool().execute('SELECT * FROM chat_messages WHERE id = ?', [result.insertId]); return map(rows[0]); }
async function findByRoom(room) { const [rows] = await getPool().execute('SELECT * FROM chat_messages WHERE room = ? ORDER BY created_at ASC, id ASC', [room]); return rows.map(map); }
module.exports = { create, findByRoom };
