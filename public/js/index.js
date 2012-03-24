(function() {

  jQuery(function($) {
    var initialize;
    initialize = function() {
      var map, mapOptions;
      mapOptions = {
        center: new google.maps.LatLng(-34.397, 150.644),
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      return map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    };
    return initialize();
  });

}).call(this);
