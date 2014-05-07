var biinApp = angular.module('biinApp',[]);
biinApp.controller('showcasesController',['$scope','$http',function($scope,$http){
	$http.get("/showcasesList").success(function(data, status, headers, config) {
		$scope.showcases =data;
	});
}]);