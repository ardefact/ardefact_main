'use strict';

var Chai = require('chai');

var Config = require('../src/Config');


describe('Config tests.', function(){
  it('get a value from vagrant config file.', function(done) {
    const bcryptWorkFactor =
            Config.getConfig(Config.CONFIG_VARS.ARDEFACT_BCRYPT_WORK_FACTOR);
    Chai.expect(bcryptWorkFactor).to.equal("4");

    done();
  });

  it('env var should override config val.', function(done) {
    Chai.expect(
      Config.getConfig(Config.CONFIG_VARS.ARDEFACT_BCRYPT_WORK_FACTOR))
      .to.equal('4');
    process.env[Config.CONFIG_VARS.ARDEFACT_BCRYPT_WORK_FACTOR] = "6";

    const bcryptWorkFactor =
            Config.getConfig(Config.CONFIG_VARS.ARDEFACT_BCRYPT_WORK_FACTOR);
    Chai.expect(bcryptWorkFactor).to.equal("6");

    done();
  });

  it('always coerce things to the string.', function(done) {
    process.env.FOO_BAR = 1337;

    Chai.expect(Config.getConfig("FOO_BAR")).to.equal("1337");

    done();
  });

  it('mode always defaulst to vagrant.', function(done) {
    process.env[Config.CONFIG_VARS.ARDEFACT_RUN_MODE] = 'foo';

    Chai.expect(Config._test.getMode()).to.equal('foo');

    delete process.env[Config.CONFIG_VARS.ARDEFACT_RUN_MODE];

    Chai.expect(Config._test.getMode()).to.equal('vagrant');

    done();
  });

  it('Config obj should be frozen.', function(done) {
    const obj = Config._test.getConfigFromFile();

    function modifyObj () {
      obj.foo = "bar";
    }

    Chai.expect(modifyObj).to.throw(
      "Can't add property foo, object is not extensible");

    done();
  });
});