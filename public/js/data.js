(function() {

  jQuery(function($) {
    var formsubmit, global, makethis;
    makethis = function() {
      return this;
    };
    global = makethis.call();
    global.setActiveMenu(1);
    formsubmit = function() {
      var formdata, item, _fn, _i, _len, _ref;
      formdata = {};
      _ref = $(this).serializeArray();
      _fn = function(item) {
        return formdata[item.name] = item.value;
      };
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        _fn(item);
      }
      $.post('customeradd', formdata).success(function(data) {
        if (data != null ? data.success : void 0) return console.log('OK');
      });
      return false;
    };
    return $('form#customer-form').on('submit', formsubmit);
  });

}).call(this);
