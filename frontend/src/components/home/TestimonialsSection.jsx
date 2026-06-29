import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { publicApi, imageUrl } from '../../utils/api';
import { useI18n } from '../../utils/i18n.jsx';
import { FaStar, FaQuoteLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

function StarRating({ rating }) {
  return (
    <div style={{ display: 'flex', gap: 2, color: '#f59e0b', fontSize: '0.85rem' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar key={star} style={{ opacity: star <= rating ? 1 : 0.25 }} />
      ))}
    </div>
  );
}

const fallbackTestimonials = [
  {
    _id: 'fallback-t-2',
    name: 'Peer',
    role: 'Fellow Developer',
    content: 'Sisay has a strong grasp of full-stack development. He consistently delivers well-structured and maintainable code.',
    rating: 5,
  },
];

function TestimonialsSection() {
  const { t } = useI18n();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    publicApi.getTestimonials()
      .then(({ data }) => {
        const items = data.data || [];
        setTestimonials(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section id="testimonials" className="skills">
        <div className="skills-container" style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div className="spinner" />
        </div>
      </section>
    );
  }

  const items = testimonials.length > 0 ? testimonials : fallbackTestimonials;

  const testimonial = items[current];

  const next = () => setCurrent((c) => (c + 1) % items.length);
  const prev = () => setCurrent((c) => (c - 1 + items.length) % items.length);

  return (
    <section id="testimonials" className="skills">
      <div className="skills-container" style={{ maxWidth: '800px' }}>
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="section-tag">{t('testimonials.title')}</span>
          <h2 className="section-title">{t('testimonials.heading')}</h2>
          <div className="section-line" />
        </motion.div>

        <motion.div
          key={current}
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          style={{
            marginTop: '2.5rem',
            background: 'var(--card-bg)',
            borderRadius: '16px',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            position: 'relative',
            border: '1px solid var(--border-color)',
          }}
        >
          <FaQuoteLeft
            style={{ fontSize: '2rem', color: 'var(--primary-color)', opacity: 0.2, position: 'absolute', top: '1.25rem', left: '1.5rem' }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            {testimonial.avatar ? (
              <img
                src={imageUrl(testimonial.avatar)}
                alt={testimonial.name}
                style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-color)' }}
              />
            ) : (
              <div
                style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'var(--primary-color)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', fontWeight: 700,
                }}
              >
                {testimonial.name?.charAt(0)}
              </div>
            )}
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{testimonial.name}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {testimonial.role}{testimonial.company ? ` at ${testimonial.company}` : ''}
              </p>
              <StarRating rating={testimonial.rating || 5} />
            </div>
          </div>

          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontStyle: 'italic', maxWidth: 600, margin: '0 auto' }}>
            "{testimonial.content}"
          </p>

          {items.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={prev} className="scroll-top-btn" style={{ position: 'static', padding: '0.5rem 0.75rem' }} aria-label="Previous">
                <FaChevronLeft size={14} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {items.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    style={{
                      width: 10, height: 10, borderRadius: '50%', border: 'none',
                      background: i === current ? 'var(--primary-color)' : 'var(--border-color)',
                      cursor: 'pointer', padding: 0, transition: 'background 0.2s',
                    }}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
              <button onClick={next} className="scroll-top-btn" style={{ position: 'static', padding: '0.5rem 0.75rem' }} aria-label="Next">
                <FaChevronRight size={14} />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
