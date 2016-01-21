var mobileSessions = angular.module('mobileSessions', ['ngRoute', 'nvd3']);

mobileSessions.controller("mobileSessionsController", ['$scope', '$http',
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