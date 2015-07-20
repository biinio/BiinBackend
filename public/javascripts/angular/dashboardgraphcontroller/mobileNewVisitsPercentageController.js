var mobileNewVisitsPercentage = angular.module('mobileNewVisitsPercentage', ['ngRoute', 'nvd3']);

mobileNewVisitsPercentage.controller("mobileNewVisitsPercentageController", ['$scope', '$http',
    function($scope, $http) {

        $scope.organizationId = selectedOrganization();
        $scope.currentDays = 0;

        $scope.$on('organizationsChanged', function(orgId) {
            $scope.getChartData($scope.currentDays);
        });
        
        //Turn off the Loader
        turnLoaderOff();

    }
]);