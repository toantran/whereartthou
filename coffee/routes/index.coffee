exports.accountadd = (req, res, next) ->
  res.render 'add',
    layout: true
    title: 'Where Art Thou - Sign Up'
    
    
exports.createaccount = (req, res, next) ->
  account = {}
  account.name = req.param 'companyname', ''
  account.username = req.param 'username', ''
  account.password = req.param 'password', ''
  account.passwordconfirm = req.param 'passwordconfirm' ,''

  userSvc = require '../services/user'
  try
    userSvc.insert account, (err, user) ->
      if err
          req.flash 'error', err
          res.redirect 'back'
        else 
          # Regenerate session when signing in
          # to prevent fixation 
          req.session?.regenerate ->
            # Store the user's primary key 
            # in the session store to be retrieved,
            # or in this case the entire user object
            req.session.user = user
            
            # return to the original url or home page   
            res.redirect '/'
  catch e
    console.trace e
    req.flash 'error', e
    res.redirect 'back'
    

exports.customeradd = (req, res, next) ->
  customersvc = require '../services/customer'
  
  customername = req.param 'customername', ''
  customercontact = req.param 'customercontact', ''
  customeraddress = req.param 'customeraddress', ''
  
  try
    customersvc.add {name:customername, contact: customercontact, address:customeraddress, userid: req.user._id}, (err, customer) ->
      res.send
        success: !!! (err)
        customer: customer
  catch e
    console.trace e
    next()


exports.data = (req, res, next) ->
  customersvc = require '../services/customer'
  
  try
    customersvc.getAll req.user._id, '', (err, customers) ->
      res.render 'data'
        title: 'Where Art Thou - Data'
        customers: customers
        layout: true
  catch e
    console.trace e
    next()
    
    

exports.customers = (req, res, next) ->
  filter = req.param 'filter', ''
  customersvc = require '../services/customer'
  
  try
    customersvc.getAll req.user._id, filter, (err, customers) ->      
      res.send
        success: !!! (err)
        customers: customers
  catch e
    console.trace e
    next()      


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
  returnUrl = req.param 'returnurl', '/'

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
    layout: true

