/* LogiCore — products.js — товары */
(function(global){
  'use strict';
  var S = global.Storage, K = S.KEYS;

  function all(){ return S.read(K.products, []); }
  function find(id){ return all().find(function(p){return p.id===id;})||null; }
  function bySku(sku){ return all().find(function(p){return p.sku===sku;})||null; }
  function byBarcode(bc){ return bc?all().find(function(p){return p.barcode===bc;})||null:null; }

  function stockOf(productId){
    return S.read(K.inventory, [])
      .filter(function(i){return i.productId===productId;})
      .reduce(function(s,i){return s+(Number(i.qty)||0);},0);
  }

  function validate(data, excludeId){
    if (!data.sku || !String(data.sku).trim()) return 'Артикул обязателен';
    if (!data.name || !String(data.name).trim()) return 'Название обязательно';
    if (data.cost==null || isNaN(Number(data.cost)) || Number(data.cost)<0) return 'Некорректная закупочная цена';
    if (data.minQty==null || isNaN(Number(data.minQty)) || Number(data.minQty)<0) return 'Некорректный минимальный остаток';
    var dup = bySku(data.sku);
    if (dup && dup.id !== excludeId) return 'Артикул уже существует';
    return null;
  }

  function create(data){
    var err = validate(data, null);
    if (err) return { error: err };
    var item = {
      id: S.uid('p'),
      sku: data.sku.trim(), barcode: (data.barcode||'').trim(),
      name: data.name.trim(), category: data.category||'',
      unit: data.unit||'шт', cost: Number(data.cost)||0,
      minQty: Number(data.minQty)||0, supplierId: data.supplierId||null,
      createdAt: S.nowISO()
    };
    S.collection(K.products).insert(item);
    if (data.warehouseId && Number(data.qty)>0) {
      global.Inventory.add(item.id, data.warehouseId, data.cellId||null, Number(data.qty));
    }
    global.Notifications.success('Товар создан', item.name);
    return { item: item };
  }

  function update(id, data){
    var err = validate(data, id);
    if (err) return { error: err };
    S.collection(K.products).update(id, {
      sku: data.sku.trim(), barcode:(data.barcode||'').trim(),
      name: data.name.trim(), category:data.category||'',
      unit:data.unit||'шт', cost:Number(data.cost)||0,
      minQty:Number(data.minQty)||0, supplierId:data.supplierId||null
    });
    global.Notifications.success('Товар обновлён', data.name);
    return { item: find(id) };
  }

  function remove(id){
    var used = S.read(K.inventory, []).some(function(i){return i.productId===id && Number(i.qty)>0;});
    var inOrders = S.read(K.orders, []).some(function(o){return (o.items||[]).some(function(it){return it.productId===id;});});
    if (used || inOrders) return { error: 'Товар используется в остатках или заказах. Сначала обнулите остатки.' };
    S.collection(K.products).remove(id);
    S.collection(K.inventory).replaceAll(S.read(K.inventory,[]).filter(function(i){return i.productId!==id;}));
    global.Notifications.success('Товар удалён', '');
    return { ok:true };
  }

  global.Products = {
    all:all, find:find, bySku:bySku, byBarcode:byBarcode,
    stockOf:stockOf, validate:validate, create:create, update:update, remove:remove
  };
})(window);