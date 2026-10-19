/* LogiCore — transport.js — ТС и водители */
(function(global){
  'use strict';
  var S = global.Storage, K = S.KEYS;

  function all(){ return S.read(K.transport, []); }
  function find(id){ return all().find(function(t){return t.id===id;})||null; }

  function drivers(){ return S.read(K.drivers, []); }
  function driverFind(id){ return drivers().find(function(d){return d.id===id;})||null; }

  function create(data){
    if (!data.plate || !String(data.plate).trim()) return { error:'Госномер обязателен' };
    if (!data.model || !String(data.model).trim()) return { error:'Марка/модель обязательна' };
    if (!data.capacity || Number(data.capacity)<=0) return { error:'Грузоподъёмность > 0' };
    var dup = all().find(function(t){return t.plate===data.plate.trim();});
    if (dup) return { error:'ТС с таким госномером уже существует' };
    var item = {
      id:S.uid('tr'), plate:data.plate.trim().toUpperCase(), model:data.model.trim(),
      type:data.type||'Фургон', capacity:Number(data.capacity)||0,
      status:data.status||'active', driverId:data.driverId||null, note:data.note||''
    };
    S.collection(K.transport).insert(item);
    global.Notifications.success('Транспорт добавлен', item.plate);
    return { item:item };
  }

  function update(id, data){
    var err = null;
    if (!data.plate) err = 'Госномер обязателен';
    else if (!data.model) err = 'Марка/модель обязательна';
    else if (!data.capacity || Number(data.capacity)<=0) err = 'Грузоподъёмность > 0';
    if (err) return { error: err };
    S.collection(K.transport).update(id, {
      plate:data.plate.trim().toUpperCase(), model:data.model.trim(),
      type:data.type||'Фургон', capacity:Number(data.capacity)||0,
      status:data.status||'active', driverId:data.driverId||null, note:data.note||''
    });
    global.Notifications.success('Транспорт обновлён', '');
    return { item:find(id) };
  }

  function remove(id){
    var used = S.read(K.routes,[]).some(function(r){return r.transportId===id && r.status!=='completed' && r.status!=='cancelled';});
    if (used) return { error:'ТС используется в активных рейсах' };
    S.collection(K.transport).remove(id);
    global.Notifications.success('ТС удалено','');
    return { ok:true };
  }

  function createDriver(data){
    if (!data.name) return { error:'ФИО обязательно' };
    var drv = { id:S.uid('drv'), name:data.name.trim(), phone:data.phone||'', license:data.license||'', status:data.status||'active', note:data.note||'' };
    S.collection(K.drivers).insert(drv);
    global.Notifications.success('Водитель добавлен', drv.name);
    return { item:drv };
  }

  function updateDriver(id, data){
    if (!data.name) return { error:'ФИО обязательно' };
    S.collection(K.drivers).update(id, {
      name:data.name.trim(), phone:data.phone||'', license:data.license||'', status:data.status||'active', note:data.note||''
    });
    global.Notifications.success('Водитель обновлён', '');
    return { item:driverFind(id) };
  }

  function removeDriver(id){
    var used = all().some(function(t){return t.driverId===id;});
    if (used) return { error:'Водитель закреплён за ТС' };
    S.collection(K.drivers).remove(id);
    global.Notifications.success('Водитель удалён','');
    return { ok:true };
  }

  global.Transport = {
    all:all, find:find, drivers:drivers, driverFind:driverFind,
    create:create, update:update, remove:remove,
    createDriver:createDriver, updateDriver:updateDriver, removeDriver:removeDriver
  };
})(window);