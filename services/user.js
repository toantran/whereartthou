(function() {
  var createEmailContent, crypto, hash, newUserRepo, utils;

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
  */

  exports.getrecords = function(userid, callback) {
    if (callback == null) callback = function() {};
    console.assert(userid, 'userid cannot be null or 0');
    if (userid == null) throw 'userid is null or empty';
    try {
      return utils.execute(newUserRepo.getById, userid).then(function(err, user, cb) {
        var teamsvc, _ref;
        if (cb == null) cb = function() {};
        if (err) return callback(err);
        if (user != null ? (_ref = user.records) != null ? _ref.length : void 0 : void 0) {
          teamsvc = require('./team');
          return utils.mapAsync(user != null ? user.records : void 0, function(rec, iteratorcb) {
            var _ref2, _ref3, _ref4;
            if (iteratorcb == null) iteratorcb = function() {};
            if (rec != null) {
              rec.result = (rec != null ? (_ref2 = rec.data) != null ? _ref2.result : void 0 : void 0) === 'win' ? 'W' : 'L';
            }
            if (rec != null) {
              rec.teamid = rec != null ? (_ref3 = rec.data) != null ? _ref3.opponentid : void 0 : void 0;
            }
            return teamsvc.getById(rec != null ? (_ref4 = rec.data) != null ? _ref4.opponentid : void 0 : void 0, function(getteamerr, team) {
              if (rec != null) {
                rec.teamname = team != null ? team.teamname : void 0;
              }
              return iteratorcb(getteamerr, rec);
            });
          }, cb);
        } else {
          return cb();
        }
      }).then(function(err, recs, cb) {
        if (cb == null) cb = function() {};
        return callback(err, recs);
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
  Update player's stats
  */

  exports.resetStats = function(userid, callback) {
    var findObj, updateObj;
    if (callback == null) callback = function() {};
    console.assert(userid, 'userid cannot be null or 0');
    if (userid == null) throw 'userid is null or empty';
    if (typeof userid === 'string') userid = new newUserRepo.ObjectId(userid);
    findObj = {
      _id: userid
    };
    updateObj = {
      $unset: {
        stats: 1,
        records: 1
      }
    };
    try {
      return newUserRepo.update(findObj, updateObj, {}, callback);
    } catch (e) {
      console.trace(e);
      return callback(e);
    }
  };

  /*
  Update player's stats
  */

  exports.updateStats = function(userid, opponentid, win, callback) {
    var findObj, incObj, statLog, updateObj;
    if (callback == null) callback = function() {};
    console.assert(userid, 'userid cannot be null or 0');
    if (userid == null) throw 'userid is null or empty';
    if (typeof userid === 'string') userid = new newUserRepo.ObjectId(userid);
    if (typeof opponentid !== 'string') opponentid = String(opponentid);
    findObj = {
      _id: userid
    };
    incObj = win ? {
      'stats.win': 1
    } : {
      'stats.loss': 1
    };
    statLog = {
      id: new newUserRepo.ObjectId(),
      type: 'matchresult',
      data: {
        opponentid: opponentid,
        result: win ? 'win' : 'lose'
      },
      createdat: new Date()
    };
    updateObj = {
      $inc: incObj,
      $set: {
        updatedat: new Date()
      },
      $addToSet: {
        posts: statLog,
        records: statLog
      }
    };
    try {
      return newUserRepo.update(findObj, updateObj, {}, callback);
    } catch (e) {
      console.trace(e);
      return callback(e);
    }
  };

  /*
  Update player's stats.  Silently
  */

  exports.updateStatsSilent = function(userid, opponentid, win, callback) {
    var findObj, incObj, statLog, updateObj;
    if (callback == null) callback = function() {};
    console.assert(userid, 'userid cannot be null or 0');
    if (userid == null) throw 'userid is null or empty';
    if (typeof userid === 'string') userid = new newUserRepo.ObjectId(userid);
    if (typeof opponentid !== 'string') opponentid = String(opponentid);
    findObj = {
      _id: userid
    };
    incObj = win ? {
      'stats.win': 1
    } : {
      'stats.loss': 1
    };
    statLog = {
      id: new newUserRepo.ObjectId(),
      type: 'matchresult',
      data: {
        opponentid: opponentid,
        result: win ? 'win' : 'lose'
      },
      createdat: new Date()
    };
    updateObj = {
      $inc: incObj,
      $addToSet: {
        records: statLog
      }
    };
    try {
      return newUserRepo.update(findObj, updateObj, {}, callback);
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

  /*
  Add a vote record into player's record
  */

  exports.addVote = function(userid, vote, callback) {
    var findObj, logObj, updateObj;
    if (callback == null) callback = function() {};
    console.assert(userid, 'userid cannot be null or 0');
    if (userid == null) throw 'userid is null or empty';
    if (typeof userid === 'string') userid = new newUserRepo.ObjectId(userid);
    findObj = {
      _id: userid
    };
    logObj = {
      type: 'matchresult',
      data: {
        matchid: vote.matchid,
        teamid: vote.teamid
      },
      createdat: new Date()
    };
    updateObj = {
      $set: {
        updatedat: new Date()
      },
      $addToSet: {
        votes: vote,
        logs: logObj
      }
    };
    try {
      return newUserRepo.update(findObj, updateObj, {}, callback);
    } catch (e) {
      console.trace(e);
      return callback(e);
    }
  };

  /*
  Set a team to a player
  */

  exports.setTeam = function(userid, team, callback) {
    var findObj, post, updateObj;
    if (callback == null) callback = function() {};
    console.assert(userid, 'userid cannot be null or 0');
    if (userid == null) throw 'userid is null or empty';
    if (typeof userid === 'string') userid = new newUserRepo.ObjectId(userid);
    findObj = {
      _id: userid
    };
    post = {
      id: new newUserRepo.ObjectId(),
      type: 'jointeam',
      data: {
        teamid: String(team._id)
      },
      createdat: new Date()
    };
    updateObj = {
      $set: {
        team: team,
        updatedat: new Date()
      },
      $unset: {
        invites: 1
      },
      $addToSet: {
        posts: post
      }
    };
    try {
      return newUserRepo.update(findObj, updateObj, {}, callback);
    } catch (e) {
      console.trace(e);
      return callback(e);
    }
  };

  /*
  Add a post record into player's record
  */

  exports.addPost = function(userid, post, callback) {
    var findObj, updateObj;
    if (callback == null) callback = function() {};
    console.assert(userid, 'userid cannot be null or 0');
    if (userid == null) throw 'userid is null or empty';
    if (typeof userid === 'string') userid = new newUserRepo.ObjectId(userid);
    findObj = {
      _id: userid
    };
    post || (post = {});
    post.createdat = new Date();
    post.id = new newUserRepo.ObjectId();
    updateObj = {
      $set: {
        updatedat: new Date()
      },
      $addToSet: {
        posts: post
      }
    };
    try {
      return newUserRepo.update(findObj, updateObj, {}, callback);
    } catch (e) {
      console.trace(e);
      return callback(e);
    }
  };

  /*
  Remove a post from player's record
  */

  exports.removePost = function(userid, postid, callback) {
    var findObj, updateObj;
    if (callback == null) callback = function() {};
    console.assert(userid, 'userid cannot be null or 0');
    if (userid == null) throw 'userid is null or empty';
    console.assert(postid, 'postid cannot be null or 0');
    if (postid == null) throw 'postid is null or empty';
    if (typeof userid === 'string') userid = new newUserRepo.ObjectId(userid);
    if (typeof postid === 'string') postid = new newUserRepo.ObjectId(postid);
    findObj = {
      _id: userid
    };
    updateObj = {
      $set: {
        updatedat: new Date()
      },
      $pull: {
        posts: {
          id: postid
        }
      }
    };
    try {
      return newUserRepo.update(findObj, updateObj, {}, callback);
    } catch (e) {
      console.trace(e);
      return callback(e);
    }
  };

  /*
  Add a comment record into player's record
  */

  exports.addComment = function(userid, postid, data, callback) {
    var findObj;
    if (callback == null) callback = function() {};
    console.assert(userid, 'userid cannot be null or 0');
    if (userid == null) throw 'userid is null or empty';
    console.assert(postid, 'postid cannot be null or 0');
    if (postid == null) throw 'postid is null or empty';
    if (typeof userid === 'string') userid = new newUserRepo.ObjectId(userid);
    if (typeof postid === 'string') postid = new newUserRepo.ObjectId(postid);
    data || (data = {});
    data.id = new newUserRepo.ObjectId();
    data.createdat = new Date();
    findObj = {
      _id: userid
    };
    try {
      return newUserRepo.getById(userid, function(getErr, user) {
        var post, _i, _len, _ref, _ref2, _results;
        if (getErr != null) return callback(getErr);
        _ref = user != null ? user.posts : void 0;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          post = _ref[_i];
          if (post != null ? (_ref2 = post.id) != null ? _ref2.equals(postid) : void 0 : void 0) {
            _results.push((function(post) {
              var updateObj;
              post.comments || (post.comments = []);
              post.comments.push(data);
              updateObj = {
                $set: {
                  posts: user != null ? user.posts : void 0,
                  updatedat: new Date()
                }
              };
              return newUserRepo.update(findObj, updateObj, {}, callback);
            })(post));
          }
        }
        return _results;
      });
    } catch (e) {
      console.trace(e);
      return callback(e);
    }
  };

  /*
  Remove a comment
  */

  exports.removeComment = function(userid, postid, commentid, callback) {
    var findObj;
    if (callback == null) callback = function() {};
    console.assert(userid, 'userid cannot be null or 0');
    if (userid == null) throw 'userid is null or empty';
    console.assert(postid, 'postid cannot be null or 0');
    if (postid == null) throw 'postid is null or empty';
    console.assert(commentid, 'commentid cannot be null or 0');
    if (commentid == null) throw 'commentid is null or empty';
    if (typeof userid === 'string') userid = new newUserRepo.ObjectId(userid);
    if (typeof postid === 'string') postid = new newUserRepo.ObjectId(postid);
    if (typeof commentid === 'string') {
      commentid = new newUserRepo.ObjectId(commentid);
    }
    findObj = {
      _id: userid
    };
    try {
      return newUserRepo.getById(userid, function(getErr, user) {
        var post, _i, _len, _ref, _ref2, _results;
        if (getErr != null) return callback(getErr);
        _ref = user != null ? user.posts : void 0;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          post = _ref[_i];
          if (post != null ? (_ref2 = post.id) != null ? _ref2.equals(postid) : void 0 : void 0) {
            _results.push((function(post) {
              var comment, index, updateObj, _fn, _len2, _ref3;
              _ref3 = post != null ? post.comments : void 0;
              _fn = function(comment, index) {
                var _ref4;
                if (comment != null ? (_ref4 = comment.id) != null ? _ref4.equals(commentid) : void 0 : void 0) {
                  return post != null ? post.comments.splice(index, 1) : void 0;
                }
              };
              for (index = 0, _len2 = _ref3.length; index < _len2; index++) {
                comment = _ref3[index];
                _fn(comment, index);
              }
              updateObj = {
                $set: {
                  posts: user != null ? user.posts : void 0,
                  updatedat: new Date()
                }
              };
              return newUserRepo.update(findObj, updateObj, {}, callback);
            })(post));
          }
        }
        return _results;
      });
    } catch (e) {
      console.trace(e);
      return callback(e);
    }
  };

  /*
  Add a vote record into player's record
  */

  exports.addTeamInvite = function(userid, teamid, callback) {
    var findObj, invite, invitedPost, updateObj;
    if (callback == null) callback = function() {};
    console.assert(userid, 'userid cannot be null or 0');
    if (userid == null) throw 'userid is null or empty';
    console.assert(teamid, 'teamid cannot be null or 0');
    if (teamid == null) throw 'teamid is null or empty';
    if (typeof userid === 'string') userid = new newUserRepo.ObjectId(userid);
    if (typeof teamid === 'string') teamid = new newUserRepo.ObjectId(teamid);
    findObj = {
      _id: userid
    };
    invite = {
      teamid: teamid
    };
    invitedPost = {
      id: new newUserRepo.ObjectId(),
      type: 'invite',
      data: {
        teamid: teamid
      },
      createdat: new Date()
    };
    updateObj = {
      $set: {
        updatedat: new Date()
      },
      $addToSet: {
        invites: invite,
        posts: invitedPost
      }
    };
    try {
      return newUserRepo.update(findObj, updateObj, {}, callback);
    } catch (e) {
      console.trace(e);
      return callback(e);
    }
  };

  exports.sortingPlayers = function(player1, player2) {
    var avg1, avg2, loss1, loss2, total1, total2, win1, win2, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
    win1 = (_ref = player1 != null ? (_ref2 = player1.stats) != null ? _ref2.win : void 0 : void 0) != null ? _ref : 0;
    loss1 = (_ref3 = player1 != null ? (_ref4 = player1.stats) != null ? _ref4.loss : void 0 : void 0) != null ? _ref3 : 0;
    total1 = win1 + loss1;
    avg1 = total1 ? win1 / total1 : 0;
    win2 = (_ref5 = player2 != null ? (_ref6 = player2.stats) != null ? _ref6.win : void 0 : void 0) != null ? _ref5 : 0;
    loss2 = (_ref7 = player2 != null ? (_ref8 = player2.stats) != null ? _ref8.loss : void 0 : void 0) != null ? _ref7 : 0;
    total2 = win2 + loss2;
    avg2 = total2 ? win2 / total2 : 0;
    if (avg1 !== avg2) {
      return -avg1 + avg2;
    } else if (win1 !== win2) {
      return -win1 + win2;
    } else {
      return loss1 - loss2;
    }
  };

  exports.insert = function(user, callback) {
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
      if (err != null) {
        return callback(err);
      } else if (existingUser != null) {
        return callback('You Chose an Email Address That is Already Registered, You Hacker!');
      } else {
        user.createdat = new Date();
        if (user.pictureurl == null) user.pictureurl = '/images/player.jpg';
        user.password = hash(user.password, 'a little dog');
        try {
          return newUserRepo.create(user, cb);
        } catch (e) {
          console.trace(e);
          return callback(e);
        }
      }
    }).then(function(err, newUsers, cb) {
      return callback(err, newUsers != null ? newUsers[0] : void 0);
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
            cursor.close();
            return db.close();
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
          cursor.close();
          return db.close();
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
