var biinAppShowCases = angular.module('biinAppShowCases',['ngRoute']);

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
biinAppShowCases.controller('showcasesController', ['$scope', '$http', function($scope,$http) {
  $scope.activeTab='details';
  $scope.selectedShowcase = null;
  $http.get('api/showcases').success(function(data){
  	$scope.showcases = data;
  });

  //Edit an showcase
  $scope.edit = function(index){
    $scope.selectedShowcase = index;
  }
}]);

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
              console.log('always event: Triggered after all images have been either loaded or confirmed broken.');
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

//Update image for a ShowCase
biinAppShowCases.directive('imageSave', function () {
    return {
      restrict: 'A',
      link: function (scope, elem, attrs) {
            // on blur, update the value in scope
            $(elem).on('click',function(e){
              var imageUrl= $(elem[0].attributes["data-image-cropped"].value).val();
              scope.showcaseEdit.mainImageUrl[0].value = imageUrl;
              scope.$digest();       

              //Close bootstrap Modal
              $("#basicModal").modal("toggle");         
            });
      }
    }
  });

//Update image for a ShowCase
biinAppShowCases.directive('imageElementSave', function () {
    return {
      restrict: 'A',
      link: function (scope, elem, attrs) {
            // on blur, update the value in scope
            $(elem).on('click',function(e){
              var imageUrl= $(elem[0].attributes["data-image-cropped"].value).val();
              scope.showcaseEdit.objects[scope.currentObjectIndexSelected].imageUrl[0].value = imageUrl;
              scope.$digest();       

              //Close bootstrap Modal
              $("#elementModal").modal("toggle");         
            });
      }
    }
  });