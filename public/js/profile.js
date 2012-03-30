(function() {

  jQuery(function($) {
    var global, makethis, onformsubmit;
    makethis = function() {
      return this;
    };
    global = makethis.call();
    global.setActiveMenu(5);
    onformsubmit = function() {
      var form, formdata, item, url, _i, _len, _ref;
      form = $(this);
      url = form.attr('action');
      formdata = {};
      _ref = form.serializeArray();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        formdata[item.name] = item.value;
      }
      $.post(url, formdata).success(function(data) {
        var el;
        el = null;
        if (data != null ? data.success : void 0) {
          el = $.el('div.alert.alert-success', {}, [
            $.el('a.close', {
              'data-dismiss': 'alert'
            }, ['x']), 'Saved!'
          ]);
        } else {
          el = $.el('div.alert.alert-error', {}, [
            $.el('a.close', {
              'data-dismiss': 'alert'
            }, ['x']), $.el('strong', {}, ['Error: ']), data != null ? data.error : void 0
          ]);
        }
        return $(form).find('.message').empty().append(el);
      });
      return false;
    };
    return $('form').on('submit', onformsubmit);
  });

}).call(this);
