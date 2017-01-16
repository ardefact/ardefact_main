(function() {
  'use strict';
  
  define([], function () {
    return {
      DEFAULTS : {
        KEYWORDS    : 'anything',
        GEOKEYWORDS : 'the world'
      },
      DOM_IDS: {
        HEADER: "header",
        FOOTER: "footer"
      },
      EVENTS   : {
        LOGIN_REDIRECT  : 'ardefact:needsToLogin',
        LOGOUT          : 'ardefact:userLogOut',
        LOGIN_SUCCESSFUL: 'ardefact:successfulLogin',
        KEYWORDS_SEARCH : 'ardefact:keywordsSearch',
        MARKER_CLICK    : 'ardefact:markerClick'
      },
      COOKIE_KEYS  : {
        AUTHENTICATED : 'authenticated',
        SESSION_COOKIE : 'connect.sid',
        CAN_UPLOAD : 'canUpload'
      },
      PAGE_URIS: {
        ARDEFACT_PAGE: "ardefact",
        UPLOAD_PAGE: "newArdefact"
      }
    };
  });
}());