'use strict';

angular.module('pascalbaumann-com')
  .directive('scroll', function($window, debounce) {
    return {
      restrict: 'A',
      replace: false,
      link: function(scope, element, attrs) {
        var $container = $('.background'),
          offsetCoords = $container.offset(),
          topOffset = offsetCoords.top,
          startPos = $container.position().top,
          backgroundHeight = $container.height(),
          contentHeight = $('body').height(),
          positions = [[0,-1600],[600,-1600],[2000,600],[1400,200]],
          contentPos = 1,
          backgroundY = 0;
        function resize() {
          setBackgroundPosition();
        }
        function scroller() {
          $('.scroll').click(function(event) {
            var targetY = calculateY($(this.hash));
            if (targetY) {
              event.preventDefault();
              $('html,body').animate({scrollTop:targetY}, 500, function(){});
            }
          });
        }
        function calculateY(element) {
          var y = element.position().top;
          if (element.hasClass('-webkit-transform')) {
            var pTrans = element.css('-webkit-transform').split(',').map(parseFloat);
            var diffY = pTrans[5]/pTrans[3];
            if (diffY) { y -= diffY; }
          }
        }
        function setBackgroundPosition() {
          if (scope.UTIL.detectTouchSupport()) return;
          var startContentY = positions[contentPos-1][0];
          var nextContentY = positions[contentPos][0];
          var scrollTop = $(window).scrollTop();
          if ( scrollTop == 0 ) { contentPos = 1; }
          if ( scrollTop >= nextContentY ) {
            if ( contentPos < positions.length-1 ) { contentPos++; }
          }
          if ( scrollTop < startContentY ) {
            if ( contentPos > 1 ) { contentPos--; }
          }
          startContentY = positions[contentPos-1][0];
          nextContentY = positions[contentPos][0];
          var startBackgroundY = positions[contentPos-1][1];
          var nextBackgroundY = positions[contentPos][1];
          var distanceToScroll = nextContentY-scrollTop;
          var distanceToMove = nextBackgroundY-backgroundY;
          var scrollPercentage = ((scrollTop-startContentY) / (nextContentY-startContentY))*100;
          var moveDist = (nextBackgroundY - startBackgroundY);
          var moveY = (moveDist / 100)*scrollPercentage;
          backgroundY = positions[contentPos-1][1]+moveY;
          var coords = '50% ' + backgroundY + 'px';
          $container.css({ backgroundPosition: coords });
        }
        setBackgroundPosition();
        angular.element($window).bind('resize', debounce(resize));
        $(window).scroll(function () { setBackgroundPosition(); });
      }
    };
});
