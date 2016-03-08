(function() {
  'use strict';

  define([
    'jquery',
    'underscore',
    'backbone',
    'utils',
    'controllers/MapController',
    'views/SearchBarView',
    'views/ArdefactSearchResultView',
    'text!templates/SRP.html'], function ($, _,
                                          Backbone,
                                          Utils,
                                          MapController,
                                          SearchBarView,
                                          ArdefactSearchResultView,
                                          SRPHtml) {

    var STATE_LOADING = 0;
    var STATE_LOADED = 1;

    var view = Backbone.View.extend({
      el         : "#mainContent",
      initialize : function () {
        var that = this;
        this.collection.on("sync", function (event) {
          that.renderSearchResults();
        });

        this.searchBarView = new SearchBarView();
      },

      render : function () {
        console.log("rendering SRP...");

        this.$el.html(SRPHtml);

        MapController.moveMap($("#defaultMapContainer"));

        return this.renderSearchResults();
      },

      renderSearchResults : function () {
        var $list = $("#searchResults");
        $list.html("");

        this.collection.each(function (item) {
          var itemView = new ArdefactSearchResultView({model : item});
          $list.append(itemView.render().$el);
        }, this);


        MapController.showAllMarkers(this.collection.toJSON());

        return this;
      }

    });
    return view;
  });
}());