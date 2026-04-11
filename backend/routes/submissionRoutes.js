const express = require('express');
const router = express.Router();
const {
  submitQuiz, getUserSubmissions, getQuizSubmissions,
  getLeaderboard, getResult, getAdminStats
} = require('../controllers/submissionController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');

router.post('/', protect, submitQuiz);
router.get('/user', protect, getUserSubmissions);
router.get('/quiz/:quizId', protect, requireAdmin, getQuizSubmissions);
router.get('/leaderboard/:quizId', protect, getLeaderboard);
router.get('/result/:submissionId', protect, getResult);
router.get('/admin/stats', protect, requireAdmin, getAdminStats);

module.exports = router;
