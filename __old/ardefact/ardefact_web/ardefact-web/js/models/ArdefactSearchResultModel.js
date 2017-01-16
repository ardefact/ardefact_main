(function() {
  'use strict';

  define([
    'underscore',
    'backbone'], function (_, Backbone) {
    var model = Backbone.Model.extend({
      defaults : {
        id    : null,
        title : null
      }
    });

    return model;
  });
}());