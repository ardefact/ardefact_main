(function() {
  define(
    ['jquery',
      'underscore',
      'backbone',
      'text!templates/Header.html'
    ], 
    ($, _, Backbone, headerHtml) => {
      var HeaderView = Backbone.View.extend(
        {
          el     : $("#header"),
          render() {
            $(this.el).html(headerHtml);
            return this;
          }
        });
      return HeaderView;
    }
  );
}());