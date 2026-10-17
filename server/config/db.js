const mysql = require('mysql2/promise');
const logger = require('./logger');

let pool;
let connected = false;

function sslConfig() {
  if (process.env.MYSQL_SSL !== 'true') return undefined;
  const ca = process.env.MYSQL_SSL_CA;
  return ca ? { ca: ca.replace(/\\n/g, '\n'), rejectUnauthorized: true } : { rejectUnauthorized: true };
}

async function initializeSchema(connection) {
  await connection.query(`CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, role ENUM('patient','doctor') NOT NULL DEFAULT 'patient',
    blood_group VARCHAR(12) NULL, allergies JSON NULL, chronic_diseases JSON NULL, emergency_contact JSON NULL,
    reset_token VARCHAR(128) NULL UNIQUE, reset_token_expiry DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  await connection.query(`CREATE TABLE IF NOT EXISTS medical_records (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT UNSIGNED NOT NULL, doctor_id BIGINT UNSIGNED NULL, record_date DATE NOT NULL,
    symptoms TEXT NULL, diagnosis TEXT NULL, doctor_notes TEXT NULL,
    file_name VARCHAR(255) NULL, file_type VARCHAR(120) NULL, file_data LONGBLOB NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_record_patient FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_record_doctor FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_records_patient_date (patient_id, record_date), INDEX idx_records_doctor (doctor_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  await connection.query(`CREATE TABLE IF NOT EXISTS appointments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT UNSIGNED NOT NULL, doctor_id BIGINT UNSIGNED NOT NULL,
    appointment_date DATE NOT NULL, appointment_time VARCHAR(20) NOT NULL,
    status ENUM('pending','confirmed','approved','completed','cancelled') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_appointment_patient FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_appointment_doctor FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_appointments_patient (patient_id), INDEX idx_appointments_doctor (doctor_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  await connection.query(`CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    room VARCHAR(120) NOT NULL, sender VARCHAR(120) NOT NULL, message TEXT NULL,
    file_url VARCHAR(500) NULL, file_name VARCHAR(255) NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_chat_room_created (room, created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
}

async function connectDB() {
  if (connected && pool) return pool;
  if (!process.env.MYSQL_HOST || !process.env.MYSQL_DATABASE || !process.env.MYSQL_USER) {
    throw new Error('MYSQL_HOST, MYSQL_DATABASE and MYSQL_USER are required');
  }
  pool = mysql.createPool({ host: process.env.MYSQL_HOST, port: Number(process.env.MYSQL_PORT || 3306), database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD, waitForConnections: true,
    connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 5), timezone: 'Z', ssl: sslConfig() });
  await pool.query('SELECT 1');
  await initializeSchema(pool);
  connected = true;
  logger.info('MySQL connected and schema verified');
  return pool;
}

function getPool() { if (!pool || !connected) throw new Error('MySQL is not connected'); return pool; }
function isConnected() { return connected; }
async function disconnectDB() { if (pool) await pool.end(); pool = undefined; connected = false; }

module.exports = { connectDB, disconnectDB, getPool, isConnected };
