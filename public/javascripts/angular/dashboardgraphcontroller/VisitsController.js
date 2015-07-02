var biinAppVisitsGraph = angular.module('biinAppVisitsGraph',['ngRoute','nvd3']);

biinAppVisitsGraph.controller("biinAppVisitsGraphController",['$scope', '$http',function($scope,$http){
    window.setTimeout(function(){
        console.log($scope.selectedOrganization);
        console.log($scope.selectedSite);      
    }, 10000);

    $http.get('/api/dashboard').success(function(data){
      $scope.organizations = data.data.organizations;

      for (var i = 0; i < $scope.organizations.length; i++) {
          if($scope.organizations[i].identifier == $scope.organizations[0].identifier)
      }
      //if($scope.organizations && $scope.organizations.length>0)
       // $scope.selectedOrganization= $scope.organizations[0].identifier;//{identifier:data.data.organizations[0].identifier, name:data.data.organizations[0].name};

  });
  

  $scope.options = {
    chart: {
        type: 'lineChart',
        height: 450,
        margin : {
            top: 20,
            right: 20,
            bottom: 40,
            left: 55
        },
        x: function(d){ return d.x; },
        y: function(d){ return d.y; },
        useInteractiveGuideline: true,
        dispatch: {
            stateChange: function(e){ console.log("stateChange"); },
            changeState: function(e){ console.log("changeState"); },
            tooltipShow: function(e){ console.log("tooltipShow"); },
            tooltipHide: function(e){ console.log("tooltipHide"); }
        },
        xAxis: {
            axisLabel: 'Time (ms)'
        },
        yAxis: {
            axisLabel: 'Voltage (v)',
            tickFormat: function(d){
                return d3.format('.02f')(d);
            },
            axisLabelDistance: 30
        },
        callback: function(chart){
            console.log("!!! lineChart callback !!!");
        }
    },
    title: {
        enable: true,
        text: 'Graph 1'
    },
    subtitle: {
        enable: true,
        text: 'Subtitle for simple line chart. Lorem ipsum dolor sit amet, at eam blandit sadipscing, vim adhuc sanctus disputando ex, cu usu affert alienum urbanitas.',
        css: {
            'text-align': 'center',
            'margin': '10px 13px 0px 7px'
        }
    }
  };

  $scope.data = sinAndCos();

  /*Random Data Generator */
  function sinAndCos() {
            var sin = [],sin2 = [],
                cos = [],mine = [];

            //Data is represented as an array of {x,y} pairs.
            for (var i = 0; i < 100; i++) {
                sin.push({x: i, y: Math.sin(i/10)});
                sin2.push({x: i, y: i % 10 == 5 ? null : Math.sin(i/10) *0.25 + 0.5});
                cos.push({x: i, y: .5 * Math.cos(i/10+ 2) + Math.random() / 10});
                mine.push({x:i,y:Math.random()});
            }

            //Line chart data should be sent as an array of series objects.
            return [
                {
                    values: sin,      //values - represents the array of {x,y} data points
                    key: 'Sine Wave', //key  - the name of the series.
                    color: '#ff7f0e'  //color - optional: choose your own line color.
                },
                {
                    values: cos,
                    key: 'Cosine Wave',
                    color: '#2ca02c'
                },
                {
                    values: sin2,
                    key: 'Another sine wave',
                    color: '#7777ff',
                    area: true      //area - set to true if you want this line to turn into a filled area chart.
                },
                {
                    values: mine,
                    key: 'Mine test',
                    color: '#cd0a0a',
                    area: true   
                }
            ];
  };

  //Turn off the Loader
  turnLoaderOff();

}]);