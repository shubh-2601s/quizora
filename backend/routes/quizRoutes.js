const express = require('express');
const router = express.Router();
const {
  createQuiz, getAllQuizzes, getQuizByCode, getQuizById, updateQuiz, deleteQuiz, getPublicQuizzes
} = require('../controllers/quizController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');

// User route - explore active public quizzes
router.get('/public', protect, getPublicQuizzes);

// Admin routes
router.post('/', protect, requireAdmin, createQuiz);
router.get('/', protect, requireAdmin, getAllQuizzes);
router.get('/:id/details', protect, requireAdmin, getQuizById);
router.put('/:id', protect, requireAdmin, updateQuiz);
router.delete('/:id', protect, requireAdmin, deleteQuiz);

// User route - validate quiz code
router.get('/code/:code', protect, getQuizByCode);

module.exports = router;
