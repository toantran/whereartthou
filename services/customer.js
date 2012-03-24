(function() {
  var repo;

  repo = require('../repository/customers');

  exports.add = function(customer, callback) {
    if (callback == null) callback = function() {};
    console.assert(customer, 'customer cannot be null or 0');
    if (customer == null) throw 'customer is null or empty';
    if (((customer != null ? customer.userid : void 0) != null) && typeof (customer != null ? customer.userid : void 0) === 'string') {
      if (customer != null) {
        customer.userid = new repo.ObjectId(customer != null ? customer.userid : void 0);
      }
    }
    try {
      return repo.create(customer, function(err, addedcustomers) {
        return callback(err, addedcustomers != null ? addedcustomers[0] : void 0);
      });
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
            var db;
            if (customers != null) {
              customers.sort(function(c1, c2) {
                if ((c1 != null ? c1.name : void 0) < (c2 != null ? c2.name : void 0)) {
                  return -1;
                } else {
                  return 1;
                }
              });
            }
            db = cursor.db;
            callback.apply(null, [toarrayerr, customers]);
            cursor.close();
            return db.close();
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
