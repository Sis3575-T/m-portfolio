import { motion } from 'framer-motion';
import './Contact.css';

const Contact = () => {
  const contactItems = [
    {
      icon: '✉️',
      label: 'Email',
      value: 'sisay3575@gmail.com',
      href: 'mailto:sisay3575@gmail.com',
      display: 'sisay3575@gmail.com',
    },
    {
      icon: '📱',
      label: 'Phone',
      value: '+251 935 756 054',
      href: 'tel:+251935756054',
      display: '+251 935 756 054',
    },
    {
      icon: '💻',
      label: 'GitHub',
      value: 'github.com/Sis3575-T',
      href: 'https://github.com/Sis3575-T',
      display: 'github.com/Sis3575-T',
    },
    {
      icon: '📍',
      label: 'Location',
      value: 'Bahir Dar, Ethiopia',
      href: null,
      display: 'Bahir Dar, Ethiopia',
    },
  ];

  return (
    <motion.section
      className="contact"
      id="contact"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
    >
      <div className="container">
        <h2 className="section-heading">Get In Touch</h2>
        <div className="section-divider"></div>
        <p className="section-subheading">
          Have a project in mind or want to collaborate? I'd love to hear from you.
        </p>

        <div className="contact-grid">
          {/* Left: info */}
          <motion.div
            className="contact-info-panel"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3>Let's work together</h3>
            <p>
              I'm currently open to freelance projects, internships, and full-time opportunities.
              Whether you have a question or just want to say hi, my inbox is always open.
            </p>

            <div className="contact-items">
              {contactItems.map((item, i) => (
                <div className="contact-item" key={i}>
                  <span className="contact-icon">{item.icon}</span>
                  <div>
                    <p className="contact-label">{item.label}</p>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="contact-value"
                      >
                        {item.display}
                      </a>
                    ) : (
                      <p className="contact-value no-link">{item.display}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            className="contact-form-panel"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Thank you for your message! I will get back to you soon.');
                e.target.reset();
              }}
            >
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input type="text" id="name" name="name" placeholder="John Doe" required />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input type="email" id="email" name="email" placeholder="john@example.com" required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input type="text" id="subject" name="subject" placeholder="Project Inquiry" required />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  placeholder="Tell me about your project or idea..."
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn-submit">
                Send Message →
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default Contact;
