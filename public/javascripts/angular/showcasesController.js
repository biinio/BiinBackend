var biinAppShowCases = angular.module('biinAppShowCases',['ngRoute']);

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