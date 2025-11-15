import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FaPlane, FaSun, FaMoon } from 'react-icons/fa';
import './Login.css';

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
          <p className="login-subtitle">Sign in to access your dashboard</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <span>⚠</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="pno" className="form-label">
              Personnel Number (PNO)
            </label>
            <input
              id="pno"
              type="text"
              className="form-input"
              placeholder="Enter your PNO"
              value={pno}
              onChange={(e) => setPno(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          Aviation Management System v1.0
        </div>
      </div>
    </div>
  );
};


export default Login;

