/* LogiCore — inventory.js — остатки и инвентаризация */
(function(global){
  'use strict';
  var S = global.Storage, K = S.KEYS;

  function all(){ return S.read(K.inventory, []); }
  function forProduct(pid){ return all().filter(function(i){return i.productId===pid;}); }
  function totalFor(pid){ return forProduct(pid).reduce(function(s,i){return s+(Number(i.qty)||0);},0); }

  function findEntry(productId, warehouseId, cellId){
    return all().find(function(i){
      return i.productId===productId && i.warehouseId===warehouseId && (i.cellId||null)===(cellId||null);
    })||null;
  }

  function setQty(productId, warehouseId, cellId, qty){
    var arr = all();
    var entry = findEntry(productId,warehouseId,cellId);
    var n = Number(qty)||0;
    if (n<0) return false;
    if (entry){
      entry.qty = n;
    } else {
      arr.push({ id:S.uid('inv'), productId:productId, warehouseId:warehouseId, cellId:cellId||null, qty:n });
    }
    // удалить нулевые
    arr = arr.filter(function(i){ return Number(i.qty) > 0; });
    return S.write(K.inventory, arr);
  }

  function add(productId, warehouseId, cellId, qty){
    var entry = findEntry(productId,warehouseId,cellId);
    var cur = entry ? Number(entry.qty)||0 : 0;
    return setQty(productId, warehouseId, cellId, cur + (Number(qty)||0));
  }

  function subtract(productId, warehouseId, cellId, qty){
    var entry = findEntry(productId,warehouseId,cellId);
    var cur = entry ? Number(entry.qty)||0 : 0;
    var n = Number(qty)||0;
    if (cur < n) return { error:'Недостаточно остатка: есть '+cur+', нужно '+n };
    setQty(productId, warehouseId, cellId, cur - n);
    return { ok:true };
  }

  // Перемещение между складами/ячейками
  function move(productId, fromWh, fromCell, toWh, toCell, qty){
    var res = subtract(productId, fromWh, fromCell, qty);
    if (res.error) return res;
    add(productId, toWh, toCell, qty);
    global.Notifications.info('Перемещение выполнено', 'Товар перемещён: '+qty+' ед.');
    return { ok:true };
  }

  // Инвентаризация: применяем список {productId, warehouseId, cellId, actual}
  function inventoryAdjust(rows){
    var log = [];
    rows.forEach(function(r){
      var entry = findEntry(r.productId, r.warehouseId, r.cellId);
      var system = entry ? Number(entry.qty)||0 : 0;
      var actual = Number(r.actual)||0;
      var diff = actual - system;
      if (diff !== 0) {
        setQty(r.productId, r.warehouseId, r.cellId, actual);
        log.push({ productId:r.productId, warehouseId:r.warehouseId, cellId:r.cellId, system:system, actual:actual, diff:diff, at:S.nowISO() });
      }
    });
    if (log.length) {
      var history = S.read('inventory_history', []);
      history = log.concat(history).slice(0,500);
      S.write('inventory_history', history);
      global.Notifications.success('Инвентаризация применена', 'Скорректировано позиций: '+log.length);
    } else {
      global.Notifications.info('Инвентаризация', 'Расхождений не найдено');
    }
    return log;
  }

  function history(){ return S.read('inventory_history', []); }

  global.Inventory = {
    all:all, forProduct:forProduct, totalFor:totalFor, findEntry:findEntry,
    setQty:setQty, add:add, subtract:subtract, move:move,
    inventoryAdjust:inventoryAdjust, history:history
  };
})(window);