const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const { createUser, bulkUploadUsers, listUsers, deleteUser } = require('../controllers/userController');

// Multer: store files in memory so we can parse the buffer directly
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel', 'text/csv', 'application/csv'];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(csv|xlsx|xls)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only .csv and .xlsx files are allowed.'));
    }
  },
});

// All routes require authentication + admin role
router.use(protect, requireAdmin);

router.post('/create', createUser);
router.post('/bulk-upload', upload.single('file'), bulkUploadUsers);
router.get('/', listUsers);
router.delete('/:id', deleteUser);

module.exports = router;
