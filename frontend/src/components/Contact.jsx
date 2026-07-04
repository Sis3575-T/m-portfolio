import React, { useState } from 'react';

function Contact({ settings, sectionTitle, sectionSubtitle }) {
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
      const existing = JSON.parse(localStorage.getItem('contactMessages') || '[]');
      existing.push({ ...form, timestamp: new Date().toISOString() });
      localStorage.setItem('contactMessages', JSON.stringify(existing));
      setFormStatus({ type: 'success', message: 'Message sent successfully!' });
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setFormStatus({ type: 'error', message: 'Failed to send message' });
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

  const socialItems = [
    { key: 'email', label: 'Email', value: email, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, href: `mailto:${email}` },
    ...(phone ? [{ key: 'phone', label: 'Phone', value: phone, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> }] : []),
    ...(address ? [{ key: 'location', label: 'Location', value: address, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> }] : []),
    ...(github ? [{ key: 'github', label: 'GitHub', value: github, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>, href: github }] : []),
    ...(linkedin ? [{ key: 'linkedin', label: 'LinkedIn', value: linkedin, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>, href: linkedin }] : []),
    ...(twitter ? [{ key: 'twitter', label: 'Twitter', value: twitter, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>, href: twitter }] : []),
    ...(telegram ? [{ key: 'telegram', label: 'Telegram', value: telegram, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>, href: telegram }] : []),
  ];

  return (
    <section className="contact section" id="contact">
      <div className="container contact-container">
        <div className="section-header">
          <span className="section-tag">Contact</span>
          <h2 className="section-title">{sectionTitle || 'Get In Touch'}</h2>
          {sectionSubtitle && <p className="section-subtitle">{sectionSubtitle}</p>}
          <div className="section-line" />
        </div>
        <div className="contact-content">
          <div className="contact-info">
            <h3 className="contact-heading">Let's work together</h3>
            <p className="contact-text">I'm open to collaboration, freelance work, and thoughtful product challenges. If you need a reliable developer who values clarity, speed, and clean execution, I'd love to hear from you.</p>
            <div className="contact-details">
              {socialItems.map(item => (
                <div key={item.key} className="contact-detail-item">
                  <div className="detail-icon">{item.icon}</div>
                  <div>
                    <span className="detail-label">{item.label}</span>
                    {item.href ? (
                      <a href={item.href} className="detail-value link" target="_blank" rel="noopener noreferrer">{item.value}</a>
                    ) : (
                      <span className="detail-value">{item.value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="contact-form-wrapper">
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input type="text" id="name" name="name" value={form.name} onChange={handleChange} placeholder="Your name" className={errors.name ? 'error' : ''} />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className={errors.email ? 'error' : ''} />
                  {errors.email && <span className="form-error">{errors.email}</span>}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input type="text" id="subject" name="subject" value={form.subject} onChange={handleChange} placeholder="Project collaboration" />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" rows="5" value={form.message} onChange={handleChange} placeholder="Tell me about the idea..." className={errors.message ? 'error' : ''} />
                {errors.message && <span className="form-error">{errors.message}</span>}
              </div>
              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? <span className="spinner" /> : 'Send Message'}
              </button>
              {formStatus && (
                <div className={`form-status ${formStatus.type}`}>
                  {formStatus.message}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
