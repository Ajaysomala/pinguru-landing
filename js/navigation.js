function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.toggle('open');
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const overlay = document.getElementById('sidebar-overlay');
  const closeBtn = document.getElementById('sidebar-close');
  const toggleBtn = document.getElementById('sidebar-toggle');
  const isOpen = sidebar.classList.toggle('open');

  if (overlay) overlay.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';

  if (closeBtn) closeBtn.style.display = isOpen ? 'block' : 'none';
  if (toggleBtn) {
    toggleBtn.textContent = isOpen ? '✕' : '☰';
    toggleBtn.setAttribute('aria-label', isOpen ? 'Close sidebar' : 'Open sidebar');
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
  }
}

function syncSidebarState(breakpoint = 760) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const overlay = document.getElementById('sidebar-overlay');
  const closeBtn = document.getElementById('sidebar-close');
  const toggleBtn = document.getElementById('sidebar-toggle');

  if (window.innerWidth > breakpoint) {
    sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
    if (closeBtn) closeBtn.style.display = 'none';
    if (toggleBtn) {
      toggleBtn.textContent = '☰';
      toggleBtn.setAttribute('aria-label', 'Open sidebar');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
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

function initSidebarDrawer(breakpoint = 760) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  syncSidebarState(breakpoint);
  window.addEventListener('resize', () => syncSidebarState(breakpoint));

  document.querySelectorAll('#sidebar a, #sidebar .nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= breakpoint && sidebar.classList.contains('open')) {
        toggleSidebar();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initSidebarDrawer();
});