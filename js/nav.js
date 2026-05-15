/**
 * nav.js Shared navigation renderer
 * Injects the site nav into any page that includes this script
 * with a <div id="site-header-mount"></div>
 */

(function () {
  const NAV_ITEMS = [
    { href: '../index.html', label: 'Home' },
    { href: '../pages/01-simple-login.html',     label: 'Scenarios' },
    { href: '../docs/README.md',                  label: 'Docs' },
  ];

  /* Called from page HTML when using pages/ subdirectory */
  function mountHeader(logoHref = '../index.html') {
    const mount = document.getElementById('site-header-mount');
    if (!mount) return;

    mount.outerHTML = `
    <header class="site-header" id="site-header">
      <div class="header-inner">
        <a href="${logoHref}" class="header-logo" aria-label="QA Lab Home" data-testid="logo">
          <div class="logo-icon" aria-hidden="true">🟣</div>
          <span>QA Lab</span>
        </a>
        <button class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation" aria-expanded="false" data-testid="nav-toggle">
          ☰
        </button>
        <nav class="header-nav" id="site-nav" aria-label="Main navigation">
          <a href="${logoHref}" class="nav-link" data-testid="nav-home">Home</a>
          <a href="../pages/01-simple-login.html"     class="nav-link" data-testid="nav-scenarios">Scenarios</a>
          <a href="../pages/11-multi step-form.html"  class="nav-link" data-testid="nav-advanced">Advanced</a>
          <a href="https://playwright.dev" target="_blank" rel="noopener" class="nav-link" data-testid="nav-playwright">Playwright ↗</a>
        </nav>
      </div>
    </header>`;
  }

  window.QALab = window.QALab || {};
  window.QALab.mountHeader = mountHeader;

  // Auto-mount if element exists on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('site-header-mount')) {
      mountHeader();
    }
  });
})();

