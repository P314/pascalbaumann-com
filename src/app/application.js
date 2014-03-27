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
    $scope.pages = [];
    $scope.viewType = "overview";
    $scope.selectedWork = undefined;
    $scope.selectedPage = undefined;
    $scope.canShowNav = function() {
        return ($scope.viewType == 'overview') ? false:true;
    };
    $scope.canShowPageNav = function() {
        return ($scope.viewType == 'overview' && $scope.works.length > 9 ) ? true:false;
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

module.directive('work', function($compile) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'app/templates/works.htm',
        link: function(scope, element, attrs) {

            function draw() {
              var tmpl = '', maxWorksInPage = 9, worksInPage = 0;
              for (var i in scope.works) {
                var work = scope.works[i];
                worksInPage++;
                if (worksInPage == 1) tmpl +='<div class="gridViewPage"><div class="gridViewParent round-top round-bottom">';
                tmpl +='<div class="gridViewChild round-top round-bottom drop-shadow-glow-layer">';
                tmpl +='  <div class="cover round-top round-bottom">';
                tmpl +='    <span>'+work.title+'<br>'+work.description+'</span>';
                tmpl +='  </div>';
                tmpl +='  <div class="media">';
                tmpl +='<ul>';
                for (var j in work.media) {
                  var media = work.media[j];
                  tmpl +='  <li>';
                  if (media.type=='image') {
                    tmpl +='      <img src="assets/works/'+work.title+'/'+media.path+'" class="round-top round-bottom" width="300px" height="185px">';
                  }
                  if (media.type=='video') {
                    tmpl +='';
                  }
                  tmpl +='  </li>';
                }
                tmpl +='</ul>';
                tmpl +='  </div>';
                tmpl +='  <div class="text">';
                tmpl +='    <div class="text-inner">';
                tmpl +='      <p>'+work.metadata.category+'<br>'+work.metadata.date+'</p>';
                tmpl +='      <p>'+work.text+'</p>';
                tmpl +='    </div>';
                tmpl +='  </div>';
                tmpl +='</div>';
                if (worksInPage == maxWorksInPage) tmpl +='</div></div>';
                if (worksInPage == maxWorksInPage) worksInPage = 0;
              }
              var newElement = angular.element(tmpl);
              $compile(newElement)(scope);
              element.replaceWith(newElement);
              scope.pages = $('.gridViewPage');
            }

            scope.$watch('works', function(newval, oldval){
                if(newval){
                    if (newval.length > 0)
                    {
                      draw();
                      init();
                    }
                }
            },true);
            scope.toogleText = function(show) {
                if (!scope.selectedWork) return;
                toogleText(getElement(),show);
            };
            scope.selectMedia = function(index) {
                showMedia(index+1);
            }
            scope.selectPage = function(index) {
                showPage(index+1);
            }
            scope.video = function(event) {
                var videoElements = angular.element(event.srcElement);
                videoElements[0].pause();
            }
            function init() {
                setTimeout(function () {
                    show();
                    createGridView();
                }, 100);
            }
            function show() {
                $('#work-title').hide();
                showPage(1);
                addMouseListener();
            }
            function createGridView() {
              $('.gridViewPage').each(function(i,j) {
                arrangeGridView((i+1), false);
              });
            }
            function arrangeGridView(page, animate) {
              var xPos = 0;
              var yPos = 0;
              var yMargin = 22;
              var xMargin = 20;
              var yIndex = 0;
              var elements = [];
              var endWidth = 300;
              var endHeight = 185;

              $('.gridViewPage:eq('+(page-1)+') .gridViewChild').each(function(i,j) {
                  $(this).css({left:0+'px', top:0+'px', width:endWidth+'px', height:endHeight+'px'});
                  elements.push({element:$(this),left:xPos, top:yPos});
                  xPos += endWidth+xMargin;
                  if (yIndex == 2) {
                      yPos += endHeight+yMargin;
                      xPos = 0;
                      yIndex = 0;
                  } else {
                      yIndex++;
                  }
              });
              for (var i=0;i<elements.length;i++) {
                var element = elements[i].element;
                element.css({position:'absolute', 'z-index':'100'});
                if ( animate ) {
                  $element.transition({left:elements[i].left+'px', top:elements[i].top+'px', width:endWidth+'px', height:endHeight+'px'}, 500, 'snap');
                } else {
                  element.css({left:elements[i].left+'px', top:elements[i].top+'px', width:endWidth+'px', height:endHeight+'px'});
                }
              }
            }
            function maximize(element) {
                var workPos = $( ".gridViewChild" ).index(element);

                $('.gridViewChild').css({'z-index':100});
                $('.gridViewChild:eq('+workPos+')').css({'z-index':101});

                var endWidth = 940;
                var endHeight = 600;
                var endLeft = 0;
                var endTop = 0;

                $('.gridViewChild:eq('+workPos+')').animate({top:endTop, left:endLeft, width: endWidth, height:endHeight}, 185);
                $('.media:eq('+workPos+') img').animate({top:endTop, left:endLeft, width: endWidth,height:endHeight}, 185);
                $('.text:eq('+workPos+')').css({'width': endWidth+'px','height':endHeight+'px'});

                element.children('.cover').hide();
                element.children('.text').hide();

                scope.viewType = "image";
                scope.selectedWork = scope.works[workPos];
                scope.selectedWorkPos = workPos;
                scope.$apply();
                showMedia(1);
                $('#logo-white').hide();
            }
            function showMedia(pos) {
                var workPos = scope.selectedWorkPos;
                $('.media:eq('+workPos+') img').hide();
                $('.media:eq('+workPos+') img:eq('+(pos-2)+')').show();
                setNav(pos);
                toogleText(getElement(),false);
            }
            function showPage(pos) {
              $('.gridViewPage').hide();
              $('.gridViewPage:eq('+(pos-1)+')').show();
              setPageNav(pos);
              scope.selectedPage = pos;
            }
            function setPageNav(pos) {
                $('nav.page ul li').removeClass('active');
                $('nav.page ul li:eq('+(pos-1)+')').addClass('active');
            }
            function setNav(pos) {
                $('nav.media ul li').removeClass('active');
                $('nav.media ul li:eq('+(pos-1)+')').addClass('active');
            }
            function minimize(element) {
                showMedia(1);
                $('#logo-white').show();
                toogleText(element,false);

                var workPos = scope.selectedWorkPos;
                var pagePos = scope.selectedPage;
                var position = getChildPosition(pagePos, (workPos-((pagePos-1)*9)));
                var endWidth = 300;
                var endHeight = 185;
                var endLeft = position.left;
                var endTop = position.top;

                $('.gridViewChild:eq('+workPos+')').animate({top:endTop, left:endLeft, width: endWidth, height:endHeight}, 185);
                $('.media:eq('+workPos+') img').animate({top:endTop, left:endLeft, width: endWidth,height:endHeight}, 185);
                $('.text:eq('+workPos+')').css({'width':'300px','height':'185px'});
                element.children('.media').delay(200).fadeTo(150, 1);

                scope.selectedWork = undefined;
                scope.selectedWorkPos = undefined;
                scope.viewType = "overview";
                scope.$apply();
            }
            function toogleText(element, show) {
                if (show) {
                    element.children('.text').show();
                    scope.viewType = "text";
                } else {
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
            function getChildPosition(pagePos, workPos) {
              var xPos = 0;
              var yPos = 0;
              var yMargin = 22;
              var xMargin = 20;
              var yIndex = 0;
              var elements = [];

              console.log(workPos);

              $('.gridViewPage:eq('+(pagePos-1)+') .gridViewChild').each(function(i,j) {
                  elements.push({left:xPos, top:yPos});
                  xPos += 300+xMargin;
                  if (yIndex == 2) {
                      yPos += 185+yMargin;
                      xPos = 0;
                      yIndex = 0;
                  } else {
                      yIndex++;
                  }
              });
              return elements[workPos];
            }
            function getElement() {
                return $('.gridViewChild:eq('+scope.selectedWorkPos+')');
            }
        }
    };
});
