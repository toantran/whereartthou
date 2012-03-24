
/*
  GET
  URL  /account/login
*/

(function() {

  exports.login = function(req, res, next) {
    var _ref, _ref2, _ref3, _ref4;
    res.render('login', {
      username: (_ref = (_ref2 = req.session) != null ? _ref2.username : void 0) != null ? _ref : '',
      password: (_ref3 = (_ref4 = req.session) != null ? _ref4.password : void 0) != null ? _ref3 : '',
      layout: true,
      title: 'Where Art Thou - Log In'
    });
    delete req.session.username;
    return delete req.session.password;
  };

  /*
    GET, POST
    URL  /account/logout
  */

  exports.logout = function(req, res, next) {
    return req.session.destroy(function() {
      return res.redirect('/');
    });
  };

  /*
    POST 
    URL /account/login
  */

  exports.authenticate = function(req, res, next) {
    var password, returnUrl, userSvc, username;
    req.session.username = username = req.param('username', '');
    req.session.password = password = req.param('password', '');
    returnUrl = req.param('returnurl', '/account/profile');
    if (!username) {
      req.flash('error', 'Enter Email');
      return res.redirect('back');
    } else {
      userSvc = require('../services/user');
      return userSvc.authenticate(username, password, function(error, authenticated, user) {
        var _ref;
        if (error) {
          req.flash('error', error);
          return res.redirect('back');
        } else if (authenticated) {
          return (_ref = req.session) != null ? _ref.regenerate(function() {
            req.session.user = user;
            return res.redirect(returnUrl);
          }) : void 0;
        } else {
          req.flash('error', 'That Aint Your Password, Homeboy!');
          return res.redirect('back');
        }
      });
    }
  };

  /*
    GET home page.
  */

  exports.index = function(req, res) {
    return res.render('index', {
      title: 'Where Art Thou'
    });
  };

}).call(this);