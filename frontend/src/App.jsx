import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { AppProvider, AppContext } from './context/AppContext';
import Home from './pages/Home';
import PlacementTest from './pages/PlacementTest';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { GraduationCap, Moon, Shield } from 'lucide-react';
import './App.css';

function Header() {
  const { user, logout } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <header className="glass sticky top-0 z-50 border-b border-slate-800/80 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
        <div className="bg-indigo-600/10 p-2 rounded-lg border border-indigo-500/20">
          <GraduationCap className="w-5 h-5 text-indigo-400" />
        </div>
        <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Adaptive English LMS
        </span>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 px-3 py-1 rounded-full text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{user.username}</span>
              <span className="text-slate-500">({user.role === 'Admin' ? 'Quản trị viên' : 'Học viên'})</span>
            </div>
            {user.role === 'Admin' && (
              <Link to="/admin" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                Admin Panel
              </Link>
            )}
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="text-red-400 hover:text-red-300 font-bold transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        )}
        <button className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors">
          <Moon className="w-4 h-4 text-indigo-400" />
        </button>
      </div>
    </header>
  );
}

function MainApp() {
  const { user } = useContext(AppContext);

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      <Header />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col container mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/placement-test" element={user ? <PlacementTest /> : <Navigate to="/" />} />
          <Route path="/student" element={user ? <StudentDashboard /> : <Navigate to="/" />} />
          <Route path="/admin" element={user && user.role === 'Admin' ? <AdminDashboard /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/20 py-6 text-center text-xs text-slate-600">
        © 2026 Adaptive English LMS. Powered by GFT AI Engine.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <MainApp />
      </BrowserRouter>
    </AppProvider>
  );
}
