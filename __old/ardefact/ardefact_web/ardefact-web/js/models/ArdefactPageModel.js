/**
 *
 */
(function() {
  'use strict';

  define(['underscore',
    'backbone',
    'config'], (_, Backbone, Config) => {
    var model = Backbone.Model.extend({
      url() {
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