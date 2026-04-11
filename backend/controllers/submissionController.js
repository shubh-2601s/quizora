const Submission = require('../models/Submission');
const Question = require('../models/Question');
const Quiz = require('../models/Quiz');

// @route POST /api/submissions  (User)
const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers, timeTaken } = req.body;
    // answers = [{ questionId, selectedAnswer }]

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Prevent duplicate submission
    if (!quiz.allowReattempt) {
      const existing = await Submission.findOne({ quiz: quizId, user: req.user._id });
      if (existing) {
        return res.status(403).json({ message: 'You have already submitted this quiz.' });
      }
    }

    const questions = await Question.find({ quiz: quizId });
    if (questions.length === 0) {
      return res.status(400).json({ message: 'No questions found for this quiz' });
    }

    // Build answer map for grading
    const qMap = {};
    questions.forEach((q) => { qMap[q._id.toString()] = q.correctAnswer; });

    let score = 0;
    const gradedAnswers = questions.map((q) => {
      const submitted = answers?.find((a) => a.questionId === q._id.toString());
      const selected = submitted?.selectedAnswer || null;
      const isCorrect = selected && selected.toUpperCase() === q.correctAnswer;
      if (isCorrect) score++;
      return { question: q._id, selectedAnswer: selected, isCorrect };
    });

    const submission = await Submission.create({
      quiz: quizId,
      user: req.user._id,
      answers: gradedAnswers,
      score,
      total: questions.length,
      timeTaken: timeTaken || 0,
    });

    res.status(201).json({
      message: 'Quiz submitted successfully',
      score,
      total: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      submissionId: submission._id,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route GET /api/submissions/user  (User - own history)
const getUserSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user._id })
      .populate('quiz', 'title code duration')
      .sort({ submittedAt: -1 });
    res.json({ submissions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route GET /api/submissions/quiz/:quizId  (Admin)
const getQuizSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ quiz: req.params.quizId })
      .populate('user', 'name email')
      .populate('quiz', 'title code total')
      .sort({ score: -1, timeTaken: 1 });
    res.json({ submissions, count: submissions.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route GET /api/submissions/leaderboard/:quizId  (Any authenticated user)
const getLeaderboard = async (req, res) => {
  try {
    const submissions = await Submission.find({ quiz: req.params.quizId })
      .populate('user', 'name email')
      .sort({ score: -1, timeTaken: 1 })
      .limit(50);

    const leaderboard = submissions.map((s, i) => ({
      rank: i + 1,
      name: s.user.name,
      email: s.user.email,
      score: s.score,
      total: s.total,
      percentage: Math.round((s.score / s.total) * 100),
      timeTaken: s.timeTaken,
      submittedAt: s.submittedAt,
    }));

    res.json({ leaderboard });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route GET /api/submissions/result/:submissionId  (User)
const getResult = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId)
      .populate('quiz', 'title code duration')
      .populate({ path: 'answers.question', select: 'question optionA optionB optionC optionD correctAnswer' });
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    if (submission.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json({ submission });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route GET /api/submissions/admin/stats  (Admin)
const getAdminStats = async (req, res) => {
  try {
    const Quiz = require('../models/Quiz');
    const quizzes = await Quiz.find({ createdBy: req.user._id });
    const quizIds = quizzes.map((q) => q._id);
    const totalSubmissions = await Submission.countDocuments({ quiz: { $in: quizIds } });
    const allSubmissions = await Submission.find({ quiz: { $in: quizIds } });
    const avgScore = allSubmissions.length
      ? Math.round(allSubmissions.reduce((acc, s) => acc + (s.score / s.total) * 100, 0) / allSubmissions.length)
      : 0;
    res.json({
      totalQuizzes: quizzes.length,
      totalSubmissions,
      avgScore,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { submitQuiz, getUserSubmissions, getQuizSubmissions, getLeaderboard, getResult, getAdminStats };
