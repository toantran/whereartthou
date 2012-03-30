(function() {
  var __hasProp = Object.prototype.hasOwnProperty;

  exports.addcolumn = function(req, res, next) {
    var fielddef, fieldname, schema, user, userSvc, _ref, _ref2;
    fieldname = req.param('fieldname', '');
    fielddef = req.param('fielddef', '');
    if (fieldname) {
      schema = (_ref = (_ref2 = req.user) != null ? _ref2.dataschema : void 0) != null ? _ref : {
        name: 1,
        contact: 1,
        address: 1
      };
      schema[fieldname] = 1;
      user = req.user;
      user.dataschema = schema;
      userSvc = require('../services/user');
      try {
        return userSvc.setSchema(req.user._id, schema, function(err, saveduser) {
          var _ref3;
          return (_ref3 = req.session) != null ? _ref3.regenerate(function() {
            var customersvc, obj;
            req.session.user = user;
            if (fielddef) {
              customersvc = require('../services/customer');
              obj = {};
              obj[fieldname] = fielddef;
              return customersvc.setDefVal(user._id, obj, function() {
                return res.send({
                  success: !!!err,
                  error: err,
                  dataschema: schema
                });
              });
            } else {
              return res.send({
                success: !!!err,
                error: err,
                dataschema: schema
              });
            }
          }) : void 0;
        });
      } catch (e) {
        console.trace(e);
        return res.send({
          success: false,
          error: e
        });
      }
    } else {
      return res.send({
        success: false,
        error: 'field name cannot be empty'
      });
    }
  };

  exports.dataschema = function(req, res, next) {
    var userSvc, _ref;
    if (((_ref = req.user) != null ? _ref.dataschema : void 0) != null) {
      return res.send({
        success: true,
        dataschema: req.user.dataschema
      });
    } else {
      userSvc = require('../services/user');
      try {
        return userSvc.getById(req.user._id, function(err, user) {
          var _ref2;
          if ((user != null ? user.dataschema : void 0) != null) {
            if ((_ref2 = req.session) != null) {
              _ref2.regenerate(function() {
                return req.session.user = user;
              });
            }
            return res.send({
              success: true,
              dataschema: req.user.dataschema
            });
          } else {
            return user != null ? user.dataschema = {
              name: 1,
              contact: 1,
              address: 1
            } : void 0;
          }
        });
      } catch (e) {
        console.trace(e);
        return res.send({
          success: false,
          error: e
        });
      }
    }
  };

  exports.defaultLocation = function(req, res, next) {
    var userSvc;
    userSvc = require('../services/user');
    try {
      return userSvc.getById(req.user._id, function(err, user) {
        return res.send({
          success: !!!err,
          location: user != null ? user.location : void 0,
          error: err
        });
      });
    } catch (e) {
      console.trace(e);
      return res.send({
        success: false,
        error: e
      });
    }
  };

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
    account.address = req.param('address', '');
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

  exports.customerdelete = function(req, res, next) {
    var customerid, customersvc;
    customersvc = require('../services/customer');
    customerid = req.param('id', '');
    if (customerid) {
      return customersvc.remove(customerid, function(err) {
        return res.send({
          success: !!!err,
          error: err
        });
      });
    } else {
      return res.send({
        success: false,
        error: 'customerid is empty'
      });
    }
  };

  exports.customeradd = function(req, res, next) {
    var customersvc, data, key, val, value, _ref, _ref2;
    customersvc = require('../services/customer');
    data = {};
    _ref2 = (_ref = req.user) != null ? _ref.dataschema : void 0;
    for (key in _ref2) {
      if (!__hasProp.call(_ref2, key)) continue;
      value = _ref2[key];
      data[key] = value;
    }
    for (key in data) {
      val = data[key];
      data[key] = req.body[key];
    }
    data.userid = req.user._id;
    console.log(data);
    try {
      return customersvc.add(data, function(err, customer) {
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
    var customersvc, usersvc, utils;
    customersvc = require('../services/customer');
    usersvc = require('../services/user');
    utils = require('../services/utils');
    try {
      return customersvc.getAll(req.user._id, '', function(err, customers) {
        return res.render('data', {
          title: 'Where Art Thou - Data',
          customers: customers,
          user: req.user,
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
