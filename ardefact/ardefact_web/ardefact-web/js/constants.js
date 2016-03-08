(function() {
  'use strict';
  
  define([], function () {
    return {
      DEFAULTS : {
        KEYWORDS    : 'anything',
        GEOKEYWORDS : 'the world'
      },
      EVENTS   : {
        KEYWORDS_SEARCH : 'ardefact:keywordsSearch',
        MARKER_CLICK    : 'ardefact:markerClick'
      }
    };
  });
}());