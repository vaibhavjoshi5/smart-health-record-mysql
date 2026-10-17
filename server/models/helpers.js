function jsonValue(value, fallback) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

function user(row) {
  if (!row) return null;
  return { _id: String(row.id), id: String(row.id), name: row.name, email: row.email, password: row.password_hash, role: row.role,
    bloodGroup: row.blood_group, allergies: jsonValue(row.allergies, []), chronicDiseases: jsonValue(row.chronic_diseases, []),
    emergencyContact: jsonValue(row.emergency_contact, null), resetToken: row.reset_token, resetTokenExpiry: row.reset_token_expiry,
    createdAt: row.created_at, updatedAt: row.updated_at };
}

function record(row, includeFile = false) {
  if (!row) return null;
  const result = { _id: String(row.id), id: String(row.id), patient: String(row.patient_id),
    doctor: row.doctor_id ? { _id: String(row.doctor_id), name: row.doctor_name } : null, date: row.record_date,
    symptoms: row.symptoms, diagnosis: row.diagnosis, doctorNotes: row.doctor_notes, fileName: row.file_name,
    fileType: row.file_type, createdAt: row.created_at, updatedAt: row.updated_at };
  if (includeFile) result.fileData = row.file_data;
  return result;
}

function appointment(row) {
  if (!row) return null;
  return { _id: String(row.id), id: String(row.id), patient: row.patient_id ? { _id: String(row.patient_id), name: row.patient_name } : null,
    doctor: row.doctor_id ? { _id: String(row.doctor_id), name: row.doctor_name } : null, date: row.appointment_date,
    time: row.appointment_time, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at };
}

module.exports = { user, record, appointment };
