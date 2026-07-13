const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Submission = require('../models/Submission');
const { generateCode } = require('../utils/generateCode');

// @route POST /api/quizzes  (Admin)
const createQuiz = async (req, res) => {
  try {
    const { title, description, startTime, endTime, duration, randomizeQuestions, allowReattempt, quizMode, strictAntiCheat, category, nextQuizCode, passcode, passingPercentage } = req.body;
    if (!title || !startTime || !endTime || !duration) {
      return res.status(400).json({ message: 'Title, startTime, endTime, and duration are required' });
    }

    let code = req.body.code ? req.body.code.trim().toUpperCase() : '';
    if (code) {
      const exists = await Quiz.findOne({ code });
      if (exists) {
        return res.status(400).json({ message: 'Quiz code is already taken. Please choose another.' });
      }
    } else {
      let isUnique = false;
      while (!isUnique) {
        code = generateCode();
        const exists = await Quiz.findOne({ code });
        if (!exists) isUnique = true;
      }
    }

    const quiz = await Quiz.create({
      title,
      description,
      code,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration,
      createdBy: req.user._id,
      randomizeQuestions: randomizeQuestions || false,
      allowReattempt: allowReattempt || false,
      quizMode: quizMode || 'standard',
      strictAntiCheat: strictAntiCheat || false,
      category: category || 'General',
      nextQuizCode: nextQuizCode || '',
      passcode: passcode || '',
      passingPercentage: passingPercentage !== undefined ? Number(passingPercentage) : 50,
    });

    res.status(201).json({ message: 'Quiz created successfully', quiz });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route GET /api/quizzes  (Admin - all quizzes)
const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    // Attach question count and submission count for each quiz
    const enriched = await Promise.all(
      quizzes.map(async (quiz) => {
        const questionCount = await Question.countDocuments({ quiz: quiz._id });
        const submissionCount = await Submission.countDocuments({ quiz: quiz._id });
        return { ...quiz, questionCount, submissionCount };
      })
    );

    res.json({ quizzes: enriched });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route GET /api/quizzes/:code  (User - access by code)
const getQuizByCode = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ code: req.params.code.toUpperCase() });
    if (!quiz) {
      return res.status(404).json({ message: 'Invalid quiz code. No quiz found.' });
    }

    // Check passcode if quiz is passcode protected
    if (quiz.passcode && quiz.passcode.trim() !== '') {
      const userPasscode = req.query.passcode;
      if (!userPasscode || userPasscode.trim() !== quiz.passcode.trim()) {
        return res.status(403).json({
          requirePasscode: true,
          message: 'This quiz is passcode protected. Please enter the correct passcode.',
        });
      }
    }

    const now = new Date();
    if (now < quiz.startTime) {
      return res.status(403).json({ message: 'This quiz has not started yet.' });
    }
    if (now > quiz.endTime) {
      return res.status(403).json({ message: 'This quiz has ended.' });
    }

    // Check if user already submitted (and reattempt is not allowed)
    if (!quiz.allowReattempt) {
      const existing = await Submission.findOne({ quiz: quiz._id, user: req.user._id });
      if (existing) {
        return res.status(403).json({
          message: 'You have already attempted this quiz.',
          alreadyAttempted: true,
          submission: existing,
        });
      }
    }

    const questionCount = await Question.countDocuments({ quiz: quiz._id });
    res.json({ quiz, questionCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route GET /api/quizzes/:id/details  (Admin)
const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'name email');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    const questionCount = await Question.countDocuments({ quiz: quiz._id });
    res.json({ quiz, questionCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route PUT /api/quizzes/:id  (Admin)
const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this quiz' });
    }
    const { title, description, startTime, endTime, duration, randomizeQuestions, allowReattempt, quizMode, strictAntiCheat, category, nextQuizCode, passcode, code, passingPercentage } = req.body;
    if (code) {
      const customCode = code.trim().toUpperCase();
      if (customCode !== quiz.code) {
        const exists = await Quiz.findOne({ code: customCode });
        if (exists) {
          return res.status(400).json({ message: 'Quiz code is already taken. Please choose another.' });
        }
        quiz.code = customCode;
      }
    }
    if (title) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (startTime) quiz.startTime = new Date(startTime);
    if (endTime) quiz.endTime = new Date(endTime);
    if (duration) quiz.duration = duration;
    if (randomizeQuestions !== undefined) quiz.randomizeQuestions = randomizeQuestions;
    if (allowReattempt !== undefined) quiz.allowReattempt = allowReattempt;
    if (quizMode) quiz.quizMode = quizMode;
    if (strictAntiCheat !== undefined) quiz.strictAntiCheat = strictAntiCheat;
    if (category) quiz.category = category;
    if (nextQuizCode !== undefined) quiz.nextQuizCode = nextQuizCode;
    if (passcode !== undefined) quiz.passcode = passcode;
    if (passingPercentage !== undefined) quiz.passingPercentage = Number(passingPercentage);
    await quiz.save();
    res.json({ message: 'Quiz updated successfully', quiz });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route DELETE /api/quizzes/:id  (Admin)
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this quiz' });
    }
    // Cascade delete questions and submissions
    await Question.deleteMany({ quiz: quiz._id });
    await Submission.deleteMany({ quiz: quiz._id });
    await quiz.deleteOne();
    res.json({ message: 'Quiz and all related data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createQuiz, getAllQuizzes, getQuizByCode, getQuizById, updateQuiz, deleteQuiz };
