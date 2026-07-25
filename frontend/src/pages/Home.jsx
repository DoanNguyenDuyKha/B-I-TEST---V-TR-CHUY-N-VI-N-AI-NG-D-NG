import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { BookOpen, GraduationCap, ArrowRight, User, Mail, Phone, Calendar, Target } from 'lucide-react';

export default function Home() {
  const { registerUser } = useContext(AppContext);
  const navigate = useNavigate();
  
  const [role, setRole] = useState('Student');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [target, setTarget] = useState('Communication');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    if (role === 'Student') {
      registerUser(username.trim(), role, {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        dob,
        target
      });
      navigate('/student');
    } else {
      registerUser(username.trim(), role, {});
      navigate('/admin');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 relative">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pulse-glow animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl pulse-glow" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-lg glass p-8 rounded-2xl shadow-xl relative z-10 border border-slate-700/50">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600/10 rounded-xl mb-3 border border-indigo-500/20">
            <GraduationCap className="w-9 h-9 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1">
            Adaptive English LMS
          </h1>
          <p className="text-xs text-slate-400">
            Cơ sở dữ liệu đám mây MongoDB tích hợp chấm điểm AI
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Bạn đăng nhập với vai trò
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('Student')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all duration-200 ${
                  role === 'Student'
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Học viên
              </button>
              <button
                type="button"
                onClick={() => setRole('Admin')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all duration-200 ${
                  role === 'Admin'
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Quản trị viên
              </button>
            </div>
          </div>

          {/* Account Username */}
          <div className="space-y-1">
            <label htmlFor="username" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Tên tài khoản (Username)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <User className="w-4 h-4" />
              </span>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tên tài khoản viết liền không dấu..."
                className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {role === 'Student' && (
            <div className="space-y-4 pt-2 border-t border-slate-800/80">
              <span className="text-[10px] font-extrabold uppercase text-indigo-400 tracking-wider block">
                Thông tin cá nhân & Mục tiêu học tập
              </span>

              {/* Full Name */}
              <div className="space-y-1">
                <label htmlFor="fullName" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Họ và tên học viên
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên đầy đủ..."
                  className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Email */}
                <div className="space-y-1">
                  <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Địa chỉ Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label htmlFor="phone" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Số điện thoại
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09xx xxx xxx"
                    className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Date of Birth */}
                <div className="space-y-1">
                  <label htmlFor="dob" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Ngày sinh
                  </label>
                  <input
                    id="dob"
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Learning Target */}
                <div className="space-y-1">
                  <label htmlFor="target" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Mục tiêu học tập
                  </label>
                  <select
                    id="target"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Communication">Giao tiếp thực tế</option>
                    <option value="IELTS">Luyện thi IELTS / Academic</option>
                    <option value="TOEIC">Luyện thi TOEIC</option>
                    <option value="BasicGrammar">Lấy lại gốc ngữ pháp</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white py-3 px-4 rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all group duration-200 pt-2"
          >
            Đăng nhập / Đăng ký hệ thống
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
}
