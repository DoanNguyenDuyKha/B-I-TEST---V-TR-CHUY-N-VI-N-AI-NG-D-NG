import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Sparkles, Brain, ClipboardCheck, ArrowRight, Loader2, BookOpen, CheckCircle, XCircle, ChevronRight, HelpCircle } from 'lucide-react';

export default function PlacementTest() {
  const { submitPlacementTest, completePlacementReview, user } = useContext(AppContext);
  const navigate = useNavigate();
  const [currentPart, setCurrentPart] = useState(1);
  const [quizAnswers, setQuizAnswers] = useState({
    q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '', q9: '', q10: ''
  });
  const [essayText, setEssayText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  // Phase of result display: 'review' (review questions first) or 'classification' (the final result)
  const [resultPhase, setResultPhase] = useState('review');

  const [essayPrompt, setEssayPrompt] = useState("Hãy viết một đoạn văn ngắn (từ 50 - 100 từ) bằng tiếng Anh bày tỏ ý kiến của bạn về tầm quan trọng của việc học tiếng Anh trong cuộc sống hiện nay.");
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [fetchingTest, setFetchingTest] = useState(false);

  const staticQuizQuestions = [
    {
      id: 'q1',
      question: "Choose the correct sentence structure:",
      options: [
        { label: "A. He don't like studying English at night.", value: "A" },
        { label: "B. He doesn't like studying English at night.", value: "B" },
        { label: "C. He not likes studying English at night.", value: "C" },
        { label: "D. He doesn't likes studying English at night.", value: "D" }
      ]
    },
    {
      id: 'q2',
      question: "I have lived in Ho Chi Minh City ______ 2021.",
      options: [
        { label: "A. since", value: "A" },
        { label: "B. for", value: "B" },
        { label: "C. in", value: "C" },
        { label: "D. ago", value: "D" }
      ]
    },
    {
      id: 'q3',
      question: "Select the word that is synonymous with 'essential' or 'indispensable':",
      options: [
        { label: "A. Trivial", value: "A" },
        { label: "B. Optional", value: "B" },
        { label: "C. Crucial", value: "C" },
        { label: "D. Substantial", value: "D" }
      ]
    },
    {
      id: 'q4',
      question: "By the time the teacher arrived, the students ______ their homework.",
      options: [
        { label: "A. finished", value: "A" },
        { label: "B. had finished", value: "B" },
        { label: "C. have finished", value: "C" },
        { label: "D. were finishing", value: "D" }
      ]
    },
    {
      id: 'q5',
      question: "Fill in the blank: 'Not only ______ English, but she also speaks Spanish fluently.'",
      options: [
        { label: "A. she speaks", value: "A" },
        { label: "B. does she speaks", value: "B" },
        { label: "C. speaks she", value: "C" },
        { label: "D. does she speak", value: "D" }
      ]
    },
    {
      id: 'q6',
      question: "Choose the correct preposition: 'She is highly capable ______ solving complex problems.'",
      options: [
        { label: "A. of", value: "A" },
        { label: "B. at", value: "B" },
        { label: "C. in", value: "C" },
        { label: "D. for", value: "D" }
      ]
    },
    {
      id: 'q7',
      question: "If I ______ more time, I would travel around the world.",
      options: [
        { label: "A. have", value: "A" },
        { label: "B. will have", value: "B" },
        { label: "C. had", value: "C" },
        { label: "D. would have", value: "D" }
      ]
    },
    {
      id: 'q8',
      question: "The seminar was ______ because of the low registration numbers.",
      options: [
        { label: "A. called on", value: "A" },
        { label: "B. called off", value: "B" },
        { label: "C. called for", value: "C" },
        { label: "D. called in", value: "D" }
      ]
    },
    {
      id: 'q9',
      question: "Choose the word with the CLOSEST meaning to 'abundant':",
      options: [
        { label: "A. Scarce", value: "A" },
        { label: "B. Small", value: "B" },
        { label: "C. Rare", value: "C" },
        { label: "D. Plentiful", value: "D" }
      ]
    },
    {
      id: 'q10',
      question: "The manager suggested that the meeting ______ postponed until next week.",
      options: [
        { label: "A. is", value: "A" },
        { label: "B. be", value: "B" },
        { label: "C. was", value: "C" },
        { label: "D. will be", value: "D" }
      ]
    }
  ];

  useEffect(() => {
    const fetchCustomTest = async () => {
      if (!user) return;
      setFetchingTest(true);
      try {
        const res = await fetch(`http://localhost:3001/api/placement-test-questions?username=${user.username}`);
        if (res.ok) {
          const data = await res.json();
          if (data && !data.fallback) {
            const labels = ["A", "B", "C", "D"];
            const mappedQuestions = data.questions.map(q => {
              // Extract raw letter answer if AI returned full string or single letter
              let finalAns = "A";
              if (q.answer.length === 1) {
                finalAns = q.answer.toUpperCase();
              } else {
                const foundIdx = q.options.findIndex(opt => opt.toLowerCase() === q.answer.toLowerCase() || opt.toLowerCase().includes(q.answer.toLowerCase()));
                if (foundIdx > -1) {
                  finalAns = labels[foundIdx];
                }
              }
              return {
                id: q.id,
                question: q.question,
                options: q.options.map((opt, oIdx) => ({
                  label: `${labels[oIdx]}. ${opt}`,
                  value: labels[oIdx]
                })),
                answer: finalAns
              };
            });

            setQuizQuestions(mappedQuestions);
            setEssayPrompt(data.essayPrompt);
            
            const initialAns = {};
            mappedQuestions.forEach(q => {
              initialAns[q.id] = '';
            });
            setQuizAnswers(initialAns);
            return;
          }
        }
      } catch (e) {
        console.warn("Failed to fetch custom placement test, using static fallback", e);
      } finally {
        setFetchingTest(false);
      }
      // Fallback
      setQuizQuestions(staticQuizQuestions);
    };
    fetchCustomTest();
  }, [user]);

  const handleSelectQuiz = (questionId, value) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const resData = await submitPlacementTest(quizAnswers, essayText);
    setResult(resData);
    setResultPhase('review'); // Default to review phase first
    setLoading(false);
  };

  const getLevelLabel = (lvl) => {
    switch (lvl) {
      case 'Advanced': return 'Xuất sắc (Advanced / CEFR C1-C2)';
      case 'Intermediate': return 'Trung bình (Intermediate / CEFR B1-B2)';
      case 'Basic': return 'Cần hỗ trợ (Basic / CEFR A1-A2)';
      default: return lvl;
    }
  };

  const getLevelColor = (lvl) => {
    switch (lvl) {
      case 'Advanced': return 'from-emerald-500 to-teal-600 border-emerald-500/30 text-emerald-400';
      case 'Intermediate': return 'from-blue-500 to-indigo-600 border-blue-500/30 text-blue-400';
      case 'Basic': return 'from-amber-500 to-orange-600 border-amber-500/30 text-amber-400';
      default: return 'from-slate-500 to-slate-600 border-slate-500/30 text-slate-400';
    }
  };

  const getLevelDescription = (lvl) => {
    switch (lvl) {
      case 'Advanced':
        return 'Lộ trình nâng cao tập trung vào viết luận học thuật phức tạp, các cấu trúc ngữ pháp đảo ngữ nâng cao, mệnh đề giả định, và sử dụng kho từ vựng C1-C2 đa dạng trong giao tiếp chuyên nghiệp.';
      case 'Intermediate':
        return 'Lộ trình trung cấp tập trung vào các thì hoàn thành, câu điều kiện, viết đoạn văn mô tả trải nghiệm, tranh luận các chủ đề đời sống và cải thiện sự lưu loát khi giao tiếp.';
      default:
        return 'Lộ trình cơ bản được thiết kế riêng giúp bạn xây dựng lại nền móng vững chắc: học động từ To Be, thì hiện tại đơn, tích lũy từ vựng chỉ người, vật, nghề nghiệp và thực hành viết câu ngắn chuẩn chỉnh.';
    }
  };

  if (fetchingTest) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-20 space-y-4">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <h3 className="text-white font-bold text-lg">AI đang thiết kế đề thi cho mục tiêu "{user?.target || 'Học giao tiếp'}"...</h3>
        <p className="text-xs text-slate-400">Hệ thống đang soạn đề thi 10 câu trắc nghiệm & đề tự luận thích ứng theo mục đích học tập của bạn.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-20 space-y-4">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <h3 className="text-white font-bold text-lg">AI đang chấm điểm bài làm của bạn...</h3>
        <p className="text-xs text-slate-400">Hệ thống đang gọi Gemini AI phân tích ngữ pháp, từ vựng và xếp lớp thích ứng.</p>
      </div>
    );
  }

  // Result phase 1: Review questions
  if (result && resultPhase === 'review') {
    return (
      <div className="flex-1 w-full px-4 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-white flex items-center justify-center gap-2">
            <ClipboardCheck className="text-indigo-400 w-7 h-7" />
            Xem Lại Bài Thi & Giải Thích Chi Tiết
          </h2>
          <p className="text-xs text-slate-400">
            Xem lại kết quả từng câu hỏi trắc nghiệm kèm giải thích và phản hồi tự luận từ Gemini AI trước khi nhận lớp học.
          </p>
        </div>

        {/* MCQ Review */}
        <div className="glass p-6 rounded-2xl border border-slate-700/50 space-y-6 shadow-xl">
          <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider border-b border-slate-800 pb-2">
            Phần 1: Trắc nghiệm ({result.quizScore} câu đúng)
          </h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {result.questionsFeedback?.map((q, idx) => (
              <div key={q.id} className="p-4 bg-slate-950/60 rounded-xl border border-slate-900 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <p className="text-xs font-bold text-slate-200">Câu {idx + 1}: {q.question}</p>
                  {q.isCorrect ? (
                    <span className="text-emerald-400 flex items-center gap-1 text-[10px] font-bold shrink-0">
                      <CheckCircle className="w-3.5 h-3.5" /> Đúng
                    </span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-1 text-[10px] font-bold shrink-0">
                      <XCircle className="w-3.5 h-3.5" /> Sai
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-[11px]">
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-500 font-semibold block">Bạn đã chọn:</span>
                    <span className={`font-bold ${q.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>{q.studentAnswer}</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-500 font-semibold block">Đáp án đúng:</span>
                    <span className="font-bold text-emerald-400">{q.correctAnswer}</span>
                  </div>
                </div>

                <div className="bg-indigo-950/20 p-3 rounded-lg border border-indigo-500/10 text-xs text-indigo-200/90 leading-relaxed flex gap-2">
                  <span className="font-bold text-indigo-400">💡</span>
                  <p><span className="font-bold text-indigo-300">Giải thích:</span> {q.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Essay Review */}
        <div className="glass p-6 rounded-2xl border border-slate-700/50 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider border-b border-slate-800 pb-2">
            Phần 2: Tự luận viết bài (Điểm AI: {result.essayEvaluation?.score}/10)
          </h3>
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Bài viết của bạn:</span>
              <p className="text-xs text-slate-350 leading-relaxed italic">"{essayText}"</p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 block">Ngữ pháp</span>
                <span className="font-bold text-slate-200">{result.essayEvaluation?.scores?.grammar}/10</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 block">Từ vựng</span>
                <span className="font-bold text-slate-200">{result.essayEvaluation?.scores?.vocabulary}/10</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 block">Độ mạch lạc</span>
                <span className="font-bold text-slate-200">{result.essayEvaluation?.scores?.coherence}/10</span>
              </div>
            </div>

            <div className="bg-indigo-950/10 p-4 rounded-xl border border-indigo-500/10 space-y-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">Nhận xét chi tiết từ Gemini AI:</span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{result.essayEvaluation?.feedback}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setResultPhase('classification')}
          className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2"
        >
          Tiếp tục nhận lớp đề xuất
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Result phase 2: Dedicated Classification Screen
  if (result && resultPhase === 'classification') {
    return (
      <div className="flex-1 w-full px-4 py-16">
        <div className="glass p-10 rounded-3xl border border-slate-700/50 text-center space-y-8 shadow-2xl relative overflow-hidden">
          {/* Confetti-like design element */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
          
          <div className="space-y-3">
            <div className="inline-flex p-4 bg-indigo-600/10 rounded-full border border-indigo-500/20 text-indigo-400 animate-bounce">
              <Sparkles className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white mt-4 bg-gradient-to-r from-white to-slate-350 bg-clip-text text-transparent">
              🎉 PHÂN LOẠI LỚP HỌC THÀNH CÔNG!
            </h2>
            <p className="text-xs text-slate-400">Hệ thống AI đã xếp lớp học thích ứng dựa trên năng lực của bạn</p>
          </div>

          <div className={`p-6 rounded-2xl border bg-gradient-to-br shadow-xl ${getLevelColor(result.classification)}`}>
            <span className="text-[10px] uppercase tracking-wider font-black text-white/80 block">Trình độ xếp lớp của bạn</span>
            <span className="text-2xl font-black text-white mt-1.5 block">{getLevelLabel(result.classification)}</span>
          </div>

          <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 text-left space-y-3">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Mô tả lộ trình học tập cá nhân hóa:</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{getLevelDescription(result.classification)}</p>
          </div>

          <button
            onClick={() => {
              completePlacementReview(result.classification);
              navigate('/student');
            }}
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-black py-4 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2 group duration-200"
          >
            Bắt đầu học lộ trình của bạn ngay bây giờ
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full px-4 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold text-white flex items-center justify-center gap-2">
          <Brain className="text-indigo-400 w-7 h-7" />
          Bài Thi Đánh Giá Năng Lực Đầu Vào
        </h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Hoàn thành bài thi trắc nghiệm ngữ pháp và viết một bài luận ngắn để mô hình AI phân tích và xếp lớp thích ứng phù hợp nhất với bạn.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`py-3 px-4 rounded-xl border text-center transition-all ${currentPart === 1 ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400 font-bold' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
          Phần 1: Trắc nghiệm (10 câu)
        </div>
        <div className={`py-3 px-4 rounded-xl border text-center transition-all ${currentPart === 2 ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400 font-bold' : 'bg-slate-900/40 border-slate-800 text-slate-500'}`}>
          Phần 2: Đọc hiểu & Viết luận
        </div>
      </div>

      {/* Part 1: Quizzes */}
      {currentPart === 1 && (
        <div className="glass p-6 rounded-2xl border border-slate-700/50 space-y-6 shadow-xl">
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {quizQuestions.map((q, idx) => (
              <div key={q.id} className="space-y-2 border-b border-slate-800/60 pb-4 last:border-0 last:pb-0">
                <p className="text-xs font-bold text-white">Câu {idx + 1}: {q.question}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {q.options.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelectQuiz(q.id, opt.value)}
                      className={`text-left px-4 py-2.5 rounded-lg border text-xs transition-all ${
                        quizAnswers[q.id] === opt.value
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 font-semibold'
                          : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800/80'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentPart(2)}
              disabled={Object.values(quizAnswers).some(val => val === '')}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold py-2.5 px-6 rounded-lg text-xs flex items-center gap-2 transition-all"
            >
              Tiếp tục phần tự luận
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Part 2: Essay */}
      {currentPart === 2 && (
        <div className="glass p-6 rounded-2xl border border-slate-700/50 space-y-6 shadow-xl">
          {/* Reading Section */}
          <div className="space-y-3 bg-slate-950 p-5 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              Đoạn văn đọc hiểu & Đề bài tự luận
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/30 p-3 rounded border border-slate-800/50">
              {essayPrompt}
            </p>
          </div>

          {/* Essay Area */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Bài viết luận của bạn
            </label>
            <textarea
              required
              rows={6}
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              placeholder="Type your English essay here (Min 30 words recommended)..."
              className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
            />
            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span>Khuyên dùng: viết tối thiểu 30 từ</span>
              <span>Số từ hiện tại: {essayText.trim().split(/\s+/).filter(Boolean).length} từ</span>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentPart(1)}
              className="border border-slate-700 text-slate-400 hover:bg-slate-800 font-bold py-2.5 px-6 rounded-lg text-xs transition-all"
            >
              Quay lại Phần 1
            </button>
            <button
              onClick={handleSubmit}
              disabled={essayText.trim().split(/\s+/).filter(Boolean).length < 10}
              className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-40 text-white font-bold py-2.5 px-8 rounded-lg text-xs flex items-center gap-2 transition-all shadow-lg"
            >
              Nộp bài thi cho AI chấm điểm
              <ClipboardCheck className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
