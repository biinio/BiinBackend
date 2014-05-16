var biinAppShowCases = angular.module('biinAppShowCases',['ngRoute']);

//App configuration
biinAppShowCases.config(['$routeProvider',
	function($routeProvider){
	$routeProvider.
		when('/edit/:identifier',{
			templateUrl:'partials/showcaseEdit',
			controller:'showcasesEditController'
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
  $http.get('api/showcases').success(function(data){
  	$scope.showcases = data;
  });
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
    console.log("Saving")
    $http.put('api/showcases/'+$scope.currentModelId,{model:$scope.showcaseEdit}).success(function(data,status){
      if(data.state=="updated")
        $scope.succesSaveShow=true;
    });
  }

  $scope.change=function(value){
    console.log("value");
    $scope.showcaseEdit.mainImageUrl[0].value = value;
    $scope.$digest();
    //$scope.$digest();
  }

/* $scope.$watch('myVar', function() {
     alert('hey, myVar has changed!');
 });*/

}]);


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

biinAppShowCases.directive('uploadChange', function () {
    return {
      restrict: 'A',
      link: function (scope, elem, attrs) {
            // on blur, update the value in scope
            $(elem).on('change',function(e){
              console.log(this);
                s3_upload($(this).attr("id"));
            });
      }
    }
  });



//Schemas
/*
var showcaseSchema = new Schema( {
  customerId: String,
  organizationId: String,
  identifier:{ type: String, index: true },
  type:String,
  title:String,
  showcaseDescription:String,
  theme:String,
  mainImageUrl:[
    {
      value:String
    }
  ],
  objects:[
    {
      objectId:String,
      number:String,
      type:{type:String},
      likes:String,
      title:String,
      objectDescription:[
        {
          value:String
        }
      ],
      actionType:String,
      originalPrice:String,
      biinPrice:String,
      discount:String,
      savings:String,
      biinSold:String,
      timeFrame:String,
      imageUrl:[
        {
          value:String
        }
      ],
      theme:String,
      categories:[
        {
          category:String
        }
      ]

    }
  ]
});*/
