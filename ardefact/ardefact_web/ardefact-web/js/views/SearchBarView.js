(function() {
  'use strict';

  define(['jquery',
      'underscore',
      'backbone',
      'utils',
      'constants',
      'models/SearchBarModel',
      'text!templates/SearchBar.html'
    ],
    ($,
     _,
     Backbone,
     Utils,
     Constants,
     SearchBarModel,
     SearchBarHtml) => {
      var view = Backbone.View.extend({
        el : $("#searchBar"),

        getKeywordsInputEl : function () {
          return this.$("#keywordsInput");
        },

        render : function () {
          $(this.el).html(SearchBarHtml);
          // listen and relay messages from keywords input element
          // to the global dispatcher
          const searchInputEl = this.getKeywordsInputEl();

          // bind a function to keywords input that will clear the default text if its the first time user is focusing on it
          searchInputEl.focus(() => {
            var keywords = searchInputEl.val().trim();
            if (Constants.DEFAULTS.KEYWORDS === keywords) {
              this.model.set({keywords : ""});
              searchInputEl.val("");
            }
          });
          searchInputEl.focusout(() => {
            const keywords = searchInputEl.val().trim();
            if (keywords === undefined || keywords === null || keywords.length === 0) {
              this.model.set({keywords : Constants.DEFAULTS.KEYWORDS});
              searchInputEl.val(Constants.DEFAULTS.KEYWORDS);
            }
          });
          searchInputEl.on('input', () => {
            this.model.set({keywords : searchInputEl.val().trim()});
          });

          searchInputEl.val(this.model.get("keywords"));

          return this;
        }
      });
      return view;
    }
  );
}());