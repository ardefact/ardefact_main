/**
Global config for client-side
*/
(function() {
  'use strict';
  
  const webRoot = '{{webRoot}}';

  define([], function () {
    return {
      webRoot: webRoot,
      apiUrlRoot : `${webRoot}/api`
    };
  });
}());