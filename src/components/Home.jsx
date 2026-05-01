import { motion } from 'framer-motion';
import './Home.css';

const Home = () => {
  return (
    <section className="hero" id="home">
      <div className="hero-bg-shapes" aria-hidden="true">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="hero-content">
        <motion.div
          className="hero-badge"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="badge-dot"></span>
          Available for opportunities
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Hi, I'm <span className="highlight">Sisay Temesgen</span>
        </motion.h1>

        <motion.p
          className="hero-role"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Full Stack Developer &amp; AI / Machine Learning Enthusiast
        </motion.p>

        <motion.p
          className="hero-description"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          Computer Science student at Bahir Dar University, building modern web applications
          with React, Node.js, and MongoDB. Passionate about clean code, great user experiences,
          and the intersection of software and artificial intelligence.
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <a href="#projects" className="btn-primary">View My Work</a>
          <a href="#contact" className="btn-secondary">Get In Touch</a>
          <div className="btn-cv-group">
            <span>📄 CV —</span>
            <a href="/Sisay_Temesgen_CV.html" target="_blank" rel="noopener noreferrer">View</a>
            <span>|</span>
            <a href="/Sisay_Temesgen_CV.html" download="Sisay_Temesgen_CV.html">Download</a>
          </div>
        </motion.div>

        <motion.div
          className="hero-stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          <div className="stat">
            <span className="stat-number">7+</span>
            <span className="stat-label">Technologies</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat">
            <span className="stat-number">3+</span>
            <span className="stat-label">Years Learning</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat">
            <span className="stat-number">∞</span>
            <span className="stat-label">Curiosity</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Home;
