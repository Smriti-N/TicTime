(() => {
  const storageKey = 'tictime-theme';
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');

  function applyTheme(theme) {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    toggle.setAttribute('aria-pressed', String(theme === 'dark'));
  }

  toggle.addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(theme);
    try {
      localStorage.setItem(storageKey, theme);
    } catch (error) {
      console.warn('Could not save the theme preference.', error);
    }
  });

  window.addEventListener('storage', (event) => {
    if (event.key === storageKey && (event.newValue === 'light' || event.newValue === 'dark')) {
      applyTheme(event.newValue);
    }
  });

  applyTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');
})();
