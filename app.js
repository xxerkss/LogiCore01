/* ============================================================
   LogiCore — app.js
   Точка входа для страниц приложения.
   Инициализирует seed, layout (sidebar/header), тему, права.
   ============================================================ */
(function (global) {
  'use strict';

  function initLayout(pageKey, pageTitle, opts){
    opts = opts || {};
    var user = global.Auth.requireAuth();
    if (!user) return;

    // seed (только при первом запуске)
    global.Seed.run();

    // тема
    var s = global.Storage.getSettings();
    document.documentElement.setAttribute('data-theme', s.theme || 'light');

    // каркас
    document.body.innerHTML = '';

    var layout = document.createElement('div');
    layout.className = 'app-layout';

    var sidebar = global.Sidebar.render(pageKey);

    var overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.id = 'sidebarOverlay';
    overlay.onclick = function(){
      sidebar.classList.remove('is-open');
      overlay.classList.remove('is-visible');
    };

    var main = document.createElement('div');
    main.className = 'main';

    var header = global.Header.render(pageTitle);

    var content = document.createElement('main');
    content.className = 'content';
    content.id = 'pageContent';

    main.appendChild(header);
    main.appendChild(content);

    layout.appendChild(sidebar);
    layout.appendChild(overlay);
    layout.appendChild(main);
    document.body.appendChild(layout);

    return content;
  }

  global.App = { initLayout: initLayout };
})(window);