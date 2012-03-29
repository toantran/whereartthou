(function() {

  jQuery(function($) {
    var formsubmit, global, makethis, progressHandlingFunction;
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
    $('form#customer-form').on('submit', formsubmit);
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
    return $('#upload-data-form input[type="submit"]').on('click', function() {
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
  });

}).call(this);
