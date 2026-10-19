/* ============================================================
   LogiCore — sidebar.js
   Боковое меню с группами.
   ============================================================ */
(function (global) {
  'use strict';

  var ICONS = {
    dashboard:'<path d="M3 13h8V3H3zM13 21h8V11h-8zM13 3v6h8V3zM3 21h8v-6H3z"/>',
    warehouse:'<path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>',
    inventory:'<path d="M3 6l9-3 9 3-9 3-9-3zM3 6v12l9 3 9-3V6M12 9v12"/>',
    receiving:'<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
    shipping:'<path d="M12 21V9M7 14l5-5 5 5M5 3h14"/>',
    orders:'<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12h6M9 16h6"/>',
    transport:'<path d="M1 17V6h13v11M14 9h4l3 4v4h-7M5 21a2 2 0 100-4 2 2 0 000 4zM18 21a2 2 0 100-4 2 2 0 000 4z"/>',
    routes:'<path d="M9 20l-5-2V4l5 2 6-2 5 2v14l-5-2-6 2zM9 6v14M15 4v14"/>',
    logistics:'<path d="M1 3h15v13H1zM16 8h4l3 3v5h-7M5.5 21a2 2 0 100-4 2 2 0 000 4zM18.5 21a2 2 0 100-4 2 2 0 000 4z"/>',
    suppliers:'<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>',
    finance:'<path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>',
    employees:'<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>',
    reports:'<path d="M3 3v18h18M7 14l4-4 3 3 5-6"/>',
    users:'<path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/>'
  };

  function svg(name){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name]||'') + '</svg>';
  }

  var GROUPS = [
    { title:'Обзор', items:[
      { key:'dashboard', label:'Главная панель', icon:'dashboard' }
    ]},
    { title:'Склад', items:[
      { key:'warehouse', label:'Склады', icon:'warehouse' },
      { key:'inventory', label:'Товары и остатки', icon:'inventory' },
      { key:'receiving', label:'Приёмка', icon:'receiving' },
      { key:'shipping', label:'Отгрузка', icon:'shipping' }
    ]},
    { title:'Логистика', items:[
      { key:'orders', label:'Заказы', icon:'orders' },
      { key:'transport', label:'Транспорт', icon:'transport' },
      { key:'routes', label:'Маршруты и рейсы', icon:'routes' },
      { key:'logistics', label:'Доставка', icon:'logistics' }
    ]},
    { title:'Компания', items:[
      { key:'suppliers', label:'Поставщики', icon:'suppliers' },
      { key:'finance', label:'Финансы', icon:'finance' },
      { key:'employees', label:'Сотрудники', icon:'employees' },
      { key:'reports', label:'Отчёты', icon:'reports' }
    ]},
    { title:'Система', items:[
      { key:'users', label:'Пользователи', icon:'users' },
      { key:'settings', label:'Настройки', icon:'settings' }
    ]}
  ];

  // какие разделы доступны какой роли (для скрытия пунктов)
  var SECTION_FOR_PERM = {
    dashboard:'dashboard', warehouse:'warehouse', inventory:'inventory',
    receiving:'receiving', shipping:'shipping', orders:'orders',
    transport:'transport', routes:'routes', logistics:'logistics',
    suppliers:'suppliers', finance:'finance', employees:'employees',
    reports:'reports', users:'users', settings:'settings'
  };

  function render(activeKey){
    var aside = document.createElement('aside');
    aside.className = 'sidebar';
    aside.id = 'sidebar';

    // === НОВЫЙ 4K ЛОГОТИП С ГРАДИЕНТОМ ===
    var brand = document.createElement('div');
    brand.className = 'sidebar__brand';
    brand.innerHTML =
      '<svg class="sidebar__logo" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:42px;height:42px;filter:drop-shadow(0 4px 10px rgba(37,99,235,0.4));">' +
        '<path d="M32 4L4 20V44L32 60L60 44V20L32 4Z" fill="#2563eb"/>' +
        '<path d="M32 4L4 20L32 36L60 20L32 4Z" fill="#60a5fa"/>' +
        '<path d="M32 36V60L60 44V20L32 36Z" fill="#1d4ed8"/>' +
        '<path d="M12 26V40L24 47V33L12 26Z" fill="#ffffff"/>' +
        '<path d="M32 36V60L4 44V20L32 36Z" fill="#3b82f6" opacity="0.3"/>' +
      '</svg>' +
      '<div class="sidebar__brand-text" style="margin-left:4px;">' +
        '<h1 style="font-weight:900;letter-spacing:-0.5px;background:linear-gradient(90deg,#ffffff,#93c5fd);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:0;font-size:22px;">LogiCore</h1>' +
        '<span style="font-size:10px;color:#93c5fd;letter-spacing:2px;text-transform:uppercase;margin-top:2px;display:block;">Warehouse · Logistics</span>' +
      '</div>';
    aside.appendChild(brand);

    var nav = document.createElement('nav');
    nav.className = 'sidebar__nav';

    var user = global.Auth.current();
    GROUPS.forEach(function(g){
      // фильтрация по правам
      var items = g.items.filter(function(it){
        if (!user) return true;
        if (user.role === 'admin') return true;
        var sec = SECTION_FOR_PERM[it.key];
        return global.Permissions.canRead(sec);
      });
      if (!items.length) return;
      var grp = document.createElement('div');
      grp.className = 'sidebar__group';
      grp.innerHTML = '<div class="sidebar__group-title">' + g.title + '</div>';
      items.forEach(function(it){
        var a = document.createElement('a');
        a.href = global.Navigation.href(it.key);
        a.className = 'sidebar__link' + (it.key === activeKey ? ' is-active' : '');
        a.innerHTML = svg(it.icon) + '<span>' + it.label + '</span>';
        grp.appendChild(a);
      });
      nav.appendChild(grp);
    });

    aside.appendChild(nav);

    var footer = document.createElement('div');
    footer.className = 'sidebar__footer';
    footer.style.display = 'flex';
    footer.style.alignItems = 'center';
    footer.style.justifyContent = 'space-between';
    footer.innerHTML = '<span>v1.0.0</span><span style="color:#3b82f6;font-weight:600;font-size:10px;background:rgba(59,130,246,0.1);padding:2px 6px;border-radius:4px;">DEMO</span>';
    aside.appendChild(footer);

    return aside;
  }

  global.Sidebar = { render: render };
})(window);