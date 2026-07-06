import { useState, useEffect } from 'react';
import { FaGithub, FaLinkedin, FaTwitter, FaTelegram } from 'react-icons/fa';
import { FiArrowUp } from 'react-icons/fi';

function Footer({ settings }) {
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const email = settings?.email || 'sisay3575@gmail.com';
  const github = settings?.github || '#';
  const linkedin = settings?.linkedin || '#';
  const twitter = settings?.twitter || '#';
  const telegram = settings?.telegram || '#';

  const year = new Date().getFullYear();
  const name = settings?.name || 'Sisay Temesgen';

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      <footer className="footer" role="contentinfo" style={{ background: '#000000', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="footer-container">
          <div className="footer-social">
            <a href={github} target="_blank" rel="noopener noreferrer" className="footer-social-link" title="GitHub">
              <FaGithub size={20} />
            </a>
            <a href={linkedin} target="_blank" rel="noopener noreferrer" className="footer-social-link" title="LinkedIn">
              <FaLinkedin size={20} />
            </a>
            <a href={twitter} target="_blank" rel="noopener noreferrer" className="footer-social-link" title="Twitter">
              <FaTwitter size={20} />
            </a>
            <a href={telegram} target="_blank" rel="noopener noreferrer" className="footer-social-link" title="Telegram">
              <FaTelegram size={20} />
            </a>
          </div>
          <div className="footer-divider" />
          <p className="footer-copyright" dangerouslySetInnerHTML={{ __html: settings?.copyrightText || `&copy; ${year} ${name}. All rights reserved.` }} />
          <p className="footer-email">
            <a href={`mailto:${email}`}>{email}</a>
          </p>
          <p className="footer-year">{year}</p>
        </div>
      </footer>

      {showScroll && (
        <button className="scroll-top-btn" onClick={scrollToTop} aria-label="Scroll to top">
          <FiArrowUp size={18} />
        </button>
      )}
    </>
  );
}

export default Footer;
