import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function LoadingScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--bg-dark)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'var(--primary-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: 800,
              color: '#fff',
              marginBottom: '1.25rem',
            }}
          >
            ST
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            style={{
              fontSize: '0.9rem',
              fontWeight: 500,
              color: 'var(--text-white)',
              letterSpacing: '0.02em',
              marginBottom: '0.5rem',
            }}
          >
            Sisay Temesgen
          </motion.p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 120 }}
            transition={{ delay: 0.5, duration: 0.6, ease: 'easeInOut' }}
            style={{
              height: 2,
              borderRadius: 1,
              background: 'var(--primary-color)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LoadingScreen;
