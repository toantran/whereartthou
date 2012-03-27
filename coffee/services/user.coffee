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
###
exports.getrecords = (userid, callback = ->) ->
  console.assert userid, 'userid cannot be null or 0'  
  throw 'userid is null or empty' unless userid?
  
  try
    utils.execute( newUserRepo.getById,  userid )
    .then (err, user, cb = ->) ->
      return callback(err) if err
      
      if user?.records?.length
        teamsvc = require './team'
        utils.mapAsync user?.records, (rec, iteratorcb = ->) ->
            rec?.result = if rec?.data?.result is 'win' then 'W' else 'L'
            rec?.teamid = rec?.data?.opponentid
            teamsvc.getById rec?.data?.opponentid, (getteamerr, team) ->
              rec?.teamname = team?.teamname
              iteratorcb getteamerr, rec
          , cb
      else
        cb()
    .then (err, recs, cb = ->) ->
      callback err, recs
      
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
Update player's stats
###
exports.resetStats = (userid, callback = ->) ->
  console.assert userid, 'userid cannot be null or 0'  
  throw 'userid is null or empty' unless userid?
  
  userid = new newUserRepo.ObjectId( userid ) if typeof userid is 'string'
  findObj = _id : userid
  updateObj = 
    $unset: 
      stats: 1
      records: 1
    
  try
    newUserRepo.update findObj, updateObj, {}, callback
  catch e
    console.trace e
    callback e
    
    
###
Update player's stats
###
exports.updateStats = (userid, opponentid, win, callback = ->) ->
  console.assert userid, 'userid cannot be null or 0'  
  throw 'userid is null or empty' unless userid?
  
  userid = new newUserRepo.ObjectId( userid ) if typeof userid is 'string'
  opponentid = String opponentid if typeof opponentid isnt 'string'
  findObj = _id : userid
  incObj = if win then {'stats.win':1} else {'stats.loss': 1}
  statLog = 
    id: new newUserRepo.ObjectId()
    type: 'matchresult'
    data: 
      opponentid: opponentid
      result: if win then 'win' else 'lose'
    createdat: new Date()  
  updateObj = 
    $inc: incObj
    $set: 
      updatedat: new Date()
    $addToSet: 
      posts: statLog
      records: statLog
    
  try
    newUserRepo.update findObj, updateObj, {}, callback
  catch e
    console.trace e
    callback e
  

###
Update player's stats.  Silently
###
exports.updateStatsSilent = (userid, opponentid, win, callback = ->) ->
  console.assert userid, 'userid cannot be null or 0'  
  throw 'userid is null or empty' unless userid?
  
  userid = new newUserRepo.ObjectId( userid ) if typeof userid is 'string'
  opponentid = String opponentid if typeof opponentid isnt 'string'
  findObj = _id : userid
  incObj = if win then {'stats.win':1} else {'stats.loss': 1}
  statLog = 
    id: new newUserRepo.ObjectId()
    type: 'matchresult'
    data: 
      opponentid: opponentid
      result: if win then 'win' else 'lose'
    createdat: new Date()  
  updateObj = 
    $inc: incObj
    $addToSet: 
      records: statLog
    
  try
    newUserRepo.update findObj, updateObj, {}, callback
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
    
    

###
Add a vote record into player's record
###
exports.addVote = (userid, vote, callback = ->) ->
  console.assert userid, 'userid cannot be null or 0'  
  throw 'userid is null or empty' unless userid?
  
  userid = new newUserRepo.ObjectId( userid ) if typeof userid is 'string'
  findObj = _id : userid
  logObj = 
    type: 'matchresult'
    data: 
      matchid: vote.matchid
      teamid: vote.teamid
    createdat: new Date()
  updateObj = 
    $set: 
      updatedat: new Date()
    $addToSet:
      votes: vote
      logs: logObj
  
  try
    newUserRepo.update findObj, updateObj, {}, callback  
  catch e
    console.trace e
    callback e
        

###
Set a team to a player
###    
exports.setTeam = (userid, team, callback = ->) ->
  console.assert userid, 'userid cannot be null or 0'  
  throw 'userid is null or empty' unless userid?
  
  userid = new newUserRepo.ObjectId( userid ) if typeof userid is 'string'
  findObj = _id : userid
  post =
    id: new newUserRepo.ObjectId() 
    type: 'jointeam'
    data: 
      teamid: String(team._id)
    createdat: new Date()
  updateObj = 
    $set: 
      team: team
      updatedat: new Date()
    $unset:
      invites: 1
    $addToSet:
      posts: post  
  
  try
    newUserRepo.update findObj, updateObj, {}, callback  
  catch e
    console.trace e
    callback e
        

###
Add a post record into player's record
###            
exports.addPost = (userid, post, callback= ->) ->
  console.assert userid, 'userid cannot be null or 0'  
  throw 'userid is null or empty' unless userid?
  
  userid = new newUserRepo.ObjectId( userid ) if typeof userid is 'string'
  
  findObj = _id : userid
  post or= {}
  post.createdat = new Date()
  post.id = new newUserRepo.ObjectId()
  updateObj = 
    $set: 
      updatedat: new Date()
    $addToSet:
      posts: post    
  
  try
    newUserRepo.update findObj, updateObj, {}, callback  
  catch e
    console.trace e
    callback e
    

