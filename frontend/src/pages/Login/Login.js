import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FaPlane, FaSun, FaMoon, FaUser, FaLock, FaExclamationTriangle } from 'react-icons/fa';

const Login = () => {
  const [pno, setPno] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate('/aircraft-selection');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!pno || !password) {
      setError('Please enter both PNO and password');
      return;
    }

    setLoading(true);
    const result = await login(pno, password);
    setLoading(false);

    if (result.success) {
      navigate('/aircraft-selection');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 p-4">
      {/* Theme Toggle */}
      <button
        className="absolute top-6 right-6 p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-300"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        type="button"
      >
        {theme === 'light' ? <FaMoon className="text-lg" /> : <FaSun className="text-lg" />}
      </button>

      {/* Login Card */}
      <div className="w-full max-w-md">
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white text-2xl mb-4 shadow-lg">
              <FaPlane />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Aviation Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                <FaExclamationTriangle className="flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* PNO Field */}
            <div>
              <label htmlFor="pno" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Personnel Number (PNO)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  id="pno"
                  type="text"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  placeholder="Enter your PNO"
                  value={pno}
                  onChange={(e) => setPno(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Aviation Management System v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
