jQuery ($) ->
  makethis = -> @
     
  global = makethis.call()
  global.setActiveMenu 5
  
  
  onformsubmit = ->
    form = $(@)
    url = form.attr 'action'    
    formdata = {}
    
    formdata[item.name] = item.value for item in form.serializeArray()
        
    $.post(url, formdata)
    .success (data) ->
      el = null
      if data?.success
        el = $.el('div.alert.alert-success', {}, [
          $.el('a.close', {'data-dismiss': 'alert'}, ['x']),
          'Saved!'
        ])
      else
        el = $.el('div.alert.alert-error', {}, [
          $.el('a.close', {'data-dismiss': 'alert'}, ['x']),
          $.el('strong', {}, ['Error: ']),
          data?.error
        ])
      $(form).find('.message').empty().append el
    
    false
  
  $('form').on 'submit', onformsubmit 
    
