'use strict';

angular.module('pascalbaumann-com', [
  'ngResource',
  'ngSanitize',
  'ngTouch',
  'debounce',
])
.run(function ($rootScope) {
  $rootScope.UTIL = {
    detectTouchSupport: function() {
      var msGesture = window.navigator && window.navigator.msPointerEnabled && window.MSGesture,
          touchSupport = (( "ontouchstart" in window ) || msGesture || window.DocumentTouch &&     document instanceof DocumentTouch);
      if(touchSupport) {
          return true;
      } else {
          false;
      }
    }
  };
});
