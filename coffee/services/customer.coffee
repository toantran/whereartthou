repo = require '../repository/customers'


exports.add = (customer, callback = ->) ->
  console.assert customer, 'customer cannot be null or 0'  
  throw 'customer is null or empty' unless customer? 
  
  customer?.userid = new repo.ObjectId(customer?.userid) if customer?.userid? and typeof customer?.userid is 'string'
  
  try
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
            
          db = cursor.db
          callback.apply null, [toarrayerr, customers]
          cursor.close()
          db.close()
      else
        callback()
        
  catch e
    console.trace e
    callback e  
  
    
