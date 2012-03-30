(function() {
  var createEmailContent, crypto, hash, newUserRepo, updateLocation, utils;

  crypto = require('crypto');

  newUserRepo = require('../repository/users2');

  utils = require('./utils');

  hash = function(msg, key) {
    return crypto.createHmac('sha256', key).update(msg).digest('hex');
  };

  createEmailContent = function(tpl, data) {
    var fn, fs, jade, path, str;
    jade = require('jade');
    fs = require('fs');
    path = "" + __dirname + "/../views/emails/" + tpl + ".jade";
    str = fs.readFileSync(path, 'utf8');
    fn = jade.compile(str, {
      filename: path,
      pretty: true
    });
    return fn(data);
  };

  exports.notifyChallenge = function(userid, data, callback) {
    if (callback == null) callback = function() {};
    console.assert(userid, 'userid cannot be null or 0');
    if (userid == null) throw 'userid is null or empty';
    try {
      return utils.execute(newUserRepo.getById, userid).then(function(err, user, cb) {
        var emailSvc;
        if (cb == null) cb = function() {};
        if (err) return callback(err);
        emailSvc = require('./email');
        if (user != null ? user.username : void 0) {
          data.tpl = 'challenge';
          data.to = user != null ? user.username : void 0;
          data.playername = user != null ? user.nickname : void 0;
          data.subject = 'You have been challenged';
          data.html = createEmailContent('challenged', data);
          return emailSvc.sendmail(data);
        } else {
          return cb();
        }
      }).then(function(err, recs, cb) {
        if (cb == null) cb = function() {};
        return callback();
      });
    } catch (e) {
      console.trace(e);
      return callback(e);
    }
  };

  /*
  Authenticate a user login
  */

  exports.authenticate = function(username, password, callback) {
    var encryptedPassword;
    console.assert(username, 'username cannot be null or empty');
    if (username == null) throw 'username is null or empty';
    encryptedPassword = hash(password, 'a little dog');
    return newUserRepo.getByUsername(username, function(error, user) {
      if (error) {
        return callback(error);
      } else if (!(user != null)) {
        return callback('User not found');
      } else if (encryptedPassword === user.password) {
        return callback(null, true, user);
      } else {
        return callback(null, false);
      }
    });
  };

  /*
  LOAD a user document by Id
  */

  exports.getById = function(userid, callback) {
    if (callback == null) callback = function() {};
    console.assert(userid, 'userid cannot be null or 0');
    if (userid == null) throw 'userid is null or empty';
    try {
      return newUserRepo.getById(userid, callback);
    } catch (e) {
      console.trace(e);
      return callback(e);
    }
  };

  /*
  Update player's picture
  */

  exports.updatePicture = function(userid, pictureurl, callback) {
    var findObj, updateObj;
    if (callback == null) callback = function() {};
    console.assert(userid, 'userid cannot be null or 0');
    if (userid == null) throw 'userid is null or empty';
    if (typeof userid === 'string') userid = new newUserRepo.ObjectId(userid);
    findObj = {
      _id: userid
    };
    updateObj = {
      $set: {
        pictureurl: pictureurl,
        updatedat: new Date()
      }
    };
    try {
      return newUserRepo.update(findObj, updateObj, {}, callback);
    } catch (e) {
      console.trace(e);
      return callback(e);
    }
  };

  exports.updateLocation = updateLocation = function(user, callback) {
    var geocoder;
    if (callback == null) callback = function() {};
    console.assert(user, 'user cannot be null');
    if (user == null) throw 'user cannot be null';
    console.assert(user != null ? user.address : void 0, 'address cannot be empty');
    geocoder = require('geocoder');
    return geocoder.geocode(user != null ? user.address : void 0, function(err, data) {
      var _ref, _ref2, _ref3;
      if ((data != null ? data.status : void 0) === 'OK') {
        user.location = data != null ? (_ref = data.results) != null ? (_ref2 = _ref[0]) != null ? (_ref3 = _ref2.geometry) != null ? _ref3.location : void 0 : void 0 : void 0 : void 0;
        return newUserRepo.update({
          _id: user != null ? user._id : void 0
        }, {
          $set: {
            location: user.location
          }
        }, {}, callback);
      } else {
        return callback(err);
      }
    });
  };

  exports.insert = function(user, callback) {
    var _this = this;
    if (callback == null) callback = function() {};
    console.assert(user, 'user cannot be null');
    if (user == null) throw 'user cannot be null';
    console.assert((user != null ? user.password : void 0) === (user != null ? user.passwordconfirm : void 0), 'Password do not match');
    if ((user != null ? user.password : void 0) !== (user != null ? user.passwordconfirm : void 0)) {
      throw 'Passwords do not match';
    }
    console.assert(user != null ? user.username : void 0, 'Email address cannot be null or empty');
    if (!(user != null ? user.username : void 0)) {
      throw 'Email address cannot be null or empty';
    }
    console.assert(user != null ? user.password : void 0, 'Password cannot be null or empty');
    if (!(user != null ? user.password : void 0)) {
      throw 'Password cannot be null or empty';
    }
    return utils.execute(newUserRepo.getByUsername, user.username).then(function(err, existingUser, cb) {
      if (cb == null) cb = function() {};
      if (err != null) {
        return callback(err);
      } else if (existingUser != null) {
        return callback('You Chose an Email Address That is Already Registered, You Hacker!');
      } else {
        user.createdat = new Date();
        user.password = hash(user.password, 'a little dog');
        if (user.dataschema == null) {
          user.dataschema = {
            name: 1,
            contact: 1,
            address: 1
          };
        }
        try {
          return newUserRepo.create(user, cb);
        } catch (e) {
          console.trace(e);
          return callback(e);
        }
      }
    }).then(function(err, newUsers, cb) {
      var _ref, _ref2;
      if (cb == null) cb = function() {};
      _this.addedUser = newUsers != null ? newUsers[0] : void 0;
      if (((_ref = _this.addedUser) != null ? _ref.address : void 0) && !((_ref2 = _this.addedUser) != null ? _ref2.location : void 0)) {
        return updateLocation(_this.addedUser, cb);
      } else {
        return callback(err, _this.addedUser);
      }
    }).then(function(err, updatedUser, cb) {
      if (cb == null) cb = function() {};
      return callback(err, _this.addedUser);
    });
  };

  exports.getAllPlayers = function(callback) {
    var query;
    if (callback == null) callback = function() {};
    query = {};
    try {
      return newUserRepo.read(query, function(readErr, cursor) {
        if (readErr != null) {
          return callback(readErr);
        } else if (cursor != null) {
          return cursor.toArray(function() {
            var db;
            db = cursor.db;
            callback.apply(null, arguments);
            return cursor.close();
          });
        } else {
          return callback();
        }
      });
    } catch (e) {
      console.log(e);
      throw e;
    }
  };

  exports.createResetPasswordToken = function(username, callback) {
    var token,
      _this = this;
    if (callback == null) callback = function() {};
    console.assert(username, 'username cannot be null');
    if (!username) throw 'username cannot be null';
    token = hash('' + Math.floor(Math.random() * 100001), 'a little dog');
    return utils.execute(newUserRepo.getByUsername, username).then(function(err, existingUser, cb) {
      var findObj, updateObj;
      _this.existingUser = existingUser;
      if (err != null) {
        return callback(err);
      } else if (existingUser != null) {
        findObj = {
          _id: existingUser._id
        };
        updateObj = {
          $set: {
            resettoken: token
          }
        };
        return newUserRepo.update(findObj, updateObj, {}, cb);
      } else {
        return callback('Account not found');
      }
    }).then(function(err, updatedUser, cb) {
      return callback(err, token, _this.existingUser);
    });
  };

  exports.getUserByToken = function(token, callback) {
    var findObj;
    if (callback == null) callback = function() {};
    console.assert(token, 'token cannot be null');
    if (!token) throw 'token cannot be null';
    findObj = {
      resettoken: token
    };
    return utils.execute(newUserRepo.read, findObj).then(function(err, cursor, cb) {
      if (cb == null) cb = function() {};
      if (err) {
        return callback(err);
      } else {
        return cursor.toArray(function() {
          var db;
          db = cursor.db;
          callback.apply(null, arguments);
          return cursor.close();
        });
      }
    }).then(function(err, users, cb) {
      if (cb == null) cb = function() {};
      if (err) {
        callback(err);
      } else if ((users != null ? users.length : void 0) === 0) {
        callback('Token not found.');
      } else {
        callback(err, users[0]);
      }
      return cb();
    });
  };

  exports.setPassword = function(userid, password, callback) {
    var encryptedPassword, findObj, updateObj;
    if (callback == null) callback = function() {};
    console.assert(userid, 'userid cannot be null');
    if (!((userid != null) && userid)) throw 'userid cannot be null';
    if (typeof userid === 'string') userid = new newUserRepo.ObjectId(userid);
    encryptedPassword = hash(password, 'a little dog');
    findObj = {
      _id: userid
    };
    updateObj = {
      $set: {
        password: encryptedPassword,
        updatedat: new Date()
      }
    };
    try {
      return newUserRepo.update(findObj, updateObj, {}, callback);
    } catch (e) {
      console.trace(e);
      return callback(e);
    }
  };

  exports.setSchema = function(userid, schema, callback) {
    var findObj, updateObj;
    if (callback == null) callback = function() {};
    console.assert(userid, 'userid cannot be null');
    if (!((userid != null) && userid)) throw 'userid cannot be null';
    if (typeof userid === 'string') userid = new newUserRepo.ObjectId(userid);
    findObj = {
      _id: userid
    };
    updateObj = {
      $set: {
        dataschema: schema,
        updatedat: new Date()
      }
    };
    try {
      return newUserRepo.update(findObj, updateObj, {}, callback);
    } catch (e) {
      console.trace(e);
      return callback(e);
    }
  };

  exports.assignTeam = function(userid, team, callback) {
    var findObj, updateObj;
    if (callback == null) callback = function() {};
    console.assert(userid, 'userid cannot be null');
    if (!((userid != null) && userid)) throw 'userid cannot be null';
    console.assert(team, 'team cannot be null');
    if (team == null) throw 'team cannot be null';
    if (typeof userid === 'string') userid = new newUserRepo.ObjectId(userid);
    findObj = {
      _id: userid
    };
    updateObj = {
      $set: {
        team: team,
        updatedat: new Date()
      }
    };
    try {
      return newUserRepo.update(findObj, updateObj, {}, callback);
    } catch (e) {
      console.trace(e);
      return callback(e);
    }
  };

}).call(this);
