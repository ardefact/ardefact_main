'use strict';

var config = require('./Config');

var fs = require("fs");
var q = require("q");
var _ = require("lodash");
var Maybe = require("data.maybe");

var LOG = require('common/Logging').createLogger("Mock API");

var Api = {
  __mockArdefacts : null,
  __mockUsers     : null,

  __getMockArdefacts() {
    var fname = __dirname + "/mockdata/mockardefacts.json";
    var deferred = q.defer();
    if (this.__mockArdefacts !== null) {
      deferred.resolve(this.__mockArdefacts);
    } else {
      fs.readFile(fname, 'utf8', (err, data) => {
        if (err) {
          deferred.reject(err);
        } else {
          LOG.info("Read " + fname);
          var ardefacts = this.__mockArdefacts = JSON.parse(data);
          for (var ardefactId in ardefacts) {
            ardefacts[ardefactId] = _.extend(ardefacts[ardefactId], {id : ardefactId});
          }
          deferred.resolve(ardefacts);
        }
      });
    }
    return deferred.promise;
  },

  __getArdefact(ardefactId) {
    return this.__getMockArdefacts().then(data => Maybe.fromNullable(data[ardefactId]));
  },

  __getMockUsers() {
    var fname = __dirname + "/mockdata/mockusers.json";

    var d = q.defer();
    if (this.__mockUsers !== null) {
      d.resolve(this.__mockUsers);
    } else {
      fs.readFile(fname, 'utf8', (err, data) => {
        if (err) {
          LOG.ERROR(err);
          d.resolve({});
        } else {
          var users = this.__mockUsers = JSON.parse(data);
          for (var userId in users) {
            users[userId] = _.extend(users[userId], {id : userId});
          }
          d.resolve(users);
        }
      });
    }
    return d.promise;
  },

  __getUser(userId) {
    return this.__getMockUsers().then(data => Maybe.fromNullable(data[userId]));
  },

  getUser(userId) {
    return this.__getUser(userId).then(maybeUser => maybeUser.map(user=> _.extend(user, {
      imageUrl : config.webUrlRoot + "/images/users/" + userId + ".jpg"
    })));
  },

  getArdefact(ardefactId) {
    return this.__getArdefact(ardefactId).then(
      maybeArdefact => maybeArdefact.map(ardefact =>
        _.extend(ardefact, {
            imageUrl : config.webUrlRoot + "/images/items/" + ardefactId + ".jpg"
          }
        )));
  },

  /**
   Get Ardefacts You May Be Interested In
   */
  getAYMBII(userId) {
    return this.__getMockArdefacts().then(
      items => ({results : _.values(items)}),
      err => {
        LOG.error(err, "Couldn't get mock ardefacts");
      }
    );
  },

  search : function (searchQuery) {
    var keywords = searchQuery.keywords;
    return this.__getMockArdefacts().then(function (items) {
      var results = _.filter(_.values(items), function (ardefact) {
        if (ardefact.title.toLowerCase().indexOf(keywords) != -1) {
          return true;
        }
        if (ardefact.description.toLowerCase().indexOf(keywords) != -1) {
          return true;
        }
        return false;
      });
      return {
        results : results,
        total   : _.size(results)
      };
    });
  }
};


module.exports = Api;