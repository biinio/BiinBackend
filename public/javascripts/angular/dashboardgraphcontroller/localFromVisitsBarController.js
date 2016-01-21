var localFromVisitsBar = angular.module('localFromVisitsBar', ['ngRoute', 'nvd3']);

localFromVisitsBar.controller("localFromVisitsBarController", ['$scope', '$http',
    function($scope, $http) {

        $scope.organizationId = selectedOrganization();
        $scope.currentDays = 0;

        $scope.$on('organizationsChanged', function(orgId) {
            $scope.getChartData($scope.currentDays);
        });
        
        $scope.getChartData = function ( days )
        {
            $scope.options = {
            chart: {
                type: 'multiBarHorizontalChart',
                x: function(d){return d.label;},
                y: function(d){return d.value;},
                showControls: false,
                showValues: true,
                transitionDuration: 500,
                xAxis: {
                    showMaxMin: false
                },
                yAxis: {
                    axisLabel: 'Values',
                    tickFormat: function(d){
                        return d3.format(',.2f')(d);
                    }
                }
            }
        };

        $scope.data = [
            {
                "key": "Series1",
                "values": 
                [
                    {
                        "value" : 25.307646510375
                    }               
                ]
            },
            {
                "key": "Series2",
                "values": 
                [
                    {
                        "value" : 25.307646510375
                    }       
                ]
            }
        ];
        }
        
        $scope.changeChartRange = function( days ){
            $scope.getChartData(days);
            $scope.currentDays = days;
        }
        $scope.changeChartRange(30);
        //Turn off the Loader
        turnLoaderOff();

    }
]);