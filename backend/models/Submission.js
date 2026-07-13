const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  selectedAnswer: { type: String, enum: ['A', 'B', 'C', 'D', null], default: null },
  isCorrect: { type: Boolean, default: false },
});

const submissionSchema = new mongoose.Schema(
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [answerSchema],
    score: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    timeTaken: { type: Number, default: 0 }, // seconds taken
    submittedAt: { type: Date, default: Date.now },
    isEliminated: { type: Boolean, default: false },
    eliminatedRound: { type: Number, default: null },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate submissions (when reattempt is false)
submissionSchema.index({ quiz: 1, user: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
