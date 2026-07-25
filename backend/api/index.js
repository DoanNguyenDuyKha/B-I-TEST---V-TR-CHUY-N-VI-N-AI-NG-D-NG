import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Lesson, Submission } from './models.js';
import { aiEvaluateWriting, aiGenerateProgressTest, aiEvaluatePromotion } from './gemini.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env configuration
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lms_adaptive';
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log("Successfully connected to MongoDB:", MONGODB_URI);
    await seedLessons();
    await seedAdmin();
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });

// Seed Initial Lessons if empty
async function seedLessons() {
  try {
    const count = await Lesson.countDocuments();
    if (count === 0) {
      console.log("Seed lessons database...");
      const staticDataPath = path.join(__dirname, 'data', 'lessons.json');
      if (fs.existsSync(staticDataPath)) {
        const fileContent = fs.readFileSync(staticDataPath, 'utf8');
        const staticLessons = JSON.parse(fileContent);
        // Remove ids to let MongoDB generate new _id, but we'll map custom id fields or clean them
        const cleanedLessons = staticLessons.map(l => {
          const { id, ...rest } = l;
          return rest;
        });
        await Lesson.insertMany(cleanedLessons);
        console.log("Seeding lessons successfully completed!");
      }
    }
  } catch (error) {
    console.error("Error seeding lessons:", error);
  }
}

async function seedAdmin() {
  try {
    const adminExists = await User.findOne({ role: 'Admin' });
    if (!adminExists) {
      console.log("Seed admin account...");
      const defaultAdmin = new User({
        username: "admin",
        password: "admin123",
        role: "Admin",
        fullName: "System Administrator",
        email: "admin@lms.com",
        phone: "0000000000",
        dob: "1990-01-01",
        target: "Administration"
      });
      await defaultAdmin.save();
      console.log("Admin seeded successfully (admin/admin123)!");
    }
  } catch (error) {
    console.error("Error seeding admin:", error);
  }
}

