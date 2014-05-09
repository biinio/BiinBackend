var biinAppShowCases = angular.module('biinAppShowCases',['ngRoute']);

//App configuration
biinAppShowCases.config(['$routeProvider',
	function($routeProvider){
	$routeProvider.
		when('/list',{
			templateUrl:'partials/showcaseList',
			controller:'showcasesController'
		}).
		when('/edit',{
			templateUrl:'partials/showcaseEdit:identifier',
			controller:'showcasesController'
		})
		.
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
biinAppShowCases.controller('showcasesEditController', ['$scope', '$http',"$routeParams", function($scope,$http,$routeParams) {
  $http.get('api/showcases').success(function(data){
  	console.log(data);
  	$scope.showcases = data;
  });
}]);