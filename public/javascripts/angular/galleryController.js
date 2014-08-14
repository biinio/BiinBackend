var biinAppGallery = angular.module('biinAppGallery',['ngRoute','angularSpectrumColorpicker','ui.slimscroll','naturalSort','biin.galleryService']);

biinAppGallery.controller("galleryController",['$scope', '$http',function($scope,$http){
  $scope.newObjects=[];
  $scope.allGallery=null;

  $http.get('api/gallery/list').success(function(data){
    $scope.allGallery = data;
  });

  //on gallery change method                
  $scope.onGalleryChange= function(obj){
    //Do a callback logic by caller
    $scope.newObjects = $scope.newObjects.concat(obj);;
    $scope.$digest();
  }

}]);