###
Remove a post from player's record
###    
exports.removePost = (userid, postid, callback = ->) ->
  console.assert userid, 'userid cannot be null or 0'  
  throw 'userid is null or empty' unless userid?
  console.assert postid, 'postid cannot be null or 0'  
  throw 'postid is null or empty' unless postid?
  
  userid = new newUserRepo.ObjectId( userid ) if typeof userid is 'string'
  postid = new newUserRepo.ObjectId( postid ) if typeof postid is 'string'
  findObj = _id : userid
  updateObj = 
    $set: 
      updatedat: new Date()
    $pull: 
      posts: 
        id: postid
  
  try
    newUserRepo.update findObj, updateObj, {}, callback  
  catch e
    console.trace e
    callback e
    

###
Add a comment record into player's record
###    
exports.addComment = (userid, postid, data, callback = ->) ->
  console.assert userid, 'userid cannot be null or 0'  
  throw 'userid is null or empty' unless userid?
  console.assert postid, 'postid cannot be null or 0'  
  throw 'postid is null or empty' unless postid?
  
  userid = new newUserRepo.ObjectId( userid ) if typeof userid is 'string'
  postid = new newUserRepo.ObjectId( postid ) if typeof postid is 'string'
  
  data or= {}
  data.id = new newUserRepo.ObjectId()
  data.createdat = new Date()
  
  findObj = _id : userid  
  
  try
    newUserRepo.getById userid, (getErr, user) ->
      return callback( getErr ) if getErr?
      for post in user?.posts when post?.id?.equals( postid )
        do (post) ->
          post.comments or= []
          post.comments.push data     
          updateObj = 
            $set:
              posts: user?.posts
              updatedat: new Date()
          newUserRepo.update findObj, updateObj, {}, callback
  catch e
    console.trace e
    callback e


###
Remove a comment
###
exports.removeComment = (userid, postid, commentid, callback = ->) ->
  console.assert userid, 'userid cannot be null or 0'  
  throw 'userid is null or empty' unless userid?
  console.assert postid, 'postid cannot be null or 0'  
  throw 'postid is null or empty' unless postid?
  console.assert commentid, 'commentid cannot be null or 0'  
  throw 'commentid is null or empty' unless commentid?

  userid = new newUserRepo.ObjectId( userid ) if typeof userid is 'string'
  postid = new newUserRepo.ObjectId( postid ) if typeof postid is 'string'
  commentid = new newUserRepo.ObjectId( commentid ) if typeof commentid is 'string'
  
  findObj = _id : userid
  
  try
    newUserRepo.getById userid, (getErr, user) ->
      return callback( getErr ) if getErr?
      for post in user?.posts when post?.id?.equals( postid )
        do (post) ->
          for comment, index in post?.comments
            do (comment, index) ->
              if comment?.id?.equals(commentid)
                post?.comments.splice index, 1
          updateObj = 
            $set:
              posts: user?.posts
              updatedat: new Date()
          newUserRepo.update findObj, updateObj, {}, callback
  catch e
    console.trace e
    callback e

###
Add a vote record into player's record
###        
exports.addTeamInvite = (userid, teamid, callback = ->) ->
  console.assert userid, 'userid cannot be null or 0'  
  throw 'userid is null or empty' unless userid?
  console.assert teamid, 'teamid cannot be null or 0'  
  throw 'teamid is null or empty' unless teamid?
  
  userid = new newUserRepo.ObjectId( userid ) if typeof userid is 'string'
  teamid = new newUserRepo.ObjectId( teamid ) if typeof teamid is 'string'
  
  findObj = _id : userid
  invite = 
    teamid: teamid
  invitedPost = 
    id: new newUserRepo.ObjectId()
    type: 'invite'
    data: 
      teamid: teamid
    createdat: new Date()
  updateObj = 
    $set: 
      updatedat: new Date()
    $addToSet:
      invites: invite
      posts: invitedPost  
  
  try
    newUserRepo.update findObj, updateObj, {}, callback       
  catch e
    console.trace e
    callback e
  
  
exports.sortingPlayers = (player1, player2) ->
  win1 = player1?.stats?.win ? 0
  loss1 = player1?.stats?.loss ? 0
  total1 = win1 + loss1
  avg1 = if total1 then (win1 / total1) else 0
  win2 = player2?.stats?.win ? 0
  loss2 = player2?.stats?.loss ? 0
  total2 = win2 + loss2
  avg2 = if total2 then (win2 / total2) else 0
    
  if avg1 isnt avg2
    -avg1 + avg2
  else if win1 isnt win2
    -win1 + win2
  else
    loss1 - loss2
    
    
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
  .then (err, existingUser, cb) ->
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
  .then (err, newUsers, cb) ->
    callback err, newUsers?[0]
  
    
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
          db.close()

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
        db.close()

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

    
    
    
    
    
