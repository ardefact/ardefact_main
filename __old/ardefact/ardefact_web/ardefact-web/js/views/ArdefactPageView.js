(function() {
  'use strict';

  define(['jquery',
      'underscore',
      'backbone',
      'utils',
      'controllers/MapController',
      'models/ArdefactPageModel',
      'text!templates/ArdefactPage.html'],
    ($,
     _,
     Backbone,
     Utils,
     MapController,
     ArdefactPageModel,
     HTML) => {
      var view = Backbone.View.extend({
        el       : "#mainContent",
        template : _.template(HTML),

        initialize : function () {
          this.listenTo(this.model, "sync", this.render);
        },

        render : function () {
          console.log("Rendering Ardefact page...");

          var modelJson = this.model.toJSON();
          var data = {
            title       : modelJson.title,
            imageUrl    : Utils.makeImageUrl(modelJson.id),
            description : modelJson.description
          };
          this.$el.html(this.template(data));

          // move the map
          MapController.moveMap($("#ardefactPageMapLocation"));


          MapController.goTo(modelJson);

          return this;
        }
      });

      return view;

    });
}());
