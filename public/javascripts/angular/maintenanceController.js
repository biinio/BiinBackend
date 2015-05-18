var biinAppMaintenance= angular.module('biinAppMaintenance',['ngRoute','ui.slimscroll','naturalSort','biin.services']);

biinAppMaintenance.controller("maintenanceController",['$scope','$http','$location',function($scope,$http,$location){
  var defaultTab = 'details';

  $http.get('maintenance/organizations').success(function(data){
    $scope.organizations = data;
    $scope.selectedOrganization = null;
    

    $scope.showBiinsPerOrganization = function(index)
    {
    	$scope.selectedOrganization = index;
    }
    
    $scope.showBiinsPerOrganization(0);

  }).error(function(err){
    console.log(err);
  })
  
  turnLoaderOff();
  }]);


