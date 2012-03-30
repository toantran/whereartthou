jQuery ($) ->
  makethis = -> @
    
  global = makethis.call()
  global.setActiveMenu 1
  
  customerformsubmit = ->
    formdata = {}
    form = $(@)
    
    for item in $(@).serializeArray()
      do (item) ->
        formdata[item.name] = item.value
    
    $.post('customeradd', formdata)
    .success (data) ->
      if data?.success
        cols = ( $.el( 'td', {}, [data?.customer[key]] ) for key, value of window.schema )
        el = $.el('tr', {'data-customerid': data?.customer?._id}, [
          $.el('td', {}, [ $.el('div.label.label-success', {}, ['new']) ]),
          cols,
          $.el('td', {}, [''])
        ])
        
        $('tbody#customer-list').prepend el
        
        $('form#customer-form input').val ''
    
    return false
  
  $('form#customer-form').on 'submit', customerformsubmit
  
  $(':file').change ->
    file = @files?[0]
    {name, size, type} = file
    if type isnt 'text/csv' 
      alert 'Invalid file'
      
  
  progressHandlingFunction = (e)->
    if e.lengthComputable
      $('progress').attr
        value: e.loaded
        max: e.total
      
  $('#upload-data-form input[type="submit"]').on 'click', ->
    formdata = new FormData($('form#upload-data-form'))
    $.ajax
      url: '/upload'
      type: 'POST'
      xhr: ->
        myXhr = $.ajaxSettings.xhr();
        if myXhr.upload
          myXhr.upload.addEventListener 'progress', progressHandlingFunction, false
        myXhr
      success: (data)->
        console.log data
      data: formdata
      cache: false
      contentType: false
      processData: false
    false
    
    
  $('form#newcolumn-form').on 'submit', ->
    formdata = {}
    form = $(@)
    
    for item in $(@).serializeArray()
      do (item) ->
        formdata[item.name] = item.value
  
    $.post('/addcolumn', formdata)
    .success (data) ->
      if data?.success
        window.location.href = window.location.href
      else
        $(form).find('.error-msg').val data?.error
        $(form).find('.error-msg').alert()
    .error ->
      
    false
    
    
  removeCustomer = (id, callback = ->) ->
    $.ajax '/customerremove',
      type: 'DELETE'
      data: 
        id: id
      success: (data) ->
        callback null
      error: ->
        callback 'error'
      
    
  
  $('#customer-list').on 'click', (e)->
    target = $(e.target).closest('.customer-remove')
    if target
      e.stopPropagation()
      id =$(target).closest('tr').attr 'data-customerid'
      removeCustomer id, (err) ->
        if not err
          $(target).closest('tr').remove()
    
    
