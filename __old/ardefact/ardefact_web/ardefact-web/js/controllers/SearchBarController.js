/**
 * Contains both view and model for the search bar.
 *
 * Rest of the UI interacts with search bar via events, or through controller
 */

(function() {
  'use strict';

  define(['underscore',
      'utils',
      'Events',
      'constants',
      'views/SearchBarView',
      'models/SearchBarModel'],
    (_,
     Utils,
     Events,
     Constants,
     SearchBarView,
     SearchBarModel) => {

      const TIMEOUT = 400;

      var keywordQuery = "";

      return function () {
        this.searchBarModel = new SearchBarModel();
        this.searchBarModel.on('change:keywords', (model, keywords) => {
          // only fire those queries that were not preceded by anything closer than TIMEOUT in time
          keywordQuery = keywords;
          setTimeout(() => {
            if (keywords === keywordQuery) {
              Events.fireEvent(Constants.EVENTS.KEYWORDS_SEARCH, keywords);
            }
          }, TIMEOUT);
        });

        this.searchBarView = new SearchBarView({model : this.searchBarModel});

        this.show = () => {
          this.searchBarView.render();
        };
      };
    });
}());