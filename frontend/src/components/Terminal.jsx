import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaTerminal, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { publicApi } from '../utils/api';
import './Terminal.css';

const FALLBACKS = {
  name: 'Sisay Temesgen',
  role: 'Full Stack Developer & AI Enthusiast',
  education: 'B.Sc. Computer Science at Bahir Dar University',
  bio: 'Passionate about building modern web applications with clean architecture. I specialize in the MERN stack and love exploring AI/ML technologies. Currently focused on creating impactful digital experiences through code.',
  location: 'Bahir Dar, Ethiopia',
  email: 'sisay3575@gmail.com',
  github: 'https://github.com/Sis3575-T',
  linkedin: 'linkedin.com/in/sisay-temesgen',
  phone: '',
  address: 'Bahir Dar, Ethiopia',
  skills: {
    Frontend: ['HTML', 'CSS', 'JavaScript', 'React', 'Tailwind CSS'],
    Backend: ['Node.js', 'Express', 'REST APIs'],
    Database: ['MongoDB', 'PostgreSQL'],
    Tools: ['Git', 'GitHub', 'Vite', 'VS Code', 'Docker'],
  },
  social: [
    { platform: 'github', url: 'https://github.com/Sis3575-T' },
    { platform: 'linkedin', url: 'linkedin.com/in/sisay-temesgen' },
    { platform: 'twitter', url: 'twitter.com' },
    { platform: 'email', url: 'sisay3575@gmail.com' },
  ],
};

