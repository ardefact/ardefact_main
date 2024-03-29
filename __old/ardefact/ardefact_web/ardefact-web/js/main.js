(function() {
  'use strict';
  
  const isBrowser = typeof window !== 'undefined';

  const BOWER_ROOT = '../bower_components';

  var rjsConfig = {
    baseUrl: isBrowser ? 'js' : '.',
    paths : {
      jquery     : `${BOWER_ROOT}/jquery/dist/jquery.min`,
      maybe : `${BOWER_ROOT}/data.min/dist/data.maybe.umd.min`,
      underscore : `${BOWER_ROOT}/lodash/dist/lodash.min`,
      backbone   : `${BOWER_ROOT}/backbone/backbone-min`,
      js_cookie  : `${BOWER_ROOT}/js-cookie/src/js.cookie`,
      js_autogrow: `lib/jquery.auto-grow-input`,
      templates  : '../templates',
    }
  };

// if we are inside browser then inititalize the app
  if (isBrowser) {
    require.config(rjsConfig);

    require([
      'jquery',
      'app',
    ], ($, App) => {

      $(document).ready(() => {
        App.initialize();
      });
    });
  } else {
    // otherwise just export the config
    module.exports = rjsConfig;
  }
}());