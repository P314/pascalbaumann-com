var module = angular
  .module('pascalbaumann-com', ['ngResource','ngSanitize'])

module.factory('jsonLoader', function($http){
    return {
        getWorks: function(callback){
            var httpRequest = $http({
            method: 'GET',
            url: '/assets/works.json'
            }).success(function(data, status) {
                callback(data);
            });
        },
       getClients: function(callback){
            var httpRequest = $http({
            method: 'GET',
            url: '/assets/clients.json'
            }).success(function(data, status) {
                callback(data);
            });
        }
    }
});

function WorksCtrl($scope, jsonLoader){
    $scope.works = [];
    $scope.viewType = "overview";
    $scope.selectedWork = undefined;
    $scope.canShowNav = function() {
        return ($scope.viewType == 'overview') ? false:true; 
    };
    jsonLoader.getWorks(function(data){
        $scope.works = data;
    });
}

function ClientsCtrl($scope, jsonLoader) {
    $scope.clients = [];
    jsonLoader.getClients(function(data){
        $scope.clients = data;
    });
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

module.directive('work', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'app/templates/work.htm', 

        link: function(scope, element, attrs) {
            scope.activeChild = undefined;
            scope.$watch('works', function(newval, oldval){
                if(newval){
                    if (newval.length > 0)
                        init();
                }
            },true);
            scope.toogleText = function(show) {
                if (!scope.activeChild) return;
                toogleText($('.gridViewChild:eq('+scope.activeChild+')'),show);
            };
            function init() {
                $('#work-title').hide();
                $('#logo-white').hide();
                $('.gridViewParent').gridview({
                    animationSpeed: 300,
                    width: 938,
                    height: 599,
                    margin:10,
                    scrollToZoom: false,
                });
                $('.gridViewParent').gridview('zoom', {
                    level:3,
                    animate:false,
                });
                $('.gridViewChild .media img').css({width: 300,height: 185});
                $('.gridViewChild').mouseover(function() {
                    if ( scope.activeChild ) return;
                    $(this).children('.cover').hide();
                });
                $('.gridViewChild').mouseleave(function() {
                    if ( scope.activeChild ) return;
                    $(this).children('.cover').show();
                });
                $('.gridViewChild').click(function() {
                    if ( scope.activeChild == undefined ) {
                      scope.viewType = "image";
                      var inVal = $( ".gridViewChild" ).index($(this));
                      $('.gridViewParent').gridview('zoomTo', inVal);
                      $('.media img').animate({width: 938,height:599}, 300);
                      $(this).children('.cover').hide();
                      $(this).children('.text').hide();
                      scope.activeChild = inVal;
                      scope.selectedWork = scope.works[inVal];
                      scope.$apply();
                    } else {
                      scope.activeChild = undefined;
                      scope.selectedWork = undefined;
                      scope.viewType = "overview";
                      $('.gridViewParent').gridview('zoom', {
                        level: 3
                      });
                      $(this).children('.text').hide();
                      $(this).children('.media').delay(200).fadeTo(150, 1);
                      $('.media img').animate({width: 300,height: 185}, 300);
                      scope.$apply();
                    }
                });
            }
            function toogleText(element, show) {
                if (show) {
                    element.children('.media').addClass('blur');
                    element.children('.text').show();
                    scope.viewType = "text";
                } else {
                    element.children('.media').removeClass('blur');
                    element.children('.text').hide();
                    scope.viewType = "image";
                }
            }
        }
    };
});