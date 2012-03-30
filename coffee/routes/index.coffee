

exports.addcolumn = (req, res, next) ->
  fieldname = req.param 'fieldname', ''
  fielddef = req.param 'fielddef', ''
  
  if fieldname 
    schema = req.user?.dataschema ? {name: 1, contact: 1, address: 1}
    schema[fieldname] = 1
    user = req.user
    user.dataschema = schema
    
    userSvc = require '../services/user'
    try
      userSvc.setSchema req.user._id, schema, (err, saveduser) ->
        req.session?.regenerate ->
          req.session.user = user
          
          if fielddef
            customersvc = require '../services/customer'
            obj = {}
            obj[fieldname] = fielddef
            customersvc.setDefVal user._id, obj, ->
              res.send
                success: !!!(err)
                error: err
                dataschema: schema
          else
            res.send
              success: !!!(err)
              error: err
              dataschema: schema
    catch e
      console.trace e
      res.send
        success: false
        error: e
  else
    res.send
      success: false
      error: 'field name cannot be empty'


exports.dataschema = (req, res, next) ->
  if req.user?.dataschema?
    res.send
      success: true
      dataschema: req.user.dataschema
  else
    userSvc = require '../services/user'
    try
      userSvc.getById req.user._id, (err, user) ->
        if user?.dataschema?
          req.session?.regenerate ->
            req.session.user = user
          res.send
            success: true
            dataschema: req.user.dataschema
        else
          user?.dataschema = 
            name: 1
            contact: 1
            address: 1
    catch e
      console.trace e
      res.send
        success: false
        error: e


exports.defaultLocation = (req, res, next) ->
  userSvc = require '../services/user'
  
  try
    userSvc.getById req.user._id, (err, user) ->
      res.send
        success: !!! (err)
        location: user?.location
        error: err
  catch e
    console.trace e
    res.send
      success: false
      error: e


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
  account.address = req.param 'address' ,''

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
    

exports.customerdelete = (req, res, next) ->
  customersvc = require '../services/customer'
  customerid = req.param 'id', ''
  
  if customerid
    customersvc.remove customerid, (err) ->
      res.send
        success: !!!(err)
        error: err
  else
    res.send
      success: false
      error: 'customerid is empty'


exports.customeradd = (req, res, next) ->
  customersvc = require '../services/customer'
  
  data = {}
  data[key] = value for own key,value of req.user?.dataschema
  
  data[key] = req.body[key] for key, val of data    
  
  data.userid = req.user._id
  
  console.log data
  
  try
    customersvc.add data, (err, customer) ->
      res.send
        success: !!! (err)
        customer: customer
  catch e
    console.trace e
    next()


exports.data = (req, res, next) ->
  customersvc = require '../services/customer'
  usersvc = require '../services/user'
  utils = require '../services/utils'
  
  try
    customersvc.getAll req.user._id, '', (err, customers) ->
      res.render 'data'
        title: 'Where Art Thou - Data'
        customers: customers
        user: req.user
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

