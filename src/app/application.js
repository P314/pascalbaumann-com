angular
  .module('pascalbaumann-com', [])

function ClientsCtrl($scope, $http) {
    $scope.clients = [];
    $scope.loadClients = function() {
        var httpRequest = $http({
            method: 'GET',
            url: '/assets/clients.json'
        }).success(function(data, status) {
            $scope.clients = data;
        });
    };
    $scope.loadClients();
}
