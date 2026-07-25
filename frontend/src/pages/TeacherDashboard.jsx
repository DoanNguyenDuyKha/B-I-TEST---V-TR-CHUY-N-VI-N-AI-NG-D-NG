import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Plus, Users, BookOpen, AlertCircle, RefreshCw, CheckCircle, HelpCircle, Loader2 } from 'lucide-react';

export default function TeacherDashboard() {
  const { students, lessons, addLesson, updateStudentClassification, logout } = useContext(AppContext);
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('Intermediate');
  const [generating, setGenerating] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState('');

  // Calculate metrics
  const totalStudents = students.length;
  const basicCount = students.filter(s => s.classification === 'Basic').length;
  const intermediateCount = students.filter(s => s.classification === 'Intermediate').length;
  const advancedCount = students.filter(s => s.classification === 'Advanced').length;

  const handleGenerateLesson = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setGenerating(true);
    setGeneratedMessage('');

    try {
      const res = await fetch('http://localhost:3001/api/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), level })
      });

      if (res.ok) {
        const data = await res.json();
        addLesson(data.lesson);
        setGeneratedMessage(`Đã sinh thành công bài học: "${data.lesson.title}" cho trình độ ${level}!`);
        setTopic('');
      } else {
        // Fallback simulated generation if API offline
        const mockLesson = {
          id: `lesson-mock-${Date.now()}`,
          level,
          title: `AI Generated Lesson: ${topic.trim()}`,
          description: `Simulated custom curriculum about ${topic.trim()} for ${level} learners.`,
          vocabulary: [
            { word: "Topic", ipa: "/ˈtɒpɪk/", type: "Noun", meaning: "Chủ đề", example: `Studying ${topic} is useful.` }
          ],
          grammar: {
            point: "Key Grammar Point",
            explanation: `Simulated explanation regarding ${topic}.`,
            structures: ["S + V + O"]
          },
          reading: {
            title: `Understanding ${topic}`,
            content: `This reading text covers ${topic} in depth.`,
            questions: [
              { id: "q1", question: `Is ${topic} interesting?`, options: ["Yes", "No"], answer: "Yes" }
            ]
          },
          essayPrompt: `Write an essay about ${topic}.`
        };
        addLesson(mockLesson);
        setGeneratedMessage(`[Simulated] Đã sinh thành công bài học: "${mockLesson.title}"!`);
        setTopic('');
      }
    } catch (err) {
      console.error(err);
      setGeneratedMessage("Đã xảy ra lỗi khi tạo bài học.");
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Teacher Admin Dashboard</h2>
          <p className="text-xs text-slate-400">Quản lý học sinh, kho tài liệu học tập & theo dõi chấm điểm</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Student List & Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-xl border border-slate-700/50 shadow-lg space-y-4">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Danh sách học viên và Đánh giá đầu vào
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3 pr-2">Tên học sinh</th>
                    <th className="pb-3 px-2">Nhóm hiện tại</th>
                    <th className="pb-3 px-2">Điểm Trắc nghiệm</th>
                    <th className="pb-3 px-2">Điểm Luận</th>
                    <th className="pb-3 pl-2">Điều chỉnh Nhóm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {students.map((student) => (
                    <tr key={student.username} className="hover:bg-slate-900/20">
                      <td className="py-3 pr-2 font-bold text-slate-200">{student.username}</td>
                      <td className="py-3 px-2">
                        {student.classification ? (
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getLevelBadgeClass(student.classification)}`}>
                            {student.classification}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">Chưa làm test</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-slate-300 font-semibold">{student.quizScore || '-'}</td>
                      <td className="py-3 px-2 text-slate-300 font-semibold">{student.essayScore !== null ? `${student.essayScore}/10` : '-'}</td>
                      <td className="py-3 pl-2">
                        <select
                          value={student.classification || ''}
                          onChange={(e) => updateStudentClassification(student.username, e.target.value)}
                          className="bg-slate-800 text-slate-300 border border-slate-700 rounded px-2 py-1 focus:outline-none focus:border-indigo-500 text-[10px]"
                        >
                          <option value="" disabled>Chọn nhóm...</option>
                          <option value="Basic">Basic</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: AI Lesson Generator */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-xl border border-slate-700/50 shadow-lg space-y-4">
            <div>
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                AI Lesson Generator
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Tự động tạo học liệu thích ứng 3 cấp độ theo bất kỳ chủ đề nào
              </p>
            </div>

            <form onSubmit={handleGenerateLesson} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Chủ đề bài giảng
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
                  Mức độ khởi tạo
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
                    Sinh bài học mới bằng AI
                  </>
                )}
              </button>
            </form>

            {generatedMessage && (
              <div className="p-3 bg-indigo-950/20 rounded-lg border border-indigo-500/20 flex gap-2 items-start text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-indigo-200">{generatedMessage}</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
