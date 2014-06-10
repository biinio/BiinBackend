var biinAppShowCases = angular.module('biinAppShowCases',['ngRoute','angularSpectrumColorpicker','ui.slimscroll']);

var showCaseCropper = null
//App configuration
biinAppShowCases.config(['$routeProvider',
	function($routeProvider){
	$routeProvider.
		when('/edit/:identifier',{
			templateUrl:'partials/showcaseEdit',
			controller:'showcasesEditController'
		})
    .
    when('/editShowcase/:identifier',{
      action:"editShowcase",
      controller:'showcasesController'
    }).	
		when('/list',{
			templateUrl:'partials/showcaseList',
			controller:'showcasesController'
		}).
    otherwise({
        redirectTo: '/list'
      });
}]);

//App define controllers
biinAppShowCases.controller('showcasesController', ['$scope', '$http','elementSrv', function($scope,$http, elementSrv) {
  $scope.activeTab='details';
  $scope.selectedShowcase = null;
  $scope.currentModelId = null;

  //Get the List of Showcases
  $http.get('api/showcases').success(function(data){
  	$scope.showcases = data;

    if($scope.selectedShowcase == null && $scope.showcases && $scope.showcases.length>0){
      //Select the first element
      $scope.edit(0);  
    }
    
  });

  //Get the List of Elements
  elementSrv.getList().then(function(promise){
    $scope.elements = promise.data.data;    
  });

  //Edit an showcase
  $scope.edit = function(index){
    $scope.selectedShowcase = index;
    $scope.currentModelId = $scope.showcases[index].identifier;
    if(showCaseCropper !=null){
      showCaseCropper.destroy();
      showCaseCropper = null;
    }

    //Instanciate cropper
   showCaseCropper= createShowcaseCropper("wrapperShowcase");
   var imgUrl = $scope.showcases[index].mainImageUrl;
   showCaseCropper.preInitImage(imgUrl);
  }

//Save detail model object
  $scope.saveDetail= function(){  
    $http.put('api/showcases/'+$scope.currentModelId,{model:$scope.showcases[$scope.selectedShowcase]}).success(function(data,status){
      if(data.state=="updated")
        $scope.succesSaveShow=true;
    });
  }    

  //Hammer managements
  showcaseHammerManager();
}]);

// Define the Elements Services
biinAppShowCases.factory('elementSrv', ['$http', function (async) {
    return {
      getList: function () {
        var promise = async({method:'GET', url:'/api/elements'})
            .success(function (data, status, headers, config) {
              return data;
            })
            .error(function (data, status, headers, config) {
              return {"status": false};
            });
          
          return promise;
      }
    }
    }]);

//Define the Directives
biinAppShowCases.directive('imageCropper',function(){
  return{
    restrict:'A',
    link:function(scope,element){       
       showCaseCropper= createShowcaseCropper(element[0].attributes["id"].value);
       var index =scope.selectedShowcase;
       var imgUrl = scope.showcases[index].mainImageUrl;
       showCaseCropper.preInitImage(imgUrl);
    }
  }
})

//Change of image directive
biinAppShowCases.directive('inputChange',function(){
  return{
    restrict:'A',
    link:function(scope,element){       
      $el = $(element);
       $el.on('change',function(e){
          console.log("image value: "+$el.val());
          var index =scope.selectedShowcase;
          scope.showcases[index].mainImageUrl= $el.val();
          scope.$digest();
          scope.$apply();
       });
    }
  }
});


//App define controllers
biinAppShowCases.controller('showcasesEditController', ['$scope','$route', '$http',"$routeParams", function($scope,$route,$http,$routeParams) {  
	$scope.activeTab='details';
  $scope.currentModelId = $routeParams.identifier;
  $scope.currentObjectIndexSelected =0;
  $scope.succesSaveShow = false;

  $http.get('api/showcases/'+$routeParams.identifier).success(function(data){
  	$scope.showcaseEdit = data.data.showcase;
  });

  //Edit and Object
  $scope.editObject= function(index){
    $scope.currentObjectIndexSelected =index;
  }


  //Save detail model object
  $scope.saveDetail= function(){  
    $http.put('api/showcases/'+$scope.currentModelId,{model:$scope.showcaseEdit}).success(function(data,status){
      if(data.state=="updated")
        $scope.succesSaveShow=true;
    });
  }

  //Edit a showcase
  $scope.editShowcase= function(){
    console.log("edit Showcase");
  }
}]);

//Image uploades pending indicator
biinAppShowCases.directive('pendingIndicator', function(){
    return {
        restrict: 'A',
        link: function(scope, element) {
            // setup the container for ImagesLoaded ... note instead of using
            // this directive on an individual image, you may consider using
            // it on the element that contains many images...
            scope.imagesLoaded = imagesLoaded(element);
            // start your progress/loading animation here
            // (or whenever you attempt to load the images)
            scope.imagesLoaded.on('always', function() {
              //console.log('always event: Triggered after all images have been either loaded or confirmed broken.');
              // end the progress/loading animation here for all images or do
              // it individually in the progress event handler below
            });
            scope.imagesLoaded.on('done', function() {
              console.log('done event: Triggered after all images have successfully loaded without any broken images.');

            });
            scope.imagesLoaded.on('fail', function() {
              console.log('fail event: Triggered after all images have been loaded with at least one broken image.');
            });
            scope.imagesLoaded.on('progress', function(instance, image) {
              console.log('proress event: Triggered after each image has been loaded.', instance, image);
              // end the progress/loading animation here or do it for all images in the always
              // event handler above
            });

        }
    };
});
