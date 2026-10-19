/* ============================================================
   LogiCore — backup.js
   Экспорт / импорт JSON резервной копии.
   ============================================================ */
(function (global) {
  'use strict';

  function collect(){
    var S = global.Storage;
    var out = { _meta:{ app:'LogiCore', exportedAt: S.nowISO() } };
    Object.keys(S.KEYS).forEach(function(k){
      var key = S.KEYS[k];
      if (key === 'seedVersion') return;
      out[key] = S.read(key, null);
    });
    return out;
  }

  function download(){
    var data = collect();
    var blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'logicore-backup-' + new Date().toISOString().slice(0,10) + '.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); }, 100);
    global.Notifications.success('Экспорт завершён', 'Файл резервной копии скачан.');
  }

  function importFromFile(file, onDone){
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e){
      var data;
      try { data = JSON.parse(e.target.result); }
      catch(err){ global.Notifications.error('Ошибка импорта', 'Файл не является корректным JSON.'); return; }
      if (!data || typeof data !== 'object' || !data._meta || data._meta.app !== 'LogiCore') {
        global.Notifications.error('Ошибка импорта', 'Файл не является резервной копией LogiCore.');
        return;
      }
      global.Modal.confirm(
        'Импорт данных',
        'Текущие данные будут перезаписаны данными из файла. Продолжить?',
        function(){
          var S = global.Storage;
          Object.keys(S.KEYS).forEach(function(k){
            var key = S.KEYS[k];
            if (key === 'seedVersion') return;
            if (data[key] !== undefined && data[key] !== null) {
              S.write(key, data[key]);
            }
          });
          global.Notifications.success('Импорт завершён', 'Данные успешно восстановлены.');
          onDone && onDone();
        }
      );
    };
    reader.readAsText(file);
  }

  global.Backup = { collect: collect, download: download, importFromFile: importFromFile };
})(window);