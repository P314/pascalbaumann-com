var module = angular
  .module('pascalbaumann-com', ['ngResource','ngSanitize'])

module.factory('jsonLoader', function($http){
    return {
        getWorks: function(callback){
            var httpRequest = $http({
            method: 'GET',
            url: '/assets/works/works.json'
            }).success(function(data, status) {
                callback(data);
            });
        },
       getClients: function(callback){
            var httpRequest = $http({
            method: 'GET',
            url: '/assets/clients/clients.json'
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
            scope.$watch('works', function(newval, oldval){
                if(newval){
                    if (newval.length > 0)
                        init();
                }
            },true);
            scope.toogleText = function(show) {
                if (!scope.selectedWork) return;
                toogleText(getElement(),show);
            };
            scope.selectMedia = function(index) {
                showMedia(index+1);
            }
            scope.video = function(event) {
                var videoElements = angular.element(event.srcElement);
                videoElements[0].pause();
            }
            function init() {
                createGridView();
                show();
            }
            function show() {
                $('#work-title').hide();
                $('#logo-white').hide();
                $('.gridViewParent').show();
                addMouseListener();
            }
            function createGridView() {
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
            }
            function maximize(element) {
                var inVal = $( ".gridViewChild" ).index(element);
                $('.gridViewParent').gridview('zoomTo', inVal);
                $('.media img').animate({width: 938,height:599}, 300);
                $('.media videogular video').animate({width: 938,height:599}, 300);
                element.children('.cover').hide();
                element.children('.text').hide();
                scope.viewType = "image";
                scope.selectedWork = scope.works[inVal];
                scope.selectedWorkPos = inVal;
                scope.$apply();
                showMedia(1);
            }
            function showMedia(pos) {
                element.children('.media').hide();
                element.children('.media:eq('+pos+')').show();
                setNav(pos);
                toogleText(getElement(),false);
            }
            function setNav(pos) {
                $('nav.bullets ul li').removeClass('active');
                $('nav.bullets ul li:eq('+(pos-1)+')').addClass('active');
            }
            function minimize(element) {
                toogleText(element,false);
                element.children('.media').delay(200).fadeTo(150, 1);
                $('.gridViewParent').gridview('zoom', { level: 3 });
                $('.media img').animate({width: 300,height: 185}, 300);
                $('.media videogular video').animate({width: 300,height: 185}, 300);
                scope.selectedWork = undefined;
                scope.selectedWorkPos = undefined;
                scope.viewType = "overview";
                scope.$apply();
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
                setTimeout(function(){ scope.$apply(); });
            }
            function addMouseListener() {
                $('.gridViewChild').mouseover(function() { handleMouseOver($(this)) });
                $('.gridViewChild').mouseleave(function() { handleMouseOut($(this)) });
                $('.gridViewChild').click(function() { handleMouseClick($(this)) });
            }
            function removeMouseListener() {
                $('.gridViewChild').mouseover(function() {});
                $('.gridViewChild').mouseleave(function() {});
                $('.gridViewChild').click(function() {});
            }
            function handleMouseOver(element) {
                if ( scope.selectedWork ) return;
                    element.children('.cover').hide();
            }
            function handleMouseOut(element) {
                if ( scope.selectedWork ) return;
                    element.children('.cover').show();
            }
            function handleMouseClick(element) {
                if ( scope.selectedWork == undefined ) {
                    maximize(element);
                } else {
                    minimize(element);
                }
            }
            function getElement() {
                return $('.gridViewChild:eq('+scope.selectedWorkPos+')');
            }
        }
    };
});