/**
 * Controller functions for working with googlemaps.
 *
 * Contains a set of markers and utility functions to zoom in to a set of markers or to just one.
 *
 * @author lev@ardefact.com
 *
 */

(function() {
  'use strict';

  define(['underscore',
    'maybe',
    'constants',
    'Events',
    'utils'], (_, Maybe, Constants, Events, Utils) => {

    var mapDOM = $(".map");

    /**
     * Map between ardefact id and corresponding marker
     * @type {{}}
     */
    var markersMap = {};

    var getMap = function () {
      return window.map;
    };

    /**
     * Creates a marker that corresponds to a given ardefact
     * @param ardefact
     * @returns {*}
     */
    var getMarker = ardefact => {
      var key = ardefact.id;
      if (key in markersMap) {
        return markersMap[key];
      }

      var location = ardefact.location;

      var marker = new google.maps.Marker({
        map      : getMap(),
        title    : ardefact.title,
        position : new google.maps.LatLng(location.lat, location.lng)
      });

      marker.addListener("mousedown", function () {
        Events.fireEvent(Constants.EVENTS.MARKER_CLICK, ardefact);
      });

      markersMap[key] = marker;
      return marker;
    };

    var getLatLngFromArdefact = function (ardefact) {
      return Maybe.fromNullable(ardefact).map(function (ardefact) {
        return ardefact.location;
      }).map(function (location) {
        return new google.maps.LatLng(location.lat, location.lng);
      });
    };

    var getBounds = function (ardefacts) {
      var bounds = new google.maps.LatLngBounds();
      _.each(ardefacts, function (ardefact) {
        var latLng = getLatLngFromArdefact(ardefact);
        if (latLng.isJust) {
          bounds.extend(latLng.get());
        }
      });
      return bounds;
    };


    return {
      getMap : getMap,

      goTo(ardefact) {
        var location = ardefact.location;
        if (location) {
          getMap().setZoom(12.0);
          getMap().panTo(new google.maps.LatLng(location.lat, location.lng));
          _.each(_.values(markersMap), marker => {
            marker.setOpacity(0.3);
          });
          getMarker(ardefact).setOpacity(1.0);
        }
      },

      showAllMarkers(ardefacts) {
        if (ardefacts.length > 1) {
          _.each(ardefacts, ardefact => {
            getMarker(ardefact).setOpacity(1.0);
          });
          var bounds = getBounds(ardefacts);
          getMap().fitBounds(bounds);
        } else if (ardefacts.length === 1) {
          this.goTo(ardefacts[0]);
        }
      },

      moveMap(newDOMParent) {
        mapDOM.detach();
        newDOMParent.append(mapDOM);
        google.maps.event.trigger(getMap(), 'resize');
      }
    };
  });
}());