(function() {

  jQuery(function($) {
    var buildDetailInfo, createMarker, displayCustomer, initialize, loadCustomers, popLatLong;
    buildDetailInfo = function(customer) {
      var contentString;
      return contentString = '<div class="alert alert-info">' + '<div>' + '<strong>Name: </strong>' + (customer != null ? customer.name : void 0) + '</div>' + '<div>' + '<strong>Contact: </strong>' + (customer != null ? customer.contact : void 0) + '</div>' + '<div>' + '<strong>Address: </strong>' + (customer != null ? customer.address : void 0) + '</div>' + '</div>';
    };
    popLatLong = function(customer, callback) {
      if (callback == null) callback = function() {};
      if ((customer != null ? customer.latlng : void 0) != null) {
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
          visible: true
        });
        contentString = buildDetailInfo(customer);
        return google.maps.event.addListener(marker, 'click', function(e) {
          var _ref, _ref2;
          if ((_ref = _this.infoWindow) != null) _ref.close();
          if ((_ref2 = _this.infoWindow) != null) _ref2.setContent(contentString);
          return _this.infoWindow.open(map, marker);
        });
      }
    };
    displayCustomer = function(customer) {
      return popLatLong(customer, function(cust) {
        var marker;
        return marker = createMarker(cust, this.map);
      });
    };
    loadCustomers = function() {
      return $.get('customers').success(function(data) {
        var customer, _i, _len, _ref, _results;
        if (data != null ? data.success : void 0) {
          _ref = data != null ? data.customers : void 0;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            customer = _ref[_i];
            _results.push(displayCustomer(customer));
          }
          return _results;
        }
      });
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
      this.infoWindow = new google.maps.InfoWindow();
      return google.maps.event.addListener(this.map, 'tilesloaded', loadCustomers);
    };
    return initialize();
  });

}).call(this);
