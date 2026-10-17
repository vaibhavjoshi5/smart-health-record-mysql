describe('MySQL backend architecture', () => {
  test('exports the SQL repository modules', () => {
    expect(typeof require('../models/User').create).toBe('function');
    expect(typeof require('../models/MedicalRecord').findByPatient).toBe('function');
    expect(typeof require('../models/Appointment').updateStatus).toBe('function');
    expect(typeof require('../models/Chat').findByRoom).toBe('function');
  });

  test('requires MySQL connection settings rather than a MongoDB URI', async () => {
    const { connectDB, disconnectDB } = require('../config/db');
    const saved = { MYSQL_HOST: process.env.MYSQL_HOST, MYSQL_DATABASE: process.env.MYSQL_DATABASE, MYSQL_USER: process.env.MYSQL_USER };
    delete process.env.MYSQL_HOST; delete process.env.MYSQL_DATABASE; delete process.env.MYSQL_USER;
    await expect(connectDB()).rejects.toThrow('MYSQL_HOST, MYSQL_DATABASE and MYSQL_USER are required');
    Object.assign(process.env, saved);
    await disconnectDB();
  });
});
