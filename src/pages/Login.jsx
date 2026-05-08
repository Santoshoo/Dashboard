import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Replace or extend these credentials as needed.
  const VALID_USERS = [
    { username: 'admin', password: 'admin123' }
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    const user = VALID_USERS.find(u => u.username === username.trim());
    if (!user) {
      setError('Invalid username');
      return;
    }
    if (user.password !== password) {
      setError('Invalid password');
      return;
    }
    localStorage.setItem('isAdminLoggedIn', 'true');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-600 p-3 rounded-full shadow-lg">
            <LogIn className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8 tracking-tight">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white/50"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white/50"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Sign In
          </button>
        </form>
        {error && (
          <div className="mt-4 text-center text-sm text-red-600">{error}</div>
        )}
      </div>
    </div>
  );
}
