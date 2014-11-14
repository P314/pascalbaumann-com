'use strict';

angular.module('pascalbaumann-com')
  .controller('ClientsCtrl', function ($scope, jsonLoader) {
    $scope.clients = [];
    jsonLoader.getClients(function(data){
      $scope.clients = data;
      setTimeout(function () {
        $('.client-logo').bind('mouseenter', handleMouseOver);
        $('.client-logo').bind('mouseleave', handleMouseOut);
      }, 100);
    });
    function handleMouseOver() {
      var image = $(this).children('.back');
      image.addClass('back-out');
    }
    function handleMouseOut() {
      var image = $(this).children('.back');
      image.removeClass('back-out');
      image.addClass('back-in');
    }
  });
