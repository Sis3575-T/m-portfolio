import { createContext, useContext, useState, useEffect } from 'react';
import { publicApi } from '../utils/api';

const ThemeContext = createContext();

function getInitialTheme() {
  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyThemeVariables(theme, customColors) {
  const root = document.documentElement;
  if (customColors) {
    root.style.setProperty('--primary-color', customColors.primary || '#7c3aed');
    root.style.setProperty('--secondary-color', customColors.secondary || '#06b6d4');
    root.style.setProperty('--bg-primary', customColors.background || (theme === 'dark' ? '#0f172a' : '#ffffff'));
    root.style.setProperty('--card-bg', customColors.card || (theme === 'dark' ? '#1e293b' : '#f8fafc'));
    root.style.setProperty('--text-white', customColors.text || (theme === 'dark' ? '#f1f5f9' : '#0f172a'));
    root.style.setProperty('--text-light', customColors.text ? `${customColors.text}cc` : (theme === 'dark' ? '#cbd5e1' : '#334155'));
    root.style.setProperty('--text-muted', customColors.text ? `${customColors.text}99` : (theme === 'dark' ? '#64748b' : '#94a3b8'));
  }
  root.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  useEffect(() => {
    applyThemeVariables(theme);
  }, [theme]);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const { data } = await publicApi.getSettings();
        const settings = data.data || data;
        const colors = settings?.themeColors || settings?.theme;
        if (colors) {
          applyThemeVariables(theme, colors);
        }
      } catch {
      }
    };
    fetchTheme();
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { ThemeProvider, useTheme };