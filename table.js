/* ============================================================
   LogiCore — table.js
   Рендер таблиц с сортировкой, поиском, пагинацией.
   ============================================================ */
(function (global) {
  'use strict';

  function escapeHtml(s){
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  /**
   * render(container, options)
   * options: { columns:[{key,label,render?,sortable?,width?}], rows:[], pageSize, search, emptyText }
   * Возвращает контроллер: { setRows, getRows, refresh }
   */
  function render(container, options){
    options = options || {};
    var state = {
      rows: (options.rows || []).slice(),
      columns: options.columns || [],
      page: 1,
      pageSize: options.pageSize || 10,
      sortKey: null,
      sortDir: 1,
      search: options.search || ''
    };

    function filtered(){
      var q = state.search.trim().toLowerCase();
      var rows = state.rows;
      if (q) {
        rows = rows.filter(function(r){
          return Object.keys(r).some(function(k){
            var v = r[k];
            if (v == null) return false;
            if (typeof v === 'object') return JSON.stringify(v).toLowerCase().indexOf(q) !== -1;
            return String(v).toLowerCase().indexOf(q) !== -1;
          });
        });
      }
      if (state.sortKey) {
        rows = rows.slice().sort(function(a,b){
          var av = a[state.sortKey], bv = b[state.sortKey];
          if (av == null) return 1;
          if (bv == null) return -1;
          if (typeof av === 'number' && typeof bv === 'number') return (av-bv)*state.sortDir;
          return String(av).localeCompare(String(bv),'ru')*state.sortDir;
        });
      }
      return rows;
    }

    function render(){
      var rows = filtered();
      var total = rows.length;
      var pages = Math.max(1, Math.ceil(total/state.pageSize));
      if (state.page > pages) state.page = pages;
      var start = (state.page-1)*state.pageSize;
      var pageRows = rows.slice(start, start+state.pageSize);

      container.innerHTML = '';

      if (!total) {
        var empty = document.createElement('div');
        empty.className = 'empty';
        empty.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7h18M3 12h18M3 17h18"/></svg>' +
          '<h4>' + escapeHtml(options.emptyText || 'Нет данных') + '</h4>' +
          '<p>Попробуйте изменить фильтры или добавить запись.</p>';
        container.appendChild(empty);
        return;
      }

      var wrap = document.createElement('div');
      wrap.className = 'table-wrap';
      var table = document.createElement('table');
      table.className = 'data';

      // head
      var thead = document.createElement('thead');
      var trh = document.createElement('tr');
      state.columns.forEach(function(col){
        var th = document.createElement('th');
        if (col.width) th.style.width = col.width;
        th.textContent = col.label;
        if (col.sortable !== false) {
          if (state.sortKey === col.key) th.classList.add('sorted');
          var ind = document.createElement('span');
          ind.className = 'sort-ind';
          ind.textContent = state.sortKey === col.key ? (state.sortDir===1?'▲':'▼') : '↕';
          th.appendChild(ind);
          th.onclick = function(){
            if (state.sortKey === col.key) state.sortDir *= -1;
            else { state.sortKey = col.key; state.sortDir = 1; }
            render();
          };
        }
        trh.appendChild(th);
      });
      thead.appendChild(trh);
      table.appendChild(thead);

      // body
      var tbody = document.createElement('tbody');
      pageRows.forEach(function(row, i){
        var tr = document.createElement('tr');
        state.columns.forEach(function(col){
          var td = document.createElement('td');
          if (col.render) {
            var out = col.render(row, start+i);
            if (out instanceof Node) td.appendChild(out);
            else td.innerHTML = out == null ? '' : out;
          } else {
            td.textContent = row[col.key] == null ? '—' : row[col.key];
          }
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      wrap.appendChild(table);
      container.appendChild(wrap);

      // footer / pagination
      var foot = document.createElement('div');
      foot.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:12px;font-size:13px;flex-wrap:wrap';
      var info = document.createElement('span');
      info.style.color = 'var(--text-muted)';
      info.textContent = 'Показано ' + (start+1) + '–' + Math.min(start+state.pageSize, total) + ' из ' + total;
      foot.appendChild(info);

      var pager = document.createElement('div');
      pager.style.cssText = 'display:flex;gap:6px;align-items:center';
      function pageBtn(label, page, disabled, active){
        var b = document.createElement('button');
        b.className = 'btn btn--sm ' + (active ? 'btn--primary' : 'btn--ghost');
        b.textContent = label;
        b.disabled = !!disabled;
        b.onclick = function(){ state.page = page; render(); };
        return b;
      }
      pager.appendChild(pageBtn('‹', state.page-1, state.page<=1));
      var maxBtns = 5;
      var from = Math.max(1, state.page - 2);
      var to = Math.min(pages, from + maxBtns - 1);
      from = Math.max(1, to - maxBtns + 1);
      for (var p=from; p<=to; p++){
        pager.appendChild(pageBtn(String(p), p, false, p===state.page));
      }
      pager.appendChild(pageBtn('›', state.page+1, state.page>=pages));
      foot.appendChild(pager);
      container.appendChild(foot);
    }

    var ctrl = {
      setRows: function(rows){ state.rows = rows.slice(); state.page = 1; render(); },
      getRows: function(){ return state.rows.slice(); },
      setSearch: function(q){ state.search = q || ''; state.page = 1; render(); },
      refresh: render
    };

    render();
    return ctrl;
  }

  global.Table = { render: render, escapeHtml: escapeHtml };
})(window);