// Helper to evaluate writing using mock AI rules
function evaluateWriting(text, levelGoal) {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount < 5) {
    return {
      score: 1,
      scores: { grammar: 1, vocabulary: 1, coherence: 1 },
      feedback: "Your writing is too short. Please write full sentences.",
      improvedText: "N/A"
    };
  }

  const lowercaseText = text.toLowerCase();
  const commonErrors = [
    { pattern: /\bi (am|was|will|have|had|do|did|go|went)\b/g, correct: "I" },
    { pattern: /\b(he|she|it) don't\b/g, error: "don't with singular", correct: "doesn't" },
    { pattern: /\byou is\b/g, error: "you is", correct: "you are" },
    { pattern: /\bthey is\b/g, error: "they is", correct: "they are" },
    { pattern: /\bwe is\b/g, error: "we is", correct: "we are" }
  ];

  let detectedErrors = [];
  commonErrors.forEach(err => {
    if (err.pattern.test(lowercaseText)) {
      detectedErrors.push(`Should use '${err.correct}' instead of incorrect verb forms.`);
    }
  });

  let grammarScore = 8;
  let vocabScore = 7;
  let coherenceScore = 8;

  if (detectedErrors.length > 0) {
    grammarScore -= detectedErrors.length * 1.5;
  }
  if (wordCount < 30) {
    vocabScore -= 3;
    coherenceScore -= 2;
  } else if (wordCount > 100) {
    vocabScore += 1.5;
    coherenceScore += 1;
  }

  const advancedWords = ["paradigm", "indispensable", "disrupt", "accelerate", "breakthrough", "transition", "accomplish", "furthermore", "consequently", "nevertheless", "mitigate", "ameliorate"];
  let advancedCount = 0;
  advancedWords.forEach(w => {
    if (lowercaseText.includes(w)) advancedCount++;
  });

  if (advancedCount > 2) {
    vocabScore += 1;
  }

  grammarScore = Math.max(1, Math.min(10, Math.round(grammarScore * 10) / 10));
  vocabScore = Math.max(1, Math.min(10, Math.round(vocabScore * 10) / 10));
  coherenceScore = Math.max(1, Math.min(10, Math.round(coherenceScore * 10) / 10));

  const overallScore = Math.round(((grammarScore + vocabScore + coherenceScore) / 3) * 10) / 10;

  let feedback = "";
  if (overallScore >= 8) {
    feedback = "Excellent writing! You demonstrate a wide vocabulary range and solid command of English grammar structure. Keep up the high standard.";
  } else if (overallScore >= 5) {
    feedback = "Good effort. Your ideas are clear, but you need to improve sentence transitions and double-check verb conjugations. Focus on expanding vocabulary.";
  } else {
    feedback = "Your writing needs support. Try to write longer sentences, review basic grammar tenses, and use capitalization correctly.";
  }

  if (detectedErrors.length > 0) {
    feedback += " Key correction: " + detectedErrors.join(" ");
  }

  let improvedText = text;
  if (detectedErrors.length > 0) {
    improvedText = text
      .replace(/\bi\b/g, "I")
      .replace(/\b(H|h)e don't\b/g, "he doesn't")
      .replace(/\b(S|s)he don't\b/g, "she doesn't")
      .replace(/\b(Y|y)ou is\b/g, "you are")
      .replace(/\b(T|t)hey is\b/g, "they are")
      .replace(/\b(W|w)e is\b/g, "we are");
  }

  return {
    score: overallScore,
    scores: {
      grammar: grammarScore,
      vocabulary: vocabScore,
      coherence: coherenceScore
    },
    feedback,
    improvedText
  };
}

// 1. GET ALL LESSONS
app.get('/api/lessons', async (req, res) => {
  try {
    const { level } = req.query;
    let query = {};
    if (level) {
      query.level = level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
    }
    const list = await Lesson.find(query);
    // Map _id to id for frontend compatibility
    const mapped = list.map(l => {
      const obj = l.toObject();
      obj.id = obj._id.toString();
      return obj;
    });
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. REGISTER USER WITH EXTENDED DETAILS
app.post('/api/register', async (req, res) => {
  const { username, password, role, fullName, email, phone, dob, target } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: "Username, password, and role are required." });
  }

  try {
    let existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists." });
    }

    const newUser = new User({
      username,
      password,
      role,
      fullName: fullName || username,
      email: email || "N/A",
      phone: phone || "N/A",
      dob: dob || "N/A",
      target: target || "General English"
    });

    await newUser.save();
    const obj = newUser.toObject();
    obj.id = obj._id.toString();
    res.json(obj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2.5 LOGIN USER
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Incorrect username or password." });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Incorrect username or password." });
    }

    const obj = user.toObject();
    obj.id = obj._id.toString();
    res.json(obj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. GET ALL STUDENTS OR SINGLE STUDENT DETAILS
app.get('/api/students', async (req, res) => {
  try {
    const list = await User.find({ role: 'Student' });
    const studentsData = [];

    for (let s of list) {
      const submissions = await Submission.find({ username: s.username });
      const mappedSubs = submissions.map(sub => {
        const subObj = sub.toObject();
        subObj.id = subObj._id.toString();
        return subObj;
      });

      const sObj = s.toObject();
      sObj.id = sObj._id.toString();
      sObj.submissions = mappedSubs;
      // Map older mock keys
      sObj.quizScore = sObj.placementTestDone ? "4/5" : null;
      // Get the placement test essay score if available in submission logs or just mock it
      sObj.essayScore = sObj.placementTestDone ? 7.5 : null;
      sObj.feedback = sObj.placementTestDone ? "Evaluated on MongoDB database successfully." : "";
      
      studentsData.push(sObj);
    }
    res.json(studentsData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. UPDATE STUDENT LEVEL
app.post('/api/students/update-level', async (req, res) => {
  const { username, classification } = req.body;
  try {
    const student = await User.findOneAndUpdate(
      { username },
      { classification },
      { new: true }
    );
    if (!student) return res.status(404).json({ error: "Student not found." });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. PLACEMENT TEST SUBMISSION & CLASSIFICATION
app.post('/api/placement-test', async (req, res) => {
  const { username, quizAnswers, essayText } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required." });
  }

  try {
    const correctKeys = { q1: "B", q2: "A", q3: "C", q4: "B", q5: "D", q6: "A", q7: "C", q8: "B", q9: "D", q10: "B" };
    let quizScore = 0;
    let totalQuiz = Object.keys(correctKeys).length;

    if (quizAnswers) {
      Object.keys(correctKeys).forEach(key => {
        if (quizAnswers[key] === correctKeys[key]) {
          quizScore++;
        }
      });
    }

    const essayEval = await aiEvaluateWriting(essayText || "", "Placement");

    let classification = "Intermediate";
    const finalEssayScore = essayEval.score;

    if (quizScore >= 8 && finalEssayScore >= 7.5) {
      classification = "Advanced";
    } else if (quizScore <= 4 && finalEssayScore <= 5.0) {
      classification = "Basic";
    } else {
      classification = "Intermediate";
    }

    // Save evaluation to student profile
    const updatedUser = await User.findOneAndUpdate(
      { username },
      { classification, placementTestDone: true },
      { new: true }
    );

    // Save placement test essay as submission
    const placementSub = new Submission({
      username,
      lessonId: "placement-test",
      essayText: essayText || "",
      evaluation: essayEval
    });
    await placementSub.save();

    res.json({
      username,
      quizScore: `${quizScore}/${totalQuiz}`,
      essayEvaluation: essayEval,
      classification,
      matchedLessons: (await Lesson.find({ level: classification })).map(l => {
        const obj = l.toObject();
        obj.id = obj._id.toString();
        return obj;
      })
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. ASSIGNMENT ESSAY GRADING
app.post('/api/essay-grade', async (req, res) => {
  const { lessonId, studentName, essayText } = req.body;

  if (!lessonId || !essayText) {
    return res.status(400).json({ error: "Lesson ID and Essay text are required." });
  }

  try {
    const lesson = await Lesson.findById(lessonId);
    const targetLevel = lesson ? lesson.level : "Intermediate";

    const evaluation = await aiEvaluateWriting(essayText, targetLevel);

    // Save submission
    const newSubmission = new Submission({
      username: studentName,
      lessonId,
      essayText,
      evaluation
    });
    await newSubmission.save();

    res.json({
      lessonId,
      studentName,
      targetLevel,
      evaluation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. GENERATE CUSTOM LESSON (AI Simulation & Save to DB)
app.post('/api/generate-lesson', async (req, res) => {
  const { topic, level } = req.body;

  if (!topic || !level) {
    return res.status(400).json({ error: "Topic and Level are required." });
  }

  try {
    const cleanTopic = topic.trim();
    let vocabulary = [];
    let grammar = {};
    let reading = {};
    let essayPrompt = "";

    if (level === "Basic") {
      vocabulary = [
        { "word": "Learn", "ipa": "/lɜːn/", "type": "Verb", "meaning": "Học tập", "example": `We learn about ${cleanTopic} today.` },
        { "word": "Simple", "ipa": "/ˈsɪmpl/", "type": "Adjective", "meaning": "Đơn giản", "example": "This is a simple word." }
      ];
      grammar = {
        "point": "Simple Present tense",
        "explanation": "Diễn tả về chủ đề " + cleanTopic,
        "structures": ["S + V(s/es)"]
      };
      reading = {
        "title": `Beginning with ${cleanTopic}`,
        "content": `Welcome to English. Today we look at ${cleanTopic}. It is a very interesting topic. Many people like it.`,
        "questions": [
          { "id": "q1", "question": "Is the topic interesting?", "options": ["Yes", "No"], "answer": "Yes" }
        ]
      };
      essayPrompt = `Write 5 simple sentences about your feelings on ${cleanTopic}.`;
    } else if (level === "Advanced") {
      vocabulary = [
        { "word": "Prerequisite", "ipa": "/ˌpriːˈrekwəzɪt/", "type": "Noun", "meaning": "Điều kiện kiên quyết", "example": `Understanding ${cleanTopic} is a prerequisite.` },
        { "word": "Conceptualize", "ipa": "/kənˈseptʃuəlaɪz/", "type": "Verb", "meaning": "Khái niệm hóa", "example": "It is difficult to conceptualize complex theories." }
      ];
      grammar = {
        "point": "Inversion & Cleft Sentences",
        "explanation": "Nhấn mạnh về chủ đề " + cleanTopic,
        "structures": ["Seldom do we see..."]
      };
      reading = {
        "title": `Advanced Insights into ${cleanTopic}`,
        "content": `The debate surrounding ${cleanTopic} has sparked substantial controversy in academic circles.`,
        "questions": [
          { "id": "q1", "question": "What is recommended?", "options": ["Research", "Ignore"], "answer": "Research" }
        ]
      };
      essayPrompt = `Write a short essay (150-200 words) discussing the global impact of ${cleanTopic}.`;
    } else {
      vocabulary = [
        { "word": "Improve", "ipa": "/ɪmˈpruːv/", "type": "Verb", "meaning": "Cải thiện", "example": "Practice helps improve your skills." }
      ];
      grammar = {
        "point": "First Conditional",
        "explanation": "Diễn tả giả thuyết tương lai liên quan đến " + cleanTopic,
        "structures": ["If + S + V, S + will + V"]
      };
      reading = {
        "title": `Learning about ${cleanTopic}`,
        "content": `Many people want to improve their knowledge of ${cleanTopic}.`,
        "questions": [
          { "id": "q1", "question": "What is the benefit?", "options": ["Improvement", "Nothing"], "answer": "Improvement" }
        ]
      };
      essayPrompt = `Write a short paragraph (80-120 words) explaining how ${cleanTopic} affects your daily life.`;
    }

    const newLesson = new Lesson({
      level,
      title: `AI Generated Lesson: ${cleanTopic}`,
      description: `A custom generated curriculum lesson about ${cleanTopic} tailored for ${level} learners.`,
      vocabulary,
      grammar,
      reading,
      essayPrompt
    });

    await newLesson.save();
    const obj = newLesson.toObject();
    obj.id = obj._id.toString();

    res.json({
      message: "Lesson generated and saved to MongoDB successfully!",
      lesson: obj
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. GENERATE PROGRESS TEST FOR PROMOTION
app.get('/api/progress-test', async (req, res) => {
  const { level } = req.query;
  if (!level) return res.status(400).json({ error: "Level is required." });
  try {
    const test = await aiGenerateProgressTest(level);
    res.json(test);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. SUBMIT PROGRESS TEST & ASSESS PROMOTION
app.post('/api/progress-test/submit', async (req, res) => {
  const { username, quizScore, essayText, currentLevel } = req.body;
  if (!username || quizScore === undefined || !essayText || !currentLevel) {
    return res.status(400).json({ error: "Username, quizScore, essayText, and currentLevel are required." });
  }
  try {
    const result = await aiEvaluatePromotion(quizScore, essayText, currentLevel);
    
    // Save placement test essay as submission
    const progressSub = new Submission({
      username,
      lessonId: `progress-test-${currentLevel.toLowerCase()}`,
      essayText,
      evaluation: {
        score: result.decision === 'Promoted' ? 8.5 : 5.5,
        feedback: result.explanation,
        improvedText: essayText
      }
    });
    await progressSub.save();

    if (result.decision === 'Promoted') {
      await User.findOneAndUpdate({ username }, { classification: result.newLevel });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server locally
const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Express Server running on port ${PORT}`);
  });
}

export default app;
