const router = require('express').Router();
const crypto = require('crypto');
const https = require('https');
const VisitorSession = require('../models/VisitorSession');
const VisitorEvent = require('../models/VisitorEvent');
const Notification = require('../models/Notification');

function hashIp(ip) {
  if (!ip) return '';
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

function isInternalIp(ip) {
  if (!ip) return true;
  return ip === '127.0.0.1' || ip === '::1' || ip === 'localhost' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.16.');
}

function geoLookup(ip) {
  return new Promise((resolve) => {
    if (!ip || isInternalIp(ip)) return resolve({});
    const url = `http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query,currency`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const geo = JSON.parse(data);
          if (geo.status === 'success') {
            return resolve({
              country: geo.country || '',
              countryCode: geo.countryCode || '',
              region: geo.regionName || geo.region || '',
              city: geo.city || '',
              postalCode: geo.zip || '',
              latitude: geo.lat || null,
              longitude: geo.lon || null,
              timezone: geo.timezone || '',
              currency: geo.currency || '',
              isp: geo.isp || geo.org || '',
            });
          }
        } catch {}
        resolve({});
      });
    }).on('error', () => resolve({}));
  });
}

const TZ_COUNTRY = {
  'Africa/Addis_Ababa': 'Ethiopia', 'Africa/Nairobi': 'Kenya', 'Africa/Cairo': 'Egypt',
  'Africa/Lagos': 'Nigeria', 'Africa/Johannesburg': 'South Africa', 'Africa/Casablanca': 'Morocco',
  'America/New_York': 'United States', 'America/Chicago': 'United States', 'America/Denver': 'United States',
  'America/Los_Angeles': 'United States', 'America/Toronto': 'Canada', 'America/Vancouver': 'Canada',
  'America/Sao_Paulo': 'Brazil', 'America/Buenos_Aires': 'Argentina', 'America/Mexico_City': 'Mexico',
  'America/Bogota': 'Colombia', 'America/Santiago': 'Chile', 'America/Lima': 'Peru',
  'Europe/London': 'United Kingdom', 'Europe/Paris': 'France', 'Europe/Berlin': 'Germany',
  'Europe/Madrid': 'Spain', 'Europe/Rome': 'Italy', 'Europe/Amsterdam': 'Netherlands',
  'Europe/Stockholm': 'Sweden', 'Europe/Oslo': 'Norway', 'Europe/Copenhagen': 'Denmark',
  'Europe/Helsinki': 'Finland', 'Europe/Moscow': 'Russia', 'Europe/Istanbul': 'Turkey',
  'Asia/Dubai': 'United Arab Emirates', 'Asia/Riyadh': 'Saudi Arabia', 'Asia/Tehran': 'Iran',
  'Asia/Kolkata': 'India', 'Asia/Shanghai': 'China', 'Asia/Tokyo': 'Japan', 'Asia/Seoul': 'South Korea',
  'Asia/Singapore': 'Singapore', 'Asia/Hong_Kong': 'Hong Kong', 'Asia/Bangkok': 'Thailand',
  'Asia/Jakarta': 'Indonesia', 'Asia/Manila': 'Philippines', 'Asia/Karachi': 'Pakistan',
  'Asia/Dhaka': 'Bangladesh', 'Asia/Ho_Chi_Minh': 'Vietnam', 'Asia/Taipei': 'Taiwan',
  'Asia/Kuala_Lumpur': 'Malaysia', 'Australia/Sydney': 'Australia', 'Australia/Melbourne': 'Australia',
  'Pacific/Auckland': 'New Zealand', 'Pacific/Honolulu': 'United States',
};

function tzToCountry(timezone) {
  if (!timezone) return '';
  if (TZ_COUNTRY[timezone]) return TZ_COUNTRY[timezone];
  const parts = timezone.split('/');
  if (parts.length > 1) return parts[1].replace(/_/g, ' ');
  return '';
}

function parseUA(ua) {
  const result = { browser: 'Unknown', browserVersion: '', os: 'Unknown', deviceType: 'unknown' };
  if (!ua) return result;
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
    result.browser = 'Chrome';
    const m = ua.match(/Chrome\/([\d.]+)/);
    if (m) result.browserVersion = m[1];
  } else if (ua.includes('Firefox/')) {
    result.browser = 'Firefox';
    const m = ua.match(/Firefox\/([\d.]+)/);
    if (m) result.browserVersion = m[1];
  } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
    result.browser = 'Safari';
    const m = ua.match(/Version\/([\d.]+)/);
    if (m) result.browserVersion = m[1];
  } else if (ua.includes('Edg/')) {
    result.browser = 'Edge';
    const m = ua.match(/Edg\/([\d.]+)/);
    if (m) result.browserVersion = m[1];
  }
  if (ua.includes('Windows')) result.os = 'Windows';
  else if (ua.includes('Mac OS')) result.os = 'macOS';
  else if (ua.includes('Linux') && !ua.includes('Android')) result.os = 'Linux';
  else if (ua.includes('Android')) result.os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) result.os = 'iOS';
  if (ua.includes('iPad') || ua.includes('Tablet') || (ua.includes('Android') && !ua.includes('Mobile'))) result.deviceType = 'tablet';
  else if (ua.includes('Mobile') || ua.includes('iPhone') || ua.includes('Android')) result.deviceType = 'mobile';
  else result.deviceType = 'desktop';
  return result;
}

