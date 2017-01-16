(function() {
  define(['jquery',
    'backbone',
    'text!templates/Footer.html'
  ],
    ($, Backbone, FooterHtml) => Backbone.View.extend({
      el: $("#footer"),
      render() {
        console.log("rendering footer");
        $(this.el).html(FooterHtml);
        return this;
      }
    })
  );
}());