jQuery ($) ->
  makethis = -> @
    
  global = makethis.call()
  global.setActiveMenu 1
  
  formsubmit = ->
    formdata = {}
    
    for item in $(@).serializeArray()
      do (item) ->
        formdata[item.name] = item.value
    
    $.post('customeradd', formdata)
    .success (data) ->
      if data?.success
        console.log 'OK'
    
    return false
  
  $('form#customer-form').on 'submit', formsubmit
