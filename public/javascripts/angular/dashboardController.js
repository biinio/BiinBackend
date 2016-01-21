var biinAppBlog = angular.module('biinAppDashboard',['ngRoute']);

biinAppBlog.controller("dashboardController",['$scope', '$http',function($scope,$http){
  $scope.selectedOrganization="";//{identifier:"",name:"Please select an option"};
  $scope.selectedSite="";
  $scope.countries={};
    $http.get('/api/dashboard').success(function(data){
      $scope.organizations = data.data.organizations;
      $scope.showcases = data.data.showcases;

      //if($scope.organizations && $scope.organizations.length>0)
       // $scope.selectedOrganization= $scope.organizations[0].identifier;//{identifier:data.data.organizations[0].identifier, name:data.data.organizations[0].name};

  });

  var functions = {};

    //GET the main view of sites
    functions.index = function(req, res) {
        res.render('dashboard/index', {
            title: 'Dashboard',
            user: req.user,
            isSiteManteinance: false
        });
    }


  $scope.changeOrganization=function(indexSel){
    var index = eval(indexSel);
    $scope.sites = $scope.organizations[index].sites;
    $scope.selectedSite=""
  }

  var getCompariveBy =function(optNumber,compBy){
    var model = {};
    if($scope.selectedOrganization!=''){
      if(!model.filters)
        model.filters=[];
      model.filters.push({organization:$scope.selectedOrganization});
    }

    if($scope.selectedSite!=''){
      if(!model.filters)
        model.filters=[];
      model.filters.push({site:$scope.selectedSite});
    }
    
    //Get the List of Showcases
    $http.get('/api/dashboard/comparative',{model:model}).success(function(data){
      $scope.filterData = data.data;
    });

  }

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
  return functions;

}]);
