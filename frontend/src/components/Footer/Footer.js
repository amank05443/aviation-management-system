import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <div className="footer-title">Aviation Management System</div>
          <div className="footer-copyright">
            © {currentYear} All rights reserved.
          </div>
        </div>

        <div className="footer-right">
          <div className="footer-links">
            <a href="#" className="footer-link">Help</a>
            <a href="#" className="footer-link">Documentation</a>
            <a href="#" className="footer-link">Support</a>
          </div>
          <div className="footer-version">v1.0.0</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
