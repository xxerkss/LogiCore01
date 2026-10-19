/* ============================================================
   LogiCore — forms.js
   Валидация и создание полей.
   ============================================================ */
(function (global) {
  'use strict';

  function field(opts){
    var wrap = document.createElement('div');
    wrap.className = 'field' + (opts.full ? ' field--full' : '');

    var label = document.createElement('label');
    label.textContent = opts.label || '';
    if (opts.required) {
      var req = document.createElement('span');
      req.className = 'req';
      req.textContent = '*';
      label.appendChild(req);
    }
    wrap.appendChild(label);

    var input;
    if (opts.type === 'select') {
      input = document.createElement('select');
      (opts.options||[]).forEach(function(o){
        var op = document.createElement('option');
        op.value = o.value;
        op.textContent = o.label;
        if (String(o.value) === String(opts.value)) op.selected = true;
        input.appendChild(op);
      });
    } else if (opts.type === 'textarea') {
      input = document.createElement('textarea');
    } else {
      input = document.createElement('input');
      input.type = opts.type || 'text';
      if (opts.step) input.step = opts.step;
      if (opts.min != null) input.min = opts.min;
    }
    input.name = opts.name || '';
    if (opts.placeholder) input.placeholder = opts.placeholder;
    if (opts.value != null) input.value = opts.value;
    if (opts.disabled) input.disabled = true;
    wrap.appendChild(input);

    var err = document.createElement('div');
    err.className = 'error';
    wrap.appendChild(err);

    if (opts.hint) {
      var hint = document.createElement('div');
      hint.className = 'hint';
      hint.textContent = opts.hint;
      wrap.appendChild(hint);
    }

    return { wrap: wrap, input: input, setError: function(msg){ err.textContent = msg||''; input.classList.toggle('is-invalid', !!msg); } };
  }

  function validateRequired(value, name){
    if (value == null || String(value).trim() === '') return 'Поле «' + name + '» обязательно';
    return null;
  }

  function validateNumber(value, name, min){
    var n = Number(value);
    if (isNaN(n)) return '«' + name + '» должно быть числом';
    if (min != null && n < min) return '«' + name + '» не может быть меньше ' + min;
    return null;
  }

  function validateEmail(value){
    if (!value) return null;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Некорректный email';
  }

  function validatePhone(value){
    if (!value) return null;
    return /^[\+\d\s\(\)-]{6,20}$/.test(value) ? null : 'Некорректный телефон';
  }

  global.Forms = {
    field: field,
    validateRequired: validateRequired,
    validateNumber: validateNumber,
    validateEmail: validateEmail,
    validatePhone: validatePhone
  };
})(window);