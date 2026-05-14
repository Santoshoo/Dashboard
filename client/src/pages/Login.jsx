import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserCircle, ShieldCheck, Fingerprint, Lock, ChevronRight, Sparkles, Command } from 'lucide-react';

export default function Login() {
  const [loginMode, setLoginMode] = useState('admin'); // 'admin' or 'employee'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedId = identifier.trim();

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
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
    <div className={`min-h-screen flex items-center justify-center font-sans p-4 relative transition-colors duration-700 overflow-hidden bg-[#0a0f1e]`}>
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-40 transition-all duration-1000 ${isEmployee ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-600'}`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-40 transition-all duration-1000 delay-300 ${isEmployee ? 'bg-teal-600' : 'bg-purple-600 animate-pulse'}`}></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-500 rounded-full blur-[100px] opacity-20 animate-bounce transition-all duration-1000" style={{ animationDuration: '8s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-3xl rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden">
          <div className="relative">
            {/* Decorative Top Accent */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 transition-colors duration-500 ${isEmployee ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>

            {/* Header Section */}
            <div className="px-10 pt-10 pb-6 text-center">
              {/* KIMS Logo */}
              <div className="flex justify-center mb-5">
                <div className="relative">
                  <div className="absolute inset-0 blur-xl opacity-30 bg-white rounded-full scale-75" />
                  <img
                    src="/kims-logo.png"
                    alt="KIMS Logo"
                    className="relative w-20 h-20 object-contain drop-shadow-2xl"
                  />
                </div>
              </div>

              <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                KIMS <span className={isEmployee ? 'text-emerald-400' : 'text-indigo-400'}>Log</span>
              </h1>
              <div className="flex items-center justify-center space-x-2">
                <div className={`h-1 w-6 rounded-full ${isEmployee ? 'bg-emerald-500/30' : 'bg-indigo-500/30'}`}></div>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[9px]">Movement Portal</p>
                <div className={`h-1 w-6 rounded-full ${isEmployee ? 'bg-emerald-500/30' : 'bg-indigo-500/30'}`}></div>
              </div>
            </div>

            {/* Role Switcher */}
            <div className="px-8 pb-6">
              <div className="bg-black/20 backdrop-blur-md p-1 rounded-2xl flex items-center border border-white/5">
                <button
                  onClick={() => { setLoginMode('admin'); setError(''); setIdentifier(''); setPassword(''); }}
                  className={`flex-1 flex items-center justify-center py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-500 ${!isEmployee ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-[1.02]' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <ShieldCheck className={`w-3 h-3 mr-1.5 ${!isEmployee ? 'animate-pulse' : ''}`} />
                  Master Access
                </button>
              </div>
            </div>

            {/* Form Section */}
            <div className="px-10 pb-12">
              <form onSubmit={handleLogin} className="space-y-6">
                {!isEmployee && (
                  <div className="space-y-2.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Administrator ID
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <UserCircle className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                      </div>
                      <input
                        type="text"
                        className="w-full pl-12 pr-6 py-4 rounded-2xl border border-white/10 bg-black/20 focus:bg-black/40 text-white placeholder-slate-600 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all duration-500 font-bold outline-none text-sm"
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
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Key</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                      </div>
                      <input
                        type="password"
                        className="w-full pl-12 pr-6 py-4 rounded-2xl border border-white/10 bg-black/20 focus:bg-black/40 text-white placeholder-slate-600 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all duration-500 font-bold outline-none text-sm"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
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
                  className={`w-full py-5 rounded-[1.5rem] text-[13px] font-black text-white shadow-2xl transition-all duration-500 transform hover:-translate-y-1.5 active:scale-[0.98] flex items-center justify-center group overflow-hidden relative ${isEmployee
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-900/40'
                    : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-indigo-900/40'}`}
                >
                  <span className="relative z-10 flex items-center uppercase tracking-widest">
                    {isEmployee ? 'Launch Public Portal' : 'Authorize Master Access'}
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
