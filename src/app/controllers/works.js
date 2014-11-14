'use strict';

angular.module('pascalbaumann-com')
  .controller('WorksCtrl', function ($scope, jsonLoader) {
    $scope.works = [];
    $scope.pages = [];
    $scope.viewType = 'overview';
    $scope.selectedWork = undefined;
    $scope.selectedPage = undefined;
    $scope.selectedMediaPos = undefined;
    $scope.canShowNav = function() {
      if ($scope.selectedWork) {
        return ($scope.viewType == 'image' && $scope.selectedWork.media.length > 1) ? true:false;
      }
      return false;
    };
    $scope.canShowPageNav = function() {
      return ($scope.viewType == 'overview' && $scope.works.length > 9 ) ? true:false;
    };
    $scope.canShowTextButton = function() {
      if ($scope.selectedWork) {
        return ($scope.viewType == 'image' && $scope.selectedWork.text.length > 0) ? true:false;
      }
    };
    jsonLoader.getWorks(function(data){
        $scope.works = data;
    });
  });
