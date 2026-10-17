const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const logger = require('../config/logger');
const router = express.Router();

function getJwtSecret() { if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET environment variable is required'); return process.env.JWT_SECRET; }
function authMiddleware(req, res, next) { const token = req.headers.authorization?.split(' ')[1]; if (!token) return res.status(401).json({ success: false, message: 'No token, authorization denied' }); try { req.user = jwt.verify(token, getJwtSecret()); next(); } catch { res.status(401).json({ success: false, message: 'Token is not valid' }); } }
function validationError(req, res) { const errors = validationResult(req); if (!errors.isEmpty()) { res.status(400).json({ success: false, message: errors.array()[0].msg }); return true; } return false; }

router.post('/register', [body('name').notEmpty().trim().escape(), body('email').isEmail().normalizeEmail(), body('password').isLength({ min: 6 }), body('role').optional().isIn(['patient', 'doctor'])], asyncHandler(async (req, res) => {
  if (validationError(req, res)) return;
  const { name, email, password, role } = req.body;
  if (await User.findByEmail(email)) return res.status(400).json({ success: false, message: 'User already exists' });
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10), role: role || 'patient' });
  logger.info(`New user registered: ${email} (${user.role})`);
  res.status(201).json({ success: true, message: 'User registered successfully', user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
}));

router.post('/login', [body('email').isEmail().normalizeEmail(), body('password').notEmpty()], asyncHandler(async (req, res) => {
  if (validationError(req, res)) return;
  const user = await User.findByEmail(req.body.email);
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) return res.status(400).json({ success: false, message: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, getJwtSecret(), { expiresIn: '7d' });
  res.json({ success: true, message: 'Login successful', token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
}));

router.post('/forgot-password', [body('email').isEmail().normalizeEmail()], asyncHandler(async (req, res) => {
  if (validationError(req, res)) return;
  const user = await User.findByEmail(req.body.email);
  if (!user) return res.status(400).json({ success: false, message: 'No user with that email' });
  const token = crypto.randomBytes(32).toString('hex');
  await User.setResetToken(user._id, token, new Date(Date.now() + 60 * 60 * 1000));
  const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;
  await transporter.sendMail({ to: user.email, subject: 'Password Reset', html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 1 hour.</p>` });
  res.json({ success: true, message: 'Password reset email sent' });
}));

router.post('/reset-password/:token', [body('password').isLength({ min: 6 })], asyncHandler(async (req, res) => {
  if (validationError(req, res)) return;
  const user = await User.findValidResetToken(req.params.token);
  if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });
  await User.resetPassword(user._id, await bcrypt.hash(req.body.password, 10));
  res.json({ success: true, message: 'Password reset successful' });
}));

module.exports = { router, authMiddleware,
  requireRole: (...roles) => (req, res, next) => roles.includes(req.user?.role) ? next() : res.status(403).json({ success: false, message: 'You are not allowed to perform this action' }),
  requireSelfOrRole: (...roles) => (req, res, next) => { const id = req.params.userId || req.params.patientId || req.params.doctorId; return String(req.user?.id) === String(id) || roles.includes(req.user?.role) ? next() : res.status(403).json({ success: false, message: 'You are not allowed to access this user' }); }
};
