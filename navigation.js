/* ============================================================
   LogiCore — navigation.js
   Единый переход между страницами.
   ============================================================ */
(function (global) {
  'use strict';

  var ROUTES = {
    dashboard: 'dashboard.html',
    warehouse: 'warehouse.html',
    inventory: 'inventory.html',
    receiving: 'receiving.html',
    shipping: 'shipping.html',
    orders: 'orders.html',
    transport: 'transport.html',
    routes: 'routes.html',
    suppliers: 'suppliers.html',
    finance: 'finance.html',
    employees: 'employees.html',
    reports: 'reports.html',
    users: 'users.html',
    settings: 'settings.html',
    logistics: 'logistics.html',
    login: 'login.html'
  };

  function basePath(){
    // Если мы внутри /pages/, возвращаем пусто; иначе — "pages/"
    return location.pathname.indexOf('/pages/') !== -1 ? '' : 'pages/';
  }

  function go(page){
    var file = ROUTES[page] || page;
    location.href = basePath() + file;
  }

  function href(page){
    return basePath() + (ROUTES[page] || page);
  }

  global.Navigation = { go: go, href: href, ROUTES: ROUTES };
})(window);