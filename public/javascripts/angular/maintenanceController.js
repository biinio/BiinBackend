var biinAppMaintenance= angular.module('biinAppMaintenance',['ngRoute','ui.slimscroll','naturalSort','biin.services']);

biinAppMaintenance.controller("maintenanceController",['$scope','$http','$location',function($scope,$http,$location){
  var defaultTab = 'details';

  $http.get('maintenance/organizations').success(function(data){
    $scope.organizations = data;
    $scope.selectedOrganization = null;
    $scope.biinsXOrganization = null;
    

    $scope.showBiinsPerOrganization = function(index)
    {
      $scope.selectedOrganization = index;
      $scope.biinsXOrganization = [];
      for(var i = 0; i< $scope.organizations[index].sites.length; i++)
      {
        var site = $scope.organizations[index].sites[i];
        for(var j= 0; j< site.biins.length; j++)
        {
          var biin = site.biins[j];
          biin.siteName = site.title2;
          $scope.biinsXOrganization.push(biin);
        }
      }
    }
    
    $scope.showBiinsPerOrganization(0);

  }).error(function(err){
    console.log(err);
  })
  
  turnLoaderOff();
  }]);


