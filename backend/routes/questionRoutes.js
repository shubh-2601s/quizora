const express = require('express');
const router = express.Router();
const { addQuestion, bulkUpload, getQuestions, deleteQuestion, upload } = require('../controllers/questionController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');

router.post('/', protect, requireAdmin, addQuestion);
router.post('/bulk/:quizId', protect, requireAdmin, upload.single('file'), bulkUpload);
router.get('/:quizId', protect, getQuestions);
router.delete('/:id', protect, requireAdmin, deleteQuestion);

module.exports = router;
