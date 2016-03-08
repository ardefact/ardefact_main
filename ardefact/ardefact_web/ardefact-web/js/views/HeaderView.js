define(['jquery',
  'underscore',
  'backbone',
  'text!templates/Header.html'
  ],
  function($, _, Backbone, headerHtml) {
    var HeaderView = Backbone.View.extend({
      el: $("#header"),
      render: function() {
        $(this.el).html(headerHtml);
        return this;
      }
    });
    return HeaderView;
  }
);