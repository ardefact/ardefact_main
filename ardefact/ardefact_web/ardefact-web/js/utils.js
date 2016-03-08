define(['underscore',
  'backbone',
  'jquery'], function(_, Backbone, $){
  return {
    makeImageUrl: function(ardefactId) {
      return "images/items/" + ardefactId + ".jpg";
    },
    isEmpty(str) {
      return str === undefined || str === null || str.length === 0;
    }
  };
});