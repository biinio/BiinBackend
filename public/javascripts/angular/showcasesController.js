var biinAppShowCases = angular.module('biinAppShowCases',['ngRoute']);

//App configuration
biinAppShowCases.config(['$routeProvider',
	function($routeProvider){
	$routeProvider.
		when('/edit/:identifier',{
			templateUrl:'partials/showcaseEdit',
			controller:'showcasesEditController'
		}).	
		when('/list',{
			templateUrl:'partials/showcaseList',
			controller:'showcasesController'
		}).
    otherwise({
        redirectTo: '/list'
      });
}]);

//App define controllers
biinAppShowCases.controller('showcasesController', ['$scope', '$http', function($scope,$http) {
  $http.get('api/showcases').success(function(data){
  	$scope.showcases = data;
  });
}]);

//App define controllers
biinAppShowCases.controller('showcasesEditController', ['$scope','$route', '$http',"$routeParams", function($scope,$route,$http,$routeParams) {  
	$scope.activeTab='details';
  $http.get('api/showcases/'+$routeParams.identifier).success(function(data){
  	$scope.showcaseEdit = data.data.showcase;
  });

}]);