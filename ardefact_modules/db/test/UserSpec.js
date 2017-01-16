'use strict';

var Hashids  = require('hashids'),
    Q        = require('q');

Q.longStackSupport = true;

var ArdefactUtils = require('utils');

var PopulateDb = require('../mockdata/populateDb'),
    MockUsers  = require('../mockdata/mockusers.json'),
    User       = require('../src/collections/User');

var Chai           = require('chai'),
    ChaiSubset     = require('chai-subset'),
    ChaiAsPromised = require('chai-as-promised'),
    Mockgoose      = require('mockgoose');

Chai.use(ChaiSubset);
Chai.use(ChaiAsPromised);

var TestUtils = require('./testUtils');

const LOG = ArdefactUtils.Logging.createLogger(__filename);


describe("User model tests.", function () {
  var UserModel = false;
  var hashids = new Hashids(User.COLLECTION_NAME);

  function setupDB(done) {
    TestUtils.getInMemoryMongoose()
      .then(mongooseInstance => {
        UserModel = User.getModel(mongooseInstance);
        done();
      })
      .catch(error => LOG.error(error, "Couldn't create in memory db."));
  }

  function clearDB(done) {
    Mockgoose.reset(() => done());
  }

  function populateMockUsers() {
    return PopulateDb.populateUsers(UserModel);
  }

  before(setupDB);
  //after(clearDB);

  describe("Stateless tests.", function () {
    it("checkPassword returns user on successful check", function (done) {
      const mockUser = new UserModel(
        {
          password : "$2a$04$HEL9pP9j/OsV8.7rr5/82ubG0X8BPk0RV6iQxmD4cdADo2I0g01v2"
        });
      mockUser.checkPassword("fuck")
        .then(account => {
          Chai.expect(account).to.equal(mockUser);
        })
        .finally(() => done());
    });

    it("checkPassword returns false on wrong password", function (done) {
      const mockUser = new UserModel(
        {
          password : "$2a$04$HEL9pP9j/OsV8.7rr5/82ubG0X8BPk0RV6iQxmD4cdADo2I0g01v2"
        });
      mockUser.checkPassword("fuck its not a right pass")
        .then(account => {
          Chai.expect(account).to.equal(false);
        })
        .finally(() => done());
    });

    it("hid should be properly computed from _id", function (done) {
      const mockUser = new UserModel(
        {
          _id : 1337
        }
      );
      Chai.expect(hashids.encode(1337)).to.equal(mockUser.hid);
      done();
    });
  });

  describe("Tests with mocked users.", function () {
    /**
     * Setup mock users in memory db before running rest of the tests.
     */
    before(done => {
      PopulateDb.populateUsers(UserModel)
        .then(() => done())
        .catch(error => done(error));
    });

    it("Test findByDisplayName.", function () {
      return UserModel.findByDisplayName("entheogen")
        .then(user=> {
          Chai.expect(user).to.containSubset(MockUsers[1]);
          //done();
        });
    });

    it("Test findByEmail.", function () {
      return UserModel.findByEmail("ross@ardefact.com")
        .then(user => {
          Chai.expect(user).to.containSubset(MockUsers[0]);
          //done();
        });
    });

    it("Test findByHid.", function () {
      const user_num = 1;
      const hid = hashids.encode(user_num);
      return UserModel.findByHid(hid)
        .then(user => {
          Chai.expect(user).to.containSubset(MockUsers[user_num]);
        });
    });

    it("Test checkPassword success case.", function () {
      return UserModel.findById(0).exec()
        .then(user => {
          return user.checkPassword("test")
            .then(checkedUser => {
              Chai.expect(checkedUser).to.equal(user);
            });
        });
    });

    it("Test checkPassword failure case.", function () {
      return UserModel.findById(0).exec()
        .then(user => {
          return user.checkPassword("test123")
            .then(checkedUser => {
              Chai.expect(checkedUser).to.equal(false);
            });
        });
    });

    it("Test hid instance method.", function () {
      return UserModel.findById(0).exec()
        .then(user => {
          Chai.expect(user.hid).to.equal(hashids.encode(0));
        });
    });

    it("Test validation fail.", function () {
      return Chai.expect(new UserModel({"foo" : "bar"}).save())
        .to.eventually.be.rejectedWith("User validation failed");
    });

    it("Test validation fail because of duplicate field.", function () {
      return Chai.expect(new UserModel(MockUsers[0]).save())
        .to.eventually.be.rejectedWith(
          "E11000 duplicate key error dup key: { : \"ross@ardefact.com\" }");
    });

    it("Test auto increment of _id", function () {
      const newUser =
            {
              "first_name"   : "foo",
              "last_name"    : "bar",
              "display_name" : "foobar",
              "bio"          : "some text",
              "email"        : "robot@ardefact.com",
              "password"     : "$2a$04$7EG9HUVFMykhzENAzqT/FuNEHfUVqjnHvPWQgPO.cGUWyaNjKMKFG",
              "traveler"     : true
            };

      return new UserModel(newUser).save()
        .then(() => {
          return UserModel.findByEmail("robot@ardefact.com")
            .then(user => {
              Chai.expect(user._id).to.equal(MockUsers.length+1);
            });
        });

    });

  });

});