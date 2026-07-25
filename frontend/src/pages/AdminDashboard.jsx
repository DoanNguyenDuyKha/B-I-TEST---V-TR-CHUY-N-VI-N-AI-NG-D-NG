import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Shield, Users, BookOpen, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const { students, lessons, updateStudentClassification, logout } = useContext(AppContext);
  const [resetLogs, setResetLogs] = useState([]);

  const handleResetTest = (username) => {
    updateStudentClassification(username, null);
    setResetLogs(prev => [...prev, `Đã reset bài kiểm tra đầu vào cho học sinh: ${username}`]);
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
            <p className="text-xs text-slate-400">Hệ thống quản lý tối cao LMS và Cơ sở dữ liệu</p>
          </div>
        </div>
        <button onClick={logout} className="text-red-400 hover:text-red-300 text-xs font-bold transition-colors">
          Đăng xuất
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Manage Students */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-xl border border-slate-700/50 shadow-lg space-y-4">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Quản lý tài khoản Học sinh
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3 pr-2">Tên học sinh</th>
                    <th className="pb-3 px-2">Cấp độ xếp lớp</th>
                    <th className="pb-3 px-2">Điểm Tự luận</th>
                    <th className="pb-3 pl-2">Thao tác hệ thống</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {students.map((s) => (
                    <tr key={s.username} className="hover:bg-slate-900/20">
                      <td className="py-3 pr-2 font-bold text-slate-200">{s.username}</td>
                      <td className="py-3 px-2">
                        {s.classification ? (
                          <span className="text-indigo-400 font-semibold">{s.classification}</span>
                        ) : (
                          <span className="text-slate-500 italic">Chưa làm test</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-slate-300 font-semibold">{s.essayScore !== null ? `${s.essayScore}/10` : '-'}</td>
                      <td className="py-3 pl-2 flex gap-2">
                        <button
                          onClick={() => handleResetTest(s.username)}
                          disabled={!s.classification}
                          className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-amber-400 px-3 py-1.5 rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
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

        {/* Logs and Stats */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-xl border border-slate-700/50 shadow-lg space-y-4">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-indigo-400" />
              Lịch sử thao tác (Admin Logs)
            </h3>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 h-60 overflow-y-auto space-y-2 font-mono text-[10px] text-slate-400">
              <p className="text-emerald-400">[SYSTEM] Admin portal initialized successfully.</p>
              {resetLogs.map((log, idx) => (
                <p key={idx} className="text-amber-300">[{new Date().toLocaleTimeString()}] {log}</p>
              ))}
              {resetLogs.length === 0 && <p className="text-slate-600">// Chưa có thao tác nào mới.</p>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
