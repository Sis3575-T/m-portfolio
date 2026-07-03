const ANALYTICS_API = import.meta.env.VITE_API_URL?.replace('/api/website', '') || 'https://portfolio-api.onrender.com';

function getVisitorId() {
  let id = localStorage.getItem('_vid');
  if (!id) {
    id = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('_vid', id);
  }
  return id;
}

function getSessionId() {
  let id = sessionStorage.getItem('_sid');
  if (!id) {
    id = 's_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('_sid', id);
  }
  return id;
}

async function track(event, data = {}) {
  try {
    await fetch(`${ANALYTICS_API}/api/track/${event}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId: getVisitorId(),
        sessionId: getSessionId(),
        url: window.location.href,
        pageTitle: document.title,
        referrer: document.referrer,
        screen: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...data,
      }),
    });
  } catch (e) {
    // Silently fail
  }
}

track('identify', {
  browser: navigator.userAgent,
});

track('page-view', {
  path: window.location.pathname,
});

document.addEventListener('click', (e) => {
  const target = e.target.closest('[data-track]');
  if (target) {
    track('event', {
      eventType: 'click',
      element: target.dataset.track,
      value: target.dataset.trackValue || target.textContent?.trim(),
    });
  }
});

let maxScroll = 0;
window.addEventListener('scroll', () => {
  const scrollPct = Math.round((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100);
  if (scrollPct > maxScroll) {
    maxScroll = scrollPct;
    if (maxScroll % 25 === 0) {
      track('event', { eventType: 'scroll_depth', value: String(maxScroll) });
    }
  }
}, { passive: true });

setInterval(() => {
  track('heartbeat', { maxScrollDepth: maxScroll });
}, 30000);

window.addEventListener('beforeunload', () => {
  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      `${ANALYTICS_API}/api/track/exit`,
      JSON.stringify({
        visitorId: getVisitorId(),
        sessionId: getSessionId(),
        maxScrollDepth: maxScroll,
        duration: Math.floor((Date.now() - performance.now()) / 1000),
      })
    );
  }
});
