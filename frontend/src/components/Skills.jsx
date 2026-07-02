import React, { useState, useMemo, useEffect } from 'react';
import { getImageUrl } from '../api';

const iconMap = [
  ['react', '⚛️'], ['vue', '💚'], ['angular', '🔴'],
  ['javascript', '🟨'], ['typescript', '🔷'], ['html', '🟧'],
  ['css', '🎨'], ['node', '💚'], ['python', '🐍'],
  ['java', '☕'], ['go', '🔵'], ['rust', '🦀'],
  ['docker', '🐳'], ['git', '🔀'], ['linux', '🐧'],
  ['mongodb', '🍃'], ['postgresql', '🐘'], ['mysql', '🐬'],
  ['redis', '🔴'], ['firebase', '🔥'], ['aws', '☁️'],
  ['figma', '🖌️'], ['sass', '💅'], ['tailwind', '🌊'],
  ['next', '▲'], ['graphql', '◈'], ['webpack', '📦'],
  ['vite', '⚡'], ['electron', '⚛️'], ['flutter', '🔷'],
  ['django', '🎸'], ['kubernetes', '☸️'], ['nginx', '🌐'],
  ['postman', '📮'], ['jest', '🃏'],
  ['cpp', '⚙️'], ['csharp', '#️⃣'], ['php', '🐘'],
  ['ruby', '💎'], ['swift', '🕊️'], ['kotlin', '🅺'],
  ['terraform', '🏗️'], ['ansible', '🔄'], ['jenkins', '🤖'],
  ['github', '🐙'], ['gitlab', '🦊'], ['bitbucket', '🔵'],
  ['jira', '🔷'], ['trello', '📋'], ['slack', '💬'],
  ['discord', '💬'], ['redux', '🔄'], ['jquery', '💲'],
  ['bootstrap', '🟪'], ['express', '⚡'], ['nestjs', '🟥'],
  ['socketio', '🔌'], ['socket', '🔌'], ['prisma', '🟢'],
  ['mongoose', '🍃'], ['sequelize', '🔵'],
  ['rabbitmq', '🐇'], ['kafka', '📊'], ['apache', '🦁'],
  ['mocha', '☕'], ['cypress', '🏁'], ['playwright', '🎭'],
  ['selenium', '🧪'], ['wordpress', '🔵'], ['laravel', '🔴'],
  ['symfony', '⚫'], ['rails', '🟥'], ['flask', '⚗️'],
  ['fastapi', '⚡'], ['spring', '🍃'],
  ['rest', '🖇️'], ['restapi', '🖇️'], ['api', '🔄'],
  ['jwt', '🔐'], ['auth', '🛡️'], ['vercel', '▲'],
  ['render', '🚀'], ['framer', '🎬'], ['motion', '🎬'],
  ['vscode', '💻'], ['code', '💻'], ['npm', '📦'],
  ['pnpm', '📦'], ['yarn', '📦'], ['database', '🗄️'],
];

function getSkillIcon(skill) {
  if (skill.icon && !/^[a-zA-Z]$/.test(skill.icon)) return skill.icon;
  const name = skill.name.toLowerCase().trim();
  const key = name.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '');
  for (const [match, emoji] of iconMap) {
    if (key === match || key.includes(match) || match.includes(key)) return emoji;
    if (name.includes(match) || match.includes(name.replace(/[^a-z]/g, ''))) return emoji;
  }
  const first = name.charAt(0).toUpperCase();
  return first;
}

function Skills({ skills, settings, sectionTitle, sectionSubtitle }) {
  const pageStyles = settings?.pageStyles?.skills || {};
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
      const id = 'skills-custom-css';
      let el = document.getElementById(id);
      if (!el) { el = document.createElement('style'); el.id = id; document.head.appendChild(el); }
      el.textContent = pageStyles.customCss;
      return () => { const e = document.getElementById(id); if (e) e.remove(); };
    }
  }, [pageStyles.customCss]);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = useMemo(() => {
    if (!skills || skills.length === 0) return [];
    return ['All', ...new Set(skills.map((s) => s.category).filter(Boolean))];
  }, [skills]);

  const filtered = useMemo(() => {
    if (!skills) return [];
    if (activeCategory === 'All') return skills;
    return skills.filter((s) => s.category === activeCategory);
  }, [skills, activeCategory]);

  if (!skills || skills.length === 0) return null;

  return (
    <section className="skills section" id="skills" style={sectionStyle}>
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{sectionTitle || 'Skills & Technologies'}</h2>
          {sectionSubtitle && <p className="section-subtitle">{sectionSubtitle}</p>}
          <div className="section-divider" />
        </div>
        {categories.length > 1 && (
          <div className="skills-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`skills-tab${activeCategory === cat ? ' active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
        <div className="skills-grid">
          {filtered.map((skill) => (
            <div key={skill._id} className="skill-item">
              <div className="skill-icon">
                {(() => {
                  const icon = getSkillIcon(skill);
                  if (icon.length > 4) {
                    return <img src={getImageUrl(icon)} alt={skill.name} style={{ width: 28, height: 28, objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />;
                  }
                  return <span style={{ fontSize: '1.2rem' }}>{icon}</span>;
                })()}
              </div>
              <div className="skill-header">
                <span className="skill-name">{skill.name}</span>
              </div>
              <p className="skill-description">
                {skill.description || `Practical experience with ${skill.name} in modern web development workflows.`}
              </p>
              {skill.projectsUsed && (
                <span className="skill-projects">Used in: {skill.projectsUsed}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Skills;
