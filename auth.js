/* ============================================================
   LogiCore — auth.js
   ДЕМОНСТРАЦИОННЫЙ вход. Не является реальной защитой.
   ============================================================ */
(function (global) {
  'use strict';

  var SESSION_KEY = 'logicore_session';

  var DEMO_USERS = [
    { login:'admin',  password:'1234', name:'Администратор', role:'admin' },
    { login:'manager',password:'1234', name:'Менеджер',      role:'manager' },
    { login:'store',  password:'1234', name:'Кладовщик',     role:'storekeeper' },
    { login:'logist', password:'1234', name:'Логист',        role:'logist' },
    { login:'viewer', password:'1234', name:'Наблюдатель',   role:'viewer' }
  ];

  function login(loginName, password){
    var u = DEMO_USERS.find(function(x){
      return x.login === String(loginName).trim().toLowerCase() && x.password === password;
    });
    if (!u) return null;
    var session = { login:u.login, name:u.name, role:u.role, at: global.Storage.nowISO() };
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch(e){}
    return session;
  }

  function current(){
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch(e){ return null; }
  }

  function logout(){
    try { sessionStorage.removeItem(SESSION_KEY); } catch(e){}
  }

  function requireAuth(){
    var s = current();
    if (!s) {
      var inPages = location.pathname.indexOf('/pages/') !== -1;
      location.href = inPages ? 'login.html' : 'pages/login.html';
      return null;
    }
    return s;
  }

  global.Auth = {
    login: login, current: current, logout: logout, requireAuth: requireAuth,
    DEMO_USERS: DEMO_USERS
  };
})(window);