import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { publicApi } from '../../utils/api';

const SESSION_KEY = 'portfolio_session_id';

function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function getDeviceInfo() {
  const ua = navigator.userAgent;
  let browser = 'Chrome';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';

  let os = 'Windows';
  if (ua.includes('Mac')) os = 'MacOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  let device = 'Desktop';
  if (/Mobi|Android|iPhone|iPad/i.test(ua)) device = 'Mobile';
  else if (/Tablet|iPad/i.test(ua)) device = 'Tablet';

  return { browser, os, device, screenResolution: `${screen.width}x${screen.height}`, language: navigator.language };
}

let debounceTimers = {};

function debounce(key, fn, delay = 500) {
  clearTimeout(debounceTimers[key]);
  debounceTimers[key] = setTimeout(fn, delay);
}

export default function AnalyticsTracker() {
  const location = useLocation();
  const startTime = useRef(Date.now());
  const trackedDepths = useRef(new Set());
  const sessionId = getSessionId();

  useEffect(() => {
    const deviceInfo = getDeviceInfo();
    const data = {
      sessionId,
      page: location.pathname,
      title: document.title,
      referrer: document.referrer || 'Direct',
      ...deviceInfo,
    };

    publicApi.trackVisit(data).catch(() => {});

    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
      const depths = [25, 50, 75, 100];
      depths.forEach(d => {
        if (scrollPercent >= d && !trackedDepths.current.has(d)) {
          trackedDepths.current.add(d);
          debounce(`scroll_${d}`, () => {
            publicApi.trackAction({ sessionId, type: 'scroll', target: `scroll_${d}%`, label: location.pathname }).catch(() => {});
          });
        }
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    if ('performance' in window && 'PerformanceObserver' in window) {
      const metrics = {};
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') metrics.lcp = entry.startTime;
            if (entry.entryType === 'first-contentful-paint') metrics.fcp = entry.startTime;
            if (entry.entryType === 'layout-shift') metrics.cls = (metrics.cls || 0) + entry.value;
          }
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
        observer.observe({ type: 'first-contentful-paint', buffered: true });
        observer.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {}

      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = {
            page: location.pathname,
            loadTime: performance.now(),
            lcp: metrics.lcp || 0,
            fcp: metrics.fcp || 0,
            cls: metrics.cls || 0,
            device: getDeviceInfo().device,
            browser: getDeviceInfo().browser,
          };
          publicApi.trackPerformance(perfData).catch(() => {});
        }, 3000);
      });
    }

    startTime.current = Date.now();
    trackedDepths.current = new Set();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      const duration = Math.floor((Date.now() - startTime.current) / 1000);
      publicApi.endSession({ sessionId, duration }).catch(() => {});
    };
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target.closest('a');
      if (target && (target.href.includes('cv.pdf') || target.href.includes('resume') || target.href.includes('download-cv'))) {
        publicApi.trackAction({ sessionId, type: 'download_cv', target: target.href, label: 'CV Download' }).catch(() => {});
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}
