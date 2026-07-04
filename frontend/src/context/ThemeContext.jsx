import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

function getInitialTheme() {
  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyThemeVariables(theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  useEffect(() => {
    applyThemeVariables(theme);
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