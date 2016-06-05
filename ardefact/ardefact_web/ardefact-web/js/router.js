(function() {
  'use strict';

  define(['jquery',
      'underscore',
      'backbone',
      'js_cookie',
      'Events',
      'config',
      'utils',
      'constants',
      'controllers/SearchBarController',
      'controllers/SRPController',
      'views/LoginPageView',
      'views/HeaderView',
      'views/FooterView',
      'views/ArdefactSearchResultView',
      'views/ArdefactPageView',
      'models/ArdefactPageModel'],
    ($,
     _,
     Backbone,
     JsCookie,
     Events,
     Config,
     Utils,
     Constants,
     SearchBarController,
     SRPController,
     LoginPageView,
     HeaderView,
     FooterView,
     ArdefactSearchResultView,
     ArdefactPageView,
     ArdefactPageModel) => {
      var initialize = function () {

        const authCheck = () => 'true' === JsCookie.get(Constants.COOKIE_KEYS.AUTHENTICATED);

        var ArdefactRouter = Backbone.Router.extend({
          routes : {
            ""             : "homePage",
            "ardefact/:id" : "ardefactPage"
          },

          initialize : function () {
            console.log("initializing..");

            /*
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
            */
            
            Events.listenToEvent(this, 
                                 Constants.EVENTS.LOGIN_SUCCESSFUL,
                                 () => {
                                   this.homePage();
                                 }
            );

            this.headerView = new HeaderView();
            this.footerView = new FooterView();
            this.loginPageView = new LoginPageView();
          },

          // require auth check for each page.
          // redirect to login page if fails.
          execute(callback, args, name) {
            if (!authCheck()) {
              this.loginPage();
            }
            else {
              if (callback) {
                callback.apply(this, args);
              }
            }
          },
          
          loginPage() {
            this.loginPageView.render();
          },
          
          homePage() {
            console.log("Home page...");
            this.footerView.render();
            this.headerView.render();
          },

          searchPage() {
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