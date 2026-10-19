/* ============================================================
   LogiCore — permissions.js
   Роли и разрешения (демонстрационные, на клиенте).
   ============================================================ */
(function (global) {
  'use strict';

  var ROLES = {
    admin:       { label:'Администратор', can:['*'] },
    manager:     { label:'Менеджер',     can:['dashboard','orders','reports','suppliers','finance:read','warehouse:read','logistics:read','employees:read'] },
    storekeeper: { label:'Кладовщик',    can:['dashboard','warehouse','inventory','products','receiving','shipping','reports'] },
    logist:      { label:'Логист',       can:['dashboard','orders','transport','routes','logistics','reports'] },
    viewer:      { label:'Наблюдатель',  can:['dashboard:read','warehouse:read','inventory:read','orders:read','reports:read','logistics:read'] }
  };

  function roleCan(role, action){
    var r = ROLES[role];
    if (!r) return false;
    if (r.can.indexOf('*') !== -1) return true;
    if (r.can.indexOf(action) !== -1) return true;
    // read-права: "section:read" разрешает "section:read", но НЕ "section:write"
    if (action.indexOf(':') === -1) return false;
    var base = action.split(':')[0];
    if (r.can.indexOf(base) !== -1) {
      // полный доступ к разделу => и read, и write
      return true;
    }
    return r.can.indexOf(base + ':read') !== -1 && action.indexOf(':read') !== -1;
  }

  function current(){
    return global.Auth.current();
  }

  function can(action){
    var s = current();
    if (!s) return false;
    return roleCan(s.role, action);
  }

  function canRead(section){ return can(section + ':read') || can(section); }
  function canWrite(section){ return can(section + ':write') || can(section); }

  function label(role){ return (ROLES[role] && ROLES[role].label) || role; }

  function hideForbidden(root){
    (root || document).querySelectorAll('[data-perm]').forEach(function(el){
      var act = el.getAttribute('data-perm');
      if (!can(act)) el.style.display = 'none';
    });
  }

  global.Permissions = {
    ROLES: ROLES, roleCan: roleCan, can: can,
    canRead: canRead, canWrite: canWrite,
    label: label, hideForbidden: hideForbidden
  };
})(window);