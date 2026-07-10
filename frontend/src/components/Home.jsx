import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { imageUrl } from '../utils/api';
import profilePhoto from '../assets/profile-photo.jpg';
import './Home.css';

const up = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

const Home = ({ settings }) => {
  const viewUrl = settings?.cvUrl ? imageUrl(settings.cvUrl) : null;

  return (
  <section className="hero" id="home">
    <div className="hero-container container">

      {/* ── Left: Text ── */}
      <div className="hero-left">
        <motion.h1 className="hero-title" {...up(0)}>
          <span className="hero-greeting">Hi, I'm</span>
          <span className="hero-name">Sisay Temesgen</span>
        </motion.h1>

        <motion.p className="hero-role" {...up(0.1)}>
          Full Stack Developer
        </motion.p>

        <motion.p className="hero-desc" {...up(0.2)}>
          Computer Science student at Bahir Dar University — building modern,
          accessible web applications with React, Node.js &amp; MongoDB.
        </motion.p>

        <motion.div className="hero-btns" {...up(0.3)}>
          <Link to="/projects" className="btn btn-primary">View My Work</Link>
          <a href="#contact" className="btn btn-ghost">Get In Touch</a>
        </motion.div>

        {settings?.cvUrl && (
          <motion.div className="hero-cv-row" {...up(0.4)}>
            <span className="hero-cv-icon">📄</span>
            <span className="hero-cv-text">Curriculum Vitae —</span>
            <a href={viewUrl} target="_blank" rel="noopener noreferrer" className="hero-cv-link">View CV</a>
            <span className="hero-cv-sep">·</span>
            <a href="#contact" className="hero-cv-link">Get In Touch</a>
          </motion.div>
        )}

        <motion.div className="hero-stats" {...up(0.5)}>
          {[['7+','Technologies'],['2+','Projects'],['3+','Yrs Learning']].map(([n,l],i)=>(
            <div key={i} className="hero-stat">
              <span className="hero-stat-n">{n}</span>
              <span className="hero-stat-l">{l}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Right: Photo ── */}
      <motion.div
        className="hero-right"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="hero-photo-outer">
          <div className="hero-photo-frame">
            <img
              src={profilePhoto}
              alt="Sisay Temesgen"
              className="hero-photo-img"
            />
          </div>
        </div>
      </motion.div>

    </div>
  </section>
  );
};

export default Home;
