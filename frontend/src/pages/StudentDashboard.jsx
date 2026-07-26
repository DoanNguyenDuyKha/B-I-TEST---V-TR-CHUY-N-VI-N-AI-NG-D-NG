import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { BookOpen, Award, CheckCircle, ChevronRight, Play, Check, Send, Award as Medal, Sparkles, BookOpen as BookIcon, GraduationCap, Loader2, AlertCircle, FileText, XCircle, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const { user, lessons, students, submitAssignment, logout, fetchLessons, updateStudentClassification } = useContext(AppContext);
  const navigate = useNavigate();
  
  // Lesson state
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [essayText, setEssayText] = useState('');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [gradingResult, setGradingResult] = useState(null);

  // Split learning tab state: 'study' (Vocabulary, Grammar, Reading), 'quiz' (The 10 MCQs), or 'essay' (The essay prompt)
  const [lessonTab, setLessonTab] = useState('study');

  // AI Guidance Counselor Toast Banner state
  const [aiGuidance, setAiGuidance] = useState("");
  const [fetchingGuidance, setFetchingGuidance] = useState(false);

  useEffect(() => {
    const fetchGuidance = async () => {
      if (!user) return;
      setFetchingGuidance(true);
      try {
        const res = await fetch(`http://localhost:3001/api/student-guidance?username=${user.username}`);
        if (res.ok) {
          const data = await res.json();
          setAiGuidance(data.guidance);
        }
      } catch (e) {
        console.warn("Failed to fetch AI counselor guidance", e);
      } finally {
        setFetchingGuidance(false);
      }
    };
    fetchGuidance();
  }, [user, lessons, students]);

  // Progress Assessment states
  const [isTakingProgressTest, setIsTakingProgressTest] = useState(false);
  const [isGeneratingProgressTest, setIsGeneratingProgressTest] = useState(false);
  const [progressTest, setProgressTest] = useState(null);
  const [progressQuizAnswers, setProgressQuizAnswers] = useState({});
  const [progressEssayText, setProgressEssayText] = useState('');
  const [progressSubmitting, setProgressSubmitting] = useState(false);
  const [studySchedule, setStudySchedule] = useState({
    time: localStorage.getItem(`schedule_time_${user?.username}`) || '20:00',
    days: localStorage.getItem(`schedule_days_${user?.username}`) || 'Thứ 2, 4, 6'
  });
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);

  const aiRecommendations = {
    Basic: "Hãy tập trung học thuộc từ vựng cốt lõi của mỗi bài, luyện đặt câu đơn giản ở thì Hiện tại đơn. Hãy hoàn thành cả 3 bài học Cơ bản và dành tối thiểu 20 phút ôn luyện mỗi ngày.",
    Intermediate: "Hãy rèn luyện sử dụng các liên từ chỉ quan hệ nhân quả/tương phản (although, because, whereas) trong bài viết luận. Hãy hoàn thành đầy đủ 3 bài học để sẵn sàng mở khóa thi thăng lớp Advanced.",
    Advanced: "Tập trung cải thiện tính đa dạng từ vựng học thuật bằng cách dùng các từ đồng nghĩa nâng cao. Luyện cấu trúc câu đảo ngữ và giả định để chuẩn bị đạt band điểm tối đa."
  };
  const [progressTestResult, setProgressTestResult] = useState(null);
  
  // Phase of progress test result: 'review' (review mcq & essay feedback first) or 'result' (show congratulatory/retention screen)
  const [progressPhase, setProgressPhase] = useState('review');

  // Speaking Simulator states
  const [isSpeakingMode, setIsSpeakingMode] = useState(false);
  const [speakingTopic, setSpeakingTopic] = useState("Introduce Yourself");
  const [speakingInput, setSpeakingInput] = useState("");
  const [speakingChatHistory, setSpeakingChatHistory] = useState([]);
  const [speakingSubmitting, setSpeakingSubmitting] = useState(false);

  // Lesson chat states
  const [lessonInput, setLessonInput] = useState("");
  const [lessonChatHistory, setLessonChatHistory] = useState([
    { sender: "ai", text: "Chào bạn! Tôi là Trợ lý Bài học AI. Bạn có thắc mắc gì về cấu trúc ngữ pháp, từ vựng hoặc bài đọc hiểu này không?" }
  ]);
  const [lessonChatSubmitting, setLessonChatSubmitting] = useState(false);

  const handleRequestSpeakingMode = (topicName = "Introduce Yourself") => {
    setIsSpeakingMode(true);
    setSelectedLesson(null);
    setIsTakingProgressTest(false);
    setSpeakingTopic(topicName);
    
    const greetings = {
      "Introduce Yourself": "Hello! I am your AI Speaking Partner. Let's practice introducing yourself in English. What is your name, age, and your hobby?",
      "Job Interview": "Welcome to the tech company job interview simulator. Can you tell me about yourself and why you want to apply for this job in English?",
      "Coffee Shop": "Hi there! Welcome to the Coffee Shop. What would you like to order today, and how is your weekend going?"
    };

    setSpeakingChatHistory([
      { sender: "ai", text: greetings[topicName] || greetings["Introduce Yourself"], feedback: "" }
    ]);
  };

  const handleSendSpeakingMessage = async () => {
    if (!speakingInput.trim() || speakingSubmitting) return;
    const studentMessage = speakingInput;
    setSpeakingInput("");
    setSpeakingChatHistory(prev => [...prev, { sender: "user", text: studentMessage }]);
    setSpeakingSubmitting(true);

    try {
      const res = await fetch('http://localhost:3001/api/speaking-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: studentMessage,
          history: speakingChatHistory
        })
      });
      if (res.ok) {
        const data = await res.json();
        let feedback = "";
        let reply = data.reply;
        if (data.reply.includes("Feedback:") && data.reply.includes("Reply:")) {
          const parts = data.reply.split("Reply:");
          feedback = parts[0].replace("Feedback:", "").trim();
          reply = parts[1].trim();
        } else if (data.reply.includes("Feedback:")) {
          feedback = data.reply.replace("Feedback:", "").trim();
          reply = "";
        }
        setSpeakingChatHistory(prev => [...prev, { sender: "ai", text: reply || data.reply, feedback }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSpeakingSubmitting(false);
    }
  };

  const handleSendLessonChatMessage = async () => {
    if (!lessonInput.trim() || lessonChatSubmitting) return;
    const msg = lessonInput;
    setLessonInput("");
    setLessonChatHistory(prev => [...prev, { sender: "user", text: msg }]);
    setLessonChatSubmitting(true);

    try {
      const res = await fetch('http://localhost:3001/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          lessonContext: {
            title: selectedLesson.title,
            level: selectedLesson.level,
            grammarPoint: selectedLesson.grammar?.point || "",
            vocabulary: selectedLesson.vocabulary?.map(v => v.word).join(", ") || ""
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        setLessonChatHistory(prev => [...prev, { sender: "ai", text: data.reply }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLessonChatSubmitting(false);
    }
  };

  const currentStudentData = students.find(s => s.username === user?.username);
  const matchedLessons = lessons.filter(l => l.username === user?.username || (!l.username && l.level === user?.classification));

  const handleOpenLesson = (lesson) => {
    setIsTakingProgressTest(false);
    setIsSpeakingMode(false);
    setSelectedLesson(lesson);
    setEssayText('');
    setQuizAnswers({});
    setQuizSubmitted(false);
    setGradingResult(null);
    setLessonChatHistory([
      { sender: "ai", text: `Chào bạn! Tôi là Trợ lý Bài học AI. Bạn có thắc mắc gì về cấu trúc ngữ pháp, từ vựng hoặc bài đọc hiểu của bài "${lesson.title}" không?` }
    ]);

    // Look for previous submission
    const prevSub = currentStudentData?.submissions?.find(sub => sub.lessonId === lesson.id);
    if (prevSub) {
      setGradingResult(prevSub.evaluation);
      setEssayText(prevSub.essayText);
    }
  };

  const handleQuizAnswer = (qId, option) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleSubmitQuiz = (lesson) => {
    let score = 0;
    lesson.reading.questions.forEach(q => {
      if (quizAnswers[q.id] === q.answer) {
        score++;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
  };

  const handleSubmitEssay = async (lessonId) => {
    if (!essayText.trim()) return;
    setSubmitting(true);
    const res = await submitAssignment(lessonId, essayText);
    setGradingResult(res.evaluation);
    setSubmitting(false);
  };

  // Start Progress Assessment
  const handleRequestProgressTest = async () => {
    setIsTakingProgressTest(true);
    setSelectedLesson(null);
    setIsGeneratingProgressTest(true);
    setProgressQuizAnswers({});
    setProgressEssayText('');
    setProgressTestResult(null);
    setProgressPhase('review');

    try {
      const res = await fetch(`http://localhost:3001/api/progress-test?level=${user?.classification}`);
      if (res.ok) {
        const data = await res.json();
        setProgressTest(data);
      } else {
        throw new Error("Failed to load test");
      }
    } catch (e) {
      console.error(e);
      // Fallback
      setProgressTest({
        questions: [
          { id: "q1", question: "Choose the correct spelling:", options: ["English", "Englesh", "Inglish", "Englich"], answer: "English", explanation: "'English' (Tiếng Anh/người Anh) là cách viết chính tả đúng chuẩn duy nhất." },
          { id: "q2", question: "If it ______ tomorrow, we will stay at home.", options: ["rains", "rain", "will rain", "rained"], answer: "rains", explanation: "Câu điều kiện loại 1 (If + S + V(hiện tại đơn), S + will + V)." },
          { id: "q3", question: "She is interested ______ learning English.", options: ["on", "at", "in", "for"], answer: "in", explanation: "Cụm tính từ cố định: 'be interested in' (thích thú/quan tâm làm gì)." },
          { id: "q4", question: "I have lived in Ho Chi Minh City ______ 2021.", options: ["since", "for", "in", "ago"], answer: "since", explanation: "Dấu hiệu 'since 2021' chỉ một hành động bắt đầu từ quá khứ kéo dài đến hiện tại, sử dụng thì Hiện tại hoàn thành." },
          { id: "q5", question: "Choose the word with the CLOSEST meaning to 'abundant':", options: ["Scarce", "Small", "Rare", "Plentiful"], answer: "Plentiful", explanation: "'Abundant' nghĩa là dồi dào, phong phú, đồng nghĩa với 'Plentiful'." }
        ],
        essayPrompt: "Write a short paragraph (80-120 words) explaining how your English study target aligns with your future career goals."
      });
    } finally {
      setIsGeneratingProgressTest(false);
    }
  };

  // Submit Progress Assessment
  const handleSubmitProgressTest = async () => {
    if (!progressTest) return;
    setProgressSubmitting(true);

    let score = 0;
    progressTest.questions.forEach(q => {
      if (progressQuizAnswers[q.id] === q.answer) {
        score++;
      }
    });

    try {
      const res = await fetch('http://localhost:3001/api/progress-test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          quizScore: score,
          essayText: progressEssayText,
          currentLevel: user.classification
        })
      });

      if (res.ok) {
        const data = await res.json();
        setProgressTestResult(data);
        setProgressPhase('review'); // Default to review phase first
      } else {
        throw new Error("Failed to evaluate promotion");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProgressSubmitting(false);
    }
  };

  const handleConfirmPromotionResult = () => {
    if (progressTestResult?.decision === 'Promoted') {
      updateStudentClassification(user.username, progressTestResult.newLevel);
    }
    setIsTakingProgressTest(false);
    setProgressTestResult(null);
  };

  const getLevelColor = (lvl) => {
    switch (lvl) {
      case 'Advanced': return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
      case 'Intermediate': return 'text-blue-400 border-blue-500/20 bg-blue-500/5';
      case 'Basic': return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
      default: return 'text-slate-400 border-slate-500/20 bg-slate-500/5';
    }
  };

  return (
    <div className="flex-1 w-full py-4 grid grid-cols-1 lg:grid-cols-4 gap-8">
      
      {/* Top Banner: AI Dynamic Counselor Guidance */}
      {aiGuidance && (
        <div className="col-span-1 lg:col-span-4 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-5 shadow-sm relative overflow-hidden shrink-0 flex items-center gap-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/20 rounded-full blur-2xl"></div>
          <div className="bg-indigo-600 text-white p-3 rounded-xl shrink-0 shadow-md">
            <Sparkles className="w-6 h-6 animate-pulse text-white" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-widest flex items-center gap-1.5">
              <span>Trợ lý Học tập AI khuyên bạn</span>
            </h4>
            <p className="text-sm font-semibold text-slate-800 leading-relaxed">
              "{aiGuidance}"
            </p>
          </div>
        </div>
      )}

      {/* Sidebar Column */}
      <div className="space-y-6">
        
        {/* Profile Card */}
        <div className="glass p-6 rounded-xl border border-slate-700/50 shadow-lg relative overflow-hidden space-y-4">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/20">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{user?.fullName || user?.username}</h3>
              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border mt-1 inline-block ${getLevelColor(user?.classification)}`}>
                Lớp: {user?.classification || 'Chưa phân loại'}
              </span>
            </div>
          </div>

          <div className="text-xs space-y-2 border-t border-slate-800/80 pt-3 text-slate-400">
            <div><span className="font-semibold text-slate-500">Tên tài khoản:</span> <span className="text-slate-300">{user?.username}</span></div>
            {user?.email && user?.email !== 'N/A' && (
              <div><span className="font-semibold text-slate-500">Email:</span> <span className="text-slate-300">{user.email}</span></div>
            )}
            {user?.target && (
              <div><span className="font-semibold text-slate-500">Mục tiêu:</span> <span className="text-indigo-400 font-semibold">{user.target}</span></div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between items-center text-[10px]">
            <div className="text-slate-500">
              Thành viên từ: <span className="text-slate-300">2026</span>
            </div>
            <button onClick={logout} className="text-red-400 hover:text-red-300 font-bold transition-colors">
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Study Scheduler Box */}
        <div className="glass p-6 rounded-xl border border-slate-700/50 shadow-lg space-y-4">
          <h4 className="font-bold text-white flex items-center gap-2 text-xs uppercase tracking-wider text-indigo-400">
            📅 Lập Lịch Học Tập
          </h4>
          {isEditingSchedule ? (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Giờ học mỗi ngày</label>
                <input
                  type="time"
                  value={studySchedule.time}
                  onChange={(e) => setStudySchedule(prev => ({ ...prev, time: e.target.value }))}
                  className="bg-slate-900 border border-slate-800 text-white rounded p-1.5 text-xs w-full focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Ngày trong tuần</label>
                <input
                  type="text"
                  value={studySchedule.days}
                  onChange={(e) => setStudySchedule(prev => ({ ...prev, days: e.target.value }))}
                  placeholder="Ví dụ: Thứ 2, 4, 6"
                  className="bg-slate-900 border border-slate-800 text-white rounded p-1.5 text-xs w-full focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                onClick={() => {
                  localStorage.setItem(`schedule_time_${user?.username}`, studySchedule.time);
                  localStorage.setItem(`schedule_days_${user?.username}`, studySchedule.days);
                  setIsEditingSchedule(false);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 rounded text-[11px] transition-colors"
              >
                Lưu lịch học
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-300 leading-relaxed">
                Bạn đã quy định lịch học tập vào lúc <strong className="text-indigo-400">{studySchedule.time}</strong> các ngày <strong className="text-indigo-400">{studySchedule.days}</strong> hàng tuần.
              </p>
              <button
                onClick={() => setIsEditingSchedule(true)}
                className="text-[10px] text-slate-500 hover:text-slate-350 underline font-semibold"
              >
                Thay đổi lịch học
              </button>
            </div>
          )}
        </div>

        {/* AI Promotion Test Box */}
        <div className="glass p-6 rounded-xl border border-slate-700/50 shadow-lg space-y-4">
          <div>
            <h4 className="font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Đánh Giá Nâng Lớp (AI)
            </h4>
            <p className="text-[10px] text-slate-400 mt-1">Yêu cầu AI tự động sinh bài Progress Test thích ứng theo trình độ hiện tại</p>
          </div>

          {(() => {
            const completedCount = matchedLessons.filter(l => 
              currentStudentData?.submissions?.some(sub => sub.lessonId === l.id)
            ).length;
            const isUnlocked = matchedLessons.length > 0 && completedCount === matchedLessons.length;

            return (
              <div className="space-y-3">
                {isUnlocked ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-xs text-emerald-400 flex gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>🔓 Đã mở khóa: Bạn đã hoàn thành {completedCount}/{matchedLessons.length} bài học. Có thể thi nâng lớp!</span>
                  </div>
                ) : (
                  <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-xs text-red-400 flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 animate-pulse" />
                    <span>🔒 Đang khóa: Bạn mới hoàn thành {completedCount}/{matchedLessons.length} bài học. Hãy làm bài tập của tất cả bài học để mở khóa thi nâng lớp.</span>
                  </div>
                )}

                <button
                  onClick={handleRequestProgressTest}
                  disabled={!isUnlocked || isTakingProgressTest || isGeneratingProgressTest}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/40 font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                >
                  <GraduationCap className="w-4 h-4" />
                  Bắt đầu thi nâng lớp
                </button>
              </div>
            );
          })()}
        </div>

        {/* AI Speaking Simulator Box */}
        <div className="glass p-6 rounded-xl border border-slate-700/50 shadow-lg space-y-4">
          <div>
            <h4 className="font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              🗣️ Luyện Giao Tiếp AI
            </h4>
            <p className="text-[10px] text-slate-400 mt-1">Luyện hội thoại trực tiếp với AI để cải thiện phản xạ bản xứ.</p>
          </div>

          <button
            onClick={() => handleRequestSpeakingMode()}
            className={`w-full font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 border ${
              isSpeakingMode
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-slate-900 text-indigo-400 border-indigo-500/20 hover:border-indigo-500/40 hover:bg-slate-800'
            }`}
          >
            Bắt đầu luyện giao tiếp
          </button>
        </div>

        {/* Learning Roadmap */}
        <div className="glass p-6 rounded-xl border border-slate-700/50 shadow-lg space-y-4">
          <div>
            <h4 className="font-bold text-white flex items-center gap-2">
              <BookIcon className="w-5 h-5 text-indigo-400" />
              Lộ Trình Học Cá Nhân
            </h4>
            <p className="text-xs text-slate-400 mt-1">Được thiết kế tự động cho trình độ {user?.classification}</p>
          </div>

          <div className="relative pl-6 border-l-2 border-indigo-600/30 space-y-6 py-2 ml-2">
            {matchedLessons.map((lesson, idx) => {
              const isCompleted = currentStudentData?.submissions?.some(s => s.lessonId === lesson.id);
              const isSelected = selectedLesson?.id === lesson.id;
              
              return (
                <div
                  key={lesson.id}
                  onClick={() => handleOpenLesson(lesson)}
                  className={`relative cursor-pointer group transition-all ${
                    isSelected ? 'scale-[1.02]' : ''
                  }`}
                >
                  <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 transition-colors flex items-center justify-center ${
                    isCompleted
                      ? 'bg-indigo-500 border-indigo-500 text-white'
                      : isSelected
                      ? 'bg-slate-900 border-indigo-400'
                      : 'bg-slate-900 border-slate-700 group-hover:border-slate-500'
                  }`}>
                    {isCompleted && <Check className="w-2.5 h-2.5" />}
                  </div>
                  
                  <div>
                    <h5 className={`text-xs font-bold transition-colors ${
                      isSelected ? 'text-indigo-400' : 'text-slate-300 group-hover:text-white'
                    }`}>
                      Bài {idx + 1}: {lesson.title}
                    </h5>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] text-slate-500 line-clamp-1 flex-1">{lesson.description}</p>
                      {lesson.studyTime && (
                        <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 shrink-0 font-semibold">
                          ⏱️ {lesson.studyTime}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3">
        {isSpeakingMode ? (
          /* Speaking simulator view */
          <div className="glass p-6 rounded-xl border border-slate-700/50 shadow-lg flex flex-col h-[650px] relative overflow-hidden">
            <div className="border-b border-slate-800 pb-4 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  AI Speaking Partner ({speakingTopic})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Thực hành hội thoại tự nhiên & nhận đánh giá ngữ pháp từ AI thời gian thực</p>
              </div>
              
              <div className="flex gap-2">
                {["Introduce Yourself", "Job Interview", "Coffee Shop"].map(topic => (
                  <button
                    key={topic}
                    onClick={() => handleRequestSpeakingMode(topic)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                      speakingTopic === topic
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {topic === 'Introduce Yourself' ? 'Giới thiệu' : topic === 'Job Interview' ? 'Phỏng vấn' : 'Quán Cafe'}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat message list */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {speakingChatHistory.map((chat, idx) => (
                <div key={idx} className={`flex flex-col ${chat.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 text-xs ${
                    chat.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-950 text-slate-200 rounded-bl-none border border-slate-900'
                  }`}>
                    {chat.text}
                  </div>
                  {chat.feedback && (
                    <div className="mt-1.5 max-w-[85%] bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl p-3 text-[11px] leading-relaxed flex gap-2">
                      <span className="font-bold">💡 Feedback:</span>
                      <p>{chat.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
              {speakingSubmitting && (
                <div className="flex justify-start">
                  <div className="bg-slate-950 border border-slate-900 rounded-2xl p-3.5 text-xs text-slate-400 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                    <span>AI Speaking Partner đang viết phản hồi...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="border-t border-slate-800 pt-4 flex gap-2 shrink-0">
              <input
                type="text"
                value={speakingInput}
                onChange={(e) => setSpeakingInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendSpeakingMessage()}
                placeholder="Trả lời bằng tiếng Anh tại đây..."
                className="flex-1 bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleSendSpeakingMessage}
                disabled={speakingSubmitting || !speakingInput.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all"
              >
                Gửi <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : isTakingProgressTest ? (
          /* Taking Progress Test (AI Generated) */
          <div className="glass p-6 rounded-xl border border-slate-700/50 shadow-lg space-y-6">
            <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  Bài thi nâng lớp định kỳ - Lớp {user?.classification}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Sinh tự động bằng Google Gemini AI</p>
              </div>
              <button 
                onClick={() => { setIsTakingProgressTest(false); setProgressTestResult(null); }} 
                className="text-slate-500 hover:text-slate-300 text-xs font-bold"
              >
                Hủy bỏ
              </button>
            </div>

            {isGeneratingProgressTest ? (
              <div className="py-12 flex flex-col justify-center items-center gap-3">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <span className="text-xs text-slate-400 font-semibold">Gemini AI đang soạn bài kiểm tra thích ứng...</span>
              </div>
            ) : progressTestResult && progressPhase === 'review' ? (
              /* Review Progress Test MCQs & Essay */
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                    Xem lại bài thi nâng lớp định kỳ
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">Phân tích chi tiết từng câu trả lời trắc nghiệm và đánh giá bài viết</p>
                </div>

                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                  {progressTest?.questions?.map((q, idx) => {
                    const studentAns = progressQuizAnswers[q.id] || "Chưa chọn";
                    const isCorrect = studentAns === q.answer;
                    
                    return (
                      <div key={q.id} className="p-4 bg-slate-950/60 rounded-xl border border-slate-900 space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-xs font-bold text-slate-200">Câu {idx + 1}: {q.question}</p>
                          {isCorrect ? (
                            <span className="text-emerald-400 flex items-center gap-1 text-[10px] font-bold">
                              <CheckCircle className="w-3.5 h-3.5" /> Đúng
                            </span>
                          ) : (
                            <span className="text-red-400 flex items-center gap-1 text-[10px] font-bold">
                              <XCircle className="w-3.5 h-3.5" /> Sai
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-[10px]">
                          <div className="bg-slate-900 p-2 rounded border border-slate-800">
                            <span className="text-slate-500 font-semibold block">Bạn đã chọn:</span>
                            <span className={isCorrect ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{studentAns}</span>
                          </div>
                          <div className="bg-slate-900 p-2 rounded border border-slate-800">
                            <span className="text-slate-500 font-semibold block">Đáp án đúng:</span>
                            <span className="font-bold text-emerald-400">{q.answer}</span>
                          </div>
                        </div>

                        <div className="bg-indigo-950/20 p-2.5 rounded border border-indigo-500/10 text-xs text-indigo-200/90 leading-relaxed flex gap-2">
                          <span>💡</span>
                          <p><span className="font-bold text-indigo-300">Giải thích:</span> {q.explanation}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                  <span className="text-xs font-bold text-indigo-400 block uppercase tracking-wider">Bài viết luận tự luận của bạn:</span>
                  <p className="text-xs text-slate-350 italic">"{progressEssayText}"</p>
                </div>

                <button
                  onClick={() => setProgressPhase('result')}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  Xem Quyết Định Thăng Hạng / Bảo Lưu
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : progressTestResult && progressPhase === 'result' ? (
              /* Promotion / Retention Screen with graphics */
              <div className="space-y-6 text-center py-6">
                {progressTestResult.decision === 'Promoted' ? (
                  /* Congratulatory Screen */
                  <div className="space-y-6">
                    <div className="inline-flex p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400 animate-bounce">
                      <Medal className="w-16 h-16" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-3xl font-black text-white">🎉 XUẤT SẮC! BẠN ĐÃ ĐƯỢC THĂNG HẠNG LỚP</h4>
                      <p className="text-xs text-slate-400">Gemini AI đánh giá bạn đã tích lũy đủ kỹ năng cần thiết để vượt cấp</p>
                    </div>

                    <div className="flex items-center justify-center gap-4 py-4 max-w-sm mx-auto">
                      <div className="bg-slate-900 border border-slate-800 px-5 py-3 rounded-xl text-sm font-bold text-slate-400">
                        {user?.classification}
                      </div>
                      <ChevronRight className="w-6 h-6 text-indigo-400" />
                      <div className="bg-emerald-500 border border-emerald-400 px-5 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-500/20">
                        {progressTestResult.newLevel}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Comfort / Encouraging Retention Screen */
                  <div className="space-y-6">
                    <div className="inline-flex p-4 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-400">
                      <Heart className="w-16 h-16" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-3xl font-black text-white">💪 HÃY TIẾP TỤC CỐ GẮNG ÔN LUYỆN!</h4>
                      <p className="text-xs text-slate-400">Bạn đã hoàn thành rất tốt bài thi, hãy kiên trì rèn luyện thêm để thăng hạng lần tới nhé</p>
                    </div>

                    <div className="flex items-center justify-center gap-4 py-2 max-w-sm mx-auto">
                      <div className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-xl text-sm font-bold text-amber-400">
                        Giữ cấp lớp: {user?.classification}
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900 text-left space-y-2 max-w-lg mx-auto">
                  <span className="text-[10px] text-indigo-400 uppercase tracking-wider font-bold block">Nhận xét từ Giám đốc Học thuật AI:</span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{progressTestResult.explanation}</p>
                </div>

                <button
                  onClick={handleConfirmPromotionResult}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-8 rounded-xl text-xs transition-all shadow-lg"
                >
                  {progressTestResult.decision === 'Promoted' ? 'Cập nhật lộ trình học mới' : 'Quay lại Roadmap của tôi'}
                </button>
              </div>
            ) : (
              /* Writing and Quizzing form */
              <div className="space-y-6">
                
                {/* 5 Multiple Choice */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Phần 1: Trắc nghiệm kiến thức (10 câu)</h4>
                  {progressTest?.questions?.map((q, idx) => (
                    <div key={q.id} className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/80 space-y-2">
                      <p className="text-xs font-bold text-slate-200">{idx + 1}. {q.question}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options?.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => setProgressQuizAnswers(prev => ({ ...prev, [q.id]: opt }))}
                            className={`text-left text-xs py-2 px-3 rounded-lg border transition-all ${
                              progressQuizAnswers[q.id] === opt
                                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-semibold'
                                : 'bg-slate-800/20 border-slate-700/40 text-slate-300 hover:bg-slate-800/40'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Essay */}
                <div className="space-y-4 border-t border-slate-800 pt-4">
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Phần 2: Viết luận (Essay writing)</h4>
                  <div className="bg-indigo-950/10 p-4 rounded-xl border border-indigo-500/10 text-xs text-indigo-200 leading-relaxed italic">
                    {progressTest?.essayPrompt}
                  </div>
                  <textarea
                    rows={6}
                    value={progressEssayText}
                    onChange={(e) => setProgressEssayText(e.target.value)}
                    placeholder="Viết bài luận tiếng Anh của bạn tại đây..."
                    className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl p-4 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <div className="text-right text-[10px] text-slate-500">
                    Số từ: {progressEssayText.trim().split(/\s+/).filter(Boolean).length} từ
                  </div>
                </div>

                <button
                  onClick={handleSubmitProgressTest}
                  disabled={progressSubmitting || Object.keys(progressQuizAnswers).length < 10 || progressEssayText.trim().split(/\s+/).filter(Boolean).length < 10}
                  className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-40 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {progressSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gemini AI đang đánh giá bài thi nâng lớp...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Nộp bài thi cho AI đánh giá nâng cấp
                    </>
                  )}
                </button>

              </div>
            )}
          </div>
        ) : selectedLesson ? (
          /* Normal Lesson content view */
          <div className="glass p-6 rounded-xl border border-slate-700/50 shadow-lg space-y-6">
            <div className="border-b border-slate-800 pb-4 flex justify-between items-start gap-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Lộ trình học tập thích ứng</span>
                <h2 className="text-xl font-extrabold text-white mt-1">{selectedLesson.title}</h2>
                <p className="text-xs text-slate-400 mt-1">{selectedLesson.description}</p>
              </div>
              {selectedLesson.studyTime && (
                <div className="bg-indigo-50 border border-indigo-150 rounded-xl px-3 py-1.5 text-right shrink-0">
                  <span className="block text-[8px] uppercase tracking-wider text-indigo-500 font-bold">Thời gian học gợi ý</span>
                  <span className="text-xs font-bold text-indigo-850 flex items-center gap-1 mt-0.5 justify-end">
                    ⏱️ {selectedLesson.studyTime}
                  </span>
                </div>
              )}
            </div>

            {/* Tabs Selector for Separation of Study and Tests */}
            <div className="flex gap-2 border-b border-slate-200 pb-3 shrink-0">
              <button
                onClick={() => setLessonTab('study')}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                  lessonTab === 'study'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                📖 1. Học Bài Học (Study)
              </button>
              <button
                onClick={() => setLessonTab('quiz')}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                  lessonTab === 'quiz'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ✍️ 2. Làm Trắc Nghiệm (Quiz - 10 câu)
              </button>
              <button
                onClick={() => setLessonTab('essay')}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                  lessonTab === 'essay'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                📝 3. Bài Tập Viết Luận (Essay)
              </button>
            </div>

            {/* TAB 1: STUDY CONTENT */}
            {lessonTab === 'study' && (
              <div className="space-y-6">
                {/* 1. Vocabulary */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-indigo-300 border-b border-slate-800 pb-2 flex items-center gap-2">
                    <BookIcon className="w-5 h-5 text-indigo-400" />
                    1. Từ Vựng Trọng Tâm (Vocabulary)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedLesson.vocabulary?.map((vocab, idx) => (
                      <div key={idx} className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 space-y-2 relative overflow-hidden">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white text-sm">{vocab.word}</span>
                          <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20">{vocab.type}</span>
                        </div>
                        <div className="text-xs space-y-1">
                          <p className="text-slate-400 font-mono">{vocab.ipa}</p>
                          <p className="text-slate-300"><span className="font-semibold text-slate-500">Nghĩa:</span> {vocab.meaning}</p>
                          <p className="text-indigo-200/80 italic"><span className="font-semibold text-slate-500">VD:</span> {vocab.example}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Grammar */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-indigo-300 border-b border-slate-800 pb-2 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-400" />
                    2. Cấu Trúc Ngữ Pháp (Grammar Point)
                  </h3>
                  <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800/80 space-y-3">
                    <h4 className="font-bold text-sm text-white">{selectedLesson.grammar?.point}</h4>
                    <p className="text-xs text-slate-350">{selectedLesson.grammar?.explanation}</p>
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Cấu trúc:</span>
                      {selectedLesson.grammar?.structures?.map((struct, idx) => (
                        <code key={idx} className="block bg-slate-950 px-3 py-1.5 rounded border border-slate-800 text-xs text-indigo-300 font-mono">
                          {struct}
                        </code>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Reading Passage */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-indigo-300 border-b border-slate-800 pb-2 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    3. Đọc Hiểu & Từ Vựng Ngữ Cảnh (Reading)
                  </h3>
                  <div className="bg-slate-900/20 p-5 rounded-xl border border-slate-800/60 space-y-3">
                    <h4 className="font-bold text-sm text-indigo-400">{selectedLesson.reading?.title}</h4>
                    <p className="text-sm text-slate-300 leading-relaxed font-sans">{selectedLesson.reading?.content}</p>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-150 p-4 rounded-xl text-xs text-indigo-800 flex items-center justify-between">
                    <span>💡 Hãy chuẩn bị kỹ kiến thức từ vựng và ngữ pháp trước khi bước sang làm trắc nghiệm đánh giá!</span>
                    <button
                      onClick={() => setLessonTab('quiz')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-4 rounded-lg text-[10px] transition-all shrink-0"
                    >
                      Bắt đầu làm Quiz
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: QUIZ COMPONENT */}
            {lessonTab === 'quiz' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                  Bài trắc nghiệm đánh giá của bài học
                </h3>
                <div className="space-y-4">
                  {selectedLesson.reading?.questions?.map((q, idx) => (
                    <div key={q.id} className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/80 space-y-2">
                      <p className="text-sm font-semibold text-slate-200">
                        {idx + 1}. {q.question}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options?.map((opt, oIdx) => {
                          const isSelected = quizAnswers[q.id] === opt;
                          const isCorrect = opt === q.answer;
                          
                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleQuizAnswer(q.id, opt)}
                              className={`text-left text-xs py-2 px-3 rounded-lg border transition-all ${
                                quizSubmitted
                                  ? isCorrect
                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-semibold'
                                    : isSelected
                                    ? 'bg-red-500/10 border-red-500 text-red-400'
                                    : 'bg-slate-900/30 border-slate-800 text-slate-500'
                                  : isSelected
                                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                                  : 'bg-slate-800/20 border-slate-700/40 text-slate-300 hover:bg-slate-800/40'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  
                  {!quizSubmitted && (
                    <button
                      onClick={() => handleSubmitQuiz(selectedLesson)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all shadow-md"
                    >
                      Nộp câu trả lời trắc nghiệm
                    </button>
                  )}

                  {quizSubmitted && (
                    <div className="p-4 bg-indigo-50 border border-indigo-150 rounded-xl flex items-center justify-between">
                      <span className="text-sm text-indigo-900 font-semibold">
                        Điểm trắc nghiệm: {quizScore}/{selectedLesson.reading?.questions?.length} câu đúng.
                      </span>
                      <span className="text-xs text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">Đã nộp bài làm</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: ESSAY COMPONENT */}
            {lessonTab === 'essay' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                  Bài tập viết luận tự luyện
                </h3>
                <div className="space-y-4">
                  <div className="bg-indigo-950/10 p-4 rounded-xl border border-indigo-500/10 text-sm text-indigo-200 leading-relaxed">
                    <span className="font-bold block mb-1">Yêu cầu bài viết:</span>
                    {selectedLesson.essayPrompt}
                  </div>

                  <div className="space-y-2">
                    <textarea
                      rows={6}
                      value={essayText}
                      onChange={(e) => setEssayText(e.target.value)}
                      disabled={submitting}
                      placeholder="Nhập bài viết luận của bạn tại đây bằng tiếng Anh..."
                      className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl p-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-all font-mono"
                    />
                    <div className="text-right text-xs text-slate-500">
                      Từ vựng: {essayText.trim().split(/\s+/).filter(Boolean).length} từ
                    </div>
                  </div>

                  <button
                    onClick={() => handleSubmitEssay(selectedLesson.id)}
                    disabled={submitting || essayText.trim().split(/\s+/).filter(Boolean).length < 5}
                    className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all shadow-md flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        AI đang chấm bài...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Nộp bài viết & Chấm điểm AI
                      </>
                    )}
                  </button>

                  {/* AI Grading result */}
                  {gradingResult && (
                    <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-800/80 space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                        <div>
                          <h4 className="font-bold text-white text-sm">Kết quả đánh giá từ AI</h4>
                          <p className="text-[10px] text-slate-500">Trình độ mục tiêu: {selectedLesson.level}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black text-indigo-400">{gradingResult.score}</span>
                          <span className="text-xs text-slate-500">/10</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-slate-900/80 p-2 rounded">
                          <span className="text-slate-500 block">Ngữ pháp</span>
                          <span className="font-bold text-slate-200">{gradingResult.scores?.grammar}/10</span>
                        </div>
                        <div className="bg-slate-900/80 p-2 rounded">
                          <span className="text-slate-500 block">Từ vựng</span>
                          <span className="font-bold text-slate-200">{gradingResult.scores?.vocabulary}/10</span>
                        </div>
                        <div className="bg-slate-900/80 p-2 rounded">
                          <span className="text-slate-500 block">Độ mạch lạc</span>
                          <span className="font-bold text-slate-200">{gradingResult.scores?.coherence}/10</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs text-indigo-400 font-bold block">Nhận xét chi tiết:</span>
                        <p className="text-xs text-slate-350 leading-relaxed bg-slate-900/20 p-3 rounded border border-slate-800/40">
                          {gradingResult.feedback}
                        </p>
                      </div>

                      {gradingResult.improvedText && gradingResult.improvedText !== essayText && (
                        <div className="space-y-1 bg-indigo-950/20 p-3 rounded border border-indigo-500/20">
                          <span className="text-xs text-indigo-400 font-bold block">Bản sửa đổi đề xuất từ AI:</span>
                          <p className="text-xs text-indigo-200 italic font-mono">"{gradingResult.improvedText}"</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. AI Lesson Assistant Q&A Chat */}
            <div className="space-y-4 border-t border-slate-800 pt-6">
              <h3 className="text-lg font-bold text-indigo-300 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                5. Trợ Lý Học Tập AI (Hỏi Đáp 24/7)
              </h3>
              <div className="bg-slate-950 rounded-xl border border-slate-900 p-4 flex flex-col h-[320px]">
                {/* Chat window */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
                  {lessonChatHistory.map((chat, idx) => (
                    <div key={idx} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                        chat.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-900 text-slate-350 rounded-tl-none border border-slate-800'
                      }`}>
                        {chat.text}
                      </div>
                    </div>
                  ))}
                  {lessonChatSubmitting && (
                    <div className="flex justify-start">
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-[11px] text-slate-400 flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                        <span>AI đang soạn câu trả lời...</span>
                      </div>
                    </div>
                  )}
                </div>
                {/* Send form */}
                <div className="flex gap-2 border-t border-slate-900 pt-3">
                  <input
                    type="text"
                    value={lessonInput}
                    onChange={(e) => setLessonInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendLessonChatMessage()}
                    placeholder="Hỏi AI bất kỳ điều gì về bài học này (ví dụ: giải thích từ vựng, đặt câu ví dụ)..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleSendLessonChatMessage}
                    disabled={lessonChatSubmitting || !lessonInput.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1 transition-all"
                  >
                    Gửi
                  </button>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="space-y-6">
            {/* Header: Learning Path Roadmap */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                🎯 Lộ Trình Học Tập Thích Ứng Của Bạn
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dựa trên mục tiêu học tập <span className="text-indigo-400 font-bold">"{user?.target || 'General English'}"</span> và kết quả bài thi phân lớp của bạn, Gemini AI đã thiết kế riêng một lộ trình học tập tối ưu gồm 4 bài học lớn. Hãy học từng bài và làm bài trắc nghiệm Quiz để hoàn thành lộ trình!
              </p>
            </div>

            {/* Lessons Roadmap Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {lessons.map((lesson, idx) => {
                const isCompleted = completedLessons.includes(lesson.id);
                const isPreviousCompleted = idx === 0 || completedLessons.includes(lessons[idx - 1]?.id);
                const isSelected = selectedLesson?.id === lesson.id;
                
                return (
                  <div
                    key={lesson.id}
                    onClick={() => handleOpenLesson(lesson)}
                    className={`glass p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-[190px] group ${
                      isSelected
                        ? 'border-indigo-500 shadow-md shadow-indigo-600/10 scale-[1.01]'
                        : isCompleted
                        ? 'border-emerald-500/40 hover:border-emerald-500'
                        : isPreviousCompleted
                        ? 'border-slate-700/60 hover:border-indigo-500/60'
                        : 'border-slate-800 opacity-60 hover:opacity-85'
                    }`}
                  >
                    {/* Background badge number */}
                    <div className="absolute -right-3 -top-3 text-7xl font-black text-slate-700/5 select-none font-mono">
                      0{idx + 1}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          isCompleted
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : isPreviousCompleted
                            ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                            : 'bg-slate-850 border-slate-700 text-slate-500'
                        }`}>
                          {isCompleted ? '✓ ĐÃ HOÀN THÀNH' : isPreviousCompleted ? '▶ ĐANG HỌC' : '🔒 CHƯA MỞ KHÓA'}
                        </span>
                        
                        {lesson.studyTime && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            ⏱️ {lesson.studyTime}
                          </span>
                        )}
                      </div>

                      <h4 className="font-extrabold text-white text-base group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {lesson.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {lesson.description}
                      </p>
                    </div>

                    <div className="border-t border-slate-800/80 pt-3 flex justify-between items-center mt-4">
                      <span className="text-[10px] text-slate-500">
                        {lesson.vocabulary?.length || 0} từ vựng • 1 chủ điểm ngữ pháp
                      </span>
                      <button className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                        isCompleted
                          ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                      }`}>
                        {isCompleted ? 'Học lại' : 'Học ngay'}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
