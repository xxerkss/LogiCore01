/* LogiCore — finance.js */
(function(global){
  'use strict';
  var S = global.Storage, K = S.KEYS;

  var CATEGORIES = ['Закупки','Транспортные расходы','Топливо','Обслуживание','Продажи','Прочие'];

  function all(){ return S.read(K.finance, []); }
  function find(id){ return all().find(function(f){return f.id===id;})||null; }

  function create(data){
    if (!data.amount || Number(data.amount)<=0) return { error:'Сумма должна быть > 0' };
    if (!data.category) return { error:'Выберите категорию' };
    if (!data.type || ['income','expense'].indexOf(data.type)===-1) return { error:'Тип операции неверный' };
    var item = {
      id:S.uid('fin'), type:data.type, category:data.category,
      amount:Number(data.amount), description:data.description||'',
      date:data.date||S.todayISO(),
      relatedType:data.relatedType||null, relatedId:data.relatedId||null,
      createdAt:S.nowISO()
    };
    S.collection(K.finance).insert(item);
    global.Notifications.success('Операция добавлена', (item.type==='income'?'Доход':'Расход')+': '+S.money(item.amount));
    return { item:item };
  }

  function remove(id){
    S.collection(K.finance).remove(id);
    global.Notifications.success('Операция удалена','');
    return { ok:true };
  }

  function totals(){
    var t = { income:0, expense:0, balance:0 };
    all().forEach(function(f){
      if (f.type==='income') t.income += Number(f.amount)||0;
      else t.expense += Number(f.amount)||0;
    });
    t.balance = t.income - t.expense;
    return t;
  }

  function byCategory(type){
    var map = {};
    all().filter(function(f){return !type||f.type===type;}).forEach(function(f){
      map[f.category] = (map[f.category]||0) + (Number(f.amount)||0);
    });
    return map;
  }

  global.Finance = { all:all, find:find, create:create, remove:remove, totals:totals, byCategory:byCategory, CATEGORIES:CATEGORIES };
})(window);