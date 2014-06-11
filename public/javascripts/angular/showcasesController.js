var biinAppShowCases = angular.module('biinAppShowCases',['ngRoute','angularSpectrumColorpicker','ui.slimscroll','naturalSort']);

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
  $scope.dragElementIndex=-1;
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

  //Add element to a showcase
  $scope.insertElementAfter= function(indexElementToDrop,indexShowcaseElement){
  
    var elementToPush = $scope.elements[indexElementToDrop];
    var positionToGive=$scope.showcases[$scope.selectedShowcase].objects[indexShowcaseElement].position+1;
    //Give the position of the next element
    elementToPush.position= positionToGive;
    //Update the elements before
    updateShowcaseObjectsPosition(positionToGive)
    //Push the element int he collection
    $scope.showcases[$scope.selectedShowcase].objects.push(elementToPush);
    $scope.elements.splice(indexElementToDrop,1);

    //Appli the changes
    $scope.$digest();
    $scope.$apply();
  } 

  //Set current dragget element index in the scope
  $scope.setDragElement=function(scopeIndex){
    $scope.dragElementIndex=scopeIndex;
  }

  //Update the position of the rest of the elements
   updateShowcaseObjectsPosition= function(position){
    for(var i = 0; i<$scope.showcases[$scope.selectedShowcase].objects.length;i++){
      if($scope.showcases[$scope.selectedShowcase].objects[i].position>=position)
        $scope.showcases[$scope.selectedShowcase].objects[i].position++;
    }
   }

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

//Dragable elements 
biinAppShowCases.directive('draggable',function(){
  return{
    restrict:'A',
    link:function(scope,element,attrs){ 
      $(element).draggable({appendTo: '.colOptions',containment: '.showcaseWorkArea', cursor: "move", scroll: false, helper: 'clone',snap: true, snapTolerance: 50,
        stop: function() {
            console.log("stop drag");
        }, 
        start:function(){          
          scope.setDragElement(scope.$eval(attrs.elementIndex));        
        }
      });
    }
  }
});  

//Dropable zones in showcase
biinAppShowCases.directive('droppable',function(){
  return{
    restrict:'A',
    link:function(scope,element,attrs){
      $(element).droppable({
      drop: function( event, ui ) {
        var dragAfterIndex = scope.$eval(attrs.elementIndex);
        scope.insertElementAfter(scope.dragElementIndex,dragAfterIndex);
        $(element).next(".dropColumn").addClass('hide');              
      },
      over:function( event, ui ){
        $(element).next(".dropColumn").removeClass('hide');
      },
      out:function( event, ui ){
        $(element).next(".dropColumn").addClass('hide');
      }
    });
    }
  }
});  

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