import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { BookOpen, Award, CheckCircle, ChevronRight, Play, Check, Send, Award as Medal, Sparkles, BookOpen as BookIcon, GraduationCap } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const { user, lessons, students, submitAssignment, logout } = useContext(AppContext);
  const navigate = useNavigate();
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [essayText, setEssayText] = useState('');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [gradingResult, setGradingResult] = useState(null);

  // If student hasn't taken placement test, prompt them
  if (user && !user.placementTestDone) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 text-center">
        <div className="glass p-8 rounded-2xl border border-slate-700/50 shadow-2xl max-w-md">
          <BookOpen className="w-16 h-16 text-indigo-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-white mb-2">Xin chào {user.username}!</h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Để bắt đầu, bạn cần hoàn thành bài kiểm tra đánh giá năng lực đầu vào. AI sẽ tự động phân loại trình độ và xây dựng lộ trình thích ứng riêng cho bạn.
          </p>
          <button
            onClick={() => navigate('/placement-test')}
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-indigo-600/30"
          >
            Bắt đầu Làm bài Test
          </button>
        </div>
      </div>
    );
  }

  const currentStudentData = students.find(s => s.username === user?.username);
  const matchedLessons = lessons.filter(l => l.level === user?.classification);

  const handleOpenLesson = (lesson) => {
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

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Sidebar Profile & Roadmap */}
      <div className="space-y-6">
        <div className="glass p-6 rounded-xl border border-slate-700/50 shadow-lg relative overflow-hidden space-y-4">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/20">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{user?.fullName || user?.username}</h3>
              <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 mt-1 inline-block">
                Lớp: {user?.classification || 'Chưa phân loại'}
              </span>
            </div>
          </div>

          <div className="text-xs space-y-2 border-t border-slate-800/80 pt-3 text-slate-400">
            <div><span className="font-semibold text-slate-500">Học viên:</span> <span className="text-slate-300">{user?.username}</span></div>
            {user?.email && user?.email !== 'N/A' && (
              <div><span className="font-semibold text-slate-500">Email:</span> <span className="text-slate-300">{user.email}</span></div>
            )}
            {user?.phone && user?.phone !== 'N/A' && (
              <div><span className="font-semibold text-slate-500">SĐT:</span> <span className="text-slate-300">{user.phone}</span></div>
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

        {/* Roadmap */}
        <div className="glass p-6 rounded-xl border border-slate-700/50 shadow-lg space-y-4">
          <div>
            <h4 className="font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" />
              Lộ Trình Học Cá Nhân
            </h4>
            <p className="text-xs text-slate-400 mt-1">Được thiết kế dựa trên kết quả kiểm tra</p>
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
                  {/* Timeline bullet */}
                  <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 transition-colors flex items-center justify-center ${
                    isCompleted
                      ? 'bg-indigo-500 border-indigo-500 text-white'
                      : isSelected
                      ? 'bg-slate-900 border-indigo-400'
                      : 'bg-slate-950 border-slate-700'
                  }`}>
                    {isCompleted && <Check className="w-2.5 h-2.5" />}
                  </div>

                  <div className={`p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-indigo-600/10 border-indigo-500/40'
                      : 'bg-slate-900/30 border-slate-800/80 hover:bg-slate-900/50 hover:border-slate-700'
                  }`}>
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-semibold text-slate-500 group-hover:text-indigo-400 transition-colors">
                        Bài {idx + 1}
                      </span>
                      {isCompleted && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                          Hoàn thành
                        </span>
                      )}
                    </div>
                    <h5 className="font-bold text-sm text-slate-200 mt-1 group-hover:text-white transition-colors">
                      {lesson.title}
                    </h5>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area: Lesson Viewer */}
      <div className="lg:col-span-2 space-y-6">
        {selectedLesson ? (
          <div className="glass p-8 rounded-xl border border-slate-700/50 shadow-lg space-y-8 relative">
            
            {/* Lesson Header */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  {selectedLesson.level} Level
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                <span className="text-xs text-slate-400">Bài học cá nhân hóa</span>
              </div>
              <h2 className="text-2xl font-bold text-white mt-1">{selectedLesson.title}</h2>
              <p className="text-slate-300 text-sm mt-2 leading-relaxed">{selectedLesson.description}</p>
            </div>

            {/* 1. Vocabulary */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-indigo-300 border-b border-slate-800 pb-2 flex items-center gap-2">
                <BookIcon className="w-5 h-5" />
                1. Từ Vựng Trọng Tâm (Vocabulary)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedLesson.vocabulary?.map((vocab, index) => (
                  <div key={index} className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/80 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-indigo-400">{vocab.word}</span>
                      <span className="text-[10px] text-slate-500 font-medium px-2 py-0.5 bg-slate-800 rounded">
                        {vocab.type}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">{vocab.ipa}</div>
                    <div className="text-sm font-semibold text-slate-200">{vocab.meaning}</div>
                    <div className="text-xs text-slate-400 italic mt-2 border-l border-slate-700 pl-2">
                      Ex: {vocab.example}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Grammar */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-indigo-300 border-b border-slate-800 pb-2 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                2. Cấu Trúc Ngữ Pháp (Grammar)
              </h3>
              <div className="bg-slate-900/30 p-5 rounded-xl border border-slate-800/80 space-y-4">
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">{selectedLesson.grammar?.point}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{selectedLesson.grammar?.explanation}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">Mẫu câu ví dụ:</span>
                  {selectedLesson.grammar?.structures?.map((struct, idx) => (
                    <div key={idx} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-300">
                      {struct}
                    </div>
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
              Chọn một bài học từ lộ trình học tập ở thanh bên trái để bắt đầu luyện từ vựng, ngữ pháp và thực hành viết luận.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
