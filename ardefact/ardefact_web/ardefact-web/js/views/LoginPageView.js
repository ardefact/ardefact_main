(function () {
  define(
    ['jquery',
      'underscore',
      'js_cookie',
      'backbone',
      'js_autogrow',
      'config',
      'Events',
      'constants',
      'text!templates/LoginPage.html'
    ], ($, _,
        JsCookie,
        Backbone,
        JsAutoGrow,
        Config,
        Events,
        Constants,
        LoginPageHtml) => {
      return Backbone.View.extend(
        {
          el : $('#mainContent'),
          render() {
            $(this.el).html(LoginPageHtml);

            // form specific magic
            $("#login-button").click(
              function (event) {
                event.preventDefault();

                const email = $('#email').val().trim();
                const password = $('#password').val().trim();

                const request = $.post(
                  `${Config.apiUrlRoot}/login`, {
                    email    : email,
                    password : password
                  });
                request.done(
                  () => {
                    // success animation

                    $('form').fadeOut(500);
                    $('.wrapper').addClass('form-success');
                    setTimeout(
                      () =>
                        Events.fireEvent(
                          Constants.EVENTS.AUTHENTICATED), 500);

                  });

                request.fail(
                  () => {
                    alert("Please try again");
                  });


              });

            $(
              function () {
                $('.autogrow').autoGrowInput({minWidth : 210, maxWidth : 610, comfortZone : 0});
              });

            return this;
          }
        }
      );
    });

}());