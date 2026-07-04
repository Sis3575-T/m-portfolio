const Settings = require('../models/Settings');
const Hero = require('../models/Hero');
const About = require('../models/About');
const Skill = require('../models/Skill');
const Project = require('../models/Project');
const Experience = require('../models/Experience');
const Education = require('../models/Education');
const Service = require('../models/Service');
const Testimonial = require('../models/Testimonial');
const Section = require('../models/Section');

module.exports = async function seedContent() {
  // ── Settings ──────────────────────────────────────────────────────────────
  if ((await Settings.countDocuments()) === 0) {
    await Settings.create({
      name: 'Sisay Temesgen',
      siteTitle: 'Sisay Temesgen — Full Stack Developer',
      siteDescription: 'Full Stack Developer crafting robust web applications with modern technologies. Specializing in MERN stack, REST APIs, and cloud-native solutions.',
      footerText: 'Crafting digital experiences with clean code and modern architecture.',
      copyrightText: '© 2026 Sisay Temesgen. Built with React, Node.js & MongoDB.',
      email: 'sisay3575@gmail.com',
      phone: '+251 935 756 054',
      address: 'Bahir Dar, Ethiopia',
      city: 'Bahir Dar',
      country: 'Ethiopia',
      github: 'https://github.com/Sis3575-T',
      linkedin: '',
      twitter: '',
      telegram: '',
      freelanceAvailable: true,
      yearsOfExperience: '2+',
      professionalTitle: 'Full Stack Developer',
      shortBio: 'Full Stack Developer with expertise in the MERN stack. Passionate about building scalable web applications, RESTful APIs, and delivering clean, maintainable code.',
    });
    console.log('  Settings seeded');
  }

  // ── Hero ──────────────────────────────────────────────────────────────────
  if ((await Hero.countDocuments()) === 0) {
    await Hero.create({
      name: 'Sisay Temesgen',
      title: 'Full Stack Developer | MERN Specialist',
      introduction: 'Hi, I\'m',
      role: 'Full Stack Developer',
      location: 'Bahir Dar, Ethiopia',
      availability: { status: 'available', text: 'Available for freelance & collaboration' },
      buttons: [
        { label: 'View My Work', url: '#projects', type: 'primary' },
        { label: 'Download CV', url: '/resume.pdf', type: 'outline', file: '/resume.pdf' },
      ],
      socialLinks: [
        { platform: 'GitHub', url: 'https://github.com/Sis3575-T', icon: 'github' },
        { platform: 'Email', url: 'mailto:sisay3575@gmail.com', icon: 'mail' },
      ],
      status: 'published',
      isActive: true,
    });
    console.log('  Hero seeded');
  }

  // ── About ─────────────────────────────────────────────────────────────────
  if ((await About.countDocuments()) === 0) {
    await About.create({
      biography: `I'm a Full Stack Developer and Computer Science student at Bahir Dar University, passionate about building modern, accessible web applications that solve real-world problems. I specialize in the MERN stack and love exploring new technologies.`,
      careerJourney: `My development journey started with self-taught HTML and CSS, gradually expanding into JavaScript and modern frameworks. Through building real projects — from e-commerce platforms to admin dashboards — I've gained hands-on experience with the full software development lifecycle: requirements analysis, system design, implementation, testing, and deployment.

I'm currently pursuing a degree in Computer Science at Bahir Dar University, where I complement academic learning with practical project experience.`,
      keyAchievements: [
        'Built a full-stack portfolio CMS with admin panel, theme system, and dynamic section builder',
        'Developed RESTful APIs with authentication, file upload, rate limiting, and role-based access',
        'Designed responsive UIs that work seamlessly across desktop, tablet, and mobile devices',
        'Implemented real-time data visualization dashboards with interactive charts and analytics',
      ],
      stats: [
        { label: 'Years of Experience', value: '2', suffix: '+' },
        { label: 'Projects Completed', value: '15', suffix: '+' },
        { label: 'Technologies Used', value: '20', suffix: '+' },
        { label: 'Commits This Year', value: '500', suffix: '+' },
      ],
      status: 'published',
      isActive: true,
    });
    console.log('  About seeded');
  }

  // ── Skills ────────────────────────────────────────────────────────────────
  if ((await Skill.countDocuments()) === 0) {
    const skills = [
      { name: 'JavaScript', category: 'Frontend', proficiency: 88, order: 1 },
      { name: 'TypeScript', category: 'Frontend', proficiency: 70, order: 2 },
      { name: 'React', category: 'Frontend', proficiency: 85, order: 3 },
      { name: 'Next.js', category: 'Frontend', proficiency: 65, order: 4 },
      { name: 'HTML5', category: 'Frontend', proficiency: 92, order: 5 },
      { name: 'CSS3', category: 'Frontend', proficiency: 90, order: 6 },
      { name: 'Tailwind CSS', category: 'Frontend', proficiency: 82, order: 7 },
      { name: 'Bootstrap', category: 'Frontend', proficiency: 78, order: 8 },
      { name: 'Framer Motion', category: 'Frontend', proficiency: 72, order: 9 },

      { name: 'Node.js', category: 'Backend', proficiency: 85, order: 10 },
      { name: 'Express.js', category: 'Backend', proficiency: 83, order: 11 },
      { name: 'REST API', category: 'Backend', proficiency: 88, order: 12 },
      { name: 'JWT Authentication', category: 'Backend', proficiency: 80, order: 13 },
      { name: 'Socket.io', category: 'Backend', proficiency: 60, order: 14 },
      { name: 'Python', category: 'Backend', proficiency: 55, order: 15 },

      { name: 'MongoDB', category: 'Database', proficiency: 82, order: 16 },
      { name: 'Mongoose', category: 'Database', proficiency: 80, order: 17 },
      { name: 'MySQL', category: 'Database', proficiency: 60, order: 18 },
      { name: 'Redis', category: 'Database', proficiency: 50, order: 19 },

      { name: 'Git', category: 'DevOps', proficiency: 85, order: 20 },
      { name: 'GitHub', category: 'DevOps', proficiency: 85, order: 21 },
      { name: 'Vercel', category: 'DevOps', proficiency: 78, order: 22 },
      { name: 'Render', category: 'DevOps', proficiency: 75, order: 23 },
      { name: 'Docker', category: 'DevOps', proficiency: 45, order: 24 },

      { name: 'VS Code', category: 'Tools', proficiency: 92, order: 25 },
      { name: 'Postman', category: 'Tools', proficiency: 80, order: 26 },
      { name: 'Figma', category: 'Tools', proficiency: 65, order: 27 },
      { name: 'npm/pnpm', category: 'Tools', proficiency: 85, order: 28 },
      { name: 'Webpack/Vite', category: 'Tools', proficiency: 72, order: 29 },
      { name: 'ESLint/Prettier', category: 'Tools', proficiency: 78, order: 30 },
    ];
    await Skill.insertMany(skills.map(s => ({ ...s, status: 'published', isActive: true })));
    console.log(`  ${skills.length} skills seeded`);
  }

  // ── Projects ──────────────────────────────────────────────────────────────
  if ((await Project.countDocuments()) === 0) {
    const projects = [
      {
        title: 'Portfolio CMS',
        description: 'A full-featured Content Management System for portfolio websites. Built with React, Node.js, MongoDB, and Express. Features include a dynamic page builder, component library, theme system, media library, analytics dashboard, and a fully responsive frontend. The entire portfolio can be managed through an intuitive admin panel without touching any code.',
        thumbnail: '',
        images: [],
        technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Mongoose', 'JWT', 'REST API', 'Tailwind CSS'],
        githubUrl: 'https://github.com/Sis3575-T',
        liveUrl: '',
        featured: true,
        category: 'Web Application',
        order: 1,
        status: 'published',
        isActive: true,
      },
      {
        title: 'E-Commerce Platform',
        description: 'A full-stack e-commerce platform with user authentication, product management, shopping cart, order processing, and payment integration. Features include admin dashboard, inventory management, and real-time order tracking.',
        thumbnail: '',
        images: [],
        technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Redux', 'Stripe API', 'JWT'],
        githubUrl: 'https://github.com/Sis3575-T',
        liveUrl: '',
        featured: true,
        category: 'Web Application',
        order: 2,
        status: 'published',
        isActive: true,
      },
      {
        title: 'Admin Dashboard',
        description: 'A comprehensive admin dashboard with data visualization, user management, analytics, and real-time monitoring. Built with React, Chart.js, and a Node.js backend with RESTful API architecture.',
        thumbnail: '',
        images: [],
        technologies: ['React', 'Chart.js', 'Node.js', 'Express', 'MongoDB', 'Socket.io', 'SCSS'],
        githubUrl: 'https://github.com/Sis3575-T',
        liveUrl: '',
        featured: false,
        category: 'Dashboard',
        order: 3,
        status: 'published',
        isActive: true,
      },
    ];
    await Project.insertMany(projects);
    console.log(`  ${projects.length} projects seeded`);
  }

  // ── Experience ────────────────────────────────────────────────────────────
  if ((await Experience.countDocuments()) === 0) {
    await Experience.create({
      company: 'Freelance / Self-Employed',
      position: 'Full Stack Developer',
      startDate: new Date('2024-01-01'),
      current: true,
      description: 'Developing full-stack web applications for clients using the MERN stack. Managing projects from requirements gathering through deployment and maintenance.',
      responsibilities: [
        'Design and implement RESTful APIs with authentication and authorization',
        'Build responsive React frontends with modern UI/UX practices',
        'Architect MongoDB schemas and optimize database queries',
        'Deploy and maintain applications on Vercel and Render',
        'Collaborate with clients to translate requirements into technical solutions',
      ],
      achievements: [
        'Delivered 15+ projects on time and within scope',
        'Built a reusable component library now used across multiple projects',
      ],
      location: 'Remote',
      order: 1,
      status: 'published',
      isActive: true,
    });
    console.log('  Experience seeded');
  }

  // ── Education ─────────────────────────────────────────────────────────────
  if ((await Education.countDocuments()) === 0) {
    await Education.create({
      institution: 'Bahir Dar University',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: new Date('2022-09-01'),
      description: 'Pursuing a comprehensive Computer Science education covering algorithms, data structures, software engineering, database systems, and web technologies. Complementing academic learning with hands-on project development.',
      achievements: [
        'Active participant in coding competitions and hackathons',
        'Built multiple full-stack projects as part of coursework',
        'Focus areas: Web Development, Database Systems, Software Engineering',
      ],
      gpa: '',
      order: 1,
      status: 'published',
      isActive: true,
    });
    console.log('  Education seeded');
  }

  // ── Services ──────────────────────────────────────────────────────────────
  if ((await Service.countDocuments()) === 0) {
    const services = [
      {
        title: 'Full Stack Web Development',
        description: 'End-to-end web application development using the MERN stack. From concept to deployment, I build scalable, performant applications with clean architecture and modern best practices.',
        icon: 'code',
        features: [
          'Custom web application development from scratch',
          'RESTful API design and implementation',
          'Responsive, mobile-first frontend development',
          'Database design and optimization with MongoDB',
          'Authentication & authorization systems',
          'Deployment and CI/CD setup',
        ],
        order: 1,
      },
      {
        title: 'Frontend Development',
        description: 'Modern, responsive user interfaces built with React and related technologies. I focus on creating intuitive, accessible, and performant frontends that deliver exceptional user experiences.',
        icon: 'monitor',
        features: [
          'React / Next.js application development',
          'Responsive and mobile-first design',
          'State management with React Context / Redux',
          'Component library development',
          'Animation and transition implementation',
          'Performance optimization and SEO',
        ],
        order: 2,
      },
      {
        title: 'Backend Development',
        description: 'Robust server-side applications and APIs built with Node.js and Express. I design scalable architectures with secure authentication, efficient database operations, and comprehensive error handling.',
        icon: 'server',
        features: [
          'Node.js / Express REST API development',
          'MongoDB schema design and optimization',
          'JWT-based authentication & authorization',
          'File upload and media management',
          'API security (rate limiting, CORS, helmet)',
          'Database indexing and query optimization',
        ],
        order: 3,
      },
      {
        title: 'Admin Dashboard Development',
        description: 'Feature-rich admin panels with data visualization, user management, analytics, and content management capabilities. Built to provide complete control over your application.',
        icon: 'settings',
        features: [
          'Custom admin panel development',
          'Data visualization with charts and graphs',
          'User and role management interfaces',
          'Content management systems',
          'Real-time analytics dashboards',
          'Export and reporting features',
        ],
        order: 4,
      },
      {
        title: 'API Development & Integration',
        description: 'Design and implementation of RESTful APIs with comprehensive documentation, testing, and third-party service integration.',
        icon: 'globe',
        features: [
          'RESTful API design and documentation',
          'Third-party API integration',
          'Payment gateway integration',
          'Email service integration',
          'Cloud storage integration',
          'Webhook implementation',
        ],
        order: 5,
      },
      {
        title: 'Website Optimization',
        description: 'Performance auditing and optimization for web applications. Improving load times, Core Web Vitals, accessibility, and overall user experience.',
        icon: 'trending-up',
        features: [
          'Performance audit and analysis',
          'Core Web Vitals optimization',
          'Code splitting and lazy loading',
          'Image optimization and CDN setup',
          'Database query optimization',
          'Accessibility compliance (WCAG)',
        ],
        order: 6,
      },
    ];
    await Service.insertMany(services.map(s => ({ ...s, status: 'published', isActive: true })));
    console.log(`  ${services.length} services seeded`);
  }

  // ── Sections (metadata for admin ordering) ────────────────────────────────
  if ((await Section.countDocuments()) === 0) {
    const sections = [
      { type: 'hero', order: 1, name: 'Hero', status: 'published', visible: true, content: { title: 'Hero', subtitle: '' } },
      { type: 'about', order: 2, name: 'About', status: 'published', visible: true, content: { title: 'About Me', subtitle: 'Discover my story, skills, and passion for development' } },
      { type: 'skills', order: 3, name: 'Skills', status: 'published', visible: true, content: { title: 'Skills & Expertise', subtitle: 'Technologies and tools I work with' } },
      { type: 'experience', order: 4, name: 'Experience', status: 'published', visible: true, content: { title: 'Professional Experience', subtitle: 'My journey in software development' } },
      { type: 'education', order: 5, name: 'Education', status: 'published', visible: true, content: { title: 'Education', subtitle: 'Academic background and qualifications' } },
      { type: 'projects', order: 6, name: 'Projects', status: 'published', visible: true, content: { title: 'Featured Projects', subtitle: 'Projects I have built and contributed to' } },
      { type: 'services', order: 7, name: 'Services', status: 'published', visible: true, content: { title: 'What I Do', subtitle: 'Professional services I offer' } },
      { type: 'testimonials', order: 8, name: 'Testimonials', status: 'published', visible: true, content: { title: 'Testimonials', subtitle: 'What people say about working with me' } },
      { type: 'blog', order: 9, name: 'Blog', status: 'published', visible: true, content: { title: 'Latest Articles', subtitle: 'Thoughts, tutorials, and insights' } },
      { type: 'certificates', order: 10, name: 'Certificates', status: 'published', visible: true, content: { title: 'Certifications', subtitle: 'Professional certifications and credentials' } },
      { type: 'contact', order: 11, name: 'Contact', status: 'published', visible: true, content: { title: 'Get In Touch', subtitle: 'Have a project in mind? Let\'s work together' } },
    ];
    await Section.insertMany(sections);
    console.log(`  ${sections.length} sections seeded`);
  }

  console.log('Content seeding complete');
};
