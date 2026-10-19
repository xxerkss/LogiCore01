/* ============================================================
   LogiCore — modal.js
   Универсальные модальные окна.
   ============================================================ */
(function (global) {
  'use strict';

  function open(opts){
    opts = opts || {};
    var backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    var wide = opts.wide ? ' modal--wide' : '';
    backdrop.innerHTML =
      '<div class="modal'+wide+'" role="dialog" aria-modal="true">' +
        '<div class="modal__head"><h3></h3>' +
          '<button class="modal__close" aria-label="Закрыть">✕</button></div>' +
        '<div class="modal__body"></div>' +
        '<div class="modal__foot"></div>' +
      '</div>';

    backdrop.querySelector('h3').textContent = opts.title || '';
    var body = backdrop.querySelector('.modal__body');
    if (typeof opts.content === 'string') body.innerHTML = opts.content;
    else if (opts.content instanceof Node) body.appendChild(opts.content);

    var foot = backdrop.querySelector('.modal__foot');
    var hasFooter = false;

    if (opts.cancelText !== false) {
      var cancel = document.createElement('button');
      cancel.className = 'btn btn--ghost';
      cancel.textContent = opts.cancelText || 'Отмена';
      cancel.onclick = close;
      foot.appendChild(cancel);
      hasFooter = true;
    }
    if (opts.confirmText) {
      var ok = document.createElement('button');
      ok.className = 'btn ' + (opts.confirmClass || 'btn--primary');
      ok.textContent = opts.confirmText;
      ok.onclick = function(){
        var r = opts.onConfirm ? opts.onConfirm(backdrop) : true;
        if (r !== false) close();
      };
      foot.appendChild(ok);
      hasFooter = true;
    }
    if (!hasFooter) foot.style.display = 'none';

    function close(){
      backdrop.classList.remove('is-open');
      setTimeout(function(){ backdrop.remove(); }, 200);
      if (opts.onClose) opts.onClose();
    }

    backdrop.querySelector('.modal__close').onclick = close;
    backdrop.addEventListener('click', function(e){ if (e.target === backdrop) close(); });
    document.addEventListener('keydown', function esc(e){
      if (e.key === 'Escape') { document.removeEventListener('keydown', esc); close(); }
    });

    document.body.appendChild(backdrop);
    requestAnimationFrame(function(){ backdrop.classList.add('is-open'); });
    return { close: close, el: backdrop };
  }

  function confirm(title, message, onYes){
    return open({
      title: title,
      content: '<p style="font-size:14px;line-height:1.6">' + message + '</p>',
      confirmText: 'Подтвердить',
      confirmClass: 'btn--danger',
      onConfirm: function(){ onYes && onYes(); return true; }
    });
  }

  global.Modal = { open: open, confirm: confirm };
})(window);