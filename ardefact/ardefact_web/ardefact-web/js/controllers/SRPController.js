(function() {
  'use strict';

  define(['backbone',
      'utils',
      'config',
      'constants',
      'Events',
      'views/ArdefactSRPView',
      'models/ArdefactSRP'],
    (Backbone,
     Utils,
     Config,
     Constants,
     Events,
     ArdefactSRPView,
     ArdefactSRPModel) => {
      const AymbiiUrl = Config.apiUrlRoot + "/aymbii";

      var inAYMBII = true;

      return function () {
        this.srpModel = _.extend(new ArdefactSRPModel(), Backbone.Events);
        this.srpModel.url = AymbiiUrl;
        this.srpView = new ArdefactSRPView({collection : this.srpModel});

        Events.listenToEvent(this.srpModel, Constants.EVENTS.KEYWORDS_SEARCH, keywords => {
          if (!Utils.isEmpty(keywords) && keywords !== Constants.DEFAULTS.KEYWORDS) {
            console.log(`Got some query ${keywords}`);
            this.srpModel.url = `${Config.apiUrlRoot}/search?keywords=${keywords}`;
            this.srpModel.fetch();
            inAYMBII = false;
          } else {
            this.srpModel.url = AymbiiUrl;
            // only fetch if we were not in AYMBII already
            if (!inAYMBII) {
              this.srpModel.fetch();
              inAYMBII = true;
            }
          }
        });

        this.fetch = () => {
          this.srpModel.fetch();
        };

        this.show = () => {
          this.srpView.render();
        };
      };
    });
}());