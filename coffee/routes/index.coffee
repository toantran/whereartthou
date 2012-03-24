

###
  GET
  URL  /account/login
###
exports.login = (req, res, next) -> 
  res.render 'login', 
    username: req.session?.username ? ''
    password: req.session?.password ? ''
    layout: true
    title: 'Where Art Thou - Log In'
  
  delete req.session.username
  delete req.session.password  


###
  GET, POST
  URL  /account/logout
###
exports.logout = (req, res, next) ->
  # destroy the user's session to log them out
  # will be re-created next request
  req.session.destroy ->
    res.redirect '/'


###
  POST 
  URL /account/login
###
exports.authenticate = (req, res, next) ->  
  req.session.username = username = req.param 'username', ''
  req.session.password = password = req.param 'password', ''
  returnUrl = req.param 'returnurl', '/account/profile'

  if not username
    req.flash 'error', 'Enter Email'
    res.redirect 'back'
  else
    userSvc = require '../services/user'
    userSvc.authenticate username, password, (error, authenticated, user) ->
      if error
        req.flash 'error', error
        res.redirect 'back'
      else if authenticated
        # Regenerate session when signing in
        # to prevent fixation 
        req.session?.regenerate ->
          # Store the user's primary key 
          # in the session store to be retrieved,
          # or in this case the entire user object
          req.session.user = user
          
          # return to the original url or home page   
          res.redirect returnUrl
      else 
        req.flash 'error', 'That Aint Your Password, Homeboy!'
        res.redirect 'back'



###
  GET home page.
###

exports.index = (req, res) ->
  res.render 'index', 
    title: 'Where Art Thou'

