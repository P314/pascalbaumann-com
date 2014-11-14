'use strict';

angular.module('pascalbaumann-com')
  .directive('layout', function($window, debounce) {
    return {
      restrict: 'A',
      replace: false,
      link: function(scope, element, attrs) {
        function resize() {
          arrange();
        }
        function arrange() {
          var browserWidth = $(window).width(),
              css = [],
              yPointer = 0;
          $('section').each(function(i,v) {
            var cssobj = { };
            if ($(this).attr('data-width') == 'full' )
              cssobj.width = browserWidth;
            css.push(cssobj);
          });
          var i = 0;
          $('section').each(function(i,v) {
              $(this).css(css[i]);
            i++;
          });
        }
        function touchHover() {
          $('*').on('touchstart', function () {
              $(this).trigger('hover');
          }).on('touchend', function () {
              $(this).trigger('hover');
          });
        };
        $('.background').addClass('fadein-background');
        $('.background').addClass('fadein-background');
        $('.start').addClass('fadein-intro');
        $('.logo').addClass('fadein-logo');
        $('body').css({'overflow':'visible'});
        $('.intro-continue').addClass('fadein');
        arrange();
        if (scope.UTIL.detectTouchSupport()) {touchHover();}
        angular.element($window).bind('resize', debounce(resize));
      }
    };
});
