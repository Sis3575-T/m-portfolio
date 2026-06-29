export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
  avatar: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  images: string[];
  technologies: string[];
  githubUrl: string;
  liveUrl: string;
  featured: boolean;
  category: string;
  order: number;
  isActive: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  _id: string;
  name: string;
  category: string;
  icon: string;
  proficiency: number;
  order: number;
  isActive: boolean;
}

export interface Experience {
  _id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  responsibilities: string[];
  achievements: string[];
  isActive: boolean;
  order: number;
}

export interface Education {
  _id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
  description: string;
  achievements: string[];
  isActive: boolean;
  order: number;
}

export interface Certificate {
  _id: string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  credentialUrl: string;
  image: string;
  visible: boolean;
  order: number;
  createdAt: string;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  category: string;
  tags: string[];
  featured: boolean;
  isActive: boolean;
  publishedAt: string;
  createdAt: string;
  scheduledAt: string;
  metaTitle: string;
  metaDescription: string;
}

export interface Message {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  isReplied: boolean;
  repliedAt: string;
  replyContent: string;
  createdAt: string;
}

export interface Media {
  _id: string;
  name: string;
  originalName: string;
  url: string;
  publicId: string;
  mimeType: string;
  size: number;
  category: string;
  folder: string;
  uploadedBy: { _id: string; name: string };
  createdAt: string;
}

export interface Setting {
  _id: string;
  siteTitle: string;
  siteDescription: string;
  seoTitle: string;
  seoDescription: string;
  logo: string;
  favicon: string;
  footerText: string;
  copyrightText: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  nationality: string;
  dateOfBirth: string;
  professionalTitle: string;
  shortBio: string;
  longBio: string;
  currentCompany: string;
  currentPosition: string;
  yearsOfExperience: string;
  freelanceAvailable: boolean;
  languages: string;
  profilePhoto: string;
  coverPhoto: string;
  github: string;
  linkedin: string;
  twitter: string;
  telegram: string;
  facebook: string;
  instagram: string;
  youtube: string;
  medium: string;
  stackoverflow: string;
  leetcode: string;
  maintenanceMode: boolean;
}

export interface Hero {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  avatar: string;
  socialLinks: { platform: string; url: string }[];
  buttons: { label: string; url: string; variant: string }[];
  isActive: boolean;
}

export interface About {
  _id: string;
  content: string;
  summary: string;
  image: string;
  skills: string[];
  isActive: boolean;
}

export interface Service {
  _id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  price: string;
  isActive: boolean;
  order: number;
}

export interface Testimonial {
  _id: string;
  name: string;
  position: string;
  company: string;
  content: string;
  avatar: string;
  rating: number;
  isActive: boolean;
  order: number;
}

export interface PortfolioPage {
  _id: string;
  title: string;
  slug: string;
  description: string;
  isPublished: boolean;
  isHome: boolean;
  order: number;
  components: PageComponent[];
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageComponent {
  _id: string;
  type: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  content: Record<string, unknown>;
  styles: ComponentStyles;
  advanced: ComponentAdvanced;
  isVisible: boolean;
  order: number;
}

export interface ComponentStyles {
  backgroundColor: string;
  textColor: string;
  headingColor: string;
  borderColor: string;
  borderRadius: string;
  shadow: string;
  width: string;
  height: string;
  padding: string;
  margin: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  alignment: string;
}

export interface ComponentAdvanced {
  customCSS: string;
  customClasses: string;
  animationType: string;
  animationDuration: string;
  hoverEffects: string;
}

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  cardColor: string;
  textColor: string;
  fontFamily: string;
  headingFont: string;
  buttonStyle: 'rounded' | 'flat' | 'pill';
  cardStyle: 'bordered' | 'shadow' | 'flat';
  headerStyle: 'fixed' | 'static' | 'sticky';
  footerStyle: 'dark' | 'light' | 'accent';
  borderRadius?: string;
  shadowIntensity?: string;
  borderColor?: string;
}

export interface Backup {
  _id: string;
  name: string;
  size: string;
  type: 'manual' | 'automatic';
  status: 'completed' | 'failed' | 'in_progress';
  data: Record<string, unknown>;
  createdAt: string;
}

export interface DashboardStats {
  messages: { total: number; unread: number };
  projects: { total: number; active: number };
  blogs: { total: number; published: number };
  media: { total: number };
  downloads: number;
  skills: number;
  certificates: number;
  experiences: number;
  education: number;
  services: number;
  testimonials: number;
  totalViews: number;
  uniqueVisitors: number;
  contactRequests: number;
  resumeDownloads: number;
  projectViews: number;
}

export interface VisitorData {
  month: string;
  count: number;
  unique: number;
  pageViews: number;
}

export interface VisitorLocation {
  country: string;
  count: number;
  percentage: number;
}

export interface DeviceStat {
  name: string;
  value: number;
  percentage: number;
}

export interface BrowserStat {
  name: string;
  value: number;
  percentage: number;
}

export interface ActivityLog {
  _id: string;
  action: string;
  resource: string;
  resourceId: string;
  description: string;
  user: { _id: string; name: string };
  createdAt: string;
}

export interface AnalyticsOverview {
  visitors: VisitorData[];
  locations: VisitorLocation[];
  devices: DeviceStat[];
  browsers: BrowserStat[];
  topPages: { path: string; views: number }[];
  referralSources: { source: string; count: number }[];
  recentVisitors: {
    ip: string;
    country: string;
    city: string;
    device: string;
    browser: string;
    os: string;
    page: string;
    duration: number;
    referrer: string;
    visitedAt: string;
  }[];
}

export interface Notification {
  _id: string;
  type: 'new_visitor' | 'new_message' | 'cv_download' | 'blog_comment' | 'project_inquiry' | 'system';
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  relatedTo: { model: string; id: string };
  createdAt: string;
  updatedAt: string;
}

export interface VersionHistory {
  _id: string;
  resource: string;
  resourceId: string;
  version: number;
  data: Record<string, unknown>;
  changes: string;
  createdBy: { _id: string; name: string };
  createdAt: string;
}

export interface Translation {
  _id: string;
  key: string;
  language: string;
  value: string;
  namespace: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRecord {
  _id: string;
  user: { _id: string; name: string } | null;
  email: string;
  ip: string;
  userAgent: string;
  status: 'success' | 'failed';
  failReason: string;
  timestamp: string;
  createdAt: string;
}

export interface PerformanceMetric {
  _id: string;
  page: string;
  loadTime: number;
  lcp: number;
  fcp: number;
  cls: number;
  ttfb: number;
  domInteractive: number;
  imageSizes: number;
  device: string;
  browser: string;
  country: string;
  timestamp: string;
}

export interface PerformanceSummary {
  avgLoadTime: number;
  avgLcp: number;
  avgFcp: number;
  avgCls: number;
  avgTtfb: number;
  avgDomInteractive: number;
  totalSamples: number;
  pageCount: number;
}

export interface AccessibilityIssue {
  _id: string;
  page: string;
  type: 'missing_alt' | 'poor_contrast' | 'heading_structure' | 'missing_label' | 'other';
  element: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  recommendation: string;
  isFixed: boolean;
  detectedAt: string;
  fixedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccessibilitySummary {
  total: number;
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  fixed: number;
  open: number;
  byType: { type: string; count: number }[];
  byImpact: { impact: string; count: number }[];
}
