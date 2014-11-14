'use strict';

angular.module('pascalbaumann-com')
  .directive('map', function() {
    return {
      restrict: 'E',
      replace: true,
      template: '<div id="map_canvas"></div>',
      link: function(scope, element, attrs) {
        var map = L.mapbox.map('map_canvas', 'pascalbaumann.map-bocmbect', {accessToken: 'pk.eyJ1IjoicGFzY2FsYmF1bWFubiIsImEiOiJSckJBdmV3In0.Ko_R3Z2VST6qT_xdmbzoMQ'});
        var geoJson = [{
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
            'coordinates': [8.524098,47.373092]
          },
          'properties': {
            'icon': {
              'iconUrl': 'assets/images/again.png',
              'iconSize': [171, 100],
              'iconAnchor': [87, 35]
            }
          }
        }];
        map.setView([47.373092,8.524098], 17);
        map.markerLayer.on('layeradd', function(e) {
            var marker = e.layer,
                feature = marker.feature;
            marker.setIcon(L.icon(feature.properties.icon));
        });
        map.markerLayer.setGeoJSON(geoJson);
        map.touchZoom.disable();
        map.scrollWheelZoom.disable();
        if (scope.UTIL.detectTouchSupport()) {
          map.dragging.disable();
        }
        if (map.tap) { map.tap.disable(); }
      }
    };
});
