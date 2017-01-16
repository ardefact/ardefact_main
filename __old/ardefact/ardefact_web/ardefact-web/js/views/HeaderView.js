(function() {
  define(
    ['jquery',
      'underscore',
      'backbone',
      'Events',
      'constants',
      'text!templates/Header.html'
    ], 
    ($, _, Backbone, Events, Constants, HeaderHtml) => {
      var HeaderView = Backbone.View.extend(
        {
          el     : $("#header"),
          template: _.template(HeaderHtml),
          render() {
            
            function logout() {
              Events.fireEvent(Constants.EVENTS.LOGOUT);
            };
            
            document.logout = logout;
            
            $(this.el).html(this.template({
              newArdefactPageUrl: `#${Constants.PAGE_URIS.UPLOAD_PAGE}`
                                          }));
            
            return this;
          }
        });
      return HeaderView;
    }
  );
}());