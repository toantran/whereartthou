jQuery ($) ->
  
  buildDetailInfo = (customer) ->
    contentString = '<div class="alert alert-info">' +
        '<div>' +
          '<strong>Name: </strong>' + customer?.name +
        '</div>' +
        '<div>' +
          '<strong>Contact: </strong>' + customer?.contact +
        '</div>' +
        '<div>' +
          '<strong>Address: </strong>' + customer?.address +
        '</div>' +
      '</div>'
    
  
  popLatLong = (customer, callback = ->) ->
    if customer?.latlng?
      callback customer
    else if customer?.lat? and customer?.lng?
      customer.latlng = new google.maps.LatLng(customer?.lat, customer?.lng, true)
      callback customer
    else
      
      @geo.geocode 
        address: customer?.address
      , (results, status) ->
        if status is google.maps.GeocoderStatus.OK
          customer?.latlng = results[0].geometry.location
        callback customer
    
  
  createMarker = (customer, map) ->
    if customer?.latlng?
      marker = new google.maps.Marker({map: map, position: customer?.latlng, title: customer.name, visible: true})
      
      contentString = buildDetailInfo customer
      
      google.maps.event.addListener marker, 'click', (e) =>
        @infoWindow?.close()
        @infoWindow?.setContent contentString
        @infoWindow.open map, marker
        
    
  
  displayCustomer = (customer) ->
    popLatLong customer, (cust) ->
      marker = createMarker cust, @map
            
  
    
  loadCustomers = ->
    $.get('customers')
    .success (data) ->
      
      if data?.success    
        displayCustomer customer for customer in data?.customers
  
  
  initialize = ->
    mapOptions = 
      center: new google.maps.LatLng(10.80800, 106.67268)
      zoom: 12
      mapTypeId: google.maps.MapTypeId.ROADMAP
      
    @map = new google.maps.Map( document.getElementById("map_canvas"), mapOptions )
    @geo = new google.maps.Geocoder()
    @infoWindow = new google.maps.InfoWindow()
    
    google.maps.event.addListener @map, 'tilesloaded', loadCustomers
    
  initialize()
