import React, { useState, useEffect } from 'react';
import { websiteApi } from '../api';
import Toast from './Toast';

function Contact({ settings, sectionTitle, sectionSubtitle }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

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
    try {
      await websiteApi.submitContact(form);
      setToast({ type: 'success', message: 'Message sent successfully!' });
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to send message' });
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

  const pageStyles = settings?.pageStyles?.contact || {};
  const sectionStyle = {
    ...(pageStyles.bgColor ? { backgroundColor: pageStyles.bgColor } : {}),
    ...(pageStyles.textColor ? { color: pageStyles.textColor } : {}),
    ...(pageStyles.fontFamily ? { fontFamily: pageStyles.fontFamily } : {}),
    ...(pageStyles.paddingY === 'small' ? { paddingTop: '2rem', paddingBottom: '2rem' } : {}),
    ...(pageStyles.paddingY === 'medium' ? { paddingTop: '4rem', paddingBottom: '4rem' } : {}),
    ...(pageStyles.paddingY === 'large' ? { paddingTop: '6rem', paddingBottom: '6rem' } : {}),
    ...(pageStyles.paddingY === 'xlarge' ? { paddingTop: '8rem', paddingBottom: '8rem' } : {}),
  };

  useEffect(() => {
    if (pageStyles.customCss) {
      const id = 'contact-custom-css';
      let el = document.getElementById(id);
      if (!el) { el = document.createElement('style'); el.id = id; document.head.appendChild(el); }
      el.textContent = pageStyles.customCss;
      return () => { const e = document.getElementById(id); if (e) e.remove(); };
    }
  }, [pageStyles.customCss]);

  return (
    <section className="contact section" id="contact" style={sectionStyle}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{sectionTitle || 'Get In Touch'}</h2>
          {sectionSubtitle && <p className="section-subtitle">{sectionSubtitle}</p>}
          <div className="section-divider" />
        </div>
        <div className="contact-content">
          <div className="contact-info">
            <h3 className="contact-info-title">Let’s build something meaningful together.</h3>
            <p className="contact-info-text">
              I’m open to collaboration, freelance work, and thoughtful product challenges. If you need a reliable developer who values clarity, speed, and clean execution, I’d love to hear from you.
            </p>
            <div className="contact-details">
              {settings?.email && (
                <div className="contact-detail">
                  <div className="contact-detail-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </div>
                  <div>
                    <span className="contact-detail-label">Email</span>
                    <a href={`mailto:${settings.email}`} className="contact-detail-value">{settings.email}</a>
                  </div>
                </div>
              )}
              {settings?.phone && (
                <div className="contact-detail">
                  <div className="contact-detail-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                  <div>
                    <span className="contact-detail-label">Phone</span>
                    <span className="contact-detail-value">{settings.phone}</span>
                  </div>
                </div>
              )}
              {settings?.address && (
                <div className="contact-detail">
                  <div className="contact-detail-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <div>
                    <span className="contact-detail-label">Location</span>
                    <span className="contact-detail-value">{settings.address}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Project collaboration"
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                value={form.message}
                onChange={handleChange}
                placeholder="Tell me about the idea, product, or challenge you are working on..."
                className={errors.message ? 'error' : ''}
              />
              {errors.message && <span className="form-error">{errors.message}</span>}
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting} data-track="contact-submit">
              {submitting ? (
                <span className="spinner" />
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </section>
  );
}

export default Contact;
