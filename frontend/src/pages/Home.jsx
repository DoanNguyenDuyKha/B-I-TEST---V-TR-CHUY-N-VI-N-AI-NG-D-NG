import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { BookOpen, GraduationCap, ArrowRight } from 'lucide-react';

export default function Home() {
  const { registerUser } = useContext(AppContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('Student');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    registerUser(username.trim(), role);
    if (role === 'Student') {
      navigate('/student');
    } else {
      navigate('/teacher');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 relative">
      {/* Decorative gradient backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pulse-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl pulse-glow" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md glass p-8 rounded-2xl shadow-xl relative z-10 border border-slate-700/50">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600/10 rounded-xl mb-4 border border-indigo-500/20">
            <GraduationCap className="w-10 h-10 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Adaptive English LMS
          </h1>
          <p className="text-sm text-slate-400">
            Hệ thống học tiếng Anh cá nhân hóa dựa trên trí tuệ nhân tạo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Vai trò của bạn
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('Student')}
                className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-200 ${
                  role === 'Student'
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Học viên
              </button>
              <button
                type="button"
                onClick={() => setRole('Teacher')}
                className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-200 ${
                  role === 'Teacher'
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Giáo viên
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Tên tài khoản / Họ tên
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập hoặc họ và tên..."
              className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white py-3 px-4 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all group duration-200"
          >
            Đăng nhập / Tiếp tục
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
}
