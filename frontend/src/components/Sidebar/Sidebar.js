import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaGaugeHigh,
  FaPlane,
  FaWrench,
  FaClipboardList,
  FaChartLine,
  FaTriangleExclamation,
  FaCircleExclamation,
  FaBars,
  FaChevronLeft
} from 'react-icons/fa6';
import './Sidebar.css';

const Sidebar = ({ collapsed, setCollapsed }) => {
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
      <motion.div
        className={`sidebar ${collapsed ? 'collapsed' : ''}`}
        animate={{ width: collapsed ? 70 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-toggle"
        >
          {collapsed ? <FaBars /> : <FaChevronLeft />}
        </button>

        <div className="sidebar-content">
          {navItems.map((section, index) => (
            <div key={index} className="sidebar-section">
              {!collapsed && (
                <div className="sidebar-section-title">{section.section}</div>
              )}
              <nav className="sidebar-nav">
                {section.items.map((item, itemIndex) => (
                  <NavLink
                    key={itemIndex}
                    to={item.path}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'collapsed' : ''}`
                    }
                    title={collapsed ? item.text : ''}
                  >
                    <span className="sidebar-link-icon">{item.icon}</span>
                    {!collapsed && (
                      <span className="sidebar-link-text">{item.text}</span>
                    )}
                  </NavLink>
                ))}
              </nav>
              {index < navItems.length - 1 && !collapsed && <div className="sidebar-divider" />}
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
