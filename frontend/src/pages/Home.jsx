import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { BookOpen, GraduationCap, ArrowRight, User, Mail, Phone, Calendar, Target, Lock, Key } from 'lucide-react';

export default function Home() {
  const { loginUser, registerUser } = useContext(AppContext);
  const navigate = useNavigate();
  
  // Tab state: 'login' or 'register'
  const [activeTab, setActiveTab] = useState('login');
  
  // Common login / register fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Register exclusive fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [target, setTarget] = useState('Communication');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (!username.trim() || !password) return;

    const res = await loginUser(username.trim(), password);
    if (res.success) {
      if (res.user.role === 'Admin') {
        navigate('/admin');
      } else {
        if (res.user.placementTestDone) {
          navigate('/student');
        } else {
          navigate('/placement-test');
        }
      }
    } else {
      setErrorMsg(res.error || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim() || !password || !fullName.trim()) return;

    const res = await registerUser(username.trim(), password, 'Student', {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      dob,
      target
    });

    if (res.success) {
      setSuccessMsg('Đăng ký tài khoản thành công! Đang chuyển hướng làm bài test...');
      setTimeout(() => {
        navigate('/placement-test');
      }, 1500);
    } else {
      setErrorMsg(res.error || 'Đăng ký tài khoản thất bại.');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 relative">
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
            Trí Tuệ Nhân Tạo Phân Loại Trình Độ & Cá Nhân Hóa Lộ Trình
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-1 rounded-xl border border-slate-800 mb-6">
          <button
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'login'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'register'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Đăng Ký
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold">
            {successMsg}
          </div>
        )}

        {/* Login View */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="login-username" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Tên tài khoản (Username)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="login-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập của bạn..."
                  className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="login-password" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Mật khẩu
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white py-3 px-4 rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition-all group duration-200"
            >
              Đăng nhập hệ thống
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        ) : (
          /* Register View */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Username */}
              <div className="space-y-1">
                <label htmlFor="reg-username" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Tên tài khoản
                </label>
                <input
                  id="reg-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username..."
                  className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label htmlFor="reg-password" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Mật khẩu đăng ký
                </label>
                <input
                  id="reg-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu..."
                  className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1">
              <label htmlFor="reg-fullname" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Họ và tên học viên
              </label>
              <input
                id="reg-fullname"
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
                <label htmlFor="reg-email" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Địa chỉ Email
                </label>
                <input
                  id="reg-email"
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
                <label htmlFor="reg-phone" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Số điện thoại
                </label>
                <input
                  id="reg-phone"
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
                <label htmlFor="reg-dob" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Ngày sinh
                </label>
                <input
                  id="reg-dob"
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Learning Target */}
              <div className="space-y-1">
                <label htmlFor="reg-target" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Mục tiêu học tập
                </label>
                <select
                  id="reg-target"
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

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white py-3 px-4 rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition-all group duration-200"
            >
              Đăng ký tài khoản
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
