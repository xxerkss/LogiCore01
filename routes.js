/* LogiCore — routes.js */
(function(global){
  'use strict';
  var S = global.Storage, K = S.KEYS;

  var STATUS = { planned:'Запланирован', in_transit:'В пути', completed:'Завершён', cancelled:'Отменён' };

  function all(){ return S.read(K.routes, []); }
  function find(id){ return all().find(function(r){return r.id===id;})||null; }

  function nextNumber(){
    var n = all().length + 1;
    var num = 'R-' + String(n).padStart(3,'0');
    while (all().some(function(r){return r.number===num;})) { n++; num='R-'+String(n).padStart(3,'0'); }
    return num;
  }

  function create(data){
    if (!data.transportId) return { error:'Выберите транспорт' };
    if (!data.driverId) return { error:'Выберите водителя' };
    if (!data.from || !data.to) return { error:'Укажите пункты отправления/назначения' };
    // Проверка доступности водителя
    var drv = global.Transport.driverFind(data.driverId);
    if (!drv) return { error:'Водитель не найден' };
    if (drv.status !== 'active') return { error:'Водитель недоступен (статус: '+drv.status+')' };
    var tr = global.Transport.find(data.transportId);
    if (!tr) return { error:'Транспорт не найден' };
    if (tr.status !== 'active') return { error:'Транспорт недоступен (статус: '+tr.status+')' };
    var busy = all().some(function(r){
      return r.driverId===data.driverId && r.status==='in_transit' && r.id!==null;
    });
    if (busy) return { error:'Водитель уже в активном рейсе' };

    var route = {
      id:S.uid('rt'), number:nextNumber(),
      transportId:data.transportId, driverId:data.driverId,
      from:data.from.trim(), to:data.to.trim(),
      departureDate:data.departureDate||'', arrivalDate:data.arrivalDate||'',
      status:'planned', notes:[], createdAt:S.nowISO()
    };
    S.collection(K.routes).insert(route);
    global.Notifications.success('Рейс создан', route.number);
    return { item:route };
  }

  function updateStatus(id, status){
    var r = find(id);
    if (!r) return { error:'Не найдено' };
    if (!STATUS[status]) return { error:'Неверный статус' };
    var notes = (r.notes||[]).slice();
    notes.unshift({ at:S.nowISO(), text:'Статус: '+STATUS[status] });
    S.collection(K.routes).update(id, { status:status, notes:notes });
    global.Notifications.info('Рейс обновлён', r.number+' → '+STATUS[status]);
    return { ok:true };
  }

  function remove(id){
    var r = find(id);
    if (!r) return { error:'Не найдено' };
    if (r.status==='in_transit') return { error:'Нельзя удалить рейс в пути' };
    S.collection(K.routes).remove(id);
    global.Notifications.success('Рейс удалён','');
    return { ok:true };
  }

  global.Routes = { all:all, find:find, create:create, updateStatus:updateStatus, remove:remove, STATUS:STATUS };
})(window);