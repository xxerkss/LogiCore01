/* LogiCore — storage.js — Быстрое хранилище с кэшем в памяти */
(function (global) {
  'use strict';

  var PREFIX = 'logicore_';
  var KEYS = {
    warehouses:'warehouses', cells:'cells', products:'products',
    inventory:'inventory', receiving:'receiving', shipping:'shipping',
    orders:'orders', transport:'transport', drivers:'drivers',
    routes:'routes', suppliers:'suppliers', finance:'finance',
    employees:'employees', users:'users', logs:'logs',
    settings:'settings', notifications:'notifications',
    seedVersion:'seed_version'
  };

  // КЭШ В ПАМЯТИ (чтобы не парсить JSON тысячи раз)
  var memoryCache = {};

  function fullKey(k){ return PREFIX + k; }

  function read(key, fallback){
    // Если уже есть в кэше — отдаем сразу
    if (memoryCache[key] !== undefined) return memoryCache[key];
    try {
      var raw = localStorage.getItem(fullKey(key));
      var parsed = raw ? JSON.parse(raw) : fallback;
      memoryCache[key] = parsed;
      return parsed;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value){
    try {
      memoryCache[key] = value; // обновляем кэш
      localStorage.setItem(fullKey(key), JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  function remove(key){
    delete memoryCache[key];
    try { localStorage.removeItem(fullKey(key)); return true; } catch(e){ return false; }
  }

  function clearAll(){
    memoryCache = {};
    try {
      Object.keys(localStorage).forEach(function(k){
        if (k.indexOf(PREFIX) === 0) localStorage.removeItem(k);
      });
      return true;
    } catch(e){ return false; }
  }

  function uid(prefix){
    return (prefix||'id') + '_' + Math.random().toString(36).slice(2,9) + Date.now().toString(36);
  }

  function collection(keyName){
    return {
      all: function(){ return read(keyName, []); },
      find: function(id){ return read(keyName, []).find(function(x){ return x.id === id; }) || null; },
      insert: function(item){
        var arr = read(keyName, []).slice();
        if (!item.id) item.id = uid(keyName.slice(0,3));
        arr.push(item);
        return write(keyName, arr) ? item : null;
      },
      update: function(id, patch){
        var arr = read(keyName, []).slice();
        var idx = arr.findIndex(function(x){ return x.id === id; });
        if (idx === -1) return null;
        arr[idx] = Object.assign({}, arr[idx], patch, { id: id });
        return write(keyName, arr) ? arr[idx] : null;
      },
      remove: function(id){
        var arr = read(keyName, []);
        var next = arr.filter(function(x){ return x.id !== id; });
        if (next.length === arr.length) return false;
        return write(keyName, next);
      }
    };
  }

  var DEFAULT_SETTINGS = {
    organization: 'LogiCore', currency: '₸', dateFormat: 'DD.MM.YYYY',
    theme: 'light', notificationsEnabled: true, version: '1.0.0'
  };

  function getSettings(){ return Object.assign({}, DEFAULT_SETTINGS, read(KEYS.settings, {})); }
  function saveSettings(patch){ return write(KEYS.settings, Object.assign({}, getSettings(), patch||{})); }

  function pad(n){ return n<10?'0'+n:''+n; }
  function formatDate(iso){
    if(!iso) return '—';
    var d = new Date(iso);
    return isNaN(d.getTime()) ? '—' : pad(d.getDate())+'.'+pad(d.getMonth()+1)+'.'+d.getFullYear();
  }
  function formatDateTime(iso){
    if(!iso) return '—';
    var d = new Date(iso);
    return isNaN(d.getTime()) ? '—' : formatDate(iso)+' '+pad(d.getHours())+':'+pad(d.getMinutes());
  }
  function money(n){
    var s = getSettings().currency || '₸';
    return (Number(n)||0).toLocaleString('ru-RU',{maximumFractionDigits:0}) + ' ' + s;
  }

  global.Storage = {
    KEYS: KEYS, read: read, write: write, remove: remove, clearAll: clearAll,
    uid: uid, collection: collection, getSettings: getSettings, saveSettings: saveSettings,
    formatDate: formatDate, formatDateTime: formatDateTime, money: money,
    todayISO: function(){ return new Date().toISOString().slice(0,10); },
    nowISO: function(){ return new Date().toISOString(); },
    prefix: PREFIX
  };
})(window);