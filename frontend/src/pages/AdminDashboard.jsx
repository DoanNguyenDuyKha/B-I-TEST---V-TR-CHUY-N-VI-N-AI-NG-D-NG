import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Shield, Users, BookOpen, Trash2, RotateCcw, AlertTriangle, Plus, Loader2, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
  const { students, lessons, addLesson, updateStudentClassification, logout } = useContext(AppContext);
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('Intermediate');
  const [generating, setGenerating] = useState(false);
  const [resetLogs, setResetLogs] = useState([]);

  // Calculate metrics
  const totalStudents = students.length;
  const basicCount = students.filter(s => s.classification === 'Basic').length;
  const intermediateCount = students.filter(s => s.classification === 'Intermediate').length;
  const advancedCount = students.filter(s => s.classification === 'Advanced').length;

  const handleResetTest = (username) => {
    updateStudentClassification(username, null);
    setResetLogs(prev => [...prev, `Đã reset bài kiểm tra đầu vào cho học sinh: ${username}`]);
  };

  const handleGenerateLesson = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setGenerating(true);

    try {
      const res = await fetch('http://localhost:3001/api/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), level })
      });

      if (res.ok) {
        const data = await res.json();
        addLesson(data.lesson);
        setResetLogs(prev => [...prev, `[AI] Sinh thành công bài học: "${data.lesson.title}" (${level})`]);
        setTopic('');
      } else {
        // Fallback
        const mockLesson = {
          id: `lesson-mock-${Date.now()}`,
          level,
          title: `AI Generated Lesson: ${topic.trim()}`,
          description: `Simulated custom curriculum about ${topic.trim()} for ${level} learners.`,
          vocabulary: [{ word: "Topic", ipa: "/ˈtɒpɪk/", type: "Noun", meaning: "Chủ đề", example: `Studying ${topic} is useful.` }],
          grammar: { point: "Key Grammar", explanation: "Simulated grammar.", structures: ["S + V"] },
          reading: { title: `Understanding ${topic}`, content: "Simulated reading.", questions: [] },
          essayPrompt: `Write about ${topic}.`
        };
        addLesson(mockLesson);
        setResetLogs(prev => [...prev, `[Simulated] Sinh bài học: "${mockLesson.title}" (${level})`]);
        setTopic('');
      }
    } catch (err) {
      console.error(err);
      setResetLogs(prev => [...prev, `[LỖI] Không thể kết nối tới AI để tạo bài học`]);
    } finally {
      setGenerating(false);
    }
  };

  const getLevelBadgeClass = (lvl) => {
    switch (lvl) {
      case 'Advanced': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Intermediate': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Basic': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600/10 p-2.5 rounded-xl border border-indigo-500/20">
            <Shield className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">System Admin Portal</h2>
            <p className="text-xs text-slate-400">Quản lý lớp học, kho bài giảng tự động bằng AI và chẩn đoán hệ thống</p>
          </div>
        </div>
        <button onClick={logout} className="text-red-400 hover:text-red-300 text-xs font-bold transition-colors">
          Đăng xuất
        </button>
      </div>

      {/* Metrics widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass p-5 rounded-xl border border-slate-700/50 shadow-md">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Tổng học sinh</span>
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-3xl font-extrabold text-white mt-2">{totalStudents}</p>
        </div>
        <div className="glass p-5 rounded-xl border border-slate-700/50 shadow-md">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Nhóm Cần hỗ trợ (Basic)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          </div>
          <p className="text-3xl font-extrabold text-amber-400 mt-2">{basicCount}</p>
        </div>
        <div className="glass p-5 rounded-xl border border-slate-700/50 shadow-md">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Nhóm Trung bình (Inter)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          </div>
          <p className="text-3xl font-extrabold text-blue-400 mt-2">{intermediateCount}</p>
        </div>
        <div className="glass p-5 rounded-xl border border-slate-700/50 shadow-md">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Nhóm Xuất sắc (Advanced)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 mt-2">{advancedCount}</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Student Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-xl border border-slate-700/50 shadow-lg space-y-4">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Bảng quản trị Học viên
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3 pr-2">Tên học sinh</th>
                    <th className="pb-3 px-2">Cấp xếp lớp</th>
                    <th className="pb-3 px-2">Điểm Tự luận</th>
                    <th className="pb-3 px-2">Đổi nhóm</th>
                    <th className="pb-3 pl-2 text-right">Hệ thống</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {students.map((s) => (
                    <tr key={s.username} className="hover:bg-slate-900/20">
                      <td className="py-3 pr-2 font-bold text-slate-200">{s.username}</td>
                      <td className="py-3 px-2">
                        {s.classification ? (
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getLevelBadgeClass(s.classification)}`}>
                            {s.classification}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">Chưa làm test</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-slate-300 font-semibold">{s.essayScore !== null ? `${s.essayScore}/10` : '-'}</td>
                      <td className="py-3 px-2">
                        <select
                          value={s.classification || ''}
                          onChange={(e) => updateStudentClassification(s.username, e.target.value)}
                          className="bg-slate-800 text-slate-300 border border-slate-700 rounded px-2 py-1 focus:outline-none focus:border-indigo-500 text-[10px]"
                        >
                          <option value="" disabled>Chọn nhóm...</option>
                          <option value="Basic">Basic</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </td>
                      <td className="py-3 pl-2 text-right">
                        <button
                          onClick={() => handleResetTest(s.username)}
                          disabled={!s.classification}
                          className="bg-slate-800/60 hover:bg-slate-800 disabled:opacity-30 text-amber-400 px-3 py-1.5 rounded text-[10px] font-bold inline-flex items-center gap-1 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Reset Test
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: AI Generator & System Logs */}
        <div className="space-y-6">
          {/* AI Generator */}
          <div className="glass p-6 rounded-xl border border-slate-700/50 shadow-lg space-y-4">
            <div>
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                AI Lesson Generator
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Tự động tạo học liệu thích ứng 3 trình độ cho học viên
              </p>
            </div>

            <form onSubmit={handleGenerateLesson} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Chủ đề bài học
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ví dụ: Job Interview, Travel Vocabulary..."
                  className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Mức độ khởi tạo ban đầu
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="Basic">Cần hỗ trợ (Basic / A1-A2)</option>
                  <option value="Intermediate">Trung bình (Intermediate / B1-B2)</option>
                  <option value="Advanced">Xuất sắc (Advanced / C1-C2)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold py-2.5 rounded-lg text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Đang thiết lập học liệu...
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Sinh bài giảng qua AI
                  </>
                )}
              </button>
            </form>
          </div>

          {/* System Logs */}
          <div className="glass p-6 rounded-xl border border-slate-700/50 shadow-lg space-y-4">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-indigo-400" />
              Lịch sử hoạt động (System Logs)
            </h3>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 h-44 overflow-y-auto space-y-2 font-mono text-[10px] text-slate-400">
              <p className="text-emerald-400">[SYSTEM] Admin portal initialized successfully.</p>
              {resetLogs.map((log, idx) => (
                <p key={idx} className="text-amber-300">[{new Date().toLocaleTimeString()}] {log}</p>
              ))}
              {resetLogs.length === 0 && <p className="text-slate-600">// Chưa có hoạt động nào mới.</p>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
