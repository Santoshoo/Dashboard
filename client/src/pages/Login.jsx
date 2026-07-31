import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserCircle, ShieldCheck, Fingerprint, Lock, ChevronRight, Sparkles, Command, Sun, Moon } from 'lucide-react';

export default function Login() {
  const [loginMode, setLoginMode] = useState('admin'); // 'admin' or 'employee'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Theme State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedId = identifier.trim();

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: loginMode, identifier: trimmedId, password })
      });

      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('currentUser', JSON.stringify({
          ...data.user,
          isLoggedIn: true
        }));
        navigate('/');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Server connection failed. Please ensure the backend is running.');
      console.error(err);
    }
  };

  const isEmployee = loginMode === 'employee';

  return (
    <div className={`min-h-screen flex items-center justify-center font-sans p-4 relative transition-colors duration-700 overflow-hidden bg-[var(--industrial-bg)]`}>
      {/* Theme Toggle Button */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center p-2.5 rounded-2xl bg-[var(--industrial-text)]/5 hover:bg-[var(--industrial-text)]/10 text-[var(--industrial-text-muted)] hover:text-[var(--industrial-text)] transition-all duration-300 border border-[var(--industrial-border)] shadow-md animate-in fade-in duration-700"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-[#D4AF37] hover:rotate-45 transition-transform duration-300" />
          ) : (
            <Moon className="w-5 h-5 text-[#D4AF37] hover:-rotate-12 transition-transform duration-300" />
          )}
        </button>
      </div>

      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 bg-[#D4AF37]`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-10 bg-[#D4AF37]`}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Main Card */}
        <div className="bg-[var(--industrial-card)] rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] border border-[var(--industrial-border)] overflow-hidden">
          <div className="relative">
            {/* Decorative Top Accent */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 gold-gradient`}></div>

            {/* Header Section */}
            <div className="px-10 pt-10 pb-6 text-center">
              {/* KIMS Logo */}
              <div className="flex justify-center mb-5">
                <div className="relative">
                  <div className="absolute inset-0 blur-2xl opacity-20 bg-[#D4AF37] rounded-full scale-110" />
                  <img
                    src="/kims-logo.png"
                    alt="KIMS Logo"
                    className="relative w-20 h-20 object-contain drop-shadow-2xl"
                  />
                </div>
              </div>

              <h1 className="text-3xl font-black text-[var(--industrial-text)] tracking-tight mb-2">
                ICT <span className="text-[#D4AF37]">Log</span>
              </h1>
              <div className="flex items-center justify-center space-x-2">
                <div className={`h-1 w-6 rounded-full bg-[#D4AF37]/20`}></div>
                <p className="text-[var(--industrial-text-muted)] font-bold uppercase tracking-[0.2em] text-[9px]">Movement Register</p>
                <div className={`h-1 w-6 rounded-full bg-[#D4AF37]/20`}></div>
              </div>
            </div>

            {/* Role Switcher */}
            <div className="px-8 pb-6">
              <div className="bg-[var(--industrial-text)]/5 backdrop-blur-md p-1.5 rounded-2xl flex items-center border border-[var(--industrial-border)]">
                <button
                  onClick={() => { setLoginMode('admin'); setError(''); setIdentifier(''); setPassword(''); }}
                  className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-500 bg-[#D4AF37] text-[#0B0F19] shadow-lg shadow-amber-900/20`}
                >
                  <ShieldCheck className={`w-3.5 h-3.5 mr-1.5 animate-pulse`} />
                  Administrative Portal
                </button>
              </div>
            </div>

            {/* Form Section */}
            <div className="px-10 pb-12">
              <form onSubmit={handleLogin} className="space-y-6">
                {!isEmployee && (
                  <div className="space-y-2.5">
                    <label className="text-[9px] font-black text-[var(--industrial-text-muted)] uppercase tracking-widest ml-1">
                      Administrator ID
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                        <UserCircle className="h-4 w-4 text-[var(--industrial-text-muted)] group-focus-within:text-[#D4AF37] transition-colors" />
                      </div>
                      <input
                        type="text"
                        className="w-full pl-12 pr-6 py-4 rounded-2xl border border-[var(--industrial-border)] bg-[var(--industrial-text)]/5 focus:bg-[var(--industrial-text)]/10 text-[var(--industrial-text)] placeholder-[var(--industrial-text-muted)]/50 focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37]/60 transition-all duration-500 font-bold outline-none text-sm animate-pulse"
                        placeholder="Username"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {!isEmployee && (
                  <div className="space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-500">
                    <label className="text-[9px] font-black text-[var(--industrial-text-muted)] uppercase tracking-widest ml-1">Security Key</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                        <Lock className="h-4 w-4 text-[var(--industrial-text-muted)] group-focus-within:text-[#D4AF37] transition-colors" />
                      </div>
                      <input
                        type="password"
                        className="w-full pl-12 pr-6 py-4 rounded-2xl border border-[var(--industrial-border)] bg-[var(--industrial-text)]/5 focus:bg-[var(--industrial-text)]/10 text-[var(--industrial-text)] placeholder-[var(--industrial-text-muted)]/50 focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37]/60 transition-all duration-500 font-bold outline-none text-sm"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {!isEmployee && (
                  <div className="flex justify-end px-1">
                    <button
                      type="button"
                      onClick={() => navigate('/reset-password')}
                      className="text-[9px] font-black uppercase tracking-widest text-[var(--industrial-text-muted)] hover:text-[#D4AF37] transition-all duration-300 outline-none cursor-pointer"
                    >
                      Reset Password?
                    </button>
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-2xl text-xs font-bold flex items-center animate-in zoom-in duration-300">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className={`w-full py-5 rounded-[1.5rem] text-[13px] font-black text-[#0B0F19] gold-gradient gold-glow shadow-2xl transition-all duration-500 transform hover:-translate-y-1.5 active:scale-[0.98] flex items-center justify-center group overflow-hidden relative`}
                >
                  <span className="relative z-10 flex items-center uppercase tracking-widest">
                    Authorize Master Access
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
