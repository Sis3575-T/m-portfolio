import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { publicApi } from './api';

const defaultTranslations = {
  en: {
    'nav.home': 'Home',
    'nav.projects': 'Projects',
    'nav.skills': 'Skills',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact',
    'hero.subtitle': 'Full Stack Developer',
    'hero.cta': 'Get In Touch',
    'about.title': 'About Me',
    'skills.title': 'Skills & Technologies',
    'projects.title': 'Projects',
    'projects.viewAll': 'View All Projects',
    'blog.title': 'Latest Blog Posts',
    'blog.readMore': 'Read More',
    'contact.title': 'Get In Touch',
    'contact.send': 'Send Message',
    'contact.name': 'Your Name',
    'contact.email': 'Your Email',
    'contact.subject': 'Subject',
    'contact.message': 'Message',
    'footer.copyright': 'All rights reserved.',
    'search.title': 'Search Results',
    'search.placeholder': 'Search projects, blogs, skills...',
    'search.noResults': 'No results found for',
    'theme.light': 'Light Mode',
    'theme.dark': 'Dark Mode',
    'resume.download': 'Download CV',
    'testimonials.title': 'Testimonials',
    'certificates.title': 'Certificates',
    'experience.title': 'Experience',
    'education.title': 'Education',
    'services.title': 'Services',
  },
  am: {
    'nav.home': 'መነሻ',
    'nav.projects': 'ፕሮጀክቶች',
    'nav.skills': 'ክህሎቶች',
    'nav.blog': 'ብሎግ',
    'nav.contact': 'ግንኙነት',
    'hero.subtitle': 'ሙሉ የቴክኖሎጂ ዲቪሎፐር',
    'hero.cta': 'አግኙኝ',
    'about.title': 'ስለ እኔ',
    'skills.title': 'ክህሎቶች እና ቴክኖሎጂዎች',
    'projects.title': 'ፕሮጀክቶች',
    'projects.viewAll': 'ሁሉም ፕሮጀክቶች',
    'blog.title': 'የቅርብ ጊዜ ብሎግ ልጥፎች',
    'blog.readMore': 'ተጨማሪ ያንብቡ',
    'contact.title': 'አግኙኝ',
    'contact.send': 'መልእክት ይላኩ',
    'contact.name': 'ስም',
    'contact.email': 'ኢሜይል',
    'contact.subject': 'ርዕስ',
    'contact.message': 'መልእክት',
    'footer.copyright': 'መብቱ በህግ የተጠበቀ ነው።',
    'search.title': 'የፍለጋ ውጤቶች',
    'search.placeholder': 'ፕሮጀክቶችን፣ ብሎጎችን፣ ክህሎቶችን ይፈልጉ...',
    'search.noResults': 'ምንም ውጤት አልተገኘም',
    'theme.light': 'የብርሃን ሁነታ',
    'theme.dark': 'የጨለማ ሁነታ',
    'resume.download': 'ሲቪ አውርድ',
  }
};

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('portfolio_lang') || 'en');
  const [translations, setTranslations] = useState(defaultTranslations);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('portfolio_lang', language);
    document.documentElement.lang = language;
    const fetchTranslations = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/translations?language=${language}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            const customT = { ...defaultTranslations };
            data.data.forEach(t => {
              if (!customT[language]) customT[language] = {};
              customT[language][t.key] = t.value;
            });
            setTranslations(customT);
          }
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    fetchTranslations();
  }, [language]);

  const t = useCallback((key, fallback) => {
    if (!translations[language]) return fallback || key;
    return translations[language][key] || fallback || key;
  }, [language, translations]);

  const changeLanguage = useCallback((lang) => {
    setLanguage(lang);
  }, []);

  return (
    <I18nContext.Provider value={{ language, setLanguage: changeLanguage, t, loading }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}