import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

const API_BASE = 'http://localhost:3001/api';

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lms_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('lms_students');
    return saved ? JSON.parse(saved) : [
      {
        username: "Ngoc Lan",
        classification: "Basic",
        quizScore: "2/5",
        essayText: "i is lan. i am student. i don't like homework.",
        essayScore: 3.5,
        feedback: "Your writing needs support. Review simple present and spelling.",
        submissions: []
      },
      {
        username: "Minh Khoa",
        classification: "Intermediate",
        quizScore: "4/5",
        essayText: "My name is Khoa. I have lived in Da Nang for two years. I study software engineering. I have accomplished many projects. It is a good experience.",
        essayScore: 6.8,
        feedback: "Good work! Clear structure, but watch out for vocabulary variety.",
        submissions: []
      },
      {
        username: "Gia Bao",
        classification: "Advanced",
        quizScore: "5/5",
        essayText: "Generative AI represents a paradigm shift in education. Rarely has a technology disrupted classical models so fast. It is indispensable that students adapt.",
        essayScore: 8.9,
        feedback: "Outstanding work! Excellent inversion structure and lexicon usage.",
        submissions: []
      }
    ];
  });

  // Sync state to local storage
  useEffect(() => {
    if (user) {
      localStorage.setItem('lms_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('lms_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('lms_students', JSON.stringify(students));
  }, [students]);

  // Fetch initial lessons
  const fetchLessons = async (level = '') => {
    try {
      const url = level ? `${API_BASE}/lessons?level=${level}` : `${API_BASE}/lessons`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLessons(data);
      } else {
        // Fallback if backend server is not running (e.g. static mode)
        const staticRes = await fetch('/api/data/lessons.json');
        if (staticRes.ok) {
          const staticData = await staticRes.json();
          setLessons(level ? staticData.filter(l => l.level === level) : staticData);
        }
      }
    } catch (e) {
      console.warn("API Server not reached, using simulated local state", e);
      // Hardcoded fallback data to keep app functional in static preview
      const fallbackLessons = [
        {
          "id": "lesson-1",
          "level": "Basic",
          "title": "Essential Vocabulary: Introduce Yourself",
          "description": "Learn basic English words and greeting phrases to introduce yourself confidently.",
          "vocabulary": [
            { "word": "Introduce", "ipa": "/ˌɪntrəˈdjuːs/", "type": "Verb", "meaning": "Giới thiệu", "example": "Let me introduce myself. My name is Nam." },
            { "word": "Greeting", "ipa": "/ˈɡriːtɪŋ/", "type": "Noun", "meaning": "Lời chào", "example": "'Hello' is a friendly greeting." }
          ],
          "grammar": {
            "point": "Verb TO BE (am/is/are)",
            "explanation": "Dùng để giới thiệu tên, tuổi, quốc tịch, nghề nghiệp.",
            "structures": ["I + am", "He/She/It + is", "You/We/They + are"]
          },
          "reading": {
            "title": "Meet Huy",
            "content": "Hello! My name is Huy. I am nineteen years old. I live in Ho Chi Minh City. I am a student. In my free time, I like reading books.",
            "questions": [
              { "id": "q1", "question": "How old is Huy?", "options": ["18", "19", "20"], "answer": "19" }
            ]
          },
          "essayPrompt": "Write a short paragraph (50-80 words) introducing yourself, including your name, age, city, and hobbies."
        },
        {
          "id": "lesson-2",
          "level": "Intermediate",
          "title": "Practical Grammar: Present Perfect vs Simple Past",
          "description": "Master the distinction between activities completed in the past and those connected to the present.",
          "vocabulary": [
            { "word": "Experience", "ipa": "/ɪkˈspɪəriəns/", "type": "Noun", "meaning": "Trải nghiệm", "example": "Travelling gives you experiences." }
          ],
          "grammar": {
            "point": "Present Perfect vs Simple Past",
            "explanation": "Simple Past dùng cho hành động đã kết thúc. Present Perfect kéo dài đến hiện tại.",
            "structures": ["S + V2/ed", "S + have/has + V3/ed"]
          },
          "reading": {
            "title": "A Journey of Career Transition",
            "content": "Minh has been a software QA tester for three years. However, last month, he decided to transition into an AI Developer.",
            "questions": [
              { "id": "q1", "question": "How long has Minh worked as a QA?", "options": ["2 years", "3 years"], "answer": "3 years" }
            ]
          },
          "essayPrompt": "Write a paragraph (100-150 words) describing a major transition or experience in your career or education."
        },
        {
          "id": "lesson-3",
          "level": "Advanced",
          "title": "Advanced Writing: Inversion & Subjunctive Mood",
          "description": "Elevate your essay style by utilizing formal inversion structures and expressing hypothetical scenarios.",
          "vocabulary": [
            { "word": "Paradigm shift", "ipa": "/ˈpærədaɪm ʃɪft/", "type": "Noun", "meaning": "Thay đổi tư duy", "example": "AI represents a paradigm shift." }
          ],
          "grammar": {
            "point": "Inversion & Subjunctive Mood",
            "explanation": "Đảo ngữ nhấn mạnh và cấu trúc câu giả định.",
            "structures": ["Negative Word + Auxiliary Verb + S + V", "S1 + recommend + that + S2 + V (bare)"]
          },
          "reading": {
            "title": "The Paradigm Shift in Modern Pedagogy",
            "content": "Rarely has technology disrupted traditional educational models as profoundly as artificial intelligence.",
            "questions": [
              { "id": "q1", "question": "What does AI disrupt?", "options": ["Traditional educational models", "Transport systems"], "answer": "Traditional educational models" }
            ]
          },
          "essayPrompt": "Write an argumentative essay (200-250 words) on how artificial intelligence is changing education."
        }
      ];
      setLessons(level ? fallbackLessons.filter(l => l.level === level) : fallbackLessons);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_BASE}/students`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (e) {
      console.warn("Failed to fetch students from API, using local storage fallback", e);
    }
  };

  useEffect(() => {
    if (user && user.role === 'Admin') {
      fetchStudents();
    }
  }, [user]);

  // Handle login
  const loginUser = async (username, password) => {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
        fetchStudents();
        return { success: true, user: data };
      } else {
        const errData = await res.json();
        return { success: false, error: errData.error };
      }
    } catch (err) {
      console.warn("Failed to login via API, running local mock login", err);
      if (username === 'admin' && password === 'admin123') {
        const adminUser = { username: 'admin', role: 'Admin', fullName: 'System Administrator', placementTestDone: true };
        setUser(adminUser);
        return { success: true, user: adminUser };
      }
      const existing = students.find(s => s.username === username);
      if (existing) {
        setUser(existing);
        return { success: true, user: existing };
      }
      return { success: false, error: "Tên đăng nhập hoặc mật khẩu không chính xác." };
    }
  };

  // Handle student registration
  const registerUser = async (username, password, role, studentDetails = {}) => {
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role, ...studentDetails })
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
        fetchStudents();
        return { success: true, user: data };
      } else {
        const errData = await res.json();
        return { success: false, error: errData.error };
      }
    } catch (err) {
      console.warn("Failed to register via API, fallback to local storage", err);
    }

    const newUser = {
      username,
      password,
      role,
      fullName: studentDetails.fullName || username,
      email: studentDetails.email || "N/A",
      phone: studentDetails.phone || "N/A",
      dob: studentDetails.dob || "N/A",
      target: studentDetails.target || "General English",
      classification: null,
      placementTestDone: false
    };
    setUser(newUser);
    if (role === 'Student' && !students.some(s => s.username === username)) {
      setStudents(prev => [...prev, {
        ...newUser,
        quizScore: null,
        essayText: "",
        essayScore: null,
        feedback: "",
        submissions: []
      }]);
    }
    return { success: true, user: newUser };
  };

  // Submit placement test
  const submitPlacementTest = async (quizAnswers, essayText) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/placement-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, quizAnswers, essayText })
      });

      if (res.ok) {
        const data = await res.json();
        const updatedUser = {
          ...user,
          classification: data.classification,
          placementTestDone: true
        };
        setUser(updatedUser);

        // Update student list record
        setStudents(prev => prev.map(s => s.username === user.username ? {
          ...s,
          classification: data.classification,
          quizScore: data.quizScore,
          essayText,
          essayScore: data.essayEvaluation.score,
          feedback: data.essayEvaluation.feedback,
          submissions: []
        } : s));

        return data;
      }
    } catch (e) {
      console.warn("Failed to contact API server for placement test, running local fallback logic", e);
      // Local fallback logic
      const words = essayText.split(/\s+/).filter(Boolean).length;
      let score = 5.5;
      let classification = "Intermediate";

      if (words < 10) {
        score = 3.0;
        classification = "Basic";
      } else if (words > 60 && essayText.toLowerCase().includes("paradigm")) {
        score = 8.5;
        classification = "Advanced";
      } else if (words < 30) {
        classification = "Basic";
        score = 4.5;
      }

      const updatedUser = {
        ...user,
        classification,
        placementTestDone: true
      };
      setUser(updatedUser);

      setStudents(prev => prev.map(s => s.username === user.username ? {
        ...s,
        classification,
        quizScore: "3/5",
        essayText,
        essayScore: score,
        feedback: `[Simulated Feedback] Evaluated locally. Your estimated score is ${score}/10. You have been placed in the ${classification} class.`,
        submissions: []
      } : s));

      return { classification };
    }
  };

  // Submit Lesson Assignment Essay
  const submitAssignment = async (lessonId, essayText) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/essay-grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, studentName: user.username, essayText })
      });

      if (res.ok) {
        const data = await res.json();
        
        // Update student submissions
        setStudents(prev => prev.map(s => {
          if (s.username === user.username) {
            const subs = s.submissions ? [...s.submissions] : [];
            const existingIdx = subs.findIndex(sub => sub.lessonId === lessonId);
            const newSub = {
              lessonId,
              essayText,
              evaluation: data.evaluation,
              gradedAt: new Date().toLocaleDateString()
            };
            if (existingIdx > -1) {
              subs[existingIdx] = newSub;
            } else {
              subs.push(newSub);
            }
            return { ...s, submissions: subs };
          }
          return s;
        }));
        return data;
      }
    } catch (e) {
      console.warn("Failed to contact grading server, running fallback grading", e);
      const score = Math.round((5 + Math.random() * 4) * 10) / 10;
      const feedback = `[Simulated] Good attempt. Your writing shows progress. Score: ${score}/10.`;
      
      setStudents(prev => prev.map(s => {
        if (s.username === user.username) {
          const subs = s.submissions ? [...s.submissions] : [];
          const newSub = {
            lessonId,
            essayText,
            evaluation: {
              score,
              scores: { grammar: score, vocabulary: score, coherence: score },
              feedback,
              improvedText: essayText
            },
            gradedAt: new Date().toLocaleDateString()
          };
          subs.push(newSub);
          return { ...s, submissions: subs };
        }
        return s;
      }));
      return {
        evaluation: { score, feedback, scores: { grammar: score, vocabulary: score, coherence: score }, improvedText: essayText }
      };
    }
  };

  // Add Lesson dynamically (Generated by AI)
  const addLesson = (newLesson) => {
    setLessons(prev => {
      if (prev.some(l => l.id === newLesson.id)) return prev;
      return [...prev, newLesson];
    });
  };

  // Update specific student classification
  const updateStudentClassification = async (username, newLevel) => {
    try {
      const res = await fetch(`${API_BASE}/students/update-level`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, classification: newLevel })
      });
      if (res.ok) {
        fetchStudents();
      }
    } catch (e) {
      console.warn("Failed to update student level on server, using local fallback", e);
    }

    setStudents(prev => prev.map(s => s.username === username ? {
      ...s,
      classification: newLevel
    } : s));
    if (user && user.username === username) {
      setUser(prev => ({ ...prev, classification: newLevel }));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lms_user');
  };

  return (
    <AppContext.Provider value={{
      user,
      lessons,
      students,
      loginUser,
      registerUser,
      submitPlacementTest,
      submitAssignment,
      addLesson,
      updateStudentClassification,
      logout,
      fetchLessons
    }}>
      {children}
    </AppContext.Provider>
  );
};
