import portfolioData from '../data/portfolioData';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function saveToLS(key, data) {
  try {
    localStorage.setItem('portfolio_' + key, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

function loadFromLS(key, fallback) {
  try {
    const stored = localStorage.getItem('portfolio_' + key);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.warn('Failed to load from localStorage:', e);
  }
  return fallback;
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

let storeListeners = [];

function notifyListeners() {
  storeListeners.forEach(fn => fn());
}

export function subscribe(fn) {
  storeListeners.push(fn);
  return () => {
    storeListeners = storeListeners.filter(f => f !== fn);
  };
}

export function getData(key) {
  return loadFromLS(key, deepClone(portfolioData[key] || null));
}

export function setData(key, value) {
  saveToLS(key, value);
  notifyListeners();
}

export function getPortfolioData() {
  return {
    settings: getData('settings'),
    navItems: getData('navItems'),
    sections: getData('sections'),
    hero: getData('hero'),
    projects: getData('projects'),
    skills: getData('skills'),
    experience: getData('experience'),
    education: getData('education'),
  };
}

export function resetToDefaults() {
  const keys = ['settings', 'navItems', 'sections', 'hero', 'projects', 'skills', 'experience', 'education'];
  keys.forEach(key => localStorage.removeItem('portfolio_' + key));
  notifyListeners();
}

export { generateId, deepClone };
