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
    $scope.selectedMediaPos = undefined;
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
                        "iconAnchor": [87, 35]
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
        link: function(scope, element, attrs) {

            function draw() {
              var tmpl = '<div class="gridView">', maxWorksInPage = 9, worksInPage = 0;
              tmpl+= '<nav id="nav.arrows">';
              tmpl+= '  <a href="javascript:;" ng-click="previousItem()" class="icon_arrow-left"></a>';
              tmpl+= '  <a href="javascript:;" ng-click="nextItem()" class="icon_arrow-right"></a>';
              tmpl+= '</nav>';

              tmpl+= '<div class="gridViewContainer round-top round-bottom">';
              for (var i in scope.works) {
                var work = scope.works[i];
                worksInPage++;
                if (worksInPage == 1) tmpl +='<div class="gridViewPage"><div class="gridViewParent round-top round-bottom">';
                tmpl +='<div class="gridViewChild round-top round-bottom drop-shadow-glow-layer">';
                tmpl +='  <div class="cover round-top round-bottom drop-shadow-glow-layer">';
                tmpl +='    <span class="title">'+work.title+'</span><span>'+work.description+'</span>';
                tmpl +='  </div>';
                tmpl +='  <div class="media">';
                tmpl +='<ul>';
                for (var j in work.media) {
                  var media = work.media[j];
                  if (media.type=='image') {
                    tmpl +='  <li>';
                    tmpl +='      <img src="assets/works/'+work.title+'/'+media.path+'" class="round-top round-bottom" width="300px" height="185px">';
                    tmpl +='  </li>';
                  }
                  if (media.type=='video') {}
                }
                tmpl +='</ul>';
                tmpl +='  </div>';
                tmpl +='  <div class="text">';
                tmpl +='    <div class="text-inner">';
                tmpl +='      <span class="title">'+work.metadata.category+'</span><span class="subtitle">'+work.metadata.date+'</span>';
                tmpl +='      <p>'+work.text+'</p>';
                tmpl +='    </div>';
                tmpl +='  </div>';
                tmpl +='</div>';
                if (worksInPage == maxWorksInPage) tmpl +='</div></div>';
                if (worksInPage == maxWorksInPage) worksInPage = 0;
              }
              tmpl +='</div></div>';
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
                toogleText(getElement(),show,true);
            }
            scope.nextItem = function() {
              var totalPages = $('.gridViewPage').length;
              var totalMedia = $('.media:eq('+scope.selectedWorkPos+') ul li').length;
              if (scope.viewType == "overview") {
                var nextPos = scope.selectedPage+1;
                if (nextPos > totalPages) nextPos = 1;
                showPage(nextPos, true);
              } else {
                var nextPos = scope.selectedMediaPos+1;
                if (nextPos > totalMedia) nextPos = 1;
                showMedia(nextPos, true);
              }
            }
            scope.previousItem = function() {
              var totalPages = $('.gridViewPage').length;
              var totalMedia = $('.media:eq('+scope.selectedWorkPos+') ul li').length;
              if (scope.viewType == "overview") {
                var nextPos = scope.selectedPage-1;
                if (nextPos < 1) nextPos = totalPages;
                showPage(nextPos, true);
              } else {
                var nextPos = scope.selectedMediaPos-1;
                if (nextPos < 1) nextPos = totalMedia;
                showMedia(nextPos, true);
              }
            }
            scope.selectMedia = function(index) {
                showMedia(index+1, true);
            }
            scope.selectPage = function(index) {
                showPage(index+1, true);
            }
            scope.video = function(event) {
                var videoElements = angular.element(event.srcElement);
                videoElements[0].pause();
            }
            function init() {
                setTimeout(function () {
                    show();
                    createGridView();
                    createGridPageView();
                }, 100);
            }
            function show() {
                $('#work-title').hide();
                showPage(1, false);
                addMouseListener();
            }
            function createGridView() {
              $('.gridViewPage').each(function(i,j) {
                arrangeGridView((i+1), false);
              });
            }
            function createGridPageView() {
              var xPos = 0;
              $('.gridViewPage').each(function(i,j) {
                  $(this).css({left:xPos+'px'});
                  xPos += $(this).width()+20;
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
              xPos = 0;
              $('.gridViewPage:eq('+(page-1)+') .gridViewChild').each(function(i,j) {
                  $(this).css({left:0+'px', top:0+'px', width:endWidth+'px', height:endHeight+'px', display:'block'});
                  elements.push({element:$(this),left:xPos, top:yPos});
                  xPos += endWidth+xMargin;
                  if (yIndex == 2) {
                      yPos += endHeight+yMargin;
                      xPos = 0;
                      yIndex = 0;
                  } else {
                      yIndex++;
                  }
                  var xPos2 = 0;
                  $('.gridViewChild:eq('+i+') .media ul li').each(function(i,j) {
                      $(this).css({left:xPos2+'px'});
                      xPos2 += 300;
                  });
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

                $('.gridViewChild:eq('+workPos+')').animate({top:endTop, left:endLeft, width: endWidth, height:endHeight}, 185, function() {
                  $('.gridViewChild').hide();
                  $(this).show();
                });
                $('.media:eq('+workPos+') ul li:eq(0) img').animate({top:endTop, left:endLeft, width: endWidth,height:endHeight}, 185);
                $('.text:eq('+workPos+')').css({'width': endWidth+'px','height':endHeight+'px'});

                element.children('.cover').hide();
                element.children('.text').hide();

                scope.viewType = "image";
                scope.selectedWork = scope.works[workPos];
                scope.selectedWorkPos = workPos;
                scope.$apply();

                $('#logo-white').hide();

                var xPos = 0;
                $('.gridViewChild:eq('+workPos+') .media ul li').each(function(i,j) {
                    $(this).css({left:xPos+'px'});
                    $('.media:eq('+workPos+') ul li:eq('+i+') img').css({width:'960px', height:'600px'});
                    xPos += 940;
                });

                showMedia(1, false);
            }
            function showMedia(pos, animate) {
              setNav(pos);
              if ( scope.selectedMediaPos == pos ) return;

              var workPos = scope.selectedWorkPos;
              var totalMedia = $('.media:eq('+workPos+') ul li').length;

              $('.media').show();

              if (animate) {
                time = 500;
              } else {
                time = 0;
              }
              var offsetX = 980;

              if (scope.selectedMediaPos < pos && pos > 1 ) {
                if ( scope.selectedMediaPos == 1) offsetX = 960;
                $('.media:eq('+workPos+') ul li:eq('+(pos-1)+')').css({left:offsetX+'px'}, time);
              } else {
                if ( scope.selectedMediaPos == 2) offsetX = 960;
                $('.media:eq('+workPos+') ul li:eq('+(pos-1)+')').css({left:-offsetX+'px'}, time);
              }
              $('.media:eq('+workPos+') ul li:eq('+(pos-1)+')').transition({left:0+'px'}, time);

              if (scope.selectedMediaPos < pos && pos > 1 ) {
                $('.media:eq('+workPos+') ul li:eq('+(scope.selectedMediaPos-1)+')').transition({left:-offsetX+'px'}, time);
              } else if (scope.selectedMediaPos > pos && pos < totalMedia ) {
                $('.media:eq('+workPos+') ul li:eq('+(scope.selectedMediaPos-1)+')').transition({left: offsetX+'px'}, time);
              }
              scope.selectedMediaPos = pos;
              toogleText(getElement(),false,false);
            }
            function showPage(pos, animate) {
              setPageNav(pos);
              if ( scope.selectedPage == pos ) return;

              var totalPages = $('.gridViewPage').length;
              if (animate) {
                time = 500;
              } else {
                time = 0;
              }

              $('.media').hide();
              if (scope.selectedPage < pos && pos > 1 ) {
                $('.gridViewPage:eq('+(pos-1)+')').css({left:960+'px'}, time);
              } else {
                $('.gridViewPage:eq('+(pos-1)+')').css({left:-960+'px'}, time);
              }
              $('.gridViewPage:eq('+(pos-1)+')').transition({left:0+'px'}, time);

              if (scope.selectedPage < pos && pos > 1 ) {
                $('.gridViewPage:eq('+(scope.selectedPage-1)+')').transition({left:-960+'px'}, time);
              } else if (scope.selectedPage > pos && pos < totalPages ) {
                $('.gridViewPage:eq('+(scope.selectedPage-1)+')').transition({left: 960+'px'}, time);
              }
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

                $('#nav.arrows').hide();
                $('#logo-white').show();
                toogleText(element,false,false);

                var workPos = scope.selectedWorkPos;
                var pagePos = scope.selectedPage;
                var position = getChildPosition(pagePos, (workPos-((pagePos-1)*9)));
                var endWidth = 300;
                var endHeight = 185;
                var endLeft = position.left;
                var endTop = position.top;

                showMedia(1, false);
                $('.gridViewChild').show();

                $('.gridViewChild:eq('+workPos+')').animate({top:endTop, left:endLeft, width: endWidth, height:endHeight}, 185, function() {
                  element.children('.cover').show();
                });
                $('.media:eq('+workPos+') ul li:eq(0) img').animate({top:endTop, left:endLeft, width: endWidth,height:endHeight}, 185);
                $('.text:eq('+workPos+')').css({'width':'300px','height':'185px'});
                //element.children('.media').delay(200).fadeTo(150, 1);

                scope.selectedWork = undefined;
                scope.selectedWorkPos = undefined;
                scope.viewType = "overview";
                scope.$apply();
            }
            function toogleText(element, show, animate) {
                if (show) {
                    element.children('.text').show();
                    element.children('.text').css({top:0+"px"});
                    if ( animate ) {
                      element.children('.text').css({top:element.children('.text').height()+"px"});
                      element.children('.text').animate({top:0+"px"}, 180);
                    }
                    scope.viewType = "text";
                } else {
                    if ( animate ) {
                      element.children('.text').css({top:0+"px"});
                      element.children('.text').animate({top:element.children('.text').height()+"px"}, 320);
                    } else {
                      element.children('.text').hide();
                    }
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
                element.children('.media').show();
                //element.children('.cover').animate({'width':1,'height':1, 'margin':'95px 150px', 'opacity':0}, 180);
                element.children('.cover').animate({top:element.children('.cover').height()+"px"}, 120);
            }
            function handleMouseOut(element) {
                if ( scope.selectedWork ) return;
                element.children('.cover').animate({top:0+"px"}, 180);
                //element.children('.cover').animate({'width':300,'height':185, 'margin':'0px 0px', 'opacity':100}, 120);
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
