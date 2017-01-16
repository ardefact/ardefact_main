(function() {
  'use strict';

  define(['jquery',
      'underscore',
      'backbone',
      'utils',
      'text!templates/SearchResult.html'
    ],
    function ($, _, Backbone, Utils, SearchResultHTML) {
      var view = Backbone.View.extend({

        tagName   : 'div',
        className : 'searchResult',
        template  : _.template(SearchResultHTML),

        render : function () {
          var modelJson = this.model.toJSON();
          var data = {
            title    : modelJson.title,
            url      : "#ardefact/" + modelJson.id,
            imageURL : Utils.makeImageUrl(modelJson.id)
          };
          this.$el.html(this.template(data));
          return this;
        }
      });
      return view;
    }
  );
}());
