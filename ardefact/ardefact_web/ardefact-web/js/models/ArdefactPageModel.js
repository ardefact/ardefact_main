/**
 *
 */
(function() {
  'use strict';

  define(['underscore',
    'backbone',
    'config'], function (_, Backbone, Config) {
    var model = Backbone.Model.extend({
      url      : function () {
        return Config.apiUrlRoot + "/ardefact?id=" + this.id;
      },
      defaults : {
        id          : null,
        title       : "NO TITLE",
        description : "NONE"
      }
    });

    return model;

  });
}());