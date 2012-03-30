(function() {

  jQuery(function($) {
    var customerformsubmit, global, makethis, progressHandlingFunction, removeCustomer;
    makethis = function() {
      return this;
    };
    global = makethis.call();
    global.setActiveMenu(1);
    customerformsubmit = function() {
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
        var cols, el, key, value, _ref2;
        if (data != null ? data.success : void 0) {
          cols = (function() {
            var _ref2, _results;
            _ref2 = window.schema;
            _results = [];
            for (key in _ref2) {
              value = _ref2[key];
              _results.push($.el('td', {}, [data != null ? data.customer[key] : void 0]));
            }
            return _results;
          })();
          el = $.el('tr', {
            'data-customerid': data != null ? (_ref2 = data.customer) != null ? _ref2._id : void 0 : void 0
          }, [$.el('td', {}, [$.el('div.label.label-success', {}, ['new'])]), cols, $.el('td', {}, [''])]);
          $('tbody#customer-list').prepend(el);
          return $('form#customer-form input').val('');
        }
      });
      return false;
    };
    $('form#customer-form').on('submit', customerformsubmit);
    $(':file').change(function() {
      var file, name, size, type, _ref;
      file = (_ref = this.files) != null ? _ref[0] : void 0;
      name = file.name, size = file.size, type = file.type;
      if (type !== 'text/csv') return alert('Invalid file');
    });
    progressHandlingFunction = function(e) {
      if (e.lengthComputable) {
        return $('progress').attr({
          value: e.loaded,
          max: e.total
        });
      }
    };
    $('#upload-data-form input[type="submit"]').on('click', function() {
      var formdata;
      formdata = new FormData($('form#upload-data-form'));
      $.ajax({
        url: '/upload',
        type: 'POST',
        xhr: function() {
          var myXhr;
          myXhr = $.ajaxSettings.xhr();
          if (myXhr.upload) {
            myXhr.upload.addEventListener('progress', progressHandlingFunction, false);
          }
          return myXhr;
        },
        success: function(data) {
          return console.log(data);
        },
        data: formdata,
        cache: false,
        contentType: false,
        processData: false
      });
      return false;
    });
    $('form#newcolumn-form').on('submit', function() {
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
      $.post('/addcolumn', formdata).success(function(data) {
        if (data != null ? data.success : void 0) {
          return window.location.href = window.location.href;
        } else {
          $(form).find('.error-msg').val(data != null ? data.error : void 0);
          return $(form).find('.error-msg').alert();
        }
      }).error(function() {});
      return false;
    });
    removeCustomer = function(id, callback) {
      if (callback == null) callback = function() {};
      return $.ajax('/customerremove', {
        type: 'DELETE',
        data: {
          id: id
        },
        success: function(data) {
          return callback(null);
        },
        error: function() {
          return callback('error');
        }
      });
    };
    return $('#customer-list').on('click', function(e) {
      var id, target;
      target = $(e.target).closest('.customer-remove');
      if (target) {
        e.stopPropagation();
        id = $(target).closest('tr').attr('data-customerid');
        return removeCustomer(id, function(err) {
          if (!err) return $(target).closest('tr').remove();
        });
      }
    });
  });

}).call(this);
