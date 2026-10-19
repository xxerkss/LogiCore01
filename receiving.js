/* LogiCore — receiving.js — приёмка */
(function(global){
  'use strict';
  var S = global.Storage, K = S.KEYS;

  function all(){ return S.read(K.receiving, []); }
  function find(id){ return all().find(function(r){return r.id===id;})||null; }

  function nextNumber(){
    var n = all().length + 1;
    var num = 'RCV-' + String(n).padStart(4,'0');
    while (all().some(function(r){return r.number===num;})) { n++; num='RCV-'+String(n).padStart(4,'0'); }
    return num;
  }

  function create(data){
    if (!data.supplierId) return { error:'Выберите поставщика' };
    if (!data.warehouseId) return { error:'Выберите склад' };
    var items = (data.items||[]).filter(function(it){return it.productId && Number(it.qty)>0;});
    if (!items.length) return { error:'Добавьте хотя бы один товар' };
    var doc = {
      id:S.uid('rcv'), number: nextNumber(),
      supplierId:data.supplierId, warehouseId:data.warehouseId,
      items: items.map(function(it){return {productId:it.productId, qty:Number(it.qty), cellId:it.cellId||null};}),
      status:'pending', note:data.note||'', createdAt:S.nowISO()
    };
    S.collection(K.receiving).insert(doc);
    global.Notifications.info('Приёмка создана', doc.number);
    return { item:doc };
  }

  function confirm(id){
    var doc = find(id);
    if (!doc) return { error:'Документ не найден' };
    if (doc.status === 'completed') return { error:'Уже подтверждён' };
    doc.items.forEach(function(it){
      global.Inventory.add(it.productId, doc.warehouseId, it.cellId||null, it.qty);
    });
    S.collection(K.receiving).update(id, { status:'completed', completedAt:S.nowISO() });
    global.Notifications.success('Приёмка подтверждена', doc.number+' — остатки обновлены');
    return { ok:true };
  }

  function remove(id){
    var doc = find(id);
    if (!doc) return { error:'Не найдено' };
    if (doc.status === 'completed') return { error:'Нельзя удалить подтверждённый документ' };
    S.collection(K.receiving).remove(id);
    global.Notifications.success('Документ удалён', '');
    return { ok:true };
  }

  global.Receiving = { all:all, find:find, create:create, confirm:confirm, remove:remove };
})(window);