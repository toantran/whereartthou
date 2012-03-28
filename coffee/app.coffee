
###
 Module dependencies.
###

express = require 'express'
routes = require './routes'

app = module.exports = express.createServer()

# Configuration
app.configure ->
  app.set 'views', "#{__dirname}/views"
  app.set 'view engine', 'jade'
  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use express.cookieParser()
  app.use express.session({ secret: 'saigon riverland' })
  app.use app.router
  app.use express["static"]("#{__dirname}/public")

app.configure 'development', ->
  app.use express.errorHandler( dumpExceptions: true, showStack: true )

app.configure 'production', ->
  app.use express.errorHandler()
  
# Some dynamic view helpers
app.dynamicHelpers 
  request: (req) -> req
  
  hasMessages: (req) ->
    if (!req.session) 
      false
    else 
      Object.keys(req.session.flash || {}).length

  messages: (req) ->
    ->
      msgs = req.flash()
      reduceFn = (arr, type) -> arr.concat( msgs[type] )
      result = Object.keys(msgs).reduce reduceFn, []  


restrict = (req, res, next) ->
  if req.session?.user
    req.user = req.session.user
    next()
  else
    returnurl = encodeURIComponent req.url
    req.session.error = 'Access denied!'
    res.redirect "/login?returnurl=#{returnurl}"
  


# Routes

app.get '/defloc', restrict, routes.defaultLocation
app.get '/accountadd', routes.accountadd
app.post '/accountadd', routes.createaccount
app.get '/data', restrict, routes.data
app.get '/customers', restrict, routes.customers
app.get '/login', routes.login
app.get '/logout', routes.logout
app.post '/login', routes.authenticate
app.post '/customeradd', restrict, routes.customeradd

app.get '/', restrict, routes.index

app.listen 3000
console.log "Express server listening on port %d in %s mode", app.address().port, app.settings.env
