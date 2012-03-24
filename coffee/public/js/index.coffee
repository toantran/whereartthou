jQuery ($) ->
  initialize = ->
    mapOptions = 
      center: new google.maps.LatLng(-34.397, 150.644)
      zoom: 16
      mapTypeId: google.maps.MapTypeId.ROADMAP
      
    map = new google.maps.Map( document.getElementById("map_canvas"), mapOptions )
    
  initialize()
