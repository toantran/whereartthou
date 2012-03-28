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
    else if customer?.location?
      customer.latlng = new google.maps.LatLng(customer?.location?.lat, customer?.location?.lng, true)
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
      marker = new google.maps.Marker({map: map, position: customer?.latlng, title: customer.name, visible: true, icon: @icon})
      
      contentString = buildDetailInfo customer
      
      google.maps.event.addListener marker, 'click', (e) =>
        @infoWindow?.close()
        @infoWindow?.setContent contentString
        @infoWindow.open map, marker
        
      return marker
        
  
  showInGrid = (customer) ->
    el = $.el('tr.client-row', {customerid: customer._id}, [
      $.el('td', {}, [
        $.el('div.client-name', {}, [customer?.name]),
        $.el('div.client-address', {}, [customer?.address])
      ])
    ])
    
    $('.clientlist-container tbody').append el
  
  
  displayCustomer = (customer) ->
    popLatLong customer, (cust) =>
      marker = createMarker cust, @map
      cust?.marker = marker      
      showInGrid cust
  
  
  displayCustomers = (customers) ->          
    displayCustomer customer for customer in customers if customers?.length
    
    
  clearMarkers = ->
    if @customers?.length
      for customer in @customers
        do (customer) ->
          if customer?.marker
            customer?.marker.setMap null
  
  
  clearGrid = ->
    $('.clientlist-container tbody').empty()
  
  loadCustomers = ->
    $.get('customers')
    .success (data) =>      
      if data?.success          
        clearMarkers()
        clearGrid()
        @customers = data?.customers                
        displayCustomers @customers
  
  
  loadDefaultLocation = ->
    $.get('/defloc')
    .success (data) =>
      if data?.success and data?.location
        loc = new google.maps.LatLng(data?.location?.lat, data?.location?.lng)
        @map.setCenter loc
  
  onMapLoad = ->
    loadDefaultLocation()
    loadCustomers()
  
  initialize = ->
    mapOptions = 
      center: new google.maps.LatLng(10.80800, 106.67268)
      zoom: 12
      mapTypeId: google.maps.MapTypeId.ROADMAP
      
    @map = new google.maps.Map( document.getElementById("map_canvas"), mapOptions )
    @geo = new google.maps.Geocoder()
    @icon = new google.maps.MarkerImage('/images/mapslt.png', new google.maps.Size(9,9), new google.maps.Point(138, 227))
    @hlicon = new google.maps.MarkerImage('/images/m3.png')        
    @infoWindow = new google.maps.InfoWindow()
    loadDefaultLocation()
    loadCustomers()
    #google.maps.event.addListener @map, 'tilesloaded', onMapLoad
    
  initialize()
  
  
  highlightCustomerLocation= (id) ->
    icon = @icon
    map = @map
    if @customers?.length
      for customer in @customers when customer._id is id
        do (customer) =>
          marker = customer?.marker
          if marker?
            #marker.setIcon @hlicon
            map.setCenter marker.getPosition()
            ###
            window.setTimeout =>
              console.log icon
              marker.setIcon icon
              marker.setVisible true
            , 1000
            ###
          
  
  onclientrowclick = (e) ->
    customerid = $(e.target).closest('tr.client-row').attr('customerid')
    
    highlightCustomerLocation customerid
  
  
  $('.clientlist-container').on 'click', onclientrowclick
