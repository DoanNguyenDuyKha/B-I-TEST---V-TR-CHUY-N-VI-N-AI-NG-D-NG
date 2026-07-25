import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Load mock database
const lessonsDbPath = path.join(__dirname, 'data', 'lessons.json');
let lessons = [];
try {
  const fileContent = fs.readFileSync(lessonsDbPath, 'utf8');
  lessons = JSON.parse(fileContent);
} catch (error) {
  console.error("Error reading lessons database:", error);
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

  // Simple spelling & grammar check simulation
  const lowercaseText = text.toLowerCase();
  const commonErrors = [
    { pattern: /\bi (am|was|will|have|had|do|did|go|went)\b/g, correct: "I" }, // i am -> I am
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

  // Calculate scores based on length, complexity and errors
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

  // Advanced words list
  const advancedWords = ["paradigm", "indispensable", "disrupt", "accelerate", "breakthrough", "transition", "accomplish", "furthermore", "consequently", "nevertheless", "mitigate", "ameliorate"];
  let advancedCount = 0;
  advancedWords.forEach(w => {
    if (lowercaseText.includes(w)) advancedCount++;
  });

  if (advancedCount > 2) {
    vocabScore += 1;
  }

  // Bound scores between 1 and 10
  grammarScore = Math.max(1, Math.min(10, Math.round(grammarScore * 10) / 10));
  vocabScore = Math.max(1, Math.min(10, Math.round(vocabScore * 10) / 10));
  coherenceScore = Math.max(1, Math.min(10, Math.round(coherenceScore * 10) / 10));

  const overallScore = Math.round(((grammarScore + vocabScore + coherenceScore) / 3) * 10) / 10;

  // Generate dynamic feedback based on scores
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

  // Generate a mock improved text
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
app.get('/api/lessons', (req, res) => {
  const { level } = req.query;
  if (level) {
    const filtered = lessons.filter(l => l.level.toLowerCase() === level.toLowerCase());
    return res.json(filtered);
  }
  res.json(lessons);
});

// 2. PLACEMENT TEST SUBMISSION & CLASSIFICATION
app.post('/api/placement-test', (req, res) => {
  const { username, quizAnswers, essayText } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required." });
  }

  // Evaluate quiz answers (1 point per correct answer)
  // Mock test key: Q1 -> B, Q2 -> A, Q3 -> C, Q4 -> B, Q5 -> D
  const correctKeys = { q1: "B", q2: "A", q3: "C", q4: "B", q5: "D" };
  let quizScore = 0;
  let totalQuiz = Object.keys(correctKeys).length;

  if (quizAnswers) {
    Object.keys(correctKeys).forEach(key => {
      if (quizAnswers[key] === correctKeys[key]) {
        quizScore++;
      }
    });
  }

  // Evaluate essay writing
  const essayEval = evaluateWriting(essayText || "", "Placement");

  // Classification Logic:
  // Advanced: Quiz >= 4/5 AND Essay score >= 7.5
  // Basic: Quiz <= 2/5 AND Essay score < 5.0
  // Intermediate: Rest of the cases
  let classification = "Intermediate";
  const finalEssayScore = essayEval.score;

  if (quizScore >= 4 && finalEssayScore >= 7.5) {
    classification = "Basic"; // Let's check: Wait, is Basic lower? Oh, "Advanced" is Excellent, "Intermediate" is Average, "Basic" is Cần hỗ trợ (Basic).
    classification = "Advanced"; // Correct
  } else if (quizScore <= 2 && finalEssayScore <= 5.0) {
    classification = "Basic";
  } else {
    classification = "Intermediate";
  }

  res.json({
    username,
    quizScore: `${quizScore}/${totalQuiz}`,
    essayEvaluation: essayEval,
    classification, // 'Basic', 'Intermediate', 'Advanced'
    matchedLessons: lessons.filter(l => l.level === classification)
  });
});

// 3. ASSIGNMENT ESSAY GRADING
app.post('/api/essay-grade', (req, res) => {
  const { lessonId, studentName, essayText } = req.body;

  if (!lessonId || !essayText) {
    return res.status(400).json({ error: "Lesson ID and Essay text are required." });
  }

  const lesson = lessons.find(l => l.id === lessonId);
  const targetLevel = lesson ? lesson.level : "Intermediate";

  const evaluation = evaluateWriting(essayText, targetLevel);

  res.json({
    lessonId,
    studentName,
    targetLevel,
    evaluation
  });
});

// 4. GENERATE CUSTOM LESSON (AI Simulation)
app.post('/api/generate-lesson', (req, res) => {
  const { topic, level } = req.body;

  if (!topic || !level) {
    return res.status(400).json({ error: "Topic and Level (Basic, Intermediate, Advanced) are required." });
  }

  // Create a structured lesson dynamic based on topic
  const cleanTopic = topic.trim();
  const id = `lesson-gen-${Date.now()}`;

  let vocabulary = [];
  let grammar = {};
  let reading = {};
  let essayPrompt = "";

  if (level === "Basic") {
    vocabulary = [
      { "word": "Learn", "ipa": "/lɜːn/", "type": "Verb", "meaning": "Học tập", "example": `We learn about ${cleanTopic} today.` },
      { "word": "Simple", "ipa": "/ˈsɪmpl/", "type": "Adjective", "meaning": "Đơn giản", "example": "This is a simple word." },
      { "word": "Begin", "ipa": "/bɪˈɡɪn/", "type": "Verb", "meaning": "Bắt đầu", "example": "Let's begin the lesson." }
    ];
    grammar = {
      "point": "Simple Present tense",
      "explanation": "Dùng để diễn tả sự thật, thói quen về chủ đề " + cleanTopic,
      "structures": ["S + V(s/es) (I study daily.)", "S + do/does not + V (He does not play.)"]
    };
    reading = {
      "title": `Beginning with ${cleanTopic}`,
      "content": `Welcome to English. Today we look at ${cleanTopic}. It is a very interesting topic. Many people like it. When you speak about it, you feel happy. Let's study more words to understand this better.`,
      "questions": [
        {
          "id": "q1",
          "question": "Is the topic interesting?",
          "options": ["Yes, it is", "No, it is not", "It is boring", "Not mentioned"],
          "answer": "Yes, it is"
        }
      ]
    };
    essayPrompt = `Write 5 simple sentences about your feelings on ${cleanTopic}.`;
  } else if (level === "Advanced") {
    vocabulary = [
      { "word": "Prerequisite", "ipa": "/ˌpriːˈrekwəzɪt/", "type": "Noun", "meaning": "Điều kiện kiên quyết", "example": `Understanding ${cleanTopic} is a prerequisite for advanced studies.` },
      { "word": "Conceptualize", "ipa": "/kənˈseptʃuəlaɪz/", "type": "Verb", "meaning": "Khái niệm hóa", "example": "It is difficult to conceptualize complex theories." },
      { "word": "Substantial", "ipa": "/səbˈstænʃl/", "type": "Adjective", "meaning": "Đáng kể", "example": "There is a substantial impact on society." }
    ];
    grammar = {
      "point": "Inversion and Cleft Sentences",
      "explanation": "Nhấn mạnh luận điểm nâng cao về " + cleanTopic,
      "structures": [
        "Inversion: Seldom do we see such development in " + cleanTopic,
        "Cleft sentence: It is this topic that defines modern research."
      ]
    };
    reading = {
      "title": `Advanced Insights into ${cleanTopic}`,
      "content": `The debate surrounding ${cleanTopic} has sparked substantial controversy in academic circles. Seldom do scholars agree on its immediate benefits. To conceptualize this paradigm requires analyzing empirical data from multiple sources. It is this depth of study that remains indispensable for anyone wishing to master the subject. Educators recommend that students research this field critically.`,
      "questions": [
        {
          "id": "q1",
          "question": "What is recommended for students to do?",
          "options": ["Read only one book", "Research the field critically", "Ignore empirical data", "Support controversial ideas"],
          "answer": "Research the field critically"
        }
      ]
    };
    essayPrompt = `Write a short essay (150-200 words) discussing the global impact of ${cleanTopic}. Incorporate inversion and cleft sentences.`;
  } else {
    // Intermediate (Default)
    vocabulary = [
      { "word": "Improve", "ipa": "/ɪmˈpruːv/", "type": "Verb", "meaning": "Cải thiện", "example": "Practice helps improve your skills." },
      { "word": "Topic", "ipa": "/ˈtɒpɪk/", "type": "Noun", "meaning": "Chủ đề", "example": "This is a popular topic today." },
      { "word": "Benefit", "ipa": "/ˈbenɪfɪt/", "type": "Noun/Verb", "meaning": "Lợi ích", "example": "There are many benefits to learning." }
    ];
    grammar = {
      "point": "First Conditional",
      "explanation": "Diễn tả giả thuyết có thể xảy ra ở hiện tại hoặc tương lai liên quan đến " + cleanTopic,
      "structures": ["If + S + V(simple present), S + will + V (If you study this topic, you will learn a lot.)"]
    };
    reading = {
      "title": `Learning about ${cleanTopic}`,
      "content": `Many people want to improve their knowledge of ${cleanTopic}. It is a highly practical skill in modern life. If you study this daily, you will see key benefits soon. It is not too hard, but you need to practice. We will explore different methods to learn it efficiently.`,
      "questions": [
        {
          "id": "q1",
          "question": "What happens if you study daily?",
          "options": ["You get tired", "You see benefits soon", "You forget everything", "Nothing changes"],
          "answer": "You see benefits soon"
        }
      ]
    };
    essayPrompt = `Write a short paragraph (80-120 words) explaining how ${cleanTopic} affects your daily life.`;
  }

  const generatedLesson = {
    id,
    level,
    title: `AI Generated Lesson: ${cleanTopic}`,
    description: `A custom generated curriculum lesson about ${cleanTopic} tailored for ${level} learners.`,
    vocabulary,
    grammar,
    reading,
    essayPrompt
  };

  // Temporarily add to in-memory lessons database
  lessons.push(generatedLesson);

  res.json({
    message: "Lesson generated successfully!",
    lesson: generatedLesson
  });
});

// Start Server locally if not running serverless on Vercel
const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Express Server running on port ${PORT}`);
  });
}

export default app;
