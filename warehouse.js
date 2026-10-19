/* LogiCore — warehouse.js — склады и ячейки */
(function(global){
  'use strict';
  var S = global.Storage, K = S.KEYS;

  function all(){ return S.read(K.warehouses, []); }
  function find(id){ return all().find(function(w){return w.id===id;})||null; }

  function cellsOf(warehouseId){ return S.read(K.cells,[]).filter(function(c){return c.warehouseId===warehouseId;}); }
  function cellFind(id){ return S.read(K.cells,[]).find(function(c){return c.id===id;})||null; }

  function usedCapacity(warehouseId){
    return S.read(K.inventory,[]).filter(function(i){return i.warehouseId===warehouseId;})
      .reduce(function(s,i){return s+(Number(i.qty)||0);},0);
  }

  function validate(data, excludeId){
    if (!data.number || !String(data.number).trim()) return 'Номер склада обязателен';
    if (!data.name || !String(data.name).trim()) return 'Название склада обязательно';
    if (data.capacity==null || isNaN(Number(data.capacity)) || Number(data.capacity)<=0) return 'Вместимость должна быть > 0';
    var dup = all().find(function(w){ return w.number===data.number.trim() && w.id!==excludeId; });
    if (dup) return 'Склад с таким номером уже существует';
    return null;
  }

  function create(data){
    var err = validate(data,null);
    if (err) return { error: err };
    var item = {
      id: S.uid('wh'), number: data.number.trim(), name: data.name.trim(),
      address: data.address||'', note: data.note||'',
      capacity: Number(data.capacity)||0, createdAt: S.nowISO()
    };
    S.collection(K.warehouses).insert(item);
    global.Notifications.success('Склад создан', item.name);
    return { item:item };
  }

  function update(id, data){
    var err = validate(data,id);
    if (err) return { error: err };
    S.collection(K.warehouses).update(id, {
      number: data.number.trim(), name: data.name.trim(),
      address: data.address||'', note: data.note||'',
      capacity: Number(data.capacity)||0
    });
    global.Notifications.success('Склад обновлён', data.name);
    return { item: find(id) };
  }

  function remove(id){
    var used = S.read(K.inventory,[]).some(function(i){return i.warehouseId===id && Number(i.qty)>0;});
    if (used) return { error:'Склад содержит товары. Сначала переместите или спишите их.' };
    S.collection(K.warehouses).remove(id);
    S.collection(K.cells).replaceAll(S.read(K.cells,[]).filter(function(c){return c.warehouseId!==id;}));
    global.Notifications.success('Склад удалён', '');
    return { ok:true };
  }

  function addCell(warehouseId, data){
    if (!data.code || !String(data.code).trim()) return { error:'Код ячейки обязателен' };
    var dup = cellsOf(warehouseId).find(function(c){return c.code===data.code.trim();});
    if (dup) return { error:'Ячейка с таким кодом уже существует' };
    var cell = {
      id: S.uid('cell'), warehouseId: warehouseId,
      code: data.code.trim(), capacity: Number(data.capacity)||0, note: data.note||''
    };
    S.collection(K.cells).insert(cell);
    global.Notifications.success('Ячейка добавлена', cell.code);
    return { item:cell };
  }

  function removeCell(cellId){
    var used = S.read(K.inventory,[]).some(function(i){return i.cellId===cellId && Number(i.qty)>0;});
    if (used) return { error:'Ячейка содержит товары' };
    S.collection(K.cells).remove(cellId);
    global.Notifications.success('Ячейка удалена', '');
    return { ok:true };
  }

  global.Warehouse = {
    all:all, find:find, cellsOf:cellsOf, cellFind:cellFind,
    usedCapacity:usedCapacity, validate:validate, create:create, update:update,
    remove:remove, addCell:addCell, removeCell:removeCell
  };
})(window);