(function() {
  var API = (window.__PORTFOLIO_API || '/api/analytics') + '/track';
  var SID = localStorage.getItem('pf_sid');
  if (!SID) { SID = 's_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10); localStorage.setItem('pf_sid', SID); }

  function detect(prop) {
    var ua = navigator.userAgent;
    if (prop === 'device') return /tablet|ipad|playbook|silk/i.test(ua) ? 'Tablet' : /mobile|iphone|ipod|android.*mobile|windows phone/i.test(ua) ? 'Mobile' : 'Desktop';
    if (prop === 'browser') return /edg/i.test(ua) ? 'Edge' : /chrome|crios/i.test(ua) ? 'Chrome' : /firefox|fxios/i.test(ua) ? 'Firefox' : /safari/i.test(ua) ? 'Safari' : /opr|opera/i.test(ua) ? 'Opera' : 'Other';
    if (prop === 'os') return /windows/i.test(ua) ? 'Windows' : /android/i.test(ua) ? 'Android' : /iphone|ipad|ipod/i.test(ua) ? 'iOS' : /macintosh|mac os/i.test(ua) ? 'macOS' : /linux/i.test(ua) ? 'Linux' : 'Other';
    return '';
  }

  function post(path, data) {
    try {
      var payload = JSON.stringify(data);
      var blob = new Blob([payload], { type: 'application/json' });
      if (navigator.sendBeacon) { navigator.sendBeacon(API + path, blob); return; }
      var x = new XMLHttpRequest();
      x.open('POST', API + path, true);
      x.setRequestHeader('Content-Type', 'application/json');
      x.send(payload);
    } catch(e) { console.error('Tracker error:', e); }
  }

  var pageData = {
    sessionId: SID,
    page: window.location.pathname,
    title: document.title,
    referrer: document.referrer || 'Direct',
    screenResolution: (screen.width || 0) + 'x' + (screen.height || 0),
    language: navigator.language || '',
    device: detect('device'),
    browser: detect('browser'),
    os: detect('os'),
  };

  post('/visit', pageData);

  window.__pt = {
    trackAction: function(type, target, label) { post('/action', { sessionId: SID, type: type, target: target || '', label: label || '' }); },
    trackVisit: function() { post('/visit', pageData); },
    getSessionId: function() { return SID; },
  };

  var orig = history.pushState;
  history.pushState = function() {
    orig.apply(history, arguments);
    setTimeout(function() {
      post('/visit', { sessionId: SID, page: location.pathname, title: document.title, referrer: '', screenResolution: (screen.width||0)+'x'+(screen.height||0), language: navigator.language||'', device: detect('device'), browser: detect('browser'), os: detect('os') });
    }, 300);
  };
  window.addEventListener('popstate', function() {
    setTimeout(function() {
      post('/visit', { sessionId: SID, page: location.pathname, title: document.title, referrer: '', screenResolution: (screen.width||0)+'x'+(screen.height||0), language: navigator.language||'', device: detect('device'), browser: detect('browser'), os: detect('os') });
    }, 300);
  });
})();