router.post('/identify', async (req, res) => {
  try {
    const { visitorId, sessionId, browser, screen, viewport, language, timezone, referrer } = req.body;
    if (!visitorId || !sessionId) return res.status(400).json({ success: false, message: 'visitorId and sessionId required' });

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || '';
    const ua = parseUA(browser || req.headers['user-agent'] || '');
    const geo = await geoLookup(ip).catch(() => ({}));
    let session = await VisitorSession.findOne({ sessionId });

    if (!session) {
      const existing = await VisitorSession.findOne({ visitorId }).sort({ createdAt: -1 }).lean();
      session = new VisitorSession({
        visitorId, sessionId,
        ipHash: hashIp(ip),
        browser: ua.browser,
        browserVersion: ua.browserVersion,
        os: ua.os,
        deviceType: ua.deviceType,
        screenResolution: screen || '',
        viewportSize: viewport || '',
        language: language || '',
        timezone: timezone || '',
        referrer: referrer || '',
        referrerDomain: referrer ? new URL(referrer).hostname : '',
        isReturning: !!existing,
        landingPage: req.body.url || '/',
        country: geo.country || tzToCountry(timezone) || '',
        countryCode: geo.countryCode || '',
        region: geo.region || '',
        city: geo.city || '',
        postalCode: geo.postalCode || '',
        latitude: geo.latitude || null,
        longitude: geo.longitude || null,
        currency: geo.currency || '',
        isp: geo.isp || '',
        timezone: geo.timezone || timezone || '',
      });
      if (!existing) {
        const notifCountry = geo.country || req.body.country || 'Unknown location';
        await Notification.create({
          type: 'info',
          title: 'New Visitor',
          message: `A new visitor from ${notifCountry} landed on ${session.landingPage || '/'}`,
          link: '/admin/analytics',
          metadata: { visitorId, sessionId: session.sessionId, country: notifCountry },
        }).catch(() => {});
      }
    } else {
      session.ipHash = hashIp(ip);
      if (ua.browser !== 'Unknown') session.browser = ua.browser;
      if (ua.browserVersion) session.browserVersion = ua.browserVersion;
      if (ua.os !== 'Unknown') session.os = ua.os;
      session.deviceType = ua.deviceType;
      if (screen) session.screenResolution = screen;
      if (viewport) session.viewportSize = viewport;
      if (language) session.language = language;
      if (timezone) session.timezone = timezone;
      if (geo.country && !session.country) session.country = geo.country;
      if (geo.countryCode && !session.countryCode) session.countryCode = geo.countryCode;
      if (geo.region && !session.region) session.region = geo.region;
      if (geo.city && !session.city) session.city = geo.city;
    }

    session.lastActiveAt = new Date();
    session.isActive = true;
    await session.save();

    res.json({ success: true, data: { sessionId: session.sessionId } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/page-view', async (req, res) => {
  try {
    const { visitorId, sessionId, url, pageTitle, path } = req.body;
    if (!visitorId || !sessionId) return res.status(400).json({ success: false, message: 'visitorId and sessionId required' });

    const pageUrl = url || path || '/';
    await VisitorEvent.create({
      sessionId, visitorId,
      eventType: 'page_view',
      url: pageUrl,
      pageTitle: pageTitle || '',
      timestamp: new Date(),
    });

    const session = await VisitorSession.findOne({ sessionId });
    if (session) {
      const now = new Date();
      if (session.pages.length > 0) {
        const last = session.pages[session.pages.length - 1];
        if (!last.leftAt) {
          last.leftAt = now;
          last.duration = Math.round((now - new Date(last.enteredAt)) / 1000);
        }
      }
      session.pages.push({ url: pageUrl, title: pageTitle || '', enteredAt: now });
      session.pageViews = session.pages.length;
      if (!session.landingPage) session.landingPage = pageUrl;
      session.exitPage = pageUrl;
      session.lastActiveAt = now;
      await session.save();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/event', async (req, res) => {
  try {
    const { visitorId, sessionId, eventType, url, pageTitle, element, value, metadata } = req.body;
    if (!visitorId || !sessionId || !eventType) return res.status(400).json({ success: false, message: 'visitorId, sessionId, and eventType required' });

    await VisitorEvent.create({
      sessionId, visitorId, eventType,
      url: url || '',
      pageTitle: pageTitle || '',
      element: element || '',
      value: value || '',
      metadata: metadata || {},
      timestamp: new Date(),
    });

    const session = await VisitorSession.findOne({ sessionId });
    if (session) {
      session.clicks = (session.clicks || 0) + 1;
      if (eventType === 'project_click') session.projectClicks = (session.projectClicks || 0) + 1;
      if (eventType === 'github_click') session.githubClicks = (session.githubClicks || 0) + 1;
      if (eventType === 'live_demo_click') session.liveDemoClicks = (session.liveDemoClicks || 0) + 1;
      if (eventType === 'resume_download') session.resumeDownloads = (session.resumeDownloads || 0) + 1;
      if (eventType === 'contact_submit') session.contactSubmissions = (session.contactSubmissions || 0) + 1;
      session.lastActiveAt = new Date();
      await session.save();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/heartbeat', async (req, res) => {
  try {
    const { visitorId, sessionId, maxScrollDepth } = req.body;
    if (!visitorId || !sessionId) return res.status(400).json({ success: false, message: 'visitorId and sessionId required' });

    const session = await VisitorSession.findOne({ sessionId });
    if (session) {
      session.lastActiveAt = new Date();
      session.isActive = true;
      if (typeof maxScrollDepth === 'number' && maxScrollDepth > (session.maxScrollDepth || 0)) {
        session.maxScrollDepth = maxScrollDepth;
      }
      await session.save();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/exit', async (req, res) => {
  try {
    const { visitorId, sessionId, maxScrollDepth, duration } = req.body;
    if (!visitorId || !sessionId) return res.status(400).json({ success: false, message: 'visitorId and sessionId required' });

    const session = await VisitorSession.findOne({ sessionId });
    if (session) {
      const now = new Date();
      session.endedAt = now;
      session.isActive = false;
      session.lastActiveAt = now;
      if (typeof maxScrollDepth === 'number' && maxScrollDepth > (session.maxScrollDepth || 0)) {
        session.maxScrollDepth = maxScrollDepth;
      }
      const start = session.startedAt || now;
      session.duration = duration || Math.round((now - start) / 1000);

      if (session.pages.length > 0) {
        const last = session.pages[session.pages.length - 1];
        if (!last.leftAt) {
          last.leftAt = now;
          last.duration = Math.round((now - new Date(last.enteredAt)) / 1000);
        }
      }

      await session.save();

      await VisitorEvent.create({
        sessionId, visitorId,
        eventType: 'page_exit',
        url: session.exitPage || '/',
        value: `duration: ${session.duration}s, scrollDepth: ${session.maxScrollDepth}%`,
        timestamp: now,
      });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/analytics/visit — lightweight visit tracking (auto-fired on page load)
router.post('/visit', async (req, res) => {
  try {
    const { visitorId, sessionId, url, referrer, browser, os, deviceType, screenResolution, language, timezone } = req.body;
    if (!visitorId || !sessionId) return res.status(400).json({ success: false, message: 'visitorId and sessionId required' });

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.connection?.remoteAddress || '';
    const ipHash = hashIp(ip);
    const geo = await geoLookup(ip).catch(() => ({}));

    let session = await VisitorSession.findOne({ sessionId });
    const now = new Date();

    if (!session) {
      let existing = null;
      if (visitorId) existing = await VisitorSession.findOne({ visitorId }).sort({ createdAt: -1 });

      const browserInfo = browser || '';
      const osInfo = os || '';
      const dType = deviceType || 'unknown';

      session = await VisitorSession.create({
        visitorId,
        sessionId,
        ipHash,
        browser: browserInfo,
        os: osInfo,
        deviceType: dType,
        screenResolution: screenResolution || '',
        language: language || '',
        timezone: geo.timezone || timezone || '',
        country: geo.country || '',
        countryCode: geo.countryCode || '',
        region: geo.region || '',
        city: geo.city || '',
        postalCode: geo.postalCode || '',
        latitude: geo.latitude || null,
        longitude: geo.longitude || null,
        currency: geo.currency || '',
        isp: geo.isp || '',
        referrer: referrer || '',
        landingPage: url || '/',
        startedAt: now,
        lastActiveAt: now,
        pageViews: 1,
        isReturning: !!existing,
        visitCount: existing ? (existing.visitCount || 0) + 1 : 1,
      });

      if (!existing) {
        await Notification.create({
          type: 'info',
          title: 'New Visitor',
          message: `A new visitor from ${geo.country || 'Unknown location'} landed on ${url || '/'}`,
          link: '/admin/analytics',
          metadata: { visitorId, sessionId },
        }).catch(() => {});
      }
    } else {
      session.pageViews = (session.pageViews || 0) + 1;
      session.lastActiveAt = now;
      if (!session.country && geo.country) session.country = geo.country;
      if (!session.city && geo.city) session.city = geo.city;
      if (!session.countryCode && geo.countryCode) session.countryCode = geo.countryCode;
      if (!session.region && geo.region) session.region = geo.region;
      await session.save();
    }

    res.json({ success: true, isReturning: session.isReturning, visitCount: session.visitCount || 1, country: session.country || '' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
