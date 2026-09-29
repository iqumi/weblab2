/*
 * Ранняя инициализация темы. Подключается в <head> БЕЗ defer/async,
 * чтобы атрибут data-theme попал на <html> до первой отрисовки и страница
 * не «мигала» светлой темой у тех, кто выбрал тёмную.
 *
 * Приоритет: сохранённый выбор (localStorage) → системная настройка
 * (prefers-color-scheme) → светлая тема.
 * Ключ 'theme' должен совпадать с THEME_KEY в js/script.js.
 */
(function () {
  var theme = null;

  try {
    theme = localStorage.getItem('theme');
  } catch (e) {
    // localStorage недоступен (приватный режим, запрет cookies) — не страшно
  }

  if (theme !== 'light' && theme !== 'dark') {
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme = prefersDark ? 'dark' : 'light';
  }

  document.documentElement.setAttribute('data-theme', theme);
})();
