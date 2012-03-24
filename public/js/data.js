(function() {

  jQuery(function($) {
    var formsubmit, global, makethis;
    makethis = function() {
      return this;
    };
    global = makethis.call();
    global.setActiveMenu(1);
    formsubmit = function() {
      var form, formdata, item, _fn, _i, _len, _ref;
      formdata = {};
      form = $(this);
      _ref = $(this).serializeArray();
      _fn = function(item) {
        return formdata[item.name] = item.value;
      };
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        _fn(item);
      }
      $.post('customeradd', formdata).success(function(data) {
        var el, _ref2, _ref3, _ref4;
        if (data != null ? data.success : void 0) {
          el = $.el('tr', {}, [$.el('td', {}, [$.el('div.label.label-success', {}, ['new'])]), $.el('td', {}, [data != null ? (_ref2 = data.customer) != null ? _ref2.name : void 0 : void 0]), $.el('td', {}, [data != null ? (_ref3 = data.customer) != null ? _ref3.contact : void 0 : void 0]), $.el('td', {}, [data != null ? (_ref4 = data.customer) != null ? _ref4.address : void 0 : void 0]), $.el('td', {}, ['']), $.el('td', {}, [''])]);
          $('tbody#customer-list').prepend(el);
          return $('form#customer-form input').val('');
        }
      });
      return false;
    };
    return $('form#customer-form').on('submit', formsubmit);
  });

}).call(this);
