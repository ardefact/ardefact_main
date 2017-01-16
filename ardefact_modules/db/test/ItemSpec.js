'use strict';

var Hashids = require('hashids'),
    Q       = require('q');

Q.longStackSupport = true;

var ArdefactUtils = require('utils');

var PopulateDb = require('../mockdata/populateDb'),
    MockItems  = PopulateDb.mockItems,
    Item       = require('../src/collections/Item');

var Chai           = require('chai'),
    ChaiSubset     = require('chai-subset'),
    ChaiAsPromised = require('chai-as-promised'),
    Mockgoose      = require('mockgoose');

Chai.use(ChaiSubset);
Chai.use(ChaiAsPromised);

var TestUtils = require('./testUtils');

const LOG = ArdefactUtils.Logging.createLogger(__filename);

describe("Item model tests.", function () {
  var ItemModel = false;
  const hashids = new Hashids(Item.COLLECTION_NAME);

  describe("Tests using in memory database.", function () {

    before(function () {
      return TestUtils.getInMemoryMongoose()
        .then(mongooseInstance => {
          ItemModel = Item.getModel(mongooseInstance);
          return PopulateDb.populateItems(ItemModel);
        })
        .then(() => {
          LOG.info("Created mock items.");
        });
    });

    it('Save mock items and query them.', function () {
      const testItemI = i => ItemModel.findById(i).exec()
        .then(item => {
          Chai.expect(item).to.containSubset(MockItems[i]);
          Chai.expect(item.hid).to.equal(hashids.encode(i));
          if (i < MockItems.length - 1) return testItemI(i + 1);
        });
      return testItemI(0);
    });

    it('Get items by hid', function () {
        const testItemI = i => ItemModel.findByHid(hashids.encode(i))
          .then(item => {
            Chai.expect(item).to.containSubset(MockItems[i]);
            if (i < MockItems.length - 1) return testItemI(i + 1);
          });

      return testItemI(0);
    });
  });

});