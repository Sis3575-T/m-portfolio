import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaTerminal } from 'react-icons/fa';

const bootLines = [
  { type: 'dim', text: '[SYSTEM] Initializing portfolio kernel...' },
  { type: 'dim', text: '[SYSTEM] Loading modules: React, Node.js, MongoDB' },
  { type: 'dim', text: '[SYSTEM] Establishing secure connection...' },
  { type: 'highlight', text: '╔══════════════════════════════════════╗' },
  { type: 'highlight', text: '║     SISAY TEMESGEN — PORTFOLIO v3.0   ║' },
  { type: 'highlight', text: '╚══════════════════════════════════════╝' },
  { type: 'output', text: '' },
  { type: 'output', text: '> Welcome! Type a command or click a link.' },
  { type: 'output', text: '' },
];

const commands = {
  help: 'Show available commands',
  about: 'About me',
  skills: 'My technical skills',
  projects: 'View my projects',
  contact: 'Get in touch',
  clear: 'Clear terminal',
};

function HeroTerminal() {
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let idx = 0;

    function tick() {
      if (cancelled) return;
      if (idx < bootLines.length) {
        setLines(prev => [...prev, bootLines[idx]]);
        idx++;
        setTimeout(tick, 120);
      }
    }

    tick();

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [lines]);

  const addLine = useCallback((type, text) => {
    setLines(prev => [...prev, { type, text }]);
  }, []);

  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleCommand = useCallback((cmd) => {
    const trimmed = cmd.trim().toLowerCase();
    addLine('command', `$ ${cmd}`);
    setCmdHistory(prev => [...prev, cmd]);
    setHistoryIdx(-1);

    switch (trimmed) {
      case 'help':
        Object.entries(commands).forEach(([c, desc]) => {
          addLine('output', `  ${c.padEnd(12)} ${desc}`);
        });
        break;
      case 'about':
        addLine('output', 'Full Stack Developer | CS Student at Bahir Dar University');
        addLine('output', 'Passionate about building modern web applications.');
        break;
      case 'skills':
        addLine('output', 'Frontend: React, JavaScript, Tailwind CSS');
        addLine('output', 'Backend: Node.js, Express, Python');
        addLine('output', 'Database: MongoDB, PostgreSQL');
        addLine('output', 'Tools: Git, Docker, Vite');
        break;
      case 'projects':
        addLine('output', 'Opening projects section...');
        setTimeout(() => scrollTo('projects'), 300);
        break;
      case 'contact':
        addLine('output', 'Opening contact section...');
        setTimeout(() => scrollTo('contact'), 300);
        break;
      case 'clear':
        setLines([]);
        break;
      default:
        addLine('error', `Command not found: ${cmd}. Type 'help' for available commands.`);
    }
  }, [addLine, scrollTo]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      handleCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const newIdx = historyIdx === -1 ? cmdHistory.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(newIdx);
        setInput(cmdHistory[newIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx !== -1) {
        const newIdx = historyIdx + 1;
        if (newIdx >= cmdHistory.length) {
          setHistoryIdx(-1);
          setInput('');
        } else {
          setHistoryIdx(newIdx);
          setInput(cmdHistory[newIdx]);
        }
      }
    }
  };

  return (
    <div className="hero-terminal" onClick={() => inputRef.current?.focus()}>
      <div className="hero-terminal-header">
        <div className="hero-terminal-dots">
          <span className="hero-terminal-dot red" />
          <span className="hero-terminal-dot yellow" />
          <span className="hero-terminal-dot green" />
        </div>
        <span className="hero-terminal-title">
          <FaTerminal size={10} /> portfolio@sisay — zsh
        </span>
        <span style={{ width: 48 }} />
      </div>
      <div className="hero-terminal-body" ref={bodyRef}>
        {lines.map((line, i) => (
          line ? (
            <div key={i} className={`hero-terminal-line hero-terminal-${line.type}`}>
              {line.text}
            </div>
          ) : null
        ))}
        <div className="hero-terminal-input-line">
          <span className="hero-terminal-prompt-symbol">$</span>
          <input
            ref={inputRef}
            className="hero-terminal-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type help..."
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
}

export default HeroTerminal;
