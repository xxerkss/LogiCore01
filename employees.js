/* LogiCore — employees.js */
(function(global){
  'use strict';
  var S = global.Storage, K = S.KEYS;
  function all(){ return S.read(K.employees, []); }
  function find(id){ return all().find(function(e){return e.id===id;})||null; }

  function create(data){
    if (!data.name) return { error:'ФИО обязательно' };
    if (!data.position) return { error:'Должность обязательна' };
    var item = { id:S.uid('emp'), name:data.name.trim(), position:data.position.trim(), phone:data.phone||'', email:data.email||'', status:data.status||'active', createdAt:S.nowISO() };
    S.collection(K.employees).insert(item);
    global.Notifications.success('Сотрудник добавлен', item.name);
    return { item:item };
  }
  function update(id, data){
    if (!data.name || !data.position) return { error:'ФИО и должность обязательны' };
    S.collection(K.employees).update(id, {
      name:data.name.trim(), position:data.position.trim(),
      phone:data.phone||'', email:data.email||'', status:data.status||'active'
    });
    global.Notifications.success('Сотрудник обновлён','');
    return { item:find(id) };
  }
  function remove(id){
    S.collection(K.employees).remove(id);
    global.Notifications.success('Сотрудник удалён','');
    return { ok:true };
  }
  global.Employees = { all:all, find:find, create:create, update:update, remove:remove };
})(window);