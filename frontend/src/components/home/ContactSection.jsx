import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaGithub, FaLinkedin, FaTwitter, FaPaperPlane, FaCheck, FaSpinner, FaUser, FaCommentAlt, FaTelegram, FaGlobe } from 'react-icons/fa';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';
import { publicApi } from '../../utils/api';
import { useI18n } from '../../utils/i18n.jsx';

const EMAILJS_SERVICE_ID = 'service_w8l2h6v';
const EMAILJS_TEMPLATE_ID = 'template_kj2fx4o';
const EMAILJS_PUBLIC_KEY = 'ovBEFSKgggx5XF6Qk';

function socialIcon(platform) {
  const map = {
    github: <FaGithub size={18} />,
    linkedin: <FaLinkedin size={18} />,
    twitter: <FaTwitter size={18} />,
    telegram: <FaTelegram size={18} />,
    email: <FaEnvelope size={18} />,
  };
  return map[platform?.toLowerCase()] || <FaGlobe size={18} />;
}

function ContactSection() {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    publicApi.getSettings().then(({ data }) => {
      const s = data?.data;
      setSettings(Array.isArray(s) ? s[0] : s || null);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);
    const toEmail = settings?.email || 'sisay3575@gmail.com';
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          from_email: form.email,
          from_phone: form.phone,
          subject: 'Contact Form Submission',
          message: form.message,
          to_email: toEmail,
        },
        EMAILJS_PUBLIC_KEY
      );
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setError(`${t('contact.errorPrefix')} ${toEmail}`);
    } finally {
      setSending(false);
    }
  };

  const s = settings || {};
  const email = s.email || 'sisay3575@gmail.com';
  const phone = s.phone || '+251 935 756 054';
  const address = s.address || 'Bahir Dar, Ethiopia';

  const socialLinks = [
    ...(s.github ? [{ platform: 'github', url: s.github }] : []),
    ...(s.linkedin ? [{ platform: 'linkedin', url: s.linkedin }] : []),
    ...(s.twitter ? [{ platform: 'twitter', url: s.twitter }] : []),
    ...(s.telegram ? [{ platform: 'telegram', url: s.telegram }] : []),
    ...(email ? [{ platform: 'email', url: `mailto:${email}` }] : []),
  ];

  return (
    <section id="contact" className="contact">
      <div className="contact-container">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="section-tag">{t('contact.title')}</span>
          <h2 className="section-title">{t('contact.heading')}</h2>
          <div className="section-line" />
          <p className="section-subtitle" style={{ margin: '1rem auto 0' }}>
            {t('contact.subtitle')}
          </p>
        </motion.div>

        <div className="contact-content">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="contact-info"
          >
            <h3 className="contact-heading">{t('contact.letsWork')}</h3>
            <p className="contact-text">{t('contact.description')}</p>

            <div className="contact-details">
              <div className="contact-detail-item">
                <div className="detail-icon">
                  <FaEnvelope size={16} />
                </div>
                <div>
                  <span className="detail-label">{t('contact.email')}</span>
                  <a href={`mailto:${email}`} className="detail-value link">
                    {email}
                  </a>
                </div>
              </div>
              <div className="contact-detail-item">
                <div className="detail-icon">
                  <FaPhone size={16} />
                </div>
                <div>
                  <span className="detail-label">{t('contact.phone')}</span>
                  <span className="detail-value">{phone}</span>
                </div>
              </div>
              <div className="contact-detail-item">
                <div className="detail-icon">
                  <FaMapMarkerAlt size={16} />
                </div>
                <div>
                  <span className="detail-label">{t('contact.location')}</span>
                  <span className="detail-value">{address}</span>
                </div>
              </div>
            </div>

            {socialLinks.length > 0 && (
              <div className="social-links">
                {socialLinks.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noreferrer" className="social-link" aria-label={link.platform}>
                    {socialIcon(link.platform)}
                  </a>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="contact-form-wrapper"
          >
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">{t('contact.name')}</label>
                  <div className="input-icon-wrap">
                    <input
                      id="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={t('contact.namePlaceholder')}
                    />
                    <FaUser className="input-icon" size={14} />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="email">{t('contact.emailLabel')}</label>
                  <div className="input-icon-wrap">
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder={t('contact.emailPlaceholder')}
                    />
                    <FaEnvelope className="input-icon" size={14} />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="phone">{t('contact.phoneLabel')}</label>
                <div className="input-icon-wrap">
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder={t('contact.phonePlaceholder')}
                  />
                  <FaPhone className="input-icon" size={14} />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="message">{t('contact.messageLabel')}</label>
                <div className="input-icon-wrap">
                  <textarea
                    id="message"
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder={t('contact.messagePlaceholder')}
                    rows={5}
                  />
                  <FaCommentAlt className="input-icon textarea-icon" size={14} />
                </div>
              </div>
              {error && (
                <div className="form-status error">{error}</div>
              )}
              <button
                type="submit"
                disabled={sending}
                className="submit-btn"
              >
                {sending ? (
                  <><FaSpinner className="spinner" /> {t('contact.sending')}</>
                ) : submitted ? (
                  <><FaCheck /> {t('contact.sent')}</>
                ) : (
                  <><FaPaperPlane /> {t('contact.send')}</>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
