import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FaPlane, FaSun, FaMoon } from 'react-icons/fa';
import './Login.css';

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [pno, setPno] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rank, setRank] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup, token } = useAuth();
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

    if (isSignup) {
      // Signup validation
      if (!fullName || !pno || !rank || !password || !confirmPassword) {
        setError('Please fill in all required fields');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      setLoading(true);
      const result = await signup({
        full_name: fullName,
        pno,
        rank,
        password
      });
      setLoading(false);

      if (result.success) {
        navigate('/aircraft-selection');
      } else {
        setError(result.error);
      }
    } else {
      // Login validation
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
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError('');
    setPno('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setRank('');
  };

  return (
    <div className="login-container">
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        type="button"
      >
        {theme === 'light' ? <FaMoon /> : <FaSun />}
      </button>
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <FaPlane />
          </div>
          <h1 className="login-title">Aviation Management</h1>
          <p className="login-subtitle">
            {isSignup ? 'Create your account' : 'Sign in to access your dashboard'}
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <span>⚠</span>
              {error}
            </div>
          )}

          {isSignup && (
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">
                Full Name *
              </label>
              <input
                id="fullName"
                type="text"
                className="form-input"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoFocus
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="pno" className="form-label">
              Personnel Number (PNO) *
            </label>
            <input
              id="pno"
              type="text"
              className="form-input"
              placeholder="Enter your PNO"
              value={pno}
              onChange={(e) => setPno(e.target.value)}
              autoFocus={!isSignup}
            />
          </div>

          {isSignup && (
            <div className="form-group">
              <label htmlFor="rank" className="form-label">
                Rank *
              </label>
              <input
                id="rank"
                type="text"
                className="form-input"
                placeholder="Enter your rank"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password *
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder={isSignup ? "Create a password (min 6 characters)" : "Enter your password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {isSignup && (
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? (isSignup ? 'Creating Account...' : 'Signing in...') : (isSignup ? 'Sign Up' : 'Sign In')}
          </button>

          <div className="toggle-mode">
            <span>{isSignup ? 'Already have an account?' : "Don't have an account?"}</span>
            <button type="button" onClick={toggleMode} className="toggle-link">
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </form>

        <div className="login-footer">
          Aviation Management System v1.0
        </div>
      </div>
    </div>
  );
};

export default Login;
