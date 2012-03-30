(function() {
  var repo;

  repo = require('../repository/customers');

  exports.remove = function(id, callback) {
    if (callback == null) callback = function() {};
    console.assert(id, 'customerid cannot be null or 0');
    if (id == null) throw 'customerid is null or empty';
    if (typeof id === 'string') id = new repo.ObjectId(id);
    try {
      return repo.remove({
        _id: id
      }, callback);
    } catch (e) {
      console.trace(e);
      return callback(e);
    }
  };

  exports.setDefVal = function(userid, setdata, callback) {
    var findObj, updateObj;
    if (callback == null) callback = function() {};
    console.assert(userid, 'userid cannot be null or 0');
    if (userid == null) throw 'userid is null or empty';
    if (setdata == null) setdata = {};
    setdata.updatedat = new Date();
    if (typeof userid === 'string') userid = new repo.ObjectId(userid);
    findObj = {
      userid: userid
    };
    updateObj = {
      $set: setdata
    };
    try {
      return repo.update(findObj, updateObj, {
        multi: true
      }, callback);
    } catch (e) {
      console.trace(e);
      return callback(e);
    }
  };

  exports.add = function(customer, callback) {
    var geocoder;
    if (callback == null) callback = function() {};
    console.assert(customer, 'customer cannot be null or 0');
    if (customer == null) throw 'customer is null or empty';
    if (((customer != null ? customer.userid : void 0) != null) && typeof (customer != null ? customer.userid : void 0) === 'string') {
      if (customer != null) {
        customer.userid = new repo.ObjectId(customer != null ? customer.userid : void 0);
      }
    }
    try {
      if (customer != null ? customer.address : void 0) {
        geocoder = require('geocoder');
        return geocoder.geocode(customer != null ? customer.address : void 0, function(err, data) {
          var _ref, _ref2, _ref3;
          if ((data != null ? data.status : void 0) === 'OK') {
            customer.location = data != null ? (_ref = data.results) != null ? (_ref2 = _ref[0]) != null ? (_ref3 = _ref2.geometry) != null ? _ref3.location : void 0 : void 0 : void 0 : void 0;
          }
          return repo.create(customer, function(err, addedcustomers) {
            return callback(err, addedcustomers != null ? addedcustomers[0] : void 0);
          });
        });
      } else {
        return repo.create(customer, function(err, addedcustomers) {
          return callback(err, addedcustomers != null ? addedcustomers[0] : void 0);
        });
      }
    } catch (e) {
      console.trace(e);
      throw e;
    }
  };

  exports.getById = function(id, callback) {
    if (callback == null) callback = function() {};
    console.assert(id, 'customer id cannot be null or 0');
    if (id == null) throw 'customer id is null or empty';
    try {
      return repo.getById(id, callback);
    } catch (e) {
      console.trace(e);
      throw e;
    }
  };

  exports.getAll = function(userid, filter, callback) {
    if (callback == null) callback = function() {};
    console.assert(userid, 'userid cannot be null or 0');
    if (userid == null) throw 'userid is null or empty';
    if (typeof userid === 'string') userid = new repo.ObjectId(userid);
    try {
      return repo.read({
        userid: userid
      }, function(readerr, cursor) {
        if (readerr) return callback(readerr);
        if (cursor != null) {
          return cursor.toArray(function(toarrayerr, customers) {
            if (customers != null) {
              customers.sort(function(c1, c2) {
                if ((c1 != null ? c1.name : void 0) < (c2 != null ? c2.name : void 0)) {
                  return -1;
                } else {
                  return 1;
                }
              });
            }
            callback.apply(null, [toarrayerr, customers]);
            return cursor.close();
          });
        } else {
          return callback();
        }
      });
    } catch (e) {
      console.trace(e);
      return callback(e);
    }
  };

}).call(this);
