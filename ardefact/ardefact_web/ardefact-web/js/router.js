(function() {
  'use strict';

  define(['jquery',
      'underscore',
      'backbone',
      'Events',
      'config',
      'utils',
      'constants',
      'controllers/SearchBarController',
      'controllers/SRPController',
      'views/HeaderView',
      'views/ArdefactSearchResultView',
      'views/ArdefactPageView',
      'models/ArdefactPageModel'],
    ($,
     _,
     Backbone,
     Events,
     Config,
     Utils,
     Constants,
     SearchBarController,
     SRPController,
     HeaderView,
     ArdefactSearchResultView,
     ArdefactPageView,
     ArdefactPageModel) => {
      var initialize = function () {

        var ArdefactRouter = Backbone.Router.extend({
          routes : {
            ""             : "searchPage",
            "ardefact/:id" : "ardefactPage"
          },

          initialize : function () {
            console.log("initializing..");

            this.searchBarController = new SearchBarController();
            this.srpController = new SRPController();
            this.srpController.fetch();

            // tie the click marker event
            Events.listenToEvent(this, Constants.EVENTS.MARKER_CLICK, ardefact => {
              console.log("Navigating to ardefact: " + JSON.stringify(ardefact));
              this.navigate("/ardefact/" + ardefact.id, true);
            });

            Events.listenToEvent(this, Constants.EVENTS.KEYWORDS_SEARCH, keywords => {
              if (Backbone.history.getFragment().trim() !== '') {
                if (!Utils.isEmpty(keywords) && keywords !== Constants.DEFAULTS.KEYWORDS) {
                  this.navigate('/', true);
                }
              }
            });

            this.headerView = new HeaderView();
          },

          searchPage : function () {
            console.log("Search page..");

            $(".map").show();


            this.headerView.render();
            this.searchBarController.show();
            this.srpController.show();
          },

          ardefactPage : function (id) {
            console.log("Ardefact page...");

            var ardefactPageModel = new ArdefactPageModel({id : id});
            this.ardefactPageView = new ArdefactPageView({model : ardefactPageModel});

            this.headerView.render();
            this.searchBarController.show();
            ardefactPageModel.fetch();

          }
        });

        var router = new ArdefactRouter();
        Backbone.history.start();
        return router;
      };

      return {
        initialize : initialize
      };
    }
  );
}());