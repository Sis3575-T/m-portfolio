import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { publicApi } from './api';

const defaultTranslations = {
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.skills': 'Skills',
    'nav.projects': 'Projects',
    'nav.experience': 'Experience',
    'nav.education': 'Education',
    'nav.services': 'Services',
    'nav.testimonials': 'Testimonials',
    'nav.contact': 'Contact',
    'nav.blog': 'Blog',

    'hero.greeting': "Hi, I'm",
    'hero.subtitle': 'Full Stack Developer',
    'hero.cta': 'Get In Touch',
    'hero.viewProjects': 'View Projects',
    'hero.contactMe': 'Contact Me',
    'hero.available': 'Available for opportunities',
    'hero.scrollDown': 'Scroll down',

    'about.title': 'About Me',
    'about.subtitle': 'Get to Know Me',
    'about.myJourney': 'My Journey',
    'about.cardFocus': 'Focus',
    'about.cardApproach': 'Approach',
    'about.cardEducation': 'Education',
    'about.cardGoal': 'Goal',
    'about.cardAchievement': 'Achievement',
    'about.cardMilestone': 'Milestone',

    'skills.title': 'Skills',
    'skills.heading': 'Technical Skills',
    'skills.subtitle': 'Technologies and tools I use to build modern, scalable applications.',

    'projects.title': 'Projects',
    'projects.heading': 'Featured Projects',
    'projects.subtitle': 'Applications built with modern technologies and development best practices.',
    'projects.search': 'Search projects...',
    'projects.visitSite': 'Visit Site',
    'projects.github': 'GitHub',
    'projects.liveDemo': 'Live Demo',
    'projects.none': 'No projects found.',
    'projects.loading': 'Loading projects...',
    'projects.all': 'All',

    'experience.title': 'Experience',
    'experience.heading': 'My Journey',
    'experience.subtitle': 'A narrative of growth — from learning fundamentals to building full-stack applications.',
    'experience.present': 'Present',

    'education.title': 'Education',
    'education.heading': 'Academic Background',
    'education.present': 'Present',

    'services.title': 'What I Do',
    'services.heading': 'Services',
    'services.subtitle': 'From concept to deployment — building modern web solutions.',

    'testimonials.title': 'Testimonials',
    'testimonials.heading': 'What People Say',

    'certificates.title': 'Certificates',
    'certificates.heading': 'Certifications',
    'certificates.subtitle': 'Professional certifications that validate my skills and knowledge.',

    'contact.title': 'Contact',
    'contact.heading': 'Get In Touch',
    'contact.subtitle': 'Open to internships, freelance work, and development roles. Reach out to discuss how I can contribute to your next project.',
    'contact.letsWork': "Let's Work Together",
    'contact.description': "Have a project in mind or just want to say hello? Feel free to reach out. I'm always open to discussing new opportunities, collaborations, or interesting tech conversations.",
    'contact.email': 'Email',
    'contact.phone': 'Phone',
    'contact.location': 'Location',
    'contact.name': 'Your Name',
    'contact.namePlaceholder': 'Your name',
    'contact.emailLabel': 'Email',
    'contact.emailPlaceholder': 'your@email.com',
    'contact.phoneLabel': 'Phone',
    'contact.phonePlaceholder': '+251 XXX XXX XXX',
    'contact.messageLabel': 'Message',
    'contact.messagePlaceholder': 'Tell me about your project or opportunity...',
    'contact.send': 'Send Message',
    'contact.sending': 'Sending...',
    'contact.sent': 'Message Sent',
    'contact.error': 'Failed to send. Please email me directly at',
    'contact.errorPrefix': 'Failed to send. Please email me directly at',

    'footer.navigation': 'Navigation',
    'footer.quickLinks': 'Quick Links',
    'footer.getInTouch': 'Get In Touch',
    'footer.copyright': 'All rights reserved.',
    'footer.builtWith': 'Built with React & Node.js',

    'search.title': 'Search Results',
    'search.placeholder': 'Search projects, blogs, skills...',
    'search.noResults': 'No results found for',
    'search.loading': 'Searching...',

    'theme.light': 'Light Mode',
    'theme.dark': 'Dark Mode',

    'resume.download': 'Download CV',

    'notFound.title': 'Page Not Found',
    'notFound.description': "The page you're looking for doesn't exist or has been moved.",
    'notFound.backHome': 'Back to Home',

    'projectDetail.loading': 'Loading...',
    'projectDetail.notFound': 'Project not found',
    'projectDetail.backHome': 'Back to Home',
    'projectDetail.github': 'GitHub',
    'projectDetail.liveDemo': 'Live Demo',

    'commandPalette.search': 'Type a command or search...',
    'commandPalette.searchPlaceholder': 'Type a command or search...',
    'commandPalette.about': 'Scroll to About section',
    'commandPalette.skills': 'Scroll to Skills section',
    'commandPalette.projects': 'Scroll to Projects section',
    'commandPalette.experience': 'Scroll to Experience section',
    'commandPalette.education': 'Scroll to Education section',
    'commandPalette.services': 'Scroll to Services section',
    'commandPalette.contact': 'Scroll to Contact section',
    'commandPalette.home': 'Scroll to top',
    'commandPalette.theme': 'Toggle dark/light theme',
    'commandPalette.searchPage': 'Go to search page',

    'language.switch': 'Switch to Amharic',
    'language.en': 'EN',
    'language.am': 'አማ',
  },
  am: {
    'nav.home': 'መነሻ',
    'nav.about': 'ስለ እኔ',
    'nav.skills': 'ክህሎቶች',
    'nav.projects': 'ፕሮጀክቶች',
    'nav.experience': 'ልምድ',
    'nav.education': 'ትምህርት',
    'nav.services': 'አገልግሎቶች',
    'nav.testimonials': 'ምስክርነቶች',
    'nav.contact': 'ግንኙነት',
    'nav.blog': 'ብሎግ',

    'hero.greeting': 'ሰላም፣ እኔ',
    'hero.subtitle': 'ሙሉ የቴክኖሎጂ ዲቪሎፐር',
    'hero.cta': 'አግኙኝ',
    'hero.viewProjects': 'ፕሮጀክቶችን ይመልከቱ',
    'hero.contactMe': 'ያግኙኝ',
    'hero.available': 'ለአጋጣሚዎች ክፍት',
    'hero.scrollDown': 'ወደ ታች ይሸብልሉ',

    'about.title': 'ስለ እኔ',
    'about.subtitle': 'ይተዋወቁኝ',
    'about.myJourney': 'ጉዞዬ',
    'about.cardFocus': 'ትኩረት',
    'about.cardApproach': 'አቀራረብ',
    'about.cardEducation': 'ትምህርት',
    'about.cardGoal': 'ግብ',
    'about.cardAchievement': 'ስኬት',
    'about.cardMilestone': 'ምዕራፍ',

    'skills.title': 'ክህሎቶች',
    'skills.heading': 'ቴክኒክ ክህሎቶች',
    'skills.subtitle': 'ዘመናዊ፣ ሊሰፋ የሚችል አፕሊኬሽኖችን ለመገንባት የምጠቀምባቸው ቴክኖሎጂዎች እና መሳሪያዎች።',

    'projects.title': 'ፕሮጀክቶች',
    'projects.heading': 'ተለይተው የቀረቡ ፕሮጀክቶች',
    'projects.subtitle': 'በዘመናዊ ቴክኖሎጂዎች እና የልማት ምርጥ ልምዶች የተገነቡ አፕሊኬሽኖች።',
    'projects.search': 'ፕሮጀክቶችን ይፈልጉ...',
    'projects.visitSite': 'ገፅን ይጎብኙ',
    'projects.github': 'ጊትሃብ',
    'projects.liveDemo': 'የቀጥታ ማሳያ',
    'projects.none': 'ምንም ፕሮጀክቶች አልተገኙም።',
    'projects.loading': 'ፕሮጀክቶች በመጫን ላይ...',
    'projects.all': 'ሁሉም',

    'experience.title': 'ልምድ',
    'experience.heading': 'ጉዞዬ',
    'experience.subtitle': 'የእድገት ታሪክ — መሰረታዊ ነገሮችን ከመማር እስከ ሙሉ የቴክኖሎጂ አፕሊኬሽኖች መገንባት።',
    'experience.present': 'አሁን ድረስ',

    'education.title': 'ትምህርት',
    'education.heading': 'የአካዳሚክ ዳራ',
    'education.present': 'አሁን ድረስ',

    'services.title': 'የማቀርባቸው አገልግሎቶች',
    'services.heading': 'አገልግሎቶች',
    'services.subtitle': 'ከሀሳብ እስከ ማሰማራት — ዘመናዊ የድር መፍትሄዎችን መገንባት።',

    'testimonials.title': 'ምስክርነቶች',
    'testimonials.heading': 'ሰዎች የሚሉት',

    'certificates.title': 'የምስክር ወረቀቶች',
    'certificates.heading': 'ሰርተፊኬቶች',
    'certificates.subtitle': 'ክህሎቴን እና እውቀቴን የሚያረጋግጡ የሙያ ሰርተፊኬቶች።',

    'contact.title': 'ግንኙነት',
    'contact.heading': 'አግኙኝ',
    'contact.subtitle': 'ለልምምድ፣ የፍሪላንስ ስራ እና የልማት ሚናዎች ክፍት ነኝ። ለቀጣይ ፕሮጀክትዎ እንዴት አስተዋጽኦ ማድረግ እንደምችል ለመወያየት ያነጋግሩኝ።',
    'contact.letsWork': 'አብረን እንስራ',
    'contact.description': 'በአእምሮዎ ውስጥ ፕሮጀክት አለዎት ወይም ሰላም ማለት ይፈልጋሉ? ነፃነት ይሰማዎ። ስለ አዳዲስ እድሎች፣ ትብብሮች ወይም አስደሳች የቴክ ውይይቶች ለመወያየት ሁልጊዜ ክፍት ነኝ።',
    'contact.email': 'ኢሜይል',
    'contact.phone': 'ስልክ',
    'contact.location': 'አድራሻ',
    'contact.name': 'ስም',
    'contact.namePlaceholder': 'ስምዎ',
    'contact.emailLabel': 'ኢሜይል',
    'contact.emailPlaceholder': 'your@email.com',
    'contact.phoneLabel': 'ስልክ',
    'contact.phonePlaceholder': '+251 XXX XXX XXX',
    'contact.messageLabel': 'መልእክት',
    'contact.messagePlaceholder': 'ስለ ፕሮጀክትዎ ወይም እድልዎ ይንገሩኝ...',
    'contact.send': 'መልእክት ይላኩ',
    'contact.sending': 'በመላክ ላይ...',
    'contact.sent': 'መልእክት ተልኳል',
    'contact.error': 'መላክ አልተሳካም። እባክዎ በቀጥታ በኢሜይል ያግኙኝ',
    'contact.errorPrefix': 'መላክ አልተሳካም። እባክዎ በቀጥታ በኢሜይል ያግኙኝ',

    'footer.navigation': 'ዳሰሳ',
    'footer.quickLinks': 'ፈጣን አገናኞች',
    'footer.getInTouch': 'አግኙኝ',
    'footer.copyright': 'መብቱ በህግ የተጠበቀ ነው።',
    'footer.builtWith': 'በReact እና Node.js የተገነባ',

    'search.title': 'የፍለጋ ውጤቶች',
    'search.placeholder': 'ፕሮጀክቶችን፣ ብሎጎችን፣ ክህሎቶችን ይፈልጉ...',
    'search.noResults': 'ምንም ውጤት አልተገኘም',
    'search.loading': 'በመፈለግ ላይ...',

    'theme.light': 'የብርሃን ሁነታ',
    'theme.dark': 'የጨለማ ሁነታ',

    'resume.download': 'ሲቪ አውርድ',

    'notFound.title': 'ገፅ አልተገኘም',
    'notFound.description': 'የሚፈልጉት ገፅ የለም ወይም ተዛውሯል።',
    'notFound.backHome': 'ወደ መነሻ ይመለሱ',

    'projectDetail.loading': 'በመጫን ላይ...',
    'projectDetail.notFound': 'ፕሮጀክት አልተገኘም',
    'projectDetail.backHome': 'ወደ መነሻ ይመለሱ',
    'projectDetail.github': 'ጊትሃብ',
    'projectDetail.liveDemo': 'የቀጥታ ማሳያ',

    'commandPalette.search': 'የትእዛዝ ወይም ፍለጋ ይተይቡ...',
    'commandPalette.searchPlaceholder': 'የትእዛዝ ወይም ፍለጋ ይተይቡ...',
    'commandPalette.about': 'ወደ ስለ እኔ ክፍል ይሸብልሉ',
    'commandPalette.skills': 'ወደ ክህሎቶች ክፍል ይሸብልሉ',
    'commandPalette.projects': 'ወደ ፕሮጀክቶች ክፍል ይሸብልሉ',
    'commandPalette.experience': 'ወደ ልምድ ክፍል ይሸብልሉ',
    'commandPalette.education': 'ወደ ትምህርት ክፍል ይሸብልሉ',
    'commandPalette.services': 'ወደ አገልግሎቶች ክፍል ይሸብልሉ',
    'commandPalette.contact': 'ወደ ግንኙነት ክፍል ይሸብልሉ',
    'commandPalette.home': 'ወደ ላይ ይሸብልሉ',
    'commandPalette.theme': 'የጨለማ/የብርሃን ገፅታን ይቀይሩ',
    'commandPalette.searchPage': 'ወደ ፍለጋ ገፅ ይሂዱ',

    'language.switch': 'ወደ እንግሊዝኛ ይቀይሩ',
    'language.en': 'EN',
    'language.am': 'አማ',
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
