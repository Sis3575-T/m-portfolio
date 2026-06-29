import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTerminal, FiSearch, FiExternalLink, FiX } from 'react-icons/fi';
import { publicApi } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../utils/i18n.jsx';

function CommandPalette({ onClose }) {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const { t } = useI18n();
  const NAV_COMMANDS = useMemo(() => [
    { cmd: 'about', desc: t('commandPalette.about'), action: 'scroll', target: 'about' },
    { cmd: 'skills', desc: t('commandPalette.skills'), action: 'scroll', target: 'skills' },
    { cmd: 'projects', desc: t('commandPalette.projects'), action: 'scroll', target: 'projects' },
    { cmd: 'experience', desc: t('commandPalette.experience'), action: 'scroll', target: 'experience' },
    { cmd: 'education', desc: t('commandPalette.education'), action: 'scroll', target: 'education' },
    { cmd: 'services', desc: t('commandPalette.services'), action: 'scroll', target: 'services' },
    { cmd: 'contact', desc: t('commandPalette.contact'), action: 'scroll', target: 'contact' },
    { cmd: 'home', desc: t('commandPalette.home'), action: 'scroll', target: 'home' },
    { cmd: 'theme', desc: t('commandPalette.theme'), action: 'theme' },
    { cmd: 'search', desc: t('commandPalette.search'), action: 'navigate', target: '/search' },
  ], [t]);
  const [input, setInput] = useState('');
  const [projects, setProjects] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    publicApi.getProjects()
      .then(({ data }) => setProjects(data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && filtered[activeIdx]) execute(filtered[activeIdx]);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [input, activeIdx, filtered]);

  const projectCmds = useMemo(() =>
    projects.map(p => ({ cmd: p.title.toLowerCase().slice(0, 20), desc: p.title, action: 'navigate', target: `/project/${p._id}` })),
  [projects]
  );

  const all = useMemo(() => [...NAV_COMMANDS, ...projectCmds], [projectCmds]);

  const filtered = useMemo(() => {
    if (!input.trim()) return all.slice(0, 8);
    const q = input.toLowerCase();
    return all.filter(s => s.cmd.includes(q)).slice(0, 8);
  }, [input, all]);

  const execute = useCallback((s) => {
    onClose();
    if (s.action === 'scroll') {
      setTimeout(() => {
        const el = document.getElementById(s.target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else if (s.action === 'navigate') {
      navigate(s.target);
    } else if (s.action === 'theme') {
      toggleTheme();
    }
  }, [navigate, onClose, toggleTheme]);

  useEffect(() => { setActiveIdx(0); }, [input]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '10vh',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.97 }}
        transition={{ duration: 0.15 }}
        style={{
          width: '100%', maxWidth: 540,
          background: 'var(--bg-card, #0f172a)',
          border: '1px solid var(--glass-border, #ffffff14)',
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem 1rem', borderBottom: '1px solid var(--glass-border, #ffffff14)' }}>
          <FiSearch size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('commandPalette.searchPlaceholder')}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text-white)', fontFamily: 'inherit', fontSize: '0.9rem',
            }}
            spellCheck={false}
          />
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 2 }}>
            <FiX size={16} />
          </button>
        </div>
        <div style={{ maxHeight: 320, overflowY: 'auto', padding: '0.25rem 0' }}>
          {filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem', fontSize: '0.85rem' }}>
              No results found
            </p>
          ) : filtered.map((s, i) => (
            <div
              key={s.cmd + s.target}
              onClick={() => execute(s)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '0.55rem 1rem', cursor: 'pointer',
                background: i === activeIdx ? 'var(--primary-color-alpha, rgba(124,58,237,0.12))' : 'transparent',
                color: 'var(--text-white)',
                transition: 'background 0.1s',
              }}
            >
              <FiTerminal size={12} style={{ color: 'var(--primary-color)', flexShrink: 0, opacity: 0.7 }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 500, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.desc}
              </span>
              <span style={{
                fontSize: '0.7rem', color: 'var(--text-muted)',
                background: 'var(--glass-bg, rgba(255,255,255,0.04))',
                borderRadius: 4, padding: '0.1rem 0.4rem',
                flexShrink: 0,
              }}>
                {s.action === 'scroll' ? 'Go' : s.action === 'theme' ? 'Toggle' : 'Open'}
              </span>
              {s.action === 'navigate' && <FiExternalLink size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
            </div>
          ))}
        </div>
        <div style={{
          display: 'flex', gap: 12, padding: '0.5rem 1rem',
          borderTop: '1px solid var(--glass-border, #ffffff14)',
          fontSize: '0.7rem', color: 'var(--text-muted)',
        }}>
          <span><kbd style={kbdStyle}>↑↓</kbd> Navigate</span>
          <span><kbd style={kbdStyle}>Enter</kbd> Open</span>
          <span><kbd style={kbdStyle}>Esc</kbd> Close</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

const kbdStyle = {
  background: 'var(--glass-bg, rgba(255,255,255,0.06))',
  border: '1px solid var(--glass-border, rgba(255,255,255,0.08))',
  borderRadius: 3, padding: '0.1rem 0.35rem',
  fontFamily: 'inherit', fontSize: '0.65rem',
  marginRight: 2,
};

export default CommandPalette;
