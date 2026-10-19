/* ============================================================
   LogiCore — filters.js
   Переиспользуемые элементы фильтров.
   ============================================================ */
(function (global) {
  'use strict';

  function create(container, opts){
    opts = opts || {};
    container.innerHTML = '';
    var bar = document.createElement('div');
    bar.className = 'toolbar';

    var search = document.createElement('input');
    search.type = 'search';
    search.placeholder = opts.searchPlaceholder || 'Поиск…';
    search.style.minWidth = '220px';
    bar.appendChild(search);

    var selects = [];
    (opts.selects || []).forEach(function(s){
      var el = document.createElement('select');
      el.innerHTML = '<option value="">' + (s.placeholder || s.label) + '</option>' +
        (s.options||[]).map(function(o){ return '<option value="'+o.value+'">'+o.label+'</option>'; }).join('');
      el.dataset.name = s.name;
      bar.appendChild(el);
      selects.push(el);
    });

    var spacer = document.createElement('div');
    spacer.className = 'spacer';
    bar.appendChild(spacer);

    if (opts.onAction) {
      var btn = document.createElement('button');
      btn.className = 'btn btn--primary';
      btn.textContent = opts.onAction.label;
      btn.onclick = opts.onAction.handler;
      bar.appendChild(btn);
    }

    container.appendChild(bar);

    function emit(){
      var data = { search: search.value };
      selects.forEach(function(s){ data[s.dataset.name] = s.value; });
      opts.onChange && opts.onChange(data);
    }
    search.addEventListener('input', emit);
    selects.forEach(function(s){ s.addEventListener('change', emit); });

    return { emit: emit };
  }

  global.Filters = { create: create };
})(window);