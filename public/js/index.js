(function() {

  jQuery(function($) {
    var buildDetailInfo, clearGrid, clearMarkers, createMarker, displayCustomer, displayCustomers, getCustomerList, highlightCustomerLocation, initialize, loadCustomers, loadDefaultLocation, onMapLoad, onclientrowclick, onsearchclick, popLatLong, showInGrid;
    buildDetailInfo = function(customer) {
      var contentString;
      return contentString = '<div class="alert alert-info">' + '<div>' + '<strong>Name: </strong>' + (customer != null ? customer.name : void 0) + '</div>' + '<div>' + '<strong>Contact: </strong>' + (customer != null ? customer.contact : void 0) + '</div>' + '<div>' + '<strong>Address: </strong>' + (customer != null ? customer.address : void 0) + '</div>' + '</div>';
    };
    popLatLong = function(customer, callback) {
      var _ref, _ref2;
      if (callback == null) callback = function() {};
      if ((customer != null ? customer.latlng : void 0) != null) {
        return callback(customer);
      } else if ((customer != null ? customer.location : void 0) != null) {
        customer.latlng = new google.maps.LatLng(customer != null ? (_ref = customer.location) != null ? _ref.lat : void 0 : void 0, customer != null ? (_ref2 = customer.location) != null ? _ref2.lng : void 0 : void 0, true);
        return callback(customer);
      } else if (((customer != null ? customer.lat : void 0) != null) && ((customer != null ? customer.lng : void 0) != null)) {
        customer.latlng = new google.maps.LatLng(customer != null ? customer.lat : void 0, customer != null ? customer.lng : void 0, true);
        return callback(customer);
      } else {
        return this.geo.geocode({
          address: customer != null ? customer.address : void 0
        }, function(results, status) {
          if (status === google.maps.GeocoderStatus.OK) {
            if (customer != null) customer.latlng = results[0].geometry.location;
          }
          return callback(customer);
        });
      }
    };
    createMarker = function(customer, map) {
      var contentString, marker,
        _this = this;
      if ((customer != null ? customer.latlng : void 0) != null) {
        marker = new google.maps.Marker({
          map: map,
          position: customer != null ? customer.latlng : void 0,
          title: customer.name,
          visible: true,
          icon: this.icon
        });
        contentString = buildDetailInfo(customer);
        google.maps.event.addListener(marker, 'click', function(e) {
          var _ref, _ref2;
          if ((_ref = _this.infoWindow) != null) _ref.close();
          if ((_ref2 = _this.infoWindow) != null) _ref2.setContent(contentString);
          return _this.infoWindow.open(map, marker);
        });
        return marker;
      }
    };
    showInGrid = function(customer) {
      var el;
      el = $.el('tr.client-row', {
        customerid: customer._id
      }, [$.el('td', {}, [$.el('div.client-name', {}, [customer != null ? customer.name : void 0]), $.el('div.client-address', {}, [customer != null ? customer.address : void 0])])]);
      return $('.clientlist-container tbody').append(el);
    };
    displayCustomer = function(customer) {
      var _this = this;
      return popLatLong(customer, function(cust) {
        var marker;
        marker = createMarker(cust, _this.map);
        if (cust != null) cust.marker = marker;
        return showInGrid(cust);
      });
    };
    displayCustomers = function(customers) {
      var customer, _i, _len, _results;
      clearMarkers();
      clearGrid();
      if (customers != null ? customers.length : void 0) {
        _results = [];
        for (_i = 0, _len = customers.length; _i < _len; _i++) {
          customer = customers[_i];
          _results.push(displayCustomer(customer));
        }
        return _results;
      }
    };
    clearMarkers = function() {
      var customer, _i, _len, _ref, _ref2, _results;
      if ((_ref = this.customers) != null ? _ref.length : void 0) {
        _ref2 = this.customers;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          customer = _ref2[_i];
          _results.push((function(customer) {
            if (customer != null ? customer.marker : void 0) {
              return customer != null ? customer.marker.setMap(null) : void 0;
            }
          })(customer));
        }
        return _results;
      }
    };
    clearGrid = function() {
      return $('.clientlist-container tbody').empty();
    };
    loadCustomers = function() {
      var _this = this;
      return $.get('customers').success(function(data) {
        if (data != null ? data.success : void 0) {
          _this.customers = data != null ? data.customers : void 0;
          return displayCustomers(_this.customers);
        }
      });
    };
    loadDefaultLocation = function() {
      var _this = this;
      return $.get('/defloc').success(function(data) {
        var loc, _ref, _ref2;
        if ((data != null ? data.success : void 0) && (data != null ? data.location : void 0)) {
          loc = new google.maps.LatLng(data != null ? (_ref = data.location) != null ? _ref.lat : void 0 : void 0, data != null ? (_ref2 = data.location) != null ? _ref2.lng : void 0 : void 0);
          return _this.map.setCenter(loc);
        }
      });
    };
    onMapLoad = function() {
      loadDefaultLocation();
      return loadCustomers();
    };
    initialize = function() {
      var mapOptions;
      mapOptions = {
        center: new google.maps.LatLng(10.80800, 106.67268),
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      this.map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
      this.geo = new google.maps.Geocoder();
      this.icon = new google.maps.MarkerImage('/images/mapslt.png', new google.maps.Size(9, 9), new google.maps.Point(138, 227));
      this.hlicon = new google.maps.MarkerImage('/images/m3.png');
      this.infoWindow = new google.maps.InfoWindow();
      loadDefaultLocation();
      return loadCustomers();
    };
    initialize();
    highlightCustomerLocation = function(id) {
      var customer, icon, map, _i, _len, _ref, _ref2, _results,
        _this = this;
      icon = this.icon;
      map = this.map;
      if ((_ref = this.customers) != null ? _ref.length : void 0) {
        _ref2 = this.customers;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          customer = _ref2[_i];
          if (customer._id === id) {
            _results.push((function(customer) {
              var marker;
              marker = customer != null ? customer.marker : void 0;
              if (marker != null) {
                return map.setCenter(marker.getPosition());
                /*
                            window.setTimeout =>
                              console.log icon
                              marker.setIcon icon
                              marker.setVisible true
                            , 1000
                */
              }
            })(customer));
          }
        }
        return _results;
      }
    };
    onclientrowclick = function(e) {
      var customerid;
      customerid = $(e.target).closest('tr.client-row').attr('customerid');
      return highlightCustomerLocation(customerid);
    };
    getCustomerList = function() {
      return this.customers;
    };
    onsearchclick = function(e) {
      var currCustomers, customer, matchCustomers, patt, val;
      val = $('input#search_input').val();
      if (val) {
        patt = new RegExp(val, 'i');
        currCustomers = getCustomerList();
        matchCustomers = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = currCustomers.length; _i < _len; _i++) {
            customer = currCustomers[_i];
            if (patt.test(customer.name) || patt.test(customer.address) || patt.test(customer.contact)) {
              _results.push(customer);
            }
          }
          return _results;
        })();
        if (matchCustomers != null ? matchCustomers.length : void 0) {
          return displayCustomers(matchCustomers);
        } else {
          return displayCustomers([]);
        }
      } else {
        return displayCustomers(getCustomerList());
      }
    };
    $('.clientlist-container').on('click', onclientrowclick);
    $('.search-bar button').on('click', onsearchclick);
    return $('input#search_input').keypress(function(e) {
      if (e.which === 13) {
        e.preventDefault();
        return onsearchclick();
      }
    });
  });

}).call(this);
