(function() {
  var Connection, Db, ObjectId, Server, Timestamp, baseDb, baseRepo, checkError, errorHandler, getDb;

  baseDb = require('./base');

  baseRepo = new baseDb.repository('teams');

  Db = baseDb.Db, ObjectId = baseDb.ObjectId, Timestamp = baseDb.Timestamp, Connection = baseDb.Connection, Server = baseDb.Server, checkError = baseDb.checkError, errorHandler = baseDb.errorHandler, getDb = baseDb.getDb;

  exports.create = function() {
    return baseRepo.create.apply(baseRepo, arguments);
  };

  exports.read = function() {
    return baseRepo.read.apply(baseRepo, arguments);
  };

  exports.update = function() {
    return baseRepo.update.apply(baseRepo, arguments);
  };

  exports.save = function() {
    return baseRepo.save.apply(baseRepo, arguments);
  };

  exports.remove = function() {
    return baseRepo.remove.apply(baseRepo, arguments);
  };

  exports.getById = function() {
    return baseRepo.getById.apply(baseRepo, arguments);
  };

  exports.ObjectId = ObjectId;

  exports.removeChallenge = function(teamid, otherteamid, callback) {
    var findObj, removingLog, updateObj;
    if (callback == null) callback = function() {};
    console.assert(teamid, 'teamid cannot be null');
    if (!teamid) throw 'teamid cannot be null';
    console.assert(otherteamid, 'otherteamid cannot be null');
    if (!otherteamid) throw 'otherteamid cannot be null';
    if (typeof teamid === 'string') teamid = new ObjectId(teamid);
    if (typeof otherteamid === 'string') otherteamid = new ObjectId(otherteamid);
    findObj = {
      _id: teamid
    };
    removingLog = {
      type: 'challengeremoved',
      data: {
        teamid: otherteamid
      },
      createdat: new Date()
    };
    updateObj = {
      $set: {
        updatedat: new Date()
      },
      $pull: {
        challenges: {
          teamid: otherteamid
        }
      },
      $addToSet: {
        logs: removingLog
      }
    };
    try {
      return baseRepo.update(findObj, updateObj, {}, callback);
    } catch (e) {
      console.trace(e);
      return callback(e);
    }
  };

}).call(this);
