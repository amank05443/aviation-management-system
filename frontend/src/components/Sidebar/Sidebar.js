import { NavLink } from 'react-router-dom';
import {
  FaGaugeHigh,
  FaPlane,
  FaWrench,
  FaClipboardList,
  FaChartLine,
  FaTriangleExclamation,
  FaCircleExclamation
} from 'react-icons/fa6';
import './Sidebar.css';

const Sidebar = () => {
  const navItems = [
    {
      section: 'Main',
      items: [
        { path: '/dashboard', icon: <FaGaugeHigh />, text: 'Dashboard' },
      ]
    },
    {
      section: 'Operations',
      items: [
        { path: '/flying-operations', icon: <FaPlane />, text: 'Flying Operations' },
        { path: '/maintenance', icon: <FaWrench />, text: 'Maintenance' },
      ]
    },
    {
      section: 'Aircraft Details',
      items: [
        { path: '/leading-particulars', icon: <FaClipboardList />, text: 'Leading Particulars' },
        { path: '/maintenance-forecast', icon: <FaChartLine />, text: 'Maintenance Forecast' },
        { path: '/limitations', icon: <FaTriangleExclamation />, text: 'Limitations' },
        { path: '/deferred-defects', icon: <FaCircleExclamation />, text: 'Deferred Defects' },
      ]
    }
  ];

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-content">
          {navItems.map((section, index) => (
            <div key={index} className="sidebar-section">
              <div className="sidebar-section-title">{section.section}</div>
              <nav className="sidebar-nav">
                {section.items.map((item, itemIndex) => (
                  <NavLink
                    key={itemIndex}
                    to={item.path}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'active' : ''}`
                    }
                  >
                    <span className="sidebar-link-icon">{item.icon}</span>
                    <span className="sidebar-link-text">{item.text}</span>
                  </NavLink>
                ))}
              </nav>
              {index < navItems.length - 1 && <div className="sidebar-divider" />}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
