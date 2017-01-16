var _ = require('lodash');

var mongoose = require('mongoose');

mongoose.Promise = require('q').Promise;

var ArdefactJSONSchemas = require('ardefact_json_schema'),
    ArdefactUtils = require('ardefact_utils');

var DBHelper = require('./src/MongoDbConnectionHelper'),
    User     = require('./src/collections/User');

var LOG = ArdefactUtils.Logging.createLogger(__filename);

DBHelper.getMongooseConnection()
  .then(db => {
    LOG.info("connected");
    User.getModel().find().exec()
      .then(results => console.log(_.map(results, result => result.toObject({virtuals:true}))))
      .catch(error => LOG.error(error));
  })
  .catch(error => LOG.error(error));

