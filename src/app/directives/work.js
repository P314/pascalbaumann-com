'use strict';

angular.module('pascalbaumann-com')
  .directive('work', function($compile) {
    return {
      restrict: 'E',
      replace: true,
      link: function(scope, element, attrs) {
        var clickTimeout;
        var currentMousePos = {};
        $(document).mousemove(function(event) {
          currentMousePos.x = event.pageX;
          currentMousePos.y = event.pageY;
        });
        objectFit.polyfill({
            selector: '.object-fit',
            fittype: 'cover'
        })
        scope.$watch('works', function(newval, oldval){
          if(newval){
            if (newval.length > 0) {
              draw();
              init();
            }
          }
        },true);
        scope.$watch('selectedWork', function(newval, oldval) {
          if(newval){
            if (newval) setArrowNav();
          }
        },true);
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
        scope.canShowArrows = function() {
          if (scope.selectedWork) {
            return true;
          }
          return false;
        }
        scope.isNumber= function (n) {
          return !isNaN(parseFloat(n)) && isFinite(n);
        }
        scope.toogleText = function(show) {
            if (!scope.selectedWork) return;
            toogleText(getElement(),show,true);
        }
        scope.nextItem = function() {
          clearTimeout(clickTimeout);
          var totalPages = getTotalPages();
          var totalMedia = getTotalMedia(scope.selectedWorkPos);
          if (scope.viewType == 'overview') {
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
          clearTimeout(clickTimeout);
          var totalPages = getTotalPages();
          var totalMedia = getTotalMedia(scope.selectedWorkPos);
          if (scope.viewType == 'overview') {
            var nextPos = scope.selectedPage-1;
            if (nextPos < 1) nextPos = totalPages;
            showPage(nextPos, true);
          } else {
            var nextPos = scope.selectedMediaPos-1;
            if (nextPos < 1) nextPos = totalMedia;
            showMedia(nextPos, true);
          }
        }
        function draw() {
          var tmpl = '<div class="gridView">', maxWorksInPage = 9, worksInPage = 0;
          tmpl+= '<nav id="nav-arrows" ng-show="canShowArrows()">';
          tmpl+= '  <a href="javascript:;" ng-click="previousItem()" class="icon_arrow-left"></a>';
          tmpl+= '  <a href="javascript:;" ng-click="nextItem()" class="icon_arrow-right"></a>';
          tmpl+= '</nav>';
          tmpl+= '<div class="gridViewContainer round-top round-bottom" ng-swipe-left="nextItem()" ng-swipe-right="previousItem()">';
          for (var i in scope.works) {
            var work = scope.works[i];
            worksInPage++;
            if (worksInPage == 1) tmpl +='<div class="gridViewPage"><div class="gridViewParent round-top round-bottom">';
            tmpl +='<div class="gridViewChild drop-shadow-glow-layer">';
            tmpl +='  <div class="cover round-top round-bottom">';
            tmpl +='    <span class="title">'+work.title+'</span><span>'+work.description+'</span>';
            tmpl +='  </div>';
            tmpl +='  <div class="media">';
            tmpl +='<ul>';
            for (var j in work.media) {
              var media = work.media[j];
              if (media.type=='image') {
                tmpl +='  <li>';
                tmpl +='      <img src="assets/works/'+media.path+'" class="content round-top round-bottom nonDraggableImage">';
                tmpl +='  </li>';
              }
              if (media.type=='video') {
                tmpl +='  <li>'
                tmpl +='      <video class="content object-fit round-top round-bottom">';
                tmpl +='        <source src="assets/works/'+media.path.mp4+'" type="video/mp4">';
                tmpl +='        <source src="assets/works/'+media.path.ogv+'" type="video/ogg">';
                tmpl +='      </video>';
                tmpl +='      <div class="play_container"><i class="icon_play"></i><i class="icon_pause"></i></div>';
                tmpl +='  </li>';
              }
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
        function handleMouseMove(event) {
          event.stopPropagation();
          if (timer) {
              clearTimeout(timer);
              timer = 0;
          }
          $('.play_container').fadeIn();
          timer = setTimeout(function() {
              $('.play_container').fadeOut()
          }, 3000)
        }
        function handleItemEnter() {
          var cover = $(this).find('.cover');
          var media = $(this).find('.media');
          var image = $(this).find('.content');
          var container = $(this);
          $(this).off();
          container.bind( 'mouseleave', handleItemLeave);
          container.bind( 'mousedown', handleItemSelected);
          itemIn(container);
        }
        function handleItemLeave() {
          var image = $(this).find('.media:eq(0) ul li:eq(0) .content')
          var container = $(this);
          itemOut(container, image)
        }
        function handleItemSelected() {
          var container = $(this);
          $('.content').off();
          container.off();
          maximize(container);
        }
        function handleItemDeSelected() {
          clickTimeout = setTimeout(function () {
            minimize(getElement());
          }, 300);
        }
        function handleMouseClickedOutside() {
          minimize(scope.selectedElement);
        }
        function init() {
          setArrowNav();
          show();
          createGridView();
          createGridPageView();
        }
        function show() {
          showPage(1, false);
          addMouseListener();
        }
        function createGridView() {
          $('.gridViewPage').each(function(i,j) {
            arrangeGridView((i+1));
          });
        }
        function createGridPageView() {
          var xPos = 0;
          $('.gridViewPage').each(function(i,j) {
              $(this).css({left:xPos+'px'});
              xPos += $(this).width()+20;
          });
        }
        function setVideoState(isRunning) {
          if (isRunning) {
            $('.play_container .icon_play').hide();
            $('.play_container .icon_pause').show();
          } else {
            $('.play_container .icon_play').show();
            $('.play_container .icon_pause').hide();
          }
        }
        function arrangeGridView(page) {
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
            element.css({position:'absolute', 'z-index':'100', left:elements[i].left+'px', top:elements[i].top+'px', width:endWidth+'px', height:endHeight+'px', opacity:100});
          }
        }
        function itemIn(container) {
          var cover = container.find('.cover');
          var media = container.find('.media');
          var image = container.find('.content');
          image.show();
          image.clearQueue();
          image.stop();
          image.css({'z-index':2});
          cover.css({'z-index':1});
          media.css({'display':'-webkit-box'});
          image.addClass('anim-work-in');
          image.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
            image.removeClass('anim-work-in');
          });
        }
        function itemOut(container, image) {
          image.show();
          image.clearQueue();
          image.stop();
          image.addClass('anim-work-out');
          image.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
            container.bind( 'mouseenter', handleItemEnter);
            image.removeClass('anim-work-out');
            $(this).hide();
          });
        }
        function maximize(element) {
            var workPos = $( '.gridViewChild' ).index(element);
            $('.gridViewChild').css({'z-index':100});
            $('.gridViewChild .media').hide();
            var endWidth = 940;
            var endHeight = 600;
            var endLeft = 0;
            var endTop = 0;
            var image = $('.media:eq('+workPos+') ul li:eq(0)').children();
            var type = (image.is( 'video' )) ? 'video':'image';
            if (image.has('x-object-fit-cover')) {
              if (!image.is( 'video' )) {
                var object = $('.media:eq('+workPos+') ul li:eq(0)').children().children();
                type = (object.is( 'video' )) ? 'video':'image';
              }
            }
            var container = $('.gridViewChild:eq('+workPos+')');
            element.css({'z-index':101});
            element.children('.text').hide();
            element.children('.cover').hide();
            element.children('.media').show();
            image.show();
            container.off();
            element.animate({top:endTop, left:endLeft, width: endWidth, height:endHeight}, 185, function() {
              $(this).show();
              container.bind( 'mouseup', handleItemDeSelected);
              $(document).bind( 'mouseup', function(event) {
                event.stopPropagation();
                var parentElement = $(event.target.parentElement.parentElement.parentElement);
                var element = $(event.target);
                var doMinimize = true;
                var attrClass = $(event.target).attr('class');
                if (attrClass) {
                  if (attrClass.substring(0,5) == 'icon_' || attrClass.substring(0,8) == 'ng-scope') {
                    doMinimize = false;
                  }
                }
                if (!parentElement.hasClass('media') && doMinimize) {
                  $(document).off();
                  minimize(getElement());
                }
              })
              if (type == 'video') {
                var timer;
                var video = angular.element(image)[0];
                if (image.has('x-object-fit-cover')) {
                  if (!image.is( 'video' )) {
                    video = angular.element(image.children())[0];
                  }
                }
                video.play();
                setVideoState(true);
                $(this).mouseleave(function(event) {
                  $('.play_container').fadeOut();
                  event.stopPropagation();
                  element.on('mousemove', handleMouseMove);
                });
                $(video).on('play', function () {
                  setVideoState(true);
                });
                $(video).on('pause', function () {
                  setVideoState(false);
                });
                element.on('mousemove', handleMouseMove);
                $('.play_container').children().mouseup(function(event) {
                  event.stopPropagation()
                  if (video.paused) {
                    video.play();
                  } else {
                    video.pause();
                  }
                });
                $('.play_container').mouseenter(function(event) {
                  event.stopPropagation()
                  if (timer) {
                      clearTimeout(timer);
                      timer = 0;
                  }
                  //element.unbind('mousemove');
                });
                $('.play_container').mouseleave(function(event) {
                  $('.play_container').fadeOut()
                  event.stopPropagation()
                  element.on('mousemove', handleMouseMove);
                });
              }
            });
            image.animate({top:endTop, left:endLeft, width: endWidth,height:endHeight}, 185);
            var xPos = 0;
            $('.gridViewChild:eq('+workPos+') .media ul li').each(function(i,j) {
                $(this).css({left:xPos+'px'});
                $('.media:eq('+workPos+') ul li:eq('+i+') .content').css({width:'960px', height:'600px'});
                xPos += 940;
            });
            scope.viewType = 'image';
            scope.selectedWork = scope.works[workPos];
            scope.selectedWorkPos = workPos;
            scope.selectedElement = element;
            scope.$apply();
            showMedia(1, false);
        }
        function minimize(element) {
          var workPos = scope.selectedWorkPos;
          var pagePos = scope.selectedPage;
          var position = getChildPosition(pagePos, (workPos-((pagePos-1)*9)));
          var endWidth = 300;
          var endHeight = 185;
          var endLeft = position.left;
          var endTop = position.top;
          var image = $('.media:eq('+workPos+') ul li:eq(0)').children();
          var container = $('.gridViewChild:eq('+workPos+')');
          container.off();
          toogleText(element,false,false);
          stopAndRewindAllVides();
          $('.play_container .icon_play').off();
          $('.background-composition').off();
          $('.gridViewChild').show();
          showMedia(1, false);
          container.animate({top:endTop, left:endLeft, width: endWidth, height:endHeight}, 185, function() {
            var isMouseOverElement = false;
            var offset = $(this).offset();
            if (currentMousePos.x >= offset.left &&
              currentMousePos.x <= (offset.left+$(this).width()) &&
              currentMousePos.y >= offset.top &&
              currentMousePos.y <= (offset.top+$(this).height())) {
                isMouseOverElement = true;
            }
            element.children('.cover').show();
            $(this).bind( 'mouseup', handleItemSelected);
            if (isMouseOverElement) {
              $(this).bind( 'mouseleave', handleItemLeave);
            } else {
              $(this).bind( 'mouseenter', handleItemEnter);
              image.removeClass('anim-work-out');
              image.hide();
            }
          });
          image.animate({width: endWidth,height:endHeight}, 185);
          $('.text:eq('+workPos+')').css({'width':'300px','height':'185px'});

          scope.selectedWork = undefined;
          scope.selectedWorkPos = undefined;
          scope.viewType = 'overview';
          scope.selectedElement = undefined;
          scope.$apply();
        }
        function stopAndRewindAllVides() {
          $('video').each(function () {
            this.currentTime = 0;
            this.pause();
          });
        }
        function showMedia(pos, animate) {
          setNav(pos);
          if ( scope.selectedMediaPos == pos ) return;
          var workPos = scope.selectedWorkPos;
          var totalMedia = getTotalMedia(workPos);
          var time = (animate) ? 500:0;
          var offsetX = 980;
          if( $('.media:eq('+workPos+') ul li:eq('+(pos-1)+')').is(':animated') ) return
          if( $('.media:eq('+workPos+') ul li:eq('+(scope.selectedMediaPos-1)+')').is(':animated') ) return;
          if (scope.selectedMediaPos < pos && pos > 1 ) {
            if ( scope.selectedMediaPos == 1) offsetX = 960;
            $('.media:eq('+workPos+') ul li:eq('+(pos-1)+')').css({left:offsetX+'px'}, time);
          } else {
            if ( scope.selectedMediaPos == 2) offsetX = 960;
            $('.media:eq('+workPos+') ul li:eq('+(pos-1)+')').css({left:-offsetX+'px'}, time);
          }
          $('.media:eq('+workPos+') ul li:eq('+(pos-1)+')').animate({left:0+'px'}, time);
          if (scope.selectedMediaPos < pos && pos > 1 ) {
            $('.media:eq('+workPos+') ul li:eq('+(scope.selectedMediaPos-1)+')').animate({left:-offsetX+'px'}, time);
          } else if (scope.selectedMediaPos > pos && pos < totalMedia ) {
            $('.media:eq('+workPos+') ul li:eq('+(scope.selectedMediaPos-1)+')').animate({left: offsetX+'px'}, time);
          }
          scope.selectedMediaPos = pos;
          toogleText(getElement(),false,false);
        }
        function showPage(pos, animate) {
          setPageNav(pos);
          if ( scope.selectedPage == pos ) return;
          var totalPages = getTotalPages();
          var time = (animate) ? 500:0;
          $('.gridViewChild .media').hide();
          $('.gridViewChild').css( 'cursor', 'pointer' );
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
        function toogleText(element, show, animate) {
          if (show) {
            element.children('.text').show();
            element.children('.text').css({'width': 960+'px','height':600+'px'});
            element.children('.text').css({top:0+'px'});
            if ( animate ) {
              element.children('.text').css({top:element.children('.text').height()+'px'});
              element.children('.text').animate({top:0+'px'}, 180);
            }
            scope.viewType = 'text';
          } else {
            if ( animate ) {
              element.children('.text').css({top:0+'px'});
              element.children('.text').animate({top:element.children('.text').height()+'px'}, 320);
            } else {
              element.children('.text').hide();
            }
            scope.viewType = 'image';
          }
          setTimeout(function(){ scope.$apply(); });
        }
        function addMouseListener() {
          $('.gridViewChild').bind( 'mouseenter', handleItemEnter);
        }
        function setArrowNav() {
          var totalPages = getTotalPages();
          var workPos = scope.selectedWorkPos;
          var totalMedia = getTotalMedia(workPos);
          var show = true;
          if (scope.viewType == 'overview') {
            if (totalPages < 2) {
              show = false;
            }
          } else if ( scope.viewType == 'image'){
            if (totalMedia < 2) {
              show = false;
            }
          }
          if (show) {
            $('#nav-arrows a').show();
          } else {
            $('#nav-arrows a').hide();
          }
        }
        function setPageNav(pos) {
          $('nav.page ul li').removeClass('active');
          $('nav.page ul li:eq('+(pos-1)+')').addClass('active');
        }
        function setNav(pos) {
          $('nav.media ul li').removeClass('active');
          $('nav.media ul li:eq('+(pos-1)+')').addClass('active');
        }
        function getTotalMedia(workPos) {
          return $('.media:eq('+workPos+') ul li').length;
        }
        function getTotalPages() {
          return $('.gridViewPage').length;
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
