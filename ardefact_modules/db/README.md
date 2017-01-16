# Ardefact Database Bridge

Everything else will talk to DBMS ([Mongodb](https://www.mongodb.com) for now) through this module.

To test in Vagrant:
```
npm install

export ARDEFACT_MONGODB_CONNECT_URL=mongodb://localhost/test
node mockdata/populateDb.js
npm test
```

Above commands should print out all mock Users we have so far.
