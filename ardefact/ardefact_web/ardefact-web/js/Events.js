/**
 * Global API for listening to, and triggering events.
 *
 */
(function() {
  'use strict';

  define(['underscore',
    'backbone'], (_, Backbone) => {

    // this object serves as a global dispatcher
    const GLOBAL_DISPATCHER_OBJECT = _.extend({}, Backbone.Events);

    return {
      /**
       * registers obj to listen to a given eventname.
       * When event is fired callback will be invoked
       *
       * @param obj
       * @param eventname
       * @param callback
       */
      listenToEvent(obj, eventname, callback) {
        obj.listenTo(GLOBAL_DISPATCHER_OBJECT, eventname, callback);
      },
      /**
       * Fires an event with a given eventname and optional arguments.
       * @param eventname
       */
      fireEvent(eventname) {
        if (!eventname) {
          console.log("EMPTY EVENT NAME WTF!");
        }
        // make sure we pass any optional parameters to event by passing them on to trigger function
        GLOBAL_DISPATCHER_OBJECT.trigger.apply(GLOBAL_DISPATCHER_OBJECT, [eventname].concat(Array.prototype.slice.call(arguments, 1)));
      }
    };
  });
}());
