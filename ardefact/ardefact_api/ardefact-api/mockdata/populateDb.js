'use strict';

var _ = require('lodash');


var MockUsersData = require('./mockusers.json');

var Logging = require('common/Logging'),
    User    = require('model/User');

var LOG = Logging.createLogger(__filename);

_.each(
  MockUsersData, user => {
    (new User(user)).commit()
                    .then(() => LOG.info(user, "inserted"))
                    .catch(error => LOG.error(error, "couldn't insert :("));
  });
