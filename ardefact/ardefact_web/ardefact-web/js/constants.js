(function() {
  'use strict';
  
  define([], function () {
    return {
      DEFAULTS : {
        KEYWORDS    : 'anything',
        GEOKEYWORDS : 'the world'
      },
      EVENTS   : {
        LOGIN_REDIRECT  : 'ardefact:needsToLogin',
        LOGIN_SUCCESSFUL: 'ardefact:successfulLogin',
        KEYWORDS_SEARCH : 'ardefact:keywordsSearch',
        MARKER_CLICK    : 'ardefact:markerClick'
      },
      COOKIE_KEYS  : {
        AUTHENTICATED : 'authenticated',
        SESSION_COOKIE : 'connect.sid'
      }
    };
  });
}());