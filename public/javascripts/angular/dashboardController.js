var biinAppBlog = angular.module('biinAppDashboard',['ngRoute']);

biinAppBlog.controller("dashboardController",['$scope', '$http',function($scope,$http){
  /*
    $http.get('/api/blog').success(function(data){
    $scope.blogs = data.blogs;
  });
*/
  var data= function() {
      var sin = [],
          cos = [];
          tan =[];

      for (var i = 0; i < 100; i++) {
        sin.push({x: i, y: Math.sin(i/10)});
        cos.push({x: i, y: .5 * Math.cos(i/10)});
        tan.push({x: i, y:  Math.tan(i/10)});
      }

      return [
        {
          values: sin,
          key: 'Sine Wave',
          color: '#ff7f0e'
        },
        {
          values: cos,
          key: 'Cosine Wave',
          color: '#2ca02c'
        },
        {
          values: tan,
          key: 'Tan Wave',
          color: '#000'
        }        
      ];
    }

    nv.addGraph(function() {
      var chart = nv.models.lineChart()
        .useInteractiveGuideline(true)
        ;

      chart.xAxis
        .axisLabel('Time (ms)')
        .tickFormat(d3.format(',r'))
        ;

      chart.yAxis
        .axisLabel('Voltage (v)')
        .tickFormat(d3.format('.02f'))
        ;

      d3.select('#testGraph svg')
        .datum(data())
        .transition().duration(500)
        .call(chart)
        ;

      nv.utils.windowResize(chart.update);

      return chart;
    });

  //Turn off the Loader
  turnLoaderOff();

}]);
