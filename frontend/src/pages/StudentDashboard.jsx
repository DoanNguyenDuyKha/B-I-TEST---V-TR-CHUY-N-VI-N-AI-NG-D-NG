import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { BookOpen, Award, CheckCircle, ChevronRight, Play, Check, Send, Award as Medal, Sparkles, BookOpen as BookIcon, GraduationCap, Loader2, AlertCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const { user, lessons, students, submitAssignment, logout, fetchLessons } = useContext(AppContext);
  const navigate = useNavigate();
  
  // Lesson state
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [essayText, setEssayText] = useState('');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [gradingResult, setGradingResult] = useState(null);

  // Progress Assessment states
  const [isTakingProgressTest, setIsTakingProgressTest] = useState(false);
  const [isGeneratingProgressTest, setIsGeneratingProgressTest] = useState(false);
  const [progressTest, setProgressTest] = useState(null);
  const [progressQuizAnswers, setProgressQuizAnswers] = useState({});
  const [progressEssayText, setProgressEssayText] = useState('');
  const [progressSubmitting, setProgressSubmitting] = useState(false);
  const [progressTestResult, setProgressTestResult] = useState(null);

  const currentStudentData = students.find(s => s.username === user?.username);
  const matchedLessons = lessons.filter(l => l.level === user?.classification);

  const handleOpenLesson = (lesson) => {
    setIsTakingProgressTest(false);
    setSelectedLesson(lesson);
    setEssayText('');
    setQuizAnswers({});
    setQuizSubmitted(false);
    setGradingResult(null);

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
          { id: "q1", question: "Choose the correct spelling:", options: ["English", "Englesh", "Inglish", "Englich"], answer: "English" },
          { id: "q2", question: "If it ______ tomorrow, we will stay at home.", options: ["rains", "rain", "will rain", "rained"], answer: "rains" },
          { id: "q3", question: "She is interested ______ learning English.", options: ["on", "at", "in", "for"], answer: "in" },
          { id: "q4", question: "I have lived in Ho Chi Minh City ______ 2021.", options: ["since", "for", "in", "ago"], answer: "since" },
          { id: "q5", question: "Choose the word with the CLOSEST meaning to 'abundant':", options: ["Scarce", "Small", "Rare", "Plentiful"], answer: "Plentiful" }
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
        // Force refresh the context/user state by updating local storage user classification
        if (data.decision === 'Promoted') {
          const updatedUser = { ...user, classification: data.newLevel };
          localStorage.setItem('lms_user', JSON.stringify(updatedUser));
          // Quick timeout to sync
          setTimeout(() => {
            window.location.reload();
          }, 4000);
        }
      } else {
        throw new Error("Failed to evaluate promotion");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProgressSubmitting(false);
    }
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
    <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      
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

        {/* AI Promotion Test Box */}
        <div className="glass p-6 rounded-xl border border-slate-700/50 shadow-lg space-y-4">
          <div>
            <h4 className="font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Đánh Giá Nâng Lớp (AI)
            </h4>
            <p className="text-[10px] text-slate-400 mt-1">Yêu cầu AI tự động sinh bài Progress Test thích ứng theo trình độ hiện tại</p>
          </div>

          <button
            onClick={handleRequestProgressTest}
            disabled={isTakingProgressTest || isGeneratingProgressTest}
            className="w-full bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/40 font-bold py-2 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
          >
            <GraduationCap className="w-4 h-4" />
            Bắt đầu thi nâng lớp
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
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{lesson.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-2">
        {isTakingProgressTest ? (
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
                onClick={() => setIsTakingProgressTest(false)} 
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
            ) : progressTestResult ? (
              /* Promotion Results view */
              <div className="space-y-6 text-center py-6">
                <div className={`inline-flex p-4 rounded-full border ${
                  progressTestResult.decision === 'Promoted' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                }`}>
                  <Award className="w-12 h-12" />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-white">Kết Quả Đánh Giá Năng Lực</h4>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mt-3 ${
                    progressTestResult.decision === 'Promoted'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  }`}>
                    Quyết định: {progressTestResult.decision === 'Promoted' ? 'ĐƯỢC NÂNG CẤP LỚP' : 'BẢO LƯU TRÌNH ĐỘ'}
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 text-left space-y-2 max-w-lg mx-auto">
                  <span className="text-[10px] text-indigo-400 uppercase tracking-wider font-bold block">Nhận xét chi tiết từ Academic Director AI</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{progressTestResult.explanation}</p>
                </div>

                {progressTestResult.decision === 'Promoted' && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs max-w-lg mx-auto font-semibold">
                    🎉 Tuyệt vời! Bạn đã được thăng hạng lên lớp: {progressTestResult.newLevel}. Trang web sẽ tự động tải lại lộ trình mới trong giây lát...
                  </div>
                )}

                <button
                  onClick={() => window.location.reload()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-6 rounded-lg text-xs"
                >
                  Xác nhận & Quay lại
                </button>
              </div>
            ) : (
              /* Writing and Quizzing form */
              <div className="space-y-6">
                
                {/* 5 Multiple Choice */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Phần 1: Trắc nghiệm kiến thức (5 câu)</h4>
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
                  disabled={progressSubmitting || Object.keys(progressQuizAnswers).length < 5 || progressEssayText.trim().split(/\s+/).filter(Boolean).length < 10}
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
            <div className="border-b border-slate-800 pb-4">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Lộ trình học tập thích ứng</span>
              <h2 className="text-xl font-extrabold text-white mt-1">{selectedLesson.title}</h2>
              <p className="text-xs text-slate-400 mt-1">{selectedLesson.description}</p>
            </div>

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

            {/* 3. Reading & Quiz */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-indigo-300 border-b border-slate-800 pb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                3. Đọc Hiểu & Trắc Nghiệm (Reading)
              </h3>
              <div className="space-y-4">
                <div className="bg-slate-900/20 p-5 rounded-xl border border-slate-800/60 space-y-3">
                  <h4 className="font-bold text-sm text-indigo-400">{selectedLesson.reading?.title}</h4>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans">{selectedLesson.reading?.content}</p>
                </div>

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
                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
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
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg text-xs transition-all"
                    >
                      Nộp câu trả lời trắc nghiệm
                    </button>
                  )}

                  {quizSubmitted && (
                    <div className="p-4 bg-indigo-950/20 rounded-xl border border-indigo-500/20 flex items-center justify-between">
                      <span className="text-sm text-indigo-200">
                        Điểm trắc nghiệm: **{quizScore}/{selectedLesson.reading?.questions?.length}** câu đúng.
                      </span>
                      <span className="text-xs text-emerald-400 font-bold">Đã nộp</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 4. Homework Writing */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-indigo-300 border-b border-slate-800 pb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                4. Bài Tập Viết Luận (Essay Assignment)
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
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/20 p-3 rounded border border-slate-800/40">
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

          </div>
        ) : (
          <div className="glass p-12 rounded-xl border border-slate-700/50 shadow-lg text-center flex flex-col justify-center items-center h-full min-h-[400px]">
            <BookOpen className="w-16 h-16 text-indigo-500/40 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Bắt đầu học tập thích ứng</h3>
            <p className="text-sm text-slate-400 max-w-sm">
              Chọn một bài học từ lộ trình học tập ở thanh bên trái hoặc bấm nút **"Bắt đầu thi nâng lớp"** bên dưới phần đánh giá AI để bắt đầu kiểm tra thăng hạng trình độ!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
