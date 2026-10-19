/* LogiCore — suppliers.js */
(function(global){
  'use strict';
  var S = global.Storage, K = S.KEYS;
  function all(){ return S.read(K.suppliers, []); }
  function find(id){ return all().find(function(s){return s.id===id;})||null; }

  function create(data){
    if (!data.name || !String(data.name).trim()) return { error:'Название компании обязательно' };
    if (!data.phone && !data.email) return { error:'Укажите телефон или email' };
    var item = {
      id:S.uid('sup'), name:data.name.trim(), contact:data.contact||'',
      phone:data.phone||'', email:data.email||'', address:data.address||'',
      note:data.note||'', createdAt:S.nowISO()
    };
    S.collection(K.suppliers).insert(item);
    global.Notifications.success('Поставщик добавлен', item.name);
    return { item:item };
  }

  function update(id, data){
    if (!data.name) return { error:'Название обязательно' };
    S.collection(K.suppliers).update(id, {
      name:data.name.trim(), contact:data.contact||'', phone:data.phone||'',
      email:data.email||'', address:data.address||'', note:data.note||''
    });
    global.Notifications.success('Поставщик обновлён','');
    return { item:find(id) };
  }

  function remove(id){
    var used = S.read(K.receiving,[]).some(function(r){return r.supplierId===id;});
    if (used) return { error:'Поставщик используется в приёмках' };
    S.collection(K.suppliers).remove(id);
    global.Notifications.success('Поставщик удалён','');
    return { ok:true };
  }

  function historyOf(id){
    return S.read(K.receiving,[]).filter(function(r){return r.supplierId===id;});
  }

  global.Suppliers = { all:all, find:find, create:create, update:update, remove:remove, historyOf:historyOf };
})(window);