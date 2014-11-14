'use strict';

angular.module('pascalbaumann-com')
  .factory('jsonLoader', function($http){
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
