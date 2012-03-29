jQuery ($) ->
  makethis = -> @
    
  global = makethis.call()
  global.setActiveMenu 1
  
  formsubmit = ->
    formdata = {}
    form = $(@)
    
    for item in $(@).serializeArray()
      do (item) ->
        formdata[item.name] = item.value
    
    $.post('customeradd', formdata)
    .success (data) ->
      if data?.success
        el = $.el('tr', {}, [
          $.el('td', {}, [ $.el('div.label.label-success', {}, ['new']) ]),
          $.el('td', {}, [ data?.customer?.name]),
          $.el('td', {}, [ data?.customer?.contact]),
          $.el('td', {}, [ data?.customer?.address]),
          $.el('td', {}, ['']),
          $.el('td', {}, [''])
        ])
        
        $('tbody#customer-list').prepend el
        
        $('form#customer-form input').val ''
    
    return false
  
  $('form#customer-form').on 'submit', formsubmit
  
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
    
    
    
    
    
