// server/models/QuizQuestion.js
const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  site: { 
    type: String, 
    required: true, 
    index: true 
  },
  question: { 
    type: String, 
    required: true 
  },
  options: [{ 
    type: String, 
    required: true 
  }],
  correctAnswer: { 
    type: Number, 
    required: true,
    min: 0,
    max: 3
  },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'], 
    required: true,
    index: true 
  },
  category: { 
    type: String 
  }
}, {
  timestamps: false
});

// Compound index for efficient queries
quizQuestionSchema.index({ site: 1, difficulty: 1 });

module.exports = mongoose.model('QuizQuestion', quizQuestionSchema, 'quiz_questions');
