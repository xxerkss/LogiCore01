/* LogiCore — shipping.js — отгрузка */
(function(global){
  'use strict';
  var S = global.Storage, K = S.KEYS;

  function all(){ return S.read(K.shipping, []); }
  function find(id){ return all().find(function(s){return s.id===id;})||null; }

  function nextNumber(){
    var n = all().length + 1;
    var num = 'SHP-' + String(n).padStart(4,'0');
    while (all().some(function(r){return r.number===num;})) { n++; num='SHP-'+String(n).padStart(4,'0'); }
    return num;
  }

  function create(data){
    if (!data.warehouseId) return { error:'Выберите склад' };
    var items = (data.items||[]).filter(function(it){return it.productId && Number(it.qty)>0;});
    if (!items.length) return { error:'Добавьте товары' };
    // Проверка остатков
    for (var i=0;i<items.length;i++){
      var it = items[i];
      var avail = global.Inventory.totalFor(it.productId);
      // если указан склад — проверим по складу
      var stockWh = global.Inventory.all().filter(function(x){return x.productId===it.productId && x.warehouseId===data.warehouseId;})
        .reduce(function(s,x){return s+(Number(x.qty)||0);},0);
      if (stockWh < Number(it.qty)) {
        var p = global.Products.find(it.productId);
        return { error:'Недостаточно «'+(p?p.name:it.productId)+'» на складе: есть '+stockWh+', нужно '+it.qty };
      }
    }
    var doc = {
      id:S.uid('shp'), number: nextNumber(),
      orderId: data.orderId||null, warehouseId: data.warehouseId,
      items: items.map(function(it){return {productId:it.productId, qty:Number(it.qty)};}),
      status:'pending', note:data.note||'', createdAt:S.nowISO()
    };
    S.collection(K.shipping).insert(doc);
    global.Notifications.info('Отгрузка создана', doc.number);
    return { item:doc };
  }

  function confirm(id){
    var doc = find(id);
    if (!doc) return { error:'Не найдено' };
    if (doc.status === 'completed') return { error:'Уже подтверждена' };
    // Проверка и списание
    var plan = doc.items.map(function(it){
      var entries = global.Inventory.all().filter(function(x){return x.productId===it.productId && x.warehouseId===doc.warehouseId;});
      return { productId:it.productId, need:Number(it.qty), entries:entries };
    });
    // Симуляция списания FIFO по ячейкам
    for (var i=0;i<plan.length;i++){
      var p = plan[i];
      var left = p.need;
      for (var j=0;j<p.entries.length && left>0;j++){
        var e = p.entries[j];
        var take = Math.min(left, Number(e.qty)||0);
        left -= take;
      }
      if (left > 0) {
        var prod = global.Products.find(p.productId);
        return { error:'Недостаточно «'+(prod?prod.name:p.productId)+'»: не хватает '+left };
      }
    }
    // Выполняем списание
    plan.forEach(function(p){
      var left = p.need;
      p.entries.forEach(function(e){
        if (left<=0) return;
        var take = Math.min(left, Number(e.qty)||0);
        global.Inventory.setQty(p.productId, e.warehouseId, e.cellId, (Number(e.qty)||0) - take);
        left -= take;
      });
    });
    S.collection(K.shipping).update(id, { status:'completed', completedAt:S.nowISO() });
    if (doc.orderId) {
      global.Orders.updateStatus(doc.orderId, 'shipped', {silent:true});
    }
    global.Notifications.success('Отгрузка подтверждена', doc.number+' — остатки списаны');
    return { ok:true };
  }

  function remove(id){
    var doc = find(id);
    if (!doc) return { error:'Не найдено' };
    if (doc.status === 'completed') return { error:'Нельзя удалить подтверждённый документ' };
    S.collection(K.shipping).remove(id);
    global.Notifications.success('Отгрузка удалена','');
    return { ok:true };
  }

  global.Shipping = { all:all, find:find, create:create, confirm:confirm, remove:remove };
})(window);