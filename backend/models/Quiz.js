const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    code: { type: String, required: true, unique: true, uppercase: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, required: true, min: 1 }, // in minutes
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    randomizeQuestions: { type: Boolean, default: false },
    allowReattempt: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
