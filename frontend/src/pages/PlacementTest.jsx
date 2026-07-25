import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Sparkles, Brain, ClipboardCheck, ArrowRight, Loader2 } from 'lucide-react';

export default function PlacementTest() {
  const { submitPlacementTest } = useContext(AppContext);
  const navigate = useNavigate();
  const [currentPart, setCurrentPart] = useState(1);
  const [quizAnswers, setQuizAnswers] = useState({
    q1: '', q2: '', q3: '', q4: '', q5: ''
  });
  const [essayText, setEssayText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const quizQuestions = [
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
    }
  ];

  const handleSelectQuiz = (questionId, value) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate AI grading process
    const resData = await submitPlacementTest(quizAnswers, essayText);
    setResult(resData);
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

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-12">
        <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">AI Engine đang chấm điểm...</h2>
        <p className="text-sm text-slate-400 animate-pulse">Đang phân tích từ vựng, ngữ pháp và cấu trúc bài viết của bạn</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        <div className="glass p-8 rounded-2xl border border-slate-700/50 shadow-2xl space-y-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

          <div className="inline-flex p-4 bg-indigo-500/10 rounded-full mb-2">
            <ClipboardCheck className="w-12 h-12 text-indigo-400 animate-bounce" />
          </div>

          <h2 className="text-3xl font-extrabold text-white">Kết Quả Đánh Giá Đầu Vào</h2>
          
          <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-800/80 inline-block mx-auto max-w-lg">
            <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Trình độ của bạn</p>
            <div className={`text-2xl font-black bg-gradient-to-r ${getLevelColor(result.classification)} bg-clip-text text-transparent`}>
              {getLevelLabel(result.classification)}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-left border-t border-slate-800/60 pt-4">
              <div>
                <span className="text-xs text-slate-400 block">Điểm trắc nghiệm:</span>
                <span className="text-lg font-bold text-white">{result.quizScore} câu đúng</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Điểm viết luận:</span>
                <span className="text-lg font-bold text-white">{result.essayEvaluation?.score}/10</span>
              </div>
            </div>
          </div>

          <div className="text-left space-y-4 max-w-xl mx-auto">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Đánh giá chi tiết của AI:
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/40 p-4 rounded-xl border border-slate-700/30">
              {result.essayEvaluation?.feedback}
            </p>
            
            {result.essayEvaluation?.improvedText && result.essayEvaluation.improvedText !== result.essayText && (
              <div className="space-y-2 bg-indigo-950/20 p-4 rounded-xl border border-indigo-500/20">
                <span className="text-xs font-bold uppercase text-indigo-400">Đoạn văn được tối ưu bởi AI:</span>
                <p className="text-sm text-indigo-200 italic">"{result.essayEvaluation.improvedText}"</p>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/student')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all"
          >
            Đến Lộ Trình Học Cá Nhân
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-8">
      <div className="glass p-8 rounded-2xl border border-slate-700/50 shadow-2xl space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-700/50 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Placement Test</h2>
            <p className="text-xs text-slate-400">Kiểm tra đầu vào cá nhân hóa</p>
          </div>
          <div className="flex gap-2">
            {[1, 2].map((num) => (
              <div
                key={num}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                  currentPart === num
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400'
                }`}
              >
                {num}
              </div>
            ))}
          </div>
        </div>

        {/* Part 1: Quiz */}
        {currentPart === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-indigo-400 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Phần 1: Trắc nghiệm Từ vựng & Ngữ pháp
            </h3>
            <div className="space-y-6">
              {quizQuestions.map((q, idx) => (
                <div key={q.id} className="space-y-3 bg-slate-900/30 p-4 rounded-xl border border-slate-800/60">
                  <p className="text-sm font-semibold text-white">
                    Câu {idx + 1}. {q.question}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelectQuiz(q.id, opt.value)}
                        className={`text-left text-sm py-2.5 px-4 rounded-lg border transition-all ${
                          quizAnswers[q.id] === opt.value
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                            : 'bg-slate-800/30 border-slate-700/40 text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPart(2)}
              disabled={Object.values(quizAnswers).some(val => !val)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              Tiếp tục phần tự luận
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Part 2: Essay */}
        {currentPart === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-indigo-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Phần 2: Viết luận ngắn (Tự luận)
            </h3>
            <div className="space-y-3 bg-slate-900/30 p-4 rounded-xl border border-slate-800/60">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Đề bài yêu cầu:</span>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                Write a short paragraph (80-120 words) introducing yourself, including your name, your passion, and why you decided to learn English.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="essay" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Bài viết của bạn ({essayText.split(/\s+/).filter(Boolean).length} từ)
              </label>
              <textarea
                id="essay"
                rows={8}
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
                placeholder="Nhập bài viết bằng tiếng Anh tại đây..."
                className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl p-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-all font-mono"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setCurrentPart(1)}
                className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-all"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={essayText.trim().split(/\s+/).filter(Boolean).length < 10}
                className="w-2/3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
              >
                Nộp bài & Chấm điểm AI
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
