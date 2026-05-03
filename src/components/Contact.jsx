import { useState } from 'react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';
import './Contact.css';

// ── EmailJS config ──────────────────────────────────────
// 1. Go to https://www.emailjs.com and create a free account
// 2. Add an Email Service (Gmail) → copy Service ID below
// 3. Create an Email Template → copy Template ID below
// 4. Go to Account → API Keys → copy Public Key below
const EMAILJS_SERVICE_ID  = 'service_w8l2h6v';
const EMAILJS_TEMPLATE_ID = 'template_kj2fx4o';
const EMAILJS_PUBLIC_KEY  = 'ovBEFSKgggx5XF6Qk';
// ────────────────────────────────────────────────────────

const inView = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
  viewport: { once: true },
});

const CONTACTS = [
  { icon: '✉️', label: 'Email', value: 'sisay3575@gmail.com', href: 'mailto:sisay3575@gmail.com' },
  { icon: '📱', label: 'Phone', value: '+251 935 756 054', href: 'tel:+251935756054' },
  { icon: '💻', label: 'GitHub', value: 'github.com/Sis3575-T', href: 'https://github.com/Sis3575-T' },
  { icon: '📍', label: 'Location', value: 'Bahir Dar, Ethiopia', href: null },
];

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          from_email: form.email,
          subject: form.subject,
          message: form.message,
          to_email: 'sisay3575@gmail.com',
        },
        EMAILJS_PUBLIC_KEY
      );
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 6000);
    } catch (err) {
      setError('Failed to send. Please email me directly at sisay3575@gmail.com');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact" id="contact">
      <div className="container">
        <motion.div {...inView()}>
          <p className="section-tag">Say Hello</p>
          <h2 className="section-title">Get In Touch</h2>
          <p className="section-subtitle">
            Open to freelance projects, internships, and full-time roles.
            Let's build something great together.
          </p>
        </motion.div>

        <div className="contact-layout">
          {/* Info panel */}
          <motion.div className="contact-info" {...inView(0.1)}>
            <h3 className="contact-info-title">Let's work together</h3>
            <p className="contact-info-text">
              Whether you have a project idea, a job opportunity, or just want to say hi —
              my inbox is always open. I'll get back to you as soon as possible.
            </p>

            <div className="contact-items">
              {CONTACTS.map((c, i) => (
                <div className="contact-item" key={i}>
                  <div className="contact-item-icon">{c.icon}</div>
                  <div>
                    <p className="contact-item-label">{c.label}</p>
                    {c.href ? (
                      <a
                        href={c.href}
                        className="contact-item-value"
                        target={c.href.startsWith('http') ? '_blank' : undefined}
                        rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        {c.value}
                      </a>
                    ) : (
                      <p className="contact-item-value contact-item-value--plain">{c.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="contact-social">
              <a href="https://github.com/Sis3575-T" target="_blank" rel="noopener noreferrer" className="social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
              <a href="mailto:sisay3575@gmail.com" className="social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                Email Me
              </a>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div className="contact-form-wrap" {...inView(0.15)}>
            {sent ? (
              <div className="form-success">
                <span className="success-icon">✅</span>
                <h4>Message Sent!</h4>
                <p>Thank you for reaching out. I'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text" id="name" name="name"
                      placeholder="John Doe"
                      value={form.name} onChange={handleChange} required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email" id="email" name="email"
                      placeholder="john@example.com"
                      value={form.email} onChange={handleChange} required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text" id="subject" name="subject"
                    placeholder="Project Inquiry / Job Opportunity"
                    value={form.subject} onChange={handleChange} required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message" name="message" rows="5"
                    placeholder="Tell me about your project or opportunity..."
                    value={form.message} onChange={handleChange} required
                  />
                </div>
                <button type="submit" className="btn btn-primary form-submit" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message →'}
                </button>
                {error && <p className="form-error">{error}</p>}
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
