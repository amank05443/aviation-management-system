import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  PersonOutline,
  LockOutlined,
  LightMode,
  DarkMode,
  AccountCircle,
  Badge,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login, signup, token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isSignup) {
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
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } else {
      if (!pno || !password) {
        setError('Please enter both PNO and password');
        return;
      }

      setLoading(true);
      const result = await login(pno, password);
      setLoading(false);

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    }
  };

  const handleTabSwitch = () => {
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
      {/* Theme Toggle */}
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <DarkMode /> : <LightMode />}
      </button>

      {/* Glass Login Card */}
      <div className="login-card">
        {/* Profile Avatar */}
        <div className="login-avatar">
          <AccountCircle />
        </div>

        {/* Auth Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${!isSignup ? 'active' : ''}`}
            onClick={() => !isSignup || handleTabSwitch()}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${isSignup ? 'active' : ''}`}
            onClick={() => isSignup || handleTabSwitch()}
          >
            Sign Up
          </button>
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Signup Fields */}
          {isSignup && (
            <>
              <div className="input-group">
                <div className="input-wrapper">
                  <AccountCircle className="input-icon" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="input-group">
                <div className="input-wrapper">
                  <PersonOutline className="input-icon" />
                  <input
                    type="text"
                    placeholder="Personnel Number (PNO)"
                    value={pno}
                    onChange={(e) => setPno(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <div className="input-wrapper">
                  <Badge className="input-icon" />
                  <input
                    type="text"
                    placeholder="Rank"
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Login Fields */}
          {!isSignup && (
            <div className="input-group">
              <div className="input-wrapper">
                <PersonOutline className="input-icon" />
                <input
                  type="text"
                  placeholder="Username / PNO"
                  value={pno}
                  onChange={(e) => setPno(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Password Field */}
          <div className="input-group">
            <div className="input-wrapper">
              <LockOutlined className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Signup only) */}
          {isSignup && (
            <div className="input-group">
              <div className="input-wrapper">
                <LockOutlined className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </button>
              </div>
            </div>
          )}

          {/* Remember Me & Forgot Password */}
          {!isSignup && (
            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password" onClick={(e) => e.preventDefault()}>
                Forgot Password?
              </a>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Loading...' : (isSignup ? 'Sign Up' : 'Login')}
          </button>
        </form>

        {/* Create Account Link */}
        <div className="create-account">
          <button
            type="button"
            className="create-account-link"
            onClick={handleTabSwitch}
          >
            {isSignup ? '← Back to Login' : 'Create Your Account →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
