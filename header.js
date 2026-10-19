/* ============================================================
   LogiCore — header.js
   Верхняя панель: заголовок, поиск, тема, уведомления, профиль.
   ============================================================ */
(function (global) {
  'use strict';

  function render(title, opts){
    opts = opts || {};
    var user = global.Auth.current() || { name:'Гость', role:'viewer' };
    var settings = global.Storage.getSettings();
    var header = document.createElement('header');
    header.className = 'header';

    header.innerHTML =
      '<button class="header__icon-btn" id="btnSidebarToggle" style="display:none" aria-label="Меню">☰</button>' +
      '<div class="header__title"></div>' +
      '<div class="header__search">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>' +
        '<input type="search" id="headerSearch" placeholder="Поиск по системе…">' +
      '</div>' +
      '<div class="header__actions">' +
        '<button class="header__icon-btn" id="btnTheme" title="Сменить тему" aria-label="Тема">🌓</button>' +
        '<button class="header__icon-btn" id="btnNotif" title="Уведомления" aria-label="Уведомления">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0"/></svg>' +
          '<span class="dot" id="notifDot" style="display:none"></span>' +
        '</button>' +
        '<div class="header__user" id="userMenu">' +
          '<div class="header__avatar"></div>' +
          '<div class="header__user-info"><strong></strong><span></span></div>' +
        '</div>' +
      '</div>';

    header.querySelector('.header__title').textContent = title || 'LogiCore';
    header.querySelector('.header__avatar').textContent = (user.name||'?').charAt(0).toUpperCase();
    header.querySelector('.header__user-info strong').textContent = user.name;
    header.querySelector('.header__user-info span').textContent = global.Permissions.label(user.role);

    // Мобильный переключатель sidebar
    var toggle = header.querySelector('#btnSidebarToggle');
    if (window.innerWidth <= 1024) toggle.style.display = 'grid';
    window.addEventListener('resize', function(){
      toggle.style.display = window.innerWidth <= 1024 ? 'grid' : 'none';
    });
    toggle.onclick = function(){
      var sb = document.getElementById('sidebar');
      var ov = document.getElementById('sidebarOverlay');
      if (sb) sb.classList.toggle('is-open');
      if (ov) ov.classList.toggle('is-visible');
    };

    // Тема
    header.querySelector('#btnTheme').onclick = function(){
      var cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      global.Storage.saveSettings({ theme: cur });
      global.Notifications.info('Тема изменена', cur === 'dark' ? 'Тёмная тема включена' : 'Светлая тема включена');
    };

    // Уведомления
    header.querySelector('#btnNotif').onclick = function(){
      var logs = global.Notifications.all();
      var body = logs.length
        ? '<div class="dash-list">' + logs.slice(0,20).map(function(l){
            return '<div class="dash-list__item"><div class="dash-list__body"><strong>' +
              global.Table.escapeHtml(l.title||l.type) + '</strong><span>' +
              global.Table.escapeHtml(l.message||'') + '</span></div>' +
              '<div class="dash-list__time">' + global.Storage.formatDateTime(l.at) + '</div></div>';
          }).join('') + '</div>'
        : '<p style="color:var(--text-muted)">Пока нет уведомлений.</p>';
      global.Modal.open({ title:'Уведомления', content: body, cancelText:'Закрыть' });
    };

    // Профиль / выход
    header.querySelector('#userMenu').onclick = function(){
      var body = '<div style="display:flex;flex-direction:column;gap:12px">' +
        '<div><strong>Пользователь:</strong> ' + global.Table.escapeHtml(user.name) + '</div>' +
        '<div><strong>Роль:</strong> ' + global.Permissions.label(user.role) + '</div>' +
        '<div style="font-size:12px;color:var(--text-muted)">Вход демонстрационный, не является реальной аутентификацией.</div>' +
        '</div>';
      global.Modal.open({
        title:'Профиль',
        content: body,
        cancelText:'Закрыть',
        confirmText:'Выйти',
        confirmClass:'btn--danger',
        onConfirm: function(){
          global.Auth.logout();
          location.href = global.Navigation.href('login');
        }
      });
    };

    // Обновить точку непрочитанных
    var unread = global.Notifications.all().filter(function(l){ return l.type === 'error' || l.type === 'warning'; });
    if (unread.length) header.querySelector('#notifDot').style.display = 'block';

    return header;
  }

  global.Header = { render: render };
})(window);