(function(){
  'use strict';
  
  define(
    ['backbone',
      'config'
    ], (Backbone, Config) => {
      var UserModel = Backbone.Model.extend(
        {
          url: () => Config.apiUrlRoot + '/user?id=' + this.id,
          defaults: {
            id: null

          }
          
        }
      );
      return UserModel;
    });
}());