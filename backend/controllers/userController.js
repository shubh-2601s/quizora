const User = require('../models/User');
const xlsx = require('xlsx');
const { parse } = require('csv-parse/sync');

// Helper: derive a name from email if not provided
const nameFromEmail = (email) => email.split('@')[0].replace(/[._-]/g, ' ');

// ─── Create Single User ───────────────────────────────────────────────────────
// @route  POST /api/users/create
// @access Admin
const createUser = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    const user = await User.create({
      email: email.toLowerCase().trim(),
      password,
      name: name?.trim() || nameFromEmail(email),
      role: role === 'admin' ? 'admin' : 'user',
    });

    res.status(201).json({
      message: 'User created successfully.',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── Bulk Upload Users ────────────────────────────────────────────────────────
// @route  POST /api/users/bulk-upload
// @access Admin
const bulkUploadUsers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Please upload a .csv or .xlsx file.' });
    }

    const { originalname, buffer } = req.file;
    const ext = originalname.split('.').pop().toLowerCase();
    let rows = [];

    if (ext === 'xlsx' || ext === 'xls') {
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });
    } else if (ext === 'csv') {
      rows = parse(buffer, { columns: true, skip_empty_lines: true, trim: true });
    } else {
      return res.status(400).json({ message: 'Unsupported file type. Please upload a .csv or .xlsx file.' });
    }

    if (rows.length === 0) {
      return res.status(400).json({ message: 'The file is empty or has no valid rows.' });
    }

    const results = { added: 0, skipped: 0, errors: [] };

    for (const [i, row] of rows.entries()) {
      const email = (row.email || row.Email || '').toString().toLowerCase().trim();
      const password = (row.password || row.Password || '').toString().trim();
      const name = (row.name || row.Name || '').toString().trim() || nameFromEmail(email);
      const role = (row.role || row.Role || '').toString().trim();
      const rowNum = i + 2; // +2 for 1-indexed + header row

      if (!email) {
        results.errors.push({ row: rowNum, reason: 'Missing email' });
        continue;
      }
      if (!password || password.length < 6) {
        results.errors.push({ row: rowNum, email, reason: 'Missing or too-short password (min 6 chars)' });
        continue;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        results.errors.push({ row: rowNum, email, reason: 'Invalid email format' });
        continue;
      }

      const existing = await User.findOne({ email });
      if (existing) {
        results.skipped++;
        continue;
      }

      try {
        await User.create({
          email,
          password,
          name,
          role: role === 'admin' ? 'admin' : 'user',
        });
        results.added++;
      } catch (err) {
        results.errors.push({ row: rowNum, email, reason: err.message });
      }
    }

    res.status(200).json({
      message: 'Bulk upload complete.',
      totalRows: rows.length,
      ...results,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── List All Users ───────────────────────────────────────────────────────────
// @route  GET /api/users
// @access Admin
const listUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const query = search
      ? { $or: [{ email: { $regex: search, $options: 'i' } }, { name: { $regex: search, $options: 'i' } }] }
      : {};

    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── Delete User ──────────────────────────────────────────────────────────────
// @route  DELETE /api/users/:id
// @access Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }
    await user.deleteOne();
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createUser, bulkUploadUsers, listUsers, deleteUser };
