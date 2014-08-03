var biinAppGallery = angular.module('biinAppGallery',['ngRoute','angularSpectrumColorpicker','ui.slimscroll','naturalSort','biin.galleryService']);

//App  Gallery Configuration
biinAppGallery.config(['$routeProvider','$locationProvider',
	function($routeProvider,$locationProvider){
	$routeProvider.
		when('/gallery',{
			templateUrl:'partials/galleryList',
			controller:'galleryController'
		}).
    otherwise({
        redirectTo: '/gallery'
      });
    // use the HTML5 History API
    $locationProvider.html5Mode(true);    
}]);

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