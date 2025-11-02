import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FaPlane, FaArrowRightFromBracket, FaArrowsRotate, FaSun, FaMoon } from 'react-icons/fa6';
import './Header.css';

const Header = () => {
  const { user, selectedAircraft, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChangeAircraft = () => {
    navigate('/aircraft-selection');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="header-title">
            <FaPlane />
            Aviation Management System
          </div>

          {selectedAircraft && (
            <div className="header-aircraft-info">
              <div className="aircraft-icon">
                <FaPlane />
              </div>
              <div className="aircraft-details">
                <h3>{selectedAircraft.aircraft_number}</h3>
                <p>{selectedAircraft.model} • {selectedAircraft.aircraft_type}</p>
              </div>
            </div>
          )}
        </div>

        <div className="header-right">
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </button>

          <button className="change-aircraft-btn" onClick={handleChangeAircraft}>
            <FaArrowsRotate />
            <span>Change Aircraft</span>
          </button>

          {user && (
            <div className="user-profile">
              <div className="profile-avatar">
                {getInitials(user.full_name)}
              </div>
              <div className="profile-info">
                <div className="profile-name">{user.full_name}</div>
                <div className="profile-pno">PNO: {user.pno}</div>
              </div>
            </div>
          )}

          <button className="logout-button" onClick={handleLogout}>
            <FaArrowRightFromBracket />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
