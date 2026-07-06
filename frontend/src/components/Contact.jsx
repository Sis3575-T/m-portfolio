import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { FaGithub, FaLinkedin, FaTwitter, FaTelegram, FaPaperPlane, FaUser, FaEnvelope, FaTag, FaCommentDots } from 'react-icons/fa';
import { backendApi } from '../services/backendApi';
import { useTheme } from '../context/ThemeContext';

function useSectionStyles(settings, key) {
  const { theme } = useTheme();
  const ps = settings?.pageStyles?.[key] || {};
  useEffect(() => {
    if (ps.customCss) {
      const el = document.createElement('style');
      el.id = `custom-css-${key}`;
      el.textContent = ps.customCss;
      document.head.appendChild(el);
      return () => el.remove();
    }
  }, [ps.customCss, key]);
  if (theme === 'dark') return { ...ps, bgColor: '' };
  return ps;
}

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

function Contact({ settings, sectionTitle, sectionSubtitle }) {
  const ps = useSectionStyles(settings, 'contact');
  const { email, phone, address, github, linkedin, twitter, telegram } = settings || {};
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState(null);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.message.trim()) errs.message = 'Message is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setFormStatus(null);
    try {
      await backendApi.submitContact(form);
      setFormStatus({ type: 'success', message: 'Message sent successfully!' });
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setFormStatus({ type: 'error', message: err.data?.message || 'Failed to send message' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const socialLinks = [
    ...(github ? [{ icon: FaGithub, href: github, label: 'GitHub' }] : []),
    ...(linkedin ? [{ icon: FaLinkedin, href: linkedin, label: 'LinkedIn' }] : []),
    ...(twitter ? [{ icon: FaTwitter, href: twitter, label: 'Twitter' }] : []),
    ...(telegram ? [{ icon: FaTelegram, href: telegram, label: 'Telegram' }] : []),
  ];

  const details = [
    ...(email ? [{ icon: FiMail, label: 'Email', value: email, href: `mailto:${email}` }] : []),
    ...(phone ? [{ icon: FiPhone, label: 'Phone', value: phone }] : []),
    ...(address ? [{ icon: FiMapPin, label: 'Location', value: address }] : []),
  ];

  return (
    <motion.section
      className="contact section" id="contact"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={sectionVariants}
      style={{
        ...(ps.bgColor ? { backgroundColor: ps.bgColor } : {}),
        ...(ps.textColor ? { color: ps.textColor } : {}),
        ...(ps.fontFamily ? { fontFamily: ps.fontFamily } : {}),
        ...(ps.paddingY === 'small' ? { paddingTop: '2rem', paddingBottom: '2rem' } : {}),
        ...(ps.paddingY === 'medium' ? { paddingTop: '4rem', paddingBottom: '4rem' } : {}),
        ...(ps.paddingY === 'large' ? { paddingTop: '6rem', paddingBottom: '6rem' } : {}),
        ...(ps.paddingY === 'xlarge' ? { paddingTop: '8rem', paddingBottom: '8rem' } : {}),
      }}
    >
      <div className="contact-container">
        <motion.div variants={itemVariants} className="text-center">
          <span className="section-tag">Contact</span>
          <h2 className="section-title">{sectionTitle || 'Get In Touch'}</h2>
          {sectionSubtitle && <p className="section-subtitle">{sectionSubtitle}</p>}
          <div className="section-line" style={{ margin: '0.5rem auto 0' }} />
        </motion.div>

        <div className="contact-content">
          <motion.div variants={itemVariants} className="contact-info">
            <h3 className="contact-heading">Let's work together</h3>
            <p className="contact-text">
              I'm open to collaboration, freelance work, and thoughtful product challenges.
              If you need a reliable developer who values clarity, speed, and clean execution,
              I'd love to hear from you.
            </p>

            {details.length > 0 && (
              <div className="contact-details">
                {details.map((item, i) => (
                  <div key={i} className="contact-detail-item">
                    <div className="detail-icon"><item.icon size={18} /></div>
                    <div>
                      <span className="detail-label">{item.label}</span>
                      {item.href ? (
                        <a href={item.href} className="detail-value link" target="_blank" rel="noopener noreferrer">
                          {item.value}
                        </a>
                      ) : (
                        <span className="detail-value">{item.value}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {socialLinks.length > 0 && (
              <div className="social-links">
                {socialLinks.map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    aria-label={social.label}
                    whileHover={{ y: -3 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  >
                    <social.icon size={18} />
                  </motion.a>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="contact-form-wrapper">
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <div className="input-icon-wrap">
                    <FaUser className="input-icon" />
                    <input
                      type="text" id="name" name="name" value={form.name}
                      onChange={handleChange} placeholder="Your name"
                      className={errors.name ? 'error' : ''}
                    />
                  </div>
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <div className="input-icon-wrap">
                    <FaEnvelope className="input-icon" />
                    <input
                      type="email" id="email" name="email" value={form.email}
                      onChange={handleChange} placeholder="you@example.com"
                      className={errors.email ? 'error' : ''}
                    />
                  </div>
                  {errors.email && <span className="form-error">{errors.email}</span>}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <div className="input-icon-wrap">
                  <FaTag className="input-icon" />
                  <input
                    type="text" id="subject" name="subject" value={form.subject}
                    onChange={handleChange} placeholder="Project collaboration"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <div className="input-icon-wrap input-icon-wrap-textarea">
                  <FaCommentDots className="input-icon" />
                  <textarea
                    id="message" name="message" rows="5" value={form.message}
                    onChange={handleChange} placeholder="Tell me about the idea..."
                    className={errors.message ? 'error' : ''}
                  />
                </div>
                {errors.message && <span className="form-error">{errors.message}</span>}
              </div>
              <motion.button
                type="submit" className="submit-btn"
                disabled={submitting}
                whileHover={submitting ? {} : { scale: 1.02 }}
                whileTap={submitting ? {} : { scale: 0.98 }}
              >
                {submitting ? (
                  <><span className="spinner" /> Sending...</>
                ) : (
                  <><FaPaperPlane size={14} /> Send Message</>
                )}
              </motion.button>
              {formStatus && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`form-status ${formStatus.type}`}
                >
                  {formStatus.message}
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

export default Contact;
