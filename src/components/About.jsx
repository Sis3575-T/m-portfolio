import { motion } from 'framer-motion';
import profilePhoto from '../assets/images/profile-photo.jpg';
import './About.css';

const About = () => {
  const highlights = [
    { icon: '🎓', label: 'Education', value: 'Bahir Dar University — Computer Science' },
    { icon: '📍', label: 'Location', value: 'Bahir Dar, Ethiopia' },
    { icon: '💼', label: 'Focus', value: 'Full Stack Web Development' },
    { icon: '🤖', label: 'Interest', value: 'AI & Machine Learning' },
  ];

  return (
    <motion.section
      className="about"
      id="about"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
    >
      <div className="container">
        <h2 className="section-heading">About Me</h2>
        <div className="section-divider"></div>
        <p className="section-subheading">
          A brief introduction to who I am and what drives me.
        </p>

        <div className="about-grid">
          {/* Photo */}
          <motion.div
            className="about-photo-wrap"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="photo-frame">
              <img src={profilePhoto} alt="Sisay Temesgen" className="profile-photo" />
            </div>
            <div className="photo-badge">
              <span>👋</span> Open to work
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            className="about-body"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <p>
              I'm a passionate software developer and Computer Science student at Bahir Dar University,
              Ethiopia. My journey in tech started with curiosity about how websites work, and it has
              grown into a deep commitment to building meaningful digital products.
            </p>
            <p>
              I specialize in the MERN stack — MongoDB, Express.js, React, and Node.js — and I'm
              continuously expanding my knowledge into AI and machine learning. I believe great software
              is not just functional, but also intuitive and accessible to everyone.
            </p>
            <p>
              Outside of coding, I enjoy exploring open-source projects, contributing to the developer
              community, and learning about the latest advancements in technology.
            </p>

            <div className="highlights-grid">
              {highlights.map((item, i) => (
                <div className="highlight-card" key={i}>
                  <span className="highlight-icon">{item.icon}</span>
                  <div>
                    <p className="highlight-label">{item.label}</p>
                    <p className="highlight-value">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="about-actions">
              <a href="mailto:sisay3575@gmail.com" className="btn-primary">Hire Me</a>
              <a href="https://github.com/Sis3575-T" target="_blank" rel="noopener noreferrer" className="btn-outline">GitHub Profile</a>
              <div className="btn-cv-group">
                <span>📄 CV —</span>
                <a href="/Sisay_Temesgen_CV.html" target="_blank" rel="noopener noreferrer">View</a>
                <span>|</span>
                <a href="/Sisay_Temesgen_CV.html" download="Sisay_Temesgen_CV.html">Download</a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default About;
