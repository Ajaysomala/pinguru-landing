const SIDEBAR_BREAKPOINT = 760;

function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.toggle('open');
}

function getSidebarContext() {
  const layout = document.querySelector('.layout.has-sidebar');
  if (!layout) return null;
  return {
    layout,
    sidebar: layout.querySelector('.sidebar'),
    overlay: document.getElementById('sidebar-overlay'),
    closeBtn: layout.querySelector('.sidebar-close'),
    toggleBtns: Array.from(document.querySelectorAll('.sidebar-toggle')),
  };
}

function updateToggleButtons(isHidden) {
  const ctx = getSidebarContext();
  if (!ctx) return;
  const label = isHidden ? 'Open sidebar' : 'Close sidebar';
  const icon = isHidden ? '☰' : '✕';
  ctx.toggleBtns.forEach((btn) => {
    btn.textContent = icon;
    btn.setAttribute('aria-label', label);
    btn.setAttribute('aria-expanded', String(!isHidden));
  });
}

function setSidebarHidden(hidden) {
  const ctx = getSidebarContext();
  if (!ctx) return;

  ctx.layout.classList.toggle('sidebar-hidden', hidden);

  const isMobile = window.innerWidth <= SIDEBAR_BREAKPOINT;
  if (ctx.overlay) ctx.overlay.classList.toggle('open', isMobile && !hidden);
  if (ctx.sidebar) ctx.sidebar.classList.toggle('open', isMobile && !hidden);
  document.body.style.overflow = isMobile && !hidden ? 'hidden' : '';

  updateToggleButtons(hidden);
}

function toggleSidebar() {
  const ctx = getSidebarContext();
  if (!ctx) return;
  const isHidden = ctx.layout.classList.contains('sidebar-hidden');
  setSidebarHidden(!isHidden);
}

function syncSidebarState() {
  const ctx = getSidebarContext();
  if (!ctx) return;

  if (window.innerWidth <= SIDEBAR_BREAKPOINT) {
    setSidebarHidden(true);
  } else {
    setSidebarHidden(false);
  }
}

function initMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (!menu) return;

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
    });
  });
}

function initSidebarDrawer() {
  const ctx = getSidebarContext();
  if (!ctx) return;

  if (window.innerWidth <= SIDEBAR_BREAKPOINT) {
    ctx.layout.classList.add('sidebar-hidden');
  } else {
    ctx.layout.classList.remove('sidebar-hidden');
  }
  syncSidebarState();
  window.addEventListener('resize', syncSidebarState);

  ctx.layout.querySelectorAll('#sidebar a, #sidebar .nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= SIDEBAR_BREAKPOINT) {
        setSidebarHidden(true);
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initSidebarDrawer();
});