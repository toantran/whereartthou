repo = require '../repository/customers'


exports.remove = (id, callback = ->) ->
  console.assert id, 'customerid cannot be null or 0'  
  throw 'customerid is null or empty' unless id?
  
  id = new repo.ObjectId(id) if typeof id is 'string'
  
  try
    repo.remove {_id: id}, callback
  catch e
    console.trace e
    callback e
    

exports.setDefVal = (userid, setdata, callback = ->) ->
  console.assert userid, 'userid cannot be null or 0'  
  throw 'userid is null or empty' unless userid?
  
  setdata ?= {}
  setdata.updatedat = new Date()
  
  userid = new repo.ObjectId(userid) if typeof userid is 'string'
  findObj = 
    userid: userid
  updateObj =
    $set: setdata
  try
    repo.update findObj, updateObj, {multi: true}, callback        
  catch e
    console.trace e
    callback e  


exports.add = (customer, callback = ->) ->
  console.assert customer, 'customer cannot be null or 0'  
  throw 'customer is null or empty' unless customer? 
  
  customer?.userid = new repo.ObjectId(customer?.userid) if customer?.userid? and typeof customer?.userid is 'string'
  
  try
    if customer?.address
      geocoder = require 'geocoder'
      geocoder.geocode customer?.address, (err, data) ->
        if data?.status is 'OK'
          customer.location = data?.results?[0]?.geometry?.location
        repo.create customer, (err, addedcustomers) ->    
          callback err, addedcustomers?[0]
    else
      repo.create customer, (err, addedcustomers) ->    
        callback err, addedcustomers?[0]
  catch e
    console.trace e
    throw e


exports.getById = (id, callback = ->)  ->
  console.assert id, 'customer id cannot be null or 0'  
  throw 'customer id is null or empty' unless id?
  
  try
    repo.getById id, callback
  catch e
    console.trace e
    throw e  
    
    
exports.getAll = (userid, filter, callback = ->) ->
  console.assert userid, 'userid cannot be null or 0'  
  throw 'userid is null or empty' unless userid?
  
  userid = new repo.ObjectId(userid) if typeof userid is 'string'
  
  try
    repo.read {userid: userid}, (readerr, cursor) ->
      return callback(readerr) if readerr
        
      if cursor?
        cursor.toArray (toarrayerr, customers)->           
          
          customers?.sort (c1, c2) ->
            if c1?.name < c2?.name then -1 else 1
            
          callback.apply null, [toarrayerr, customers]
          cursor.close()
      else
        callback()
        
  catch e
    console.trace e
    callback e  
  
    
