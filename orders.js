/* LogiCore — orders.js */
(function(global){
  'use strict';
  var S = global.Storage, K = S.KEYS;

  var STATUS_FLOW = ['new','confirmed','collecting','ready','shipped','transit','delivered'];
  var STATUS_LABELS = {
    new:'Новый', confirmed:'Подтверждён', collecting:'Собирается',
    ready:'Готов к отгрузке', shipped:'Отгружен', transit:'В пути',
    delivered:'Доставлен', cancelled:'Отменён'
  };

  function all(){ return S.read(K.orders, []); }
  function find(id){ return all().find(function(o){return o.id===id;})||null; }

  function nextNumber(){
    var n = all().length + 1;
    var num = 'ORD-' + String(1000+n);
    while (all().some(function(o){return o.number===num;})) { n++; num='ORD-'+String(1000+n); }
    return num;
  }

  function totalOf(order){
    return (order.items||[]).reduce(function(s,it){return s+(Number(it.qty)||0)*(Number(it.price)||0);},0);
  }

  function create(data){
    if (!data.customer || !String(data.customer).trim()) return { error:'Укажите получателя' };
    if (!data.phone || !String(data.phone).trim()) return { error:'Укажите телефон' };
    if (!data.address || !String(data.address).trim()) return { error:'Укажите адрес' };
    var items = (data.items||[]).filter(function(it){return it.productId && Number(it.qty)>0;});
    if (!items.length) return { error:'Добавьте товары' };
    var order = {
      id:S.uid('ord'), number: nextNumber(),
      customer:data.customer.trim(), phone:data.phone.trim(), address:data.address.trim(),
      items: items.map(function(it){return {productId:it.productId, qty:Number(it.qty), price:Number(it.price)||0};}),
      status:'new', createdAt:S.nowISO(), deliveryDate: data.deliveryDate||'',
      note: data.note||''
    };
    S.collection(K.orders).insert(order);
    global.Notifications.success('Заказ создан', order.number);
    return { item:order };
  }

  function update(id, data){
    var o = find(id);
    if (!o) return { error:'Не найдено' };
    S.collection(K.orders).update(id, {
      customer:data.customer||o.customer, phone:data.phone||o.phone, address:data.address||o.address,
      items:data.items||o.items, deliveryDate:data.deliveryDate||o.deliveryDate,
      note:data.note!=null?data.note:o.note
    });
    global.Notifications.success('Заказ обновлён', o.number);
    return { item:find(id) };
  }

  function updateStatus(id, status, opts){
    opts = opts || {};
    var o = find(id);
    if (!o) return { error:'Не найдено' };
    if (status === 'delivered' && ['shipped','transit'].indexOf(o.status)===-1) {
      return { error:'Нельзя доставить заказ, который ещё не отгружен' };
    }
    S.collection(K.orders).update(id, { status:status });
    if (!opts.silent) global.Notifications.info('Статус заказа', o.number + ' → ' + (STATUS_LABELS[status]||status));
    return { ok:true };
  }

  function nextStatus(id){
    var o = find(id);
    if (!o) return { error:'Не найдено' };
    var idx = STATUS_FLOW.indexOf(o.status);
    if (idx === -1 || idx === STATUS_FLOW.length-1) return { error:'Достигнут финальный статус' };
    return updateStatus(id, STATUS_FLOW[idx+1]);
  }

  function remove(id){
    var o = find(id);
    if (!o) return { error:'Не найдено' };
    if (['shipped','transit','delivered'].indexOf(o.status)!==-1) return { error:'Нельзя удалить отгруженный/доставленный заказ' };
    S.collection(K.orders).remove(id);
    global.Notifications.success('Заказ удалён','');
    return { ok:true };
  }

  global.Orders = {
    all:all, find:find, create:create, update:update,
    updateStatus:updateStatus, nextStatus:nextStatus, remove:remove,
    totalOf:totalOf, STATUS_FLOW:STATUS_FLOW, STATUS_LABELS:STATUS_LABELS
  };
})(window);