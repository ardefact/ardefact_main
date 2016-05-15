/**
 * Just lev fucking around.
 */
'using strict';

global.CLIArgs = {debug : true};

var StaticRouter = require('./routers/StaticContentRouter'),
    Logging      = require('common/Logging'),
    DBSetup = require('db/setup'),
    User = require('model/User');

const LOG = Logging.createLogger(__filename);

DBSetup.setup()
       .then(() => LOG.info("setup complete"))
       .then(() => User.byEmail("lev@ardefact.com"))
       .then(user => LOG.info({result:user}))
       .then(() => User.all())
       .then(users => LOG.info(users, "all users"))
  .catch(error => LOG.error(error));


/*

User.all().then(users => {
  LOG.info({users: users}, "fuck");
})
  .catch(error => LOG.error(error, "shit"));
  */



