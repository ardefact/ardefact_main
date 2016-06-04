(function(){
  define(
    ['backbone',
      'views/LoginPageView'
    ], (Backbone, LoginPageView) => {
      // return constructor function
      return function() {
        this.loginPageView = new LoginPageView();
      };
    });
}());