const multer = require('multer');
const { parse } = require('csv-parse/sync');
const Question = require('../models/Question');
const Quiz = require('../models/Quiz');

// Multer → memory storage for CSV files
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// @route POST /api/questions  (Admin)
const addQuestion = async (req, res) => {
  try {
    const { quizId, question, optionA, optionB, optionC, optionD, correctAnswer, round, explanation } = req.body;
    if (!quizId || !question || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const count = await Question.countDocuments({ quiz: quizId });
    const newQuestion = await Question.create({
      quiz: quizId,
      question,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer: correctAnswer.toUpperCase(),
      order: count + 1,
      round: round ? parseInt(round, 10) : 1,
      explanation: explanation || '',
    });
    res.status(201).json({ message: 'Question added successfully', question: newQuestion });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route POST /api/questions/bulk/:quizId  (Admin - CSV upload)
const bulkUpload = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (!req.file) return res.status(400).json({ message: 'No CSV file uploaded' });

    const csvContent = req.file.buffer.toString('utf8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (records.length === 0) {
      return res.status(400).json({ message: 'CSV file is empty' });
    }

    const validAnswers = ['A', 'B', 'C', 'D'];
    const questions = [];
    const errors = [];
    let startOrder = await Question.countDocuments({ quiz: quizId });

    records.forEach((row, i) => {
      const { question, optionA, optionB, optionC, optionD, correctAnswer, round, explanation } = row;
      if (!question || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
        errors.push(`Row ${i + 2}: Missing required fields`);
        return;
      }
      if (!validAnswers.includes(correctAnswer.toUpperCase())) {
        errors.push(`Row ${i + 2}: correctAnswer must be A, B, C, or D`);
        return;
      }
      questions.push({
        quiz: quizId,
        question: question.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim(),
        optionD: optionD.trim(),
        correctAnswer: correctAnswer.toUpperCase(),
        order: startOrder + questions.length + 1,
        round: round ? parseInt(round, 10) : 1,
        explanation: explanation ? explanation.trim() : '',
      });
    });

    if (questions.length === 0) {
      return res.status(400).json({ message: 'No valid questions found in CSV', errors });
    }

    await Question.insertMany(questions);
    res.status(201).json({
      message: `${questions.length} question(s) uploaded successfully`,
      uploaded: questions.length,
      errors,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route GET /api/questions/:quizId  (User/Admin)
const getQuestions = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    let questions = await Question.find({ quiz: quizId }).sort({ order: 1 }).lean();

    if (quiz.randomizeQuestions) {
      // Fisher-Yates shuffle
      for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
      }
    }

    // Remove correctAnswer and explanation from user-facing response
    if (req.user.role !== 'admin') {
      questions = questions.map(({ correctAnswer, explanation, ...rest }) => rest);
    }

    res.json({ questions, total: questions.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route DELETE /api/questions/:id  (Admin)
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { addQuestion, bulkUpload, getQuestions, deleteQuestion, upload };
