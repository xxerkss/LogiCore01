/* LogiCore — reports.js */
(function(global){
  'use strict';
  var S = global.Storage, K = S.KEYS;

  function stockByWarehouse(){
    var wss = global.Warehouse.all();
    return wss.map(function(w){
      var inv = S.read(K.inventory,[]).filter(function(i){return i.warehouseId===w.id;});
      return {
        warehouseId:w.id, warehouse:w.name, number:w.number,
        items: inv.length,
        qty: inv.reduce(function(s,i){return s+(Number(i.qty)||0);},0),
        capacity: w.capacity
      };
    });
  }

  function lowStock(){
    var out = [];
    global.Products.all().forEach(function(p){
      var qty = global.Inventory.totalFor(p.id);
      if (qty < (Number(p.minQty)||0)) out.push({ productId:p.id, sku:p.sku, name:p.name, qty:qty, minQty:p.minQty });
    });
    return out;
  }

  function ordersByStatus(){
    var map = {};
    global.Orders.all().forEach(function(o){ map[o.status]=(map[o.status]||0)+1; });
    return map;
  }

  function financeByCategory(){
    return global.Finance.byCategory();
  }

  function supplierPerformance(){
    return global.Suppliers.all().map(function(s){
      var docs = global.Suppliers.historyOf(s.id);
      var total = docs.reduce(function(acc,r){
        return acc + (r.items||[]).reduce(function(a,it){return a+(Number(it.qty)||0);},0);
      },0);
      return { supplierId:s.id, name:s.name, deliveries:docs.length, totalQty:total };
    });
  }

  global.Reports = {
    stockByWarehouse:stockByWarehouse, lowStock:lowStock,
    ordersByStatus:ordersByStatus, financeByCategory:financeByCategory,
    supplierPerformance:supplierPerformance
  };
})(window);