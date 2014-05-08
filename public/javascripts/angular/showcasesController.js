var biinAppShowCases = angular.module('biinAppShowCases',['ngRoute']);

biinAppShowCases.controller('showcasesController', ['$scope', function($scope) {
  $scope.name = "Nick Name";    
}]);

biinAppShowCases.config(['$routeProvider',
	function($routeProvider){
	$routeProvider.
		when('/list',{
			templateUrl:'partials/showcaseList',
			controller:'showcasesController'
		}).
    otherwise({
        redirectTo: '/list'
      });
}]);