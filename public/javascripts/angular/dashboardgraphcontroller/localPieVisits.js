var mobilePieVisits = angular.module('mobilePieVisits', ['ngRoute', 'nvd3']);

mobilePieVisits.controller("mobilePieVisitsController", ['$scope', '$http',
    function($scope, $http) {

        $scope.organizationId = selectedOrganization();
        $scope.currentDays = 0;

        $scope.$on('organizationsChanged', function(orgId) {
            $scope.getChartData($scope.currentDays);
        });
        
        $scope.getChartData = function (  )
        {
            $http.get('/api/dashboard/local/visits/newvsreturning', {
                    headers: {
                        organizationid: $scope.organizationId,
                        siteid: "e1532fca-97f3-4356-8048-537f5affe27a"
                    }
                }).success(function(data) {
                    
                    $scope.data = [
                        {
                            key: "New Visits",
                            y: data.data.newVisits
                        },
                        {
                            key: "Returning Visitor",
                            y: data.data.returningVisits
                        }
                    ];

                    /*$scope.data = [
                        {
                            key: "New Visits",
                            y: 0
                        },
                        {
                            key: "Returning Visitor",
                            y: 0
                        }
                    ];*/

                    $scope.options = {
                        chart: {
                            type: 'pieChart',
                            height: 250,
                            x: function(d){return d.key;},
                            y: function(d){return d.y;},
                            showLabels: true,
                            transitionDuration: 500,
                            labelThreshold: 0.01,
                            legend: {
                                margin: {
                                    top: 5,
                                    right: 35,
                                    bottom: 5,
                                    left: 0
                                }
                            }
                        }
                    };
                });
        }
        $scope.getChartData();
        //Turn off the Loader
        turnLoaderOff();

    }
]);