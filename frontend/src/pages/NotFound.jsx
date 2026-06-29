import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import { useI18n } from '../utils/i18n.jsx';

function NotFound() {
  const { t } = useI18n();
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '6rem', fontWeight: 800, color: 'var(--primary-color)', margin: 0, lineHeight: 1 }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.5rem', color: 'var(--text-white)', margin: '0.5rem 0 1rem' }}>
        {t('notFound.title')}
      </h2>
      <p style={{ color: 'var(--text-light)', marginBottom: '2rem', maxWidth: 400 }}>
        {t('notFound.description')}
      </p>
      <Link to="/" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
        <FaHome size={16} />         {t('notFound.backHome')}
      </Link>
    </div>
  );
}

export default NotFound;
