import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['Student', 'Admin'] },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  dob: { type: String, required: true }, // Store Date of birth as string for simplicity
  target: { type: String, required: true }, // e.g. IELTS, Business, Basic Communication
  classification: { type: String, default: null, enum: ['Basic', 'Intermediate', 'Advanced', null] },
  placementTestDone: { type: Boolean, default: false }
}, { timestamps: true });

const LessonSchema = new mongoose.Schema({
  level: { type: String, required: true, enum: ['Basic', 'Intermediate', 'Advanced'] },
  title: { type: String, required: true },
  description: { type: String },
  vocabulary: [{
    word: String,
    ipa: String,
    type: String,
    meaning: String,
    example: String
  }],
  grammar: {
    point: String,
    explanation: String,
    structures: [String]
  },
  reading: {
    title: String,
    content: String,
    questions: [{
      id: String,
      question: String,
      options: [String],
      answer: String
    }]
  },
  essayPrompt: { type: String, required: true }
}, { timestamps: true });

const SubmissionSchema = new mongoose.Schema({
  username: { type: String, required: true },
  lessonId: { type: String, required: true },
  essayText: { type: String, required: true },
  evaluation: {
    score: Number,
    scores: {
      grammar: Number,
      vocabulary: Number,
      coherence: Number
    },
    feedback: String,
    improvedText: String
  },
  gradedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);
export const Lesson = mongoose.model('Lesson', LessonSchema);
export const Submission = mongoose.model('Submission', SubmissionSchema);
