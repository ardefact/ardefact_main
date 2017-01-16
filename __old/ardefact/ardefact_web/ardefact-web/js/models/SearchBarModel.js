/**
 * model for the search bar.
 *
 * @author lev@ardefact.com
 */
(function() {
  'use strict';

  define(['underscore',
    'backbone', 'constants'], (_, Backbone, Constants) => {

    var model = Backbone.Model.extend({
      defaults : {
        keywords    : Constants.DEFAULTS.KEYWORDS,
        geoKeywords : Constants.DEFAULTS.GEOKEYWORDS
      }
    });

    return model;
  });
}());