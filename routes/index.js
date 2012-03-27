(function() {

  exports.accountadd = function(req, res, next) {
    return res.render('add', {
      layout: true,
      title: 'Where Art Thou - Sign Up'
    });
  };

  exports.createaccount = function(req, res, next) {
    var account, userSvc;
    account = {};
    account.name = req.param('companyname', '');
    account.username = req.param('username', '');
    account.password = req.param('password', '');
    account.passwordconfirm = req.param('passwordconfirm', '');
    userSvc = require('../services/user');
    try {
      return userSvc.insert(account, function(err, user) {
        var _ref;
        if (err) {
          req.flash('error', err);
          return res.redirect('back');
        } else {
          return (_ref = req.session) != null ? _ref.regenerate(function() {
            req.session.user = user;
            return res.redirect('/');
          }) : void 0;
        }
      });
    } catch (e) {
      console.trace(e);
      req.flash('error', e);
      return res.redirect('back');
    }
  };

  exports.customeradd = function(req, res, next) {
    var customeraddress, customercontact, customername, customersvc;
    customersvc = require('../services/customer');
    customername = req.param('customername', '');
    customercontact = req.param('customercontact', '');
    customeraddress = req.param('customeraddress', '');
    try {
      return customersvc.add({
        name: customername,
        contact: customercontact,
        address: customeraddress,
        userid: req.user._id
      }, function(err, customer) {
        return res.send({
          success: !!!err,
          customer: customer
        });
      });
    } catch (e) {
      console.trace(e);
      return next();
    }
  };

  exports.data = function(req, res, next) {
    var customersvc;
    customersvc = require('../services/customer');
    try {
      return customersvc.getAll(req.user._id, '', function(err, customers) {
        return res.render('data', {
          title: 'Where Art Thou - Data',
          customers: customers,
          layout: true
        });
      });
    } catch (e) {
      console.trace(e);
      return next();
    }
  };

  exports.customers = function(req, res, next) {
    var customersvc, filter;
    filter = req.param('filter', '');
    customersvc = require('../services/customer');
    try {
      return customersvc.getAll(req.user._id, filter, function(err, customers) {
        return res.send({
          success: !!!err,
          customers: customers
        });
      });
    } catch (e) {
      console.trace(e);
      return next();
    }
  };

  /*
    GET
    URL  /account/login
  */

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
    returnUrl = req.param('returnurl', '/');
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
      title: 'Where Art Thou',
      layout: true
    });
  };

}).call(this);
