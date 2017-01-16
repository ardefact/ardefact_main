(function() {
  'use strict';

  define(['underscore',
      'backbone',
      'utils',
      'config',
      'models/ArdefactSearchResultModel'],
    function (_, Backbone, Utils, Config, ArdefactSearchResultModel) {
      var collection = Backbone.Collection.extend({
        url   : Config.apiUrlRoot + "/aymbii",
        model : ArdefactSearchResultModel,
        parse : function (data) {
          return data.results;
        }
      });

      return collection;
    });
}());