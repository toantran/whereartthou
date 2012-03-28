crypto = require 'crypto'
newUserRepo = require '../repository/users2'
utils = require './utils'

hash = (msg, key) ->
  crypto.createHmac( 'sha256', key)
  .update(msg)
  .digest('hex')


createEmailContent = (tpl, data) ->
  jade = require 'jade'
  fs = require 'fs'
  path = "#{__dirname}/../views/emails/#{tpl}.jade"
  str = fs.readFileSync(path, 'utf8')
  fn = jade.compile str, 
    filename: path
    pretty: true  
  fn data
  

exports.notifyChallenge = (userid, data, callback = ->) ->
  console.assert userid, 'userid cannot be null or 0'  
  throw 'userid is null or empty' unless userid?
  
  try
    utils.execute( newUserRepo.getById,  userid )
    .then (err, user, cb = ->) ->
      return callback(err) if err
      
      emailSvc = require './email'
      
      if user?.username
        data.tpl = 'challenge'
        data.to = user?.username
        data.playername = user?.nickname
        data.subject = 'You have been challenged'
        data.html = createEmailContent 'challenged', data
        emailSvc.sendmail data
      else
        cb()
    .then (err, recs, cb = ->) ->
      callback()
      
  catch e
    console.trace e
    callback e  


###
Authenticate a user login
###
exports.authenticate = (username, password, callback) ->
  console.assert username, 'username cannot be null or empty'
  throw 'username is null or empty' unless username?
  
  encryptedPassword = hash password, 'a little dog'
  newUserRepo.getByUsername username, (error, user) ->
    if error
      callback error
    else if not user?
      callback 'User not found'
    else if encryptedPassword is user.password
      callback null, true, user
    else 
      callback null, false
        


###
LOAD a user document by Id
###
exports.getById = (userid, callback = ->) ->
  console.assert userid, 'userid cannot be null or 0'  
  throw 'userid is null or empty' unless userid?
  
  try
    newUserRepo.getById userid, callback
  catch e
    console.trace e
    callback e 

  
  
###
Update player's picture
###
exports.updatePicture = (userid, pictureurl, callback = ->) ->
  console.assert userid, 'userid cannot be null or 0'  
  throw 'userid is null or empty' unless userid?

  userid = new newUserRepo.ObjectId( userid ) if typeof userid is 'string'
  findObj = _id : userid
  updateObj = 
    $set: 
      pictureurl: pictureurl
      updatedat: new Date()
  
  try
    newUserRepo.update findObj, updateObj, {}, callback  
  catch e
    console.trace e
    callback e
    
    

exports.updateLocation = updateLocation = (user, callback = ->) ->
  console.assert user, 'user cannot be null'  
  throw 'user cannot be null' unless user?
  console.assert user?.address, 'address cannot be empty'
  
  geocoder = require 'geocoder'
  geocoder.geocode user?.address, (err, data) ->
    if data?.status is 'OK'
      user.location = data?.results?[0]?.geometry?.location
      newUserRepo.update {_id: user?._id}, {$set: {location: user.location}}, {}, callback
    else
      callback err    
  

    
exports.insert = (user, callback = ->) ->
  console.assert user, 'user cannot be null'  
  throw 'user cannot be null' unless user?
  console.assert user?.password is user?.passwordconfirm, 'Password do not match'
  throw 'Passwords do not match' unless user?.password is user?.passwordconfirm
  console.assert user?.username, 'Email address cannot be null or empty'
  throw 'Email address cannot be null or empty' unless user?.username
  console.assert user?.password, 'Password cannot be null or empty'
  throw 'Password cannot be null or empty' unless user?.password
    
  utils.execute(newUserRepo.getByUsername, user.username)
  .then (err, existingUser, cb = ->) ->
    if err?
      callback err
    else if existingUser?
      callback 'You Chose an Email Address That is Already Registered, You Hacker!'
    else
      user.createdat = new Date()
      user.pictureurl ?= '/images/player.jpg'
      user.password = hash user.password, 'a little dog'
      try 
        newUserRepo.create user, cb
      catch e
        console.trace e
        callback e
  .then (err, newUsers, cb = ->) =>
    @addedUser = newUsers?[0]
    if @addedUser?.address and not @addedUser?.location
      updateLocation @addedUser, cb
    else
      callback err, @addedUser
  .then (err, updatedUser, cb = ->) =>
    callback err, @addedUser
  
    
exports.getAllPlayers = (callback = ->) -> 
  query = {}
  try
    newUserRepo.read query, (readErr, cursor) ->
      if readErr?
        callback readErr
      else if cursor?
        cursor.toArray ->           
          db = cursor.db
          callback.apply null, arguments
          cursor.close()

      else
        callback()
        
  catch e
    console.log e
    throw e
    
    
exports.createResetPasswordToken = (username, callback = ->) ->
  console.assert username, 'username cannot be null'
  throw 'username cannot be null' unless username
  
  token = hash( '' + Math.floor( Math.random() * 100001), 'a little dog')
  
  utils.execute(newUserRepo.getByUsername, username)
  .then (err, @existingUser, cb) =>
    if err?
      callback err
    else if existingUser?
      findObj = _id : existingUser._id
      updateObj = 
        $set: 
          resettoken: token
          
      newUserRepo.update findObj, updateObj, {}, cb
    else
      callback 'Account not found'
  .then (err, updatedUser, cb) =>
    
    callback err, token, @existingUser
  
    
exports.getUserByToken = (token, callback = ->) ->
  console.assert token, 'token cannot be null'
  throw 'token cannot be null' unless token
  
  findObj = resettoken: token
  
  utils.execute(newUserRepo.read, findObj)
  .then (err, cursor, cb = ->) ->
    if err
      callback err
    else
      cursor.toArray ->           
        db = cursor.db
        callback.apply null, arguments
        cursor.close()

  .then (err, users, cb = ->) ->
    if err
      callback err
    else if users?.length is 0
      callback 'Token not found.'
    else
      callback err, users[0]
    cb()

    
exports.setPassword = (userid, password, callback = ->) ->
  console.assert userid, 'userid cannot be null'
  throw 'userid cannot be null' unless userid? and userid
  
  userid = new newUserRepo.ObjectId( userid ) if typeof userid is 'string'
  encryptedPassword = hash password, 'a little dog'
  
  findObj = _id : userid
  updateObj = 
    $set: 
      password: encryptedPassword
      updatedat: new Date()
  
  try
    newUserRepo.update findObj, updateObj, {}, callback  
  catch e
    console.trace e
    callback e  
    
    
exports.assignTeam = (userid, team, callback = ->) ->
  console.assert userid, 'userid cannot be null'
  throw 'userid cannot be null' unless userid? and userid
  console.assert team, 'team cannot be null'
  throw 'team cannot be null' unless team?
  
  userid = new newUserRepo.ObjectId( userid ) if typeof userid is 'string'
  
  findObj = _id : userid
  updateObj = 
    $set:
      team: team
      updatedat: new Date()
    
  try
    newUserRepo.update findObj, updateObj, {}, callback  
  catch e
    console.trace e
    callback e      

    
    
    
    
    