function Terminal({ onClose }) {
  const navigate = useNavigate();
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [bootDone, setBootDone] = useState(false);
  const [allData, setAllData] = useState({ hero: null, about: null, skills: [], settings: null, projects: [] });
  const [dataLoaded, setDataLoaded] = useState(false);
  const inputRef = useRef(null);
  const endRef = useRef(null);

  const d = allData;
  const hero = d.hero;
  const about = d.about;
  const skillsList = d.skills;
  const settings = d.settings;
  const projects = d.projects;

  const name = hero?.name || settings?.name || FALLBACKS.name;
  const role = hero?.role || hero?.title || settings?.professionalTitle || FALLBACKS.role;
  const bio = about?.biography || hero?.introduction || settings?.longBio || settings?.shortBio || FALLBACKS.bio;

  const groupedSkills = useMemo(() => {
    if (skillsList.length === 0) return FALLBACKS.skills;
    const g = {};
    skillsList.forEach(s => {
      const cat = s.category || 'Other';
      if (!g[cat]) g[cat] = [];
      g[cat].push(s.name);
    });
    return g;
  }, [skillsList]);

  const socialLinks = useMemo(() => {
    const heroSocial = (hero?.socialLinks || []).map(s => ({ platform: s.platform, url: s.url }));
    const settingsSocial = [
      { platform: 'github', url: settings?.github },
      { platform: 'linkedin', url: settings?.linkedin },
      { platform: 'twitter', url: settings?.twitter },
      { platform: 'telegram', url: settings?.telegram },
      { platform: 'facebook', url: settings?.facebook },
      { platform: 'instagram', url: settings?.instagram },
      { platform: 'youtube', url: settings?.youtube },
    ].filter(s => s.url);
    const merged = [...heroSocial, ...settingsSocial];
    return merged.length > 0 ? merged : FALLBACKS.social;
  }, [hero, settings]);

  const email = settings?.email || FALLBACKS.email;
  const github = settings?.github || FALLBACKS.github;
  const linkedin = settings?.linkedin || FALLBACKS.linkedin;
  const phone = settings?.phone || FALLBACKS.phone;
  const address = settings?.address || hero?.location || FALLBACKS.address;

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const addLine = useCallback((text, type = 'output', onClick) => {
    setLines(prev => [...prev, { text, type, onClick }]);
  }, []);

  const addTypedLine = useCallback((text, type = 'output', cb) => {
    let idx = 0;
    setLines(prev => [...prev, { text: '', type, typing: true, id: Date.now() + Math.random() }]);
    const interval = setInterval(() => {
      idx++;
      setLines(prev => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last && last.typing) {
          copy[copy.length - 1] = { ...last, text: text.slice(0, idx) };
        }
        return copy;
      });
      if (idx >= text.length) {
        clearInterval(interval);
        setLines(prev => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last && last.typing) {
            copy[copy.length - 1] = { text, type };
          }
          return copy;
        });
        cb?.();
      }
    }, 8);
    return () => clearInterval(interval);
  }, []);

  const showBanner = useCallback(() => {
    const banner = [
      '╔══════════════════════════════════════════════════════╗',
      '║                                                     ║',
      '║         S I S A Y   T E M E S G E N                 ║',
      '║     Full Stack Developer & AI Enthusiast            ║',
      '║                                                     ║',
      '╚══════════════════════════════════════════════════════╝',
      '',
      'Welcome to my interactive terminal portfolio.',
      'Type \'help\' to see available commands.',
      '',
    ];
    banner.forEach((line, i) => {
      setTimeout(() => addLine(line, i === 0 ? 'banner' : 'output'), i * 60);
    });
    return banner.length * 60;
  }, [addLine]);

  useEffect(() => {
    const bootMsgs = [
      '[SYSTEM] Initializing portfolio kernel...',
      '[SYSTEM] Loading modules: React, Node.js, MongoDB',
      '[SYSTEM] Establishing secure connection...',
      '> Welcome! Type a command or click a link.',
    ];
    let delay = 0;
    bootMsgs.forEach((msg, i) => {
      delay += 350;
      setTimeout(() => addLine(msg, 'boot'), delay);
    });
    delay += 500;
    setTimeout(() => {
      setBootDone(true);
      showBanner();
    }, delay);
  }, [addLine, showBanner]);

  useEffect(() => {
    if (bootDone && !dataLoaded) {
      const loadData = async () => {
        try {
          const results = await Promise.allSettled([
            publicApi.getHero(),
            publicApi.getAbout(),
            publicApi.getSkills(),
            publicApi.getSettings(),
            publicApi.getProjects(),
          ]);
          setAllData({
            hero: results[0].status === 'fulfilled' ? (results[0].value.data?.data || null) : null,
            about: results[1].status === 'fulfilled' ? (results[1].value.data?.data || null) : null,
            skills: results[2].status === 'fulfilled' ? (results[2].value.data?.data || []) : [],
            settings: results[3].status === 'fulfilled' ? (results[3].value.data?.data || null) : null,
            projects: results[4].status === 'fulfilled' ? (results[4].value.data?.data || []) : [],
          });
        } catch {
        } finally {
          setDataLoaded(true);
        }
      };
      loadData();
    }
  }, [bootDone, dataLoaded]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  });

  const openProject = (project) => {
    if (project?._id) {
      navigate(`/projects/${project._id}`);
      onClose();
    }
  };

  const commands = {
    help: () => {
      addTypedLine('Available commands:', 'highlight');
      const cmdList = [
        { cmd: 'about', desc: 'About me' },
        { cmd: 'banner', desc: 'Show banner' },
        { cmd: 'clear', desc: 'Clear terminal' },
        { cmd: 'contact', desc: 'Contact info' },
        { cmd: 'help', desc: 'Show this help' },
        { cmd: 'open', desc: 'View project detail' },
        { cmd: 'projects', desc: 'Show projects' },
        { cmd: 'skills', desc: 'Show skills' },
        { cmd: 'social', desc: 'Social links' },
        { cmd: 'whoami', desc: 'Who I am' },
      ];
      cmdList.forEach((c, i) => {
        setTimeout(() => addLine(`  ${c.cmd.padEnd(14)}${c.desc}`, 'output'), 100 + i * 40);
      });
    },
    about: () => {
      addTypedLine('About Me', 'highlight');
      setTimeout(() => addLine(`  Name:     ${name}`, 'output'), 200);
      setTimeout(() => addLine(`  Role:     ${role}`, 'output'), 300);
      setTimeout(() => addLine(`  Location: ${address}`, 'output'), 400);
      setTimeout(() => addLine('', 'output'), 450);
      setTimeout(() => addTypedLine(bio, 'output'), 550);
    },
    skills: () => {
      addTypedLine('Technical Skills', 'highlight');
      let delay = 200;
      Object.entries(groupedSkills).forEach(([category, items]) => {
        setTimeout(() => {
          addLine(`  ${category}:  ${items.join(', ')}`, 'output');
        }, delay);
        delay += 120;
      });
    },
    projects: () => {
      addTypedLine('Projects', 'highlight');
      if (!dataLoaded) {
        setTimeout(() => addLine('  Loading projects...', 'dim'), 200);
      } else if (projects.length === 0) {
        setTimeout(() => addLine('  No projects found.', 'output'), 200);
      } else {
        projects.forEach((p, i) => {
          const delay = 200 + i * 300;
          setTimeout(() => addLine(`  ${i + 1}. ${p.title}`, 'project-link', () => openProject(p)), delay);
          setTimeout(() => addLine(`     ${p.description}`, 'output'), delay + 80);
          setTimeout(() => addLine(`     Tech: ${(p.technologies || p.techs || []).join(', ')}`, 'dim'), delay + 160);
          if (p.liveUrl) setTimeout(() => addLine(`     Live Demo: ${p.liveUrl}`, 'link', () => window.open(p.liveUrl, '_blank')), delay + 200);
          if (p.githubUrl) setTimeout(() => addLine(`     GitHub:    ${p.githubUrl}`, 'link', () => window.open(p.githubUrl, '_blank')), delay + 240);
          if (i < projects.length - 1) setTimeout(() => addLine('', 'output'), delay + 280);
        });
      }
      const len = projects.length || 0;
      setTimeout(() => addLine('', 'output'), 200 + len * 300 + 300);
      setTimeout(() => addLine("  Type 'open <number>' or click a project to view details.", 'dim'), 200 + len * 300 + 350);
    },
    contact: () => {
      addTypedLine('Contact Information', 'highlight');
      setTimeout(() => addLine(`  Email:    ${email}`, 'output'), 200);
      if (phone) setTimeout(() => addLine(`  Phone:    ${phone}`, 'output'), 250);
      setTimeout(() => addLine(`  GitHub:   ${github}`, 'output'), 300);
      setTimeout(() => addLine(`  LinkedIn: ${linkedin}`, 'output'), 400);
      if (address) setTimeout(() => addLine(`  Location: ${address}`, 'output'), 450);
    },
    social: () => {
      addTypedLine('Social Links', 'highlight');
      socialLinks.forEach((link, i) => {
        setTimeout(() => {
          addLine(`  ${link.platform.padEnd(12)}-> ${link.url}`, 'output');
        }, 200 + i * 100);
      });
    },
    whoami: () => {
      addTypedLine(`${name}`, 'highlight');
      setTimeout(() => addLine(`  ${role}`, 'output'), 200);
      setTimeout(() => addLine(`  ${address}`, 'output'), 300);
    },
    banner: () => {
      showBanner();
    },
    clear: () => {
      setLines([]);
      setBootDone(true);
      setTimeout(() => showBanner(), 100);
    },
  };

  const execute = (cmd) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    addLine(`> ${trimmed}`, 'command');
    setCmdHistory(prev => [...prev, trimmed]);
    setHistoryIdx(-1);

    const parts = trimmed.toLowerCase().split(/\s+/);
    const base = parts[0];

    if (base === 'clear') {
      setTimeout(() => {
        setLines([]);
        setBootDone(true);
        setTimeout(() => showBanner(), 100);
      }, 100);
      return;
    }

    if (base === 'open') {
      const num = parseInt(parts[1]);
      if (!isNaN(num) && num >= 1 && num <= projects.length) {
        openProject(projects[num - 1]);
      } else {
        addTypedLine(`Usage: open <number> (1-${projects.length || 0})`, 'error');
      }
      return;
    }

    if (commands[base]) {
      commands[base]();
    } else {
      addTypedLine(`Command not found: '${base}'. Type 'help'`, 'error');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      execute(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const newIdx = historyIdx === -1 ? cmdHistory.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(newIdx);
      setInput(cmdHistory[newIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      const newIdx = historyIdx + 1;
      if (newIdx >= cmdHistory.length) {
        setHistoryIdx(-1);
        setInput('');
      } else {
        setHistoryIdx(newIdx);
        setInput(cmdHistory[newIdx]);
      }
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <motion.div
      className="terminal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleContainerClick}
    >
      <div className="terminal-window" onClick={e => e.stopPropagation()}>
        <div className="terminal-header">
          <div className="terminal-dots">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
          </div>
          <span className="terminal-title">
            <FaTerminal size={12} /> Terminal — {name.toLowerCase().replace(/\s+/g, '')}@portfolio:~$
          </span>
          <button className="terminal-close" onClick={onClose} aria-label="Close terminal">
            <FaTimes size={14} />
          </button>
        </div>

        <div className="terminal-body">
          {lines.map((line, i) => (
            <div key={i} className={`terminal-line terminal-line-${line.type || 'output'}`} onClick={line.onClick} style={line.onClick ? { cursor: 'pointer' } : undefined}>
              {line.text}
              {line.typing && <span className="terminal-cursor-blink">▊</span>}
            </div>
          ))}

          {!bootDone && (
            <div className="terminal-line terminal-line-boot">
              <span className="terminal-cursor-blink">▊</span>
            </div>
          )}

          {bootDone && (
            <div className="terminal-input-line">
              <span className="terminal-prompt">$ </span>
              <input
                ref={inputRef}
                type="text"
                className="terminal-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          )}

          <div ref={endRef} />
        </div>
      </div>
    </motion.div>
  );
}

export default Terminal;
