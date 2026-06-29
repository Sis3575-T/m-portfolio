require('dotenv').config();
require('dotenv').config();
const mongoose = require('mongoose');
const Hero = require('./models/Hero');
const About = require('./models/About');
const Skill = require('./models/Skill');
const Service = require('./models/Service');
const Experience = require('./models/Experience');
const Education = require('./models/Education');
const Certificate = require('./models/Certificate');
const Setting = require('./models/Settings');
const Project = require('./models/Project');
const Page = require('./models/Page');
const Translation = require('./models/Translation');
const Theme = require('./models/Theme');
const User = require('./models/User');

const connectDB = require('./config/db');

async function seed() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    if ((await Hero.countDocuments()) === 0) {
      await Hero.create({
        name: 'Sisay Temesgen',
        title: 'Full Stack Developer, AI Enthusiast, Computer Science Student, Problem Solver',
        introduction: 'Computer Science student at Bahir Dar University — building modern, accessible web applications with React, Node.js & MongoDB.',
        role: 'Full Stack Developer',
        location: 'Bahir Dar, Ethiopia',
        availability: { status: 'available', text: 'Available for opportunities' },
        avatar: '',
        socialLinks: [
          { platform: 'github', url: 'https://github.com/Sis3575-T', icon: 'FaGithub' },
          { platform: 'linkedin', url: 'https://linkedin.com/in/sisay-temesgen', icon: 'FaLinkedin' },
          { platform: 'twitter', url: 'https://twitter.com', icon: 'FaTwitter' },
          { platform: 'telegram', url: 'https://t.me/sisay3575', icon: 'FaTelegram' },
          { platform: 'email', url: 'mailto:sisay3575@gmail.com', icon: 'FiMail' },
        ],
        buttons: [
          { label: 'View Projects', url: '', type: 'primary' },
          { label: 'Contact Me', url: '', type: 'outline' },
          { label: 'Download CV', url: '', type: 'outline', file: '' },
        ],
        isActive: true,
      });
      console.log('  Hero seeded');
    }

    if ((await About.countDocuments()) === 0) {
      await About.create({
        biography: `I am a Full-Stack Developer and Computer Science student at Bahir Dar University with a genuine passion for building software that solves real problems. My journey into technology started with pure curiosity about how websites work and has evolved into a dedicated pursuit of software development excellence.\n\nI chose Computer Science because I wanted to understand the fundamental principles behind the technology we use every day. Through coursework and hands-on projects, I've developed practical skills in frontend and backend development, database management, API design, and responsive UI. Each project teaches me something new about architecture, performance, and the art of clean code.\n\nWhat drives me is the ability to transform ideas into working products. I enjoy the complete development cycle — from planning and design to implementation and deployment. Full-stack development appeals to me because it combines the logic of backend systems with the creativity of frontend interfaces, giving me a holistic view of how modern applications are built.`,
        heading: 'Full Stack Developer with a passion for <span class="text-gradient">building exceptional</span> digital experiences',
        careerJourney: 'Started with HTML, CSS, and JavaScript fundamentals in 2022. Progressed to React and Node.js by 2023. Currently building full-stack applications with the MERN stack and exploring AI integration.',
        keyAchievements: [
          'Full-Stack Web Development with modern JavaScript/TypeScript ecosystems',
          'B.Sc. Computer Science at Bahir Dar University — building a strong CS foundation',
          'Building a CMS platform with admin dashboard, authentication, and media management',
          'Deployed live applications on Vercel and Render platforms',
          'Built Ethiopian Tourist Destination platform showcasing cultural heritage',
        ],
        stats: [
          { label: 'Years Learning', value: '2', suffix: '+' },
          { label: 'Projects Built', value: '3', suffix: '+' },
          { label: 'Technologies', value: '5', suffix: '+' },
          { label: 'Curiosity', value: '∞', suffix: '' },
        ],
        isActive: true,
      });
      console.log('  About seeded');
    }

    if ((await Skill.countDocuments()) === 0) {
      await Skill.insertMany([
        { name: 'React', category: 'Frontend', proficiency: 85, icon: 'FaReact', isActive: true },
        { name: 'TypeScript', category: 'Frontend', proficiency: 75, icon: 'SiTypescript', isActive: true },
        { name: 'JavaScript', category: 'Frontend', proficiency: 85, icon: 'FaJs', isActive: true },
        { name: 'HTML5', category: 'Frontend', proficiency: 90, icon: 'FaHtml5', isActive: true },
        { name: 'CSS3', category: 'Frontend', proficiency: 85, icon: 'FaCss3Alt', isActive: true },
        { name: 'Tailwind CSS', category: 'Frontend', proficiency: 80, icon: 'SiTailwindcss', isActive: true },
        { name: 'Node.js', category: 'Backend', proficiency: 80, icon: 'FaNodeJs', isActive: true },
        { name: 'Express', category: 'Backend', proficiency: 78, icon: 'SiExpress', isActive: true },
        { name: 'Python', category: 'Backend', proficiency: 60, icon: 'FaPython', isActive: true },
        { name: 'MongoDB', category: 'Database', proficiency: 75, icon: 'SiMongodb', isActive: true },
        { name: 'PostgreSQL', category: 'Database', proficiency: 65, icon: 'SiPostgresql', isActive: true },
        { name: 'Git', category: 'Tools & Technologies', proficiency: 82, icon: 'FaGitAlt', isActive: true },
        { name: 'Docker', category: 'Tools & Technologies', proficiency: 50, icon: 'FaDocker', isActive: true },
        { name: 'Vite', category: 'Tools & Technologies', proficiency: 75, icon: 'SiVite', isActive: true },
        { name: 'Postman', category: 'Tools & Technologies', proficiency: 70, icon: 'SiPostman', isActive: true },
        { name: 'Figma', category: 'Tools & Technologies', proficiency: 55, icon: 'FaFigma', isActive: true },
        { name: 'npm', category: 'Tools & Technologies', proficiency: 78, icon: 'FaNpm', isActive: true },
      ]);
      console.log('  Skills seeded');
    }

    if ((await Service.countDocuments()) === 0) {
      await Service.insertMany([
        {
          title: 'Frontend Development',
          description: 'Responsive, accessible UIs built with React and modern CSS. Pixel-perfect implementations from Figma or any design system.',
          icon: '🎨',
          features: ['React components', 'Responsive design', 'Accessibility (a11y)', 'Performance optimization'],
          order: 1,
          isActive: true,
        },
        {
          title: 'Backend Development',
          description: 'RESTful APIs and server-side logic with Node.js, Express, and MongoDB. Authentication, validation, and data modeling.',
          icon: '⚙️',
          features: ['RESTful APIs', 'Authentication & authorization', 'Database design', 'Data validation'],
          order: 2,
          isActive: true,
        },
        {
          title: 'Full Stack Projects',
          description: 'End-to-end web applications from concept to deployment. Architecture planning, database design, and cloud hosting.',
          icon: '🚀',
          features: ['Architecture planning', 'Frontend + backend integration', 'Deployment & hosting', 'Performance monitoring'],
          order: 3,
          isActive: true,
        },
        {
          title: 'Responsive Design',
          description: 'Mobile-first layouts that work seamlessly across all devices. Performance optimized with modern tooling.',
          icon: '📱',
          features: ['Mobile-first approach', 'Cross-browser compatibility', 'Performance optimization', 'Modern CSS techniques'],
          order: 4,
          isActive: true,
        },
      ]);
      console.log('  Services seeded');
    }

    if ((await Experience.countDocuments()) === 0) {
      await Experience.insertMany([
        {
          position: 'Building Full-Stack Applications',
          company: 'Portfolio & Client Projects',
          startDate: new Date('2024-01-01'),
          endDate: null,
          current: true,
          description: 'Developing complete web applications using MERN stack with responsive design and clean architecture. Building a CMS platform with admin dashboard, authentication, and media management. Integrating RESTful APIs, database operations, and cloud-based file storage.',
          responsibilities: [
            'Developing complete web applications using MERN stack with responsive design and clean architecture',
            'Building a CMS platform with admin dashboard, authentication, and media management',
            'Integrating RESTful APIs, database operations, and cloud-based file storage',
          ],
          location: 'Bahir Dar, Ethiopia',
          order: 1,
          isActive: true,
        },
        {
          position: 'Computer Science Foundation',
          company: 'Bahir Dar University',
          startDate: new Date('2023-01-01'),
          endDate: null,
          current: true,
          description: 'Pursuing B.Sc. in Computer Science with focus on software engineering principles. Coursework in data structures, algorithms, database systems, and web technologies. Building practical projects that bridge academic theory with real-world application.',
          responsibilities: [
            'Pursuing B.Sc. in Computer Science with focus on software engineering principles',
            'Coursework in data structures, algorithms, database systems, and web technologies',
            'Building practical projects that bridge academic theory with real-world application',
          ],
          location: 'Bahir Dar, Ethiopia',
          order: 2,
          isActive: true,
        },
        {
          position: 'Learning Through Building',
          company: 'Self-Directed Development',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
          current: false,
          description: 'Mastered React for frontend development and Node.js with Express for backend services. Built projects integrating authentication flows, API design, and database operations. Explored modern tooling including Tailwind CSS, Vite, and Docker for development workflows.',
          responsibilities: [
            'Mastered React for frontend development and Node.js with Express for backend services',
            'Built projects integrating authentication flows, API design, and database operations',
            'Explored modern tooling including Tailwind CSS, Vite, and Docker for development workflows',
          ],
          location: 'Bahir Dar, Ethiopia',
          order: 3,
          isActive: true,
        },
        {
          position: 'Starting the Journey',
          company: 'Web Development Fundamentals',
          startDate: new Date('2022-01-01'),
          endDate: new Date('2022-12-31'),
          current: false,
          description: 'Began with HTML, CSS, and JavaScript fundamentals through online resources. Built foundational knowledge in responsive design, programming logic, and version control with Git. Completed initial projects that established core web development skills.',
          responsibilities: [
            'Began with HTML, CSS, and JavaScript fundamentals through online resources',
            'Built foundational knowledge in responsive design, programming logic, and version control with Git',
            'Completed initial projects that established core web development skills',
          ],
          location: 'Bahir Dar, Ethiopia',
          order: 4,
          isActive: true,
        },
      ]);
      console.log('  Experiences seeded');
    }

    if ((await Setting.countDocuments()) === 0) {
      await Setting.create({
        siteTitle: 'Sisay Temesgen — Portfolio',
        siteDescription: 'Full Stack Developer & AI Enthusiast',
        seoTitle: 'Sisay Temesgen | Full Stack Developer',
        seoDescription: 'Sisay Temesgen - Full Stack Developer & Computer Science student at Bahir Dar University. Building modern web applications.',
        footerText: 'Always learning, always building.',
        copyrightText: '© 2026 Sisay Temesgen. All rights reserved.',
        email: 'sisay3575@gmail.com',
        phone: '+251 935 756 054',
        address: 'Bahir Dar, Ethiopia',
        city: 'Bahir Dar',
        country: 'Ethiopia',
        nationality: 'Ethiopian',
        dateOfBirth: '',
        professionalTitle: 'Full Stack Developer',
        shortBio: 'Computer Science student at Bahir Dar University — building modern, accessible web applications with React, Node.js & MongoDB.',
        longBio: `I am a Full-Stack Developer and Computer Science student at Bahir Dar University with a genuine passion for building software that solves real problems. My journey into technology started with pure curiosity about how websites work and has evolved into a dedicated pursuit of software development excellence.`,
        currentCompany: 'Bahir Dar University',
        currentPosition: 'Computer Science Student',
        yearsOfExperience: '2',
        freelanceAvailable: true,
        languages: 'English, Amharic',
        github: 'https://github.com/Sis3575-T',
        linkedin: 'https://linkedin.com/in/sisay-temesgen',
        twitter: 'https://twitter.com',
        telegram: 'https://t.me/sisay3575',
        facebook: '',
        instagram: '',
        youtube: '',
        medium: '',
        stackoverflow: '',
        leetcode: '',
        maintenanceMode: false,
      });
      console.log('  Settings seeded');
    }

    if ((await Page.countDocuments()) === 0) {
      await Page.create({
        title: 'Home',
        slug: 'home',
        description: 'Portfolio homepage',
        isPublished: true,
        isHome: true,
        order: 0,
        components: [
          { type: 'hero', title: 'Hero', subtitle: '', description: '', buttonText: '', buttonLink: '', isVisible: true, order: 0 },
          { type: 'about', title: 'About Me', subtitle: 'Get to Know Me', description: '', buttonText: '', buttonLink: '', isVisible: true, order: 1 },
          { type: 'stats', title: 'Statistics', subtitle: '', description: '', buttonText: '', buttonLink: '', isVisible: true, order: 2 },
          { type: 'skills', title: 'Technical Skills', subtitle: 'Skills', description: 'Technologies and tools I use to build modern, scalable applications.', buttonText: '', buttonLink: '', isVisible: true, order: 3 },
          { type: 'projects', title: 'Projects', subtitle: 'Projects', description: '', buttonText: '', buttonLink: '', isVisible: true, order: 4 },
          { type: 'experience', title: 'My Journey', subtitle: 'Experience', description: 'A narrative of growth — from learning fundamentals to building full-stack applications.', buttonText: '', buttonLink: '', isVisible: true, order: 5 },
          { type: 'education', title: 'Academic Background', subtitle: 'Education', description: '', buttonText: '', buttonLink: '', isVisible: true, order: 6 },
          { type: 'certificates', title: 'Certifications', subtitle: 'Certificates', description: 'Professional certifications that validate my skills and knowledge.', buttonText: '', buttonLink: '', isVisible: true, order: 7 },
          { type: 'services', title: 'Services', subtitle: 'What I Do', description: 'From concept to deployment — building modern web solutions.', buttonText: '', buttonLink: '', isVisible: true, order: 8 },
          { type: 'contact', title: 'Get In Touch', subtitle: 'Contact', description: 'Open to internships, freelance work, and development roles. Reach out to discuss how I can contribute to your next project.', buttonText: '', buttonLink: '', isVisible: true, order: 11 },
        ],
      });
      console.log('  Home page seeded');
    }

    if ((await Education.countDocuments()) === 0) {
      await Education.create({
        institution: 'Bahir Dar University',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: new Date('2023-01-01'),
        endDate: null,
        gpa: '',
        description: 'Pursuing a B.Sc. in Computer Science with coursework in data structures, algorithms, database systems, and web technologies.',
        achievements: [
          'Building a strong foundation in computer science theory and practice',
          'Developing full-stack applications as part of coursework and personal projects',
          'Exploring AI and machine learning concepts alongside core curriculum',
        ],
        order: 0,
        isActive: true,
      });
      console.log('  Education seeded');
    }

    if ((await Project.countDocuments()) === 0) {
      await Project.insertMany([
        {
          title: 'Ethiopian Tourist Destination',
          description: 'A comprehensive tourist destination platform showcasing Ethiopia\'s highest peaks, national parks, and cultural heritage sites. Features interactive guides, travel tips, and curated recommendations for travelers exploring Ethiopia.',
          thumbnail: '',
          technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'CSS3'],
          githubUrl: '',
          liveUrl: 'https://tourist-destination-2.onrender.com/',
          featured: true,
          category: 'Full Stack',
          order: 0,
          isActive: true,
        },
        {
          title: 'Abay Grand Hotel',
          description: 'A modern hotel booking and information platform built with Next.js and Tailwind CSS. Features room listings, booking functionality, and a responsive design optimized for all devices.',
          thumbnail: '',
          technologies: ['React', 'Next.js', 'Tailwind CSS', 'Vercel'],
          githubUrl: '',
          liveUrl: 'https://abay-grand-hotel-1.vercel.app/',
          featured: true,
          category: 'Full Stack',
          order: 1,
          isActive: true,
        },
        {
          title: 'Portfolio CMS',
          description: 'A full-featured content management system with admin dashboard, authentication, and media management. Built with the MERN stack, featuring real-time updates and a modern UI.',
          thumbnail: '',
          technologies: ['React', 'Express', 'MongoDB', 'Node.js', 'Cloudinary'],
          githubUrl: '',
          liveUrl: '',
          featured: true,
          category: 'Full Stack',
          order: 2,
          isActive: true,
        },
      ]);
      console.log('  Projects seeded');
    }

    if ((await Certificate.countDocuments()) === 0) {
      await Certificate.insertMany([
        {
          title: 'JavaScript Algorithms and Data Structures',
          issuer: 'freeCodeCamp',
          credentialUrl: 'https://www.freecodecamp.org/certification/',
          issueDate: '2024',
          visible: true,
          order: 0,
        },
        {
          title: 'Responsive Web Design',
          issuer: 'freeCodeCamp',
          credentialUrl: 'https://www.freecodecamp.org/certification/',
          issueDate: '2023',
          visible: true,
          order: 1,
        },
      ]);
      console.log('  Certificates seeded');
    }

    if ((await Translation.countDocuments()) === 0) {
      const defaultTranslations = [
        { key: 'nav.home', language: 'en', value: 'Home', namespace: 'nav' },
        { key: 'nav.home', language: 'am', value: 'መነሻ', namespace: 'nav' },
        { key: 'nav.projects', language: 'en', value: 'Projects', namespace: 'nav' },
        { key: 'nav.projects', language: 'am', value: 'ፕሮጀክቶች', namespace: 'nav' },
        { key: 'nav.skills', language: 'en', value: 'Skills', namespace: 'nav' },
        { key: 'nav.skills', language: 'am', value: 'ክህሎቶች', namespace: 'nav' },
        { key: 'nav.blog', language: 'en', value: 'Blog', namespace: 'nav' },
        { key: 'nav.blog', language: 'am', value: 'ብሎግ', namespace: 'nav' },
        { key: 'nav.contact', language: 'en', value: 'Contact', namespace: 'nav' },
        { key: 'nav.contact', language: 'am', value: 'ግንኙነት', namespace: 'nav' },
        { key: 'hero.subtitle', language: 'en', value: 'Full Stack Developer', namespace: 'hero' },
        { key: 'hero.subtitle', language: 'am', value: 'ሙሉ የቴክኖሎጂ ዲቪሎፐር', namespace: 'hero' },
        { key: 'hero.cta', language: 'en', value: 'Get In Touch', namespace: 'hero' },
        { key: 'hero.cta', language: 'am', value: 'አግኙኝ', namespace: 'hero' },
        { key: 'about.title', language: 'en', value: 'About Me', namespace: 'about' },
        { key: 'about.title', language: 'am', value: 'ስለ እኔ', namespace: 'about' },
        { key: 'skills.title', language: 'en', value: 'Skills & Technologies', namespace: 'skills' },
        { key: 'skills.title', language: 'am', value: 'ክህሎቶች እና ቴክኖሎጂዎች', namespace: 'skills' },
        { key: 'projects.title', language: 'en', value: 'Projects', namespace: 'projects' },
        { key: 'projects.title', language: 'am', value: 'ፕሮጀክቶች', namespace: 'projects' },
        { key: 'blog.title', language: 'en', value: 'Latest Blog Posts', namespace: 'blog' },
        { key: 'blog.title', language: 'am', value: 'የቅርብ ጊዜ ብሎግ ልጥፎች', namespace: 'blog' },
        { key: 'contact.title', language: 'en', value: 'Get In Touch', namespace: 'contact' },
        { key: 'contact.title', language: 'am', value: 'አግኙኝ', namespace: 'contact' },
        { key: 'footer.copyright', language: 'en', value: 'All rights reserved.', namespace: 'footer' },
        { key: 'footer.copyright', language: 'am', value: 'መብቱ በህግ የተጠበቀ ነው።', namespace: 'footer' },
      ];
      await Translation.insertMany(defaultTranslations);
      console.log('  Translations seeded');
    }

    if ((await Theme.countDocuments()) === 0) {
      await Theme.create({
        primaryColor: '#3B82F6',
        secondaryColor: '#6366F1',
        accentColor: '#10B981',
        backgroundColor: '#FFFFFF',
        cardColor: '#F8FAFC',
        textColor: '#1E293B',
        borderColor: '#E2E8F0',
        fontFamily: 'Inter',
        headingFont: 'Inter',
        buttonStyle: 'rounded',
        cardStyle: 'shadow',
        headerStyle: 'sticky',
        footerStyle: 'dark',
        borderRadius: '8',
        shadowIntensity: '4',
      });
      console.log('  Theme seeded');
    }

    console.log('Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
