var biinAppGallery = angular.module('biinAppGallery',['ngRoute','angularSpectrumColorpicker','ui.slimscroll','naturalSort','biin.services']);

biinAppGallery.controller("galleryController",['$scope', '$http',function($scope,$http){
  $scope.newObjects=[];
  $scope.allGallery=null;
  $scope.organizationId = selectedOrganization();

  $http.get('api/organizations/'+$scope.organizationId+'/gallery').success(function(data){
    $scope.allGallery = data.data;
  });

  //on gallery change method                
  $scope.onGalleryChange= function(obj){
    //Do a callback logic by caller
    $scope.newObjects = $scope.newObjects.concat(obj);;
    $scope.$digest();
  }

}]);