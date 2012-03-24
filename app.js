
/*
 Module dependencies.
*/

(function() {
  var app, express, restrict, routes;

  express = require('express');

  routes = require('./routes');

  app = module.exports = express.createServer();

  app.configure(function() {
    app.set('views', "" + __dirname + "/views");
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({
      secret: 'saigon riverland'
    }));
    app.use(app.router);
    return app.use(express["static"]("" + __dirname + "/public"));
  });

  app.configure('development', function() {
    return app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
  });

  app.configure('production', function() {
    return app.use(express.errorHandler());
  });

  app.dynamicHelpers({
    request: function(req) {
      return req;
    },
    hasMessages: function(req) {
      if (!req.session) {
        return false;
      } else {
        return Object.keys(req.session.flash || {}).length;
      }
    },
    messages: function(req) {
      return function() {
        var msgs, reduceFn, result;
        msgs = req.flash();
        reduceFn = function(arr, type) {
          return arr.concat(msgs[type]);
        };
        return result = Object.keys(msgs).reduce(reduceFn, []);
      };
    }
  });

  restrict = function(req, res, next) {
    var returnurl, _ref;
    if ((_ref = req.session) != null ? _ref.user : void 0) {
      req.user = req.session.user;
      return next();
    } else {
      returnurl = encodeURIComponent(req.url);
      req.session.error = 'Access denied!';
      return res.redirect("/login?returnurl=" + returnurl);
    }
  };

  app.get('/login', routes.login);

  app.get('/logout', routes.logout);

  app.post('/login', routes.authenticate);

  app.get('/', restrict, routes.index);

  app.listen(3000);

  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

}).call(this);
