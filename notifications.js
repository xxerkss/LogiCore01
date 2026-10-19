/* ============================================================
   LogiCore — notifications.js
   Всплывающие уведомления (toast) + журнал в шапке.
   ============================================================ */
(function (global) {
  'use strict';

  function ensureStack(){
    var stack = document.getElementById('toastStack');
    if (!stack) {
      stack = document.createElement('div');
      stack.id = 'toastStack';
      stack.className = 'toast-stack';
      document.body.appendChild(stack);
    }
    return stack;
  }

  function toast(type, title, message){
    var stack = ensureStack();
    var el = document.createElement('div');
    el.className = 'toast toast--' + (type || 'info');
    el.innerHTML = '<div><strong></strong><span></span></div>';
    el.querySelector('strong').textContent = title || '';
    el.querySelector('span').textContent = message || '';
    stack.appendChild(el);
    setTimeout(function(){
      el.style.opacity = '0';
      el.style.transform = 'translateY(8px)';
      setTimeout(function(){ el.remove(); }, 250);
    }, 4200);
  }

  function log(type, title, message){
    var arr = global.Storage.read(global.Storage.KEYS.logs, []);
    arr.unshift({
      id: global.Storage.uid('log'),
      type: type || 'info',
      title: title || '',
      message: message || '',
      at: global.Storage.nowISO()
    });
    if (arr.length > 200) arr = arr.slice(0, 200);
    global.Storage.write(global.Storage.KEYS.logs, arr);
  }

  global.Notifications = {
    success: function(t,m){ toast('success',t,m); log('success',t,m); },
    error:   function(t,m){ toast('error',t,m);   log('error',t,m); },
    warning: function(t,m){ toast('warning',t,m); log('warning',t,m); },
    info:    function(t,m){ toast('info',t,m);    log('info',t,m); },
    log: log,
    all: function(){ return global.Storage.read(global.Storage.KEYS.logs, []); }
  };
})(window);