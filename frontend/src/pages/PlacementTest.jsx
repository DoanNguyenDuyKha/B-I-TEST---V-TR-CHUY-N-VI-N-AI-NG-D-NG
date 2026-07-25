import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Sparkles, Brain, ClipboardCheck, ArrowRight, Loader2, BookOpen } from 'lucide-react';

export default function PlacementTest() {
  const { submitPlacementTest } = useContext(AppContext);
  const navigate = useNavigate();
  const [currentPart, setCurrentPart] = useState(1);
  const [quizAnswers, setQuizAnswers] = useState({
    q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '', q9: '', q10: ''
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

  const handleSelectQuiz = (questionId, value) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
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
      <div className="flex-1 flex flex-col justify-center items-center py-20 space-y-4">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <h3 className="text-white font-bold text-lg">AI đang chấm điểm bài làm của bạn...</h3>
        <p className="text-xs text-slate-400">Quá trình này sử dụng Google Gemini để chấm ngữ pháp, từ vựng và xếp lớp thích ứng.</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-12">
        <div className="glass p-8 rounded-2xl border border-slate-700/50 text-center space-y-6">
          <div className="inline-flex p-3 bg-indigo-600/10 rounded-full border border-indigo-500/20 text-indigo-400">
            <ClipboardCheck className="w-10 h-10" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Kết Quả Đánh Giá Năng Lực</h2>
            <p className="text-xs text-slate-400">Hệ thống AI của chúng tôi đã đánh giá bài thi của bạn thành công</p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Điểm trắc nghiệm</span>
              <span className="text-2xl font-extrabold text-white mt-1 block">{result.quizScore}</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Điểm tự luận</span>
              <span className="text-2xl font-extrabold text-white mt-1 block">{result.essayEvaluation?.score}/10</span>
            </div>
          </div>

          <div className={`p-5 rounded-xl border bg-gradient-to-br ${getLevelColor(result.classification)}`}>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-white/70 block">Lớp Học Đề Xuất (Phân loại AI)</span>
            <span className="text-xl font-black text-white mt-1 block">{getLevelLabel(result.classification)}</span>
          </div>

          {result.essayEvaluation?.feedback && (
            <div className="text-left bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Nhận xét chi tiết từ AI</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{result.essayEvaluation.feedback}</p>
            </div>
          )}

          <button
            onClick={() => navigate('/student')}
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2"
          >
            Bắt đầu học lộ trình của bạn
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 space-y-8">
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
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "In today's globalized economy, English has undeniably established itself as the global lingua franca. In fields ranging from international trade to technological innovation, proficiency in English opens up massive opportunities for career growth. However, many experts debate whether standard grammar rules are more important than real-world conversational communication skills when learning English."
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">
              Đề bài: Hãy viết một đoạn văn ngắn (từ 50 - 100 từ) bằng tiếng Anh bày tỏ ý kiến của bạn về tầm quan trọng của việc học tiếng Anh trong cuộc sống hiện nay.
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
