var module = angular
  .module('pascalbaumann-com', [])

function ClientsCtrl($scope, $http) {
    $scope.clients = [];
    $scope.loadClients = function() {
        var httpRequest = $http({
            method: 'GET',
            url: '/assets/clients.json'
        }).success(function(data, status) {
            $scope.clients = data;
        });
    };
    $scope.loadClients();
}

module.directive('map', function() {

    return {
        restrict: 'E',
        replace: true,
        template: '<div id="map_canvas"></div>',
        link: function(scope, element, attrs) {
            var map = L.mapbox.map('map_canvas', 'pascalbaumann.map-bocmbect')
                .setView([47.373092,8.524098], 17);
            var geoJson = [{
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [8.524098,47.373092]
                },
                "properties": {
                    "icon": {
                        "iconUrl": "assets/images/again.png",
                        "iconSize": [171, 100],
                        "iconAnchor": [68, 100] 
                    }
                }
            }];
            map.markerLayer.on('layeradd', function(e)
            {
                var marker = e.layer,
                    feature = marker.feature;
                marker.setIcon(L.icon(feature.properties.icon));
            });
            map.markerLayer.setGeoJSON(geoJson);
            map.touchZoom.disable();
            map.scrollWheelZoom.disable();
            if (detectTouchSupport())
                map.dragging.disable();
            if (map.tap) map.tap.disable();
        }
    };
});


    