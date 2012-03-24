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
