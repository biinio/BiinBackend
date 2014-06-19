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
  	$scope.showcases = data.data;
    $scope.showcasePrototype = data.prototypeObj;
    $scope.showcasePrototypeBkp =  $.extend(true, {}, data.prototypeObj);
    if($scope.selectedShowcase == null && $scope.showcases && $scope.showcases.length>0){
      //Select the first element
      $scope.edit(0);  
    }
    
  });

  //Get the List of Elements
  elementSrv.getList().then(function(promise){
    $scope.elements = promise.data.data;    
  });
  
  //Push a new showcase in the list
  $scope.create = function(){
    var newObject=$scope.showcasePrototype;
    if($scope.showcases.indexOf(newObject)>-1){      
      $scope.selectedShowcase=$scope.showcases.indexOf(newObject); 
    }else{
        $scope.showcasePrototype =  $.extend(true, {}, $scope.showcasePrototypeBkp);
        $scope.showcasePrototype.isNew=true;
        $scope.showcases.push($scope.showcasePrototype);     
        $scope.edit($scope.showcases.indexOf($scope.showcasePrototype)); 
    }
     
  }

  //Edit an showcase
  $scope.edit = function(index){
    $scope.selectedShowcase = index;
    $scope.currentModelId = $scope.showcases[index].identifier;
    //Remove the cropper
    removeCropper();

    //Instanciate cropper
   showCaseCropper= createShowcaseCropper("wrapperShowcase");
   var imgUrl = $scope.showcases[index].mainImageUrl;
   showCaseCropper.preInitImage(imgUrl);
  }

  //Remove showcase at specific position
  $scope.removeShowcaseAt = function(index){
    if($scope.selectedShowcase==index){
      $scope.selectedShowcase =null;
      $scope.currentModelId =null;

      //Remove the cropper
      removeCropper();
    }
    if('isNew' in $scope.showcases[index] ){
      //remove the showcase
      $scope.showcases.splice(index,1);
    }else//If the element is new is not in the data base      
      var showcaseId = $scope.showcases[index].identifier;      
      $scope.showcases.splice(index,1);
      $http.delete('api/showcases/'+showcaseId).success(function(data){
          if(data.state=="success"){
            //Todo: implement a pull of messages
          }
        }
      );
  }

  //Save detail model object
  $scope.saveDetail= function(){  
    $http.put('api/showcases/'+$scope.currentModelId,{model:$scope.showcases[$scope.selectedShowcase]}).success(function(data,status){
      if("replaceModel" in data){
        $scope.showcases[$scope.selectedShowcase] = data.replaceModel;
        $scope.showcasePrototype =  $.extend(true, {}, $scope.showcasePrototypeBkp);
      }
      if(data.state=="success")
        $scope.succesSaveShow=true;
    });          
  } 

  //Remove an element of a Showcase
  $scope.removeElementAt=function(index){
    var position = $scope.showcases[$scope.selectedShowcase].objects[index].position;
    $scope.showcases[$scope.selectedShowcase].objects.splice(index,1);

    //Update the elements position
    updateShowcaseObjectsPositionWhenDelete(eval(position));
  }

  //Move element of a showcase to up
  $scope.moveElementUp=function(index){
    var oldPosition =eval($scope.showcases[$scope.selectedShowcase].objects[index].position);
    if(oldPosition>1){      
      var newPosition =oldPosition-1;

      var prevObj= _.find($scope.showcases[$scope.selectedShowcase].objects, function (obj) { return eval(obj.position) === newPosition})      
      $scope.showcases[$scope.selectedShowcase].objects[index].position=""+newPosition;
      
      //Modify the position of the prev object
      prevObj.position = ""+oldPosition;

      if(!$scope.$$phase) {
        $scope.$digest();
      }
    }
  }  

  //Move element of a showcase to down
  $scope.moveElementDown=function(index){
    var oldPosition =eval($scope.showcases[$scope.selectedShowcase].objects[index].position);
    if(oldPosition<$scope.showcases[$scope.selectedShowcase].objects.length){        
        var newPosition =oldPosition+1;
        var nextObj= _.find($scope.showcases[$scope.selectedShowcase].objects, function (obj) { return eval(obj.position) === newPosition })      
        $scope.showcases[$scope.selectedShowcase].objects[index].position= ""+newPosition;        
        nextObj.position = ""+oldPosition;
    }
  }

  //Add element to a showcase
  $scope.insertElementAfter= function(indexElementToDrop,position){
  
    var elementToPush = $scope.elements[indexElementToDrop];
    var positionToGive= eval(position)+1;
    //Give the position of the next element
    elementToPush.position= ""+positionToGive;
    //Update the elements before
    updateShowcaseObjectsPosition(positionToGive)

    delete elementToPush._id;
    
    //Push the element int he collection
    $scope.showcases[$scope.selectedShowcase].objects.push(elementToPush);

    //Apply the changes
    $scope.$digest();
    $scope.$apply();
  } 

  //Set current dragget element index in the scope
  $scope.setDragElement=function(scopeIndex){
    $scope.dragElementIndex=scopeIndex;
  }

  //Update the position of the rest of the elements to add one when is added a new element
   updateShowcaseObjectsPosition= function(position){
    for(var i = 0; i<$scope.showcases[$scope.selectedShowcase].objects.length;i++){
      var objPosition = eval($scope.showcases[$scope.selectedShowcase].objects[i].position);
      if(objPosition>=position)
        $scope.showcases[$scope.selectedShowcase].objects[i].position= ""+ eval(objPosition+1);
    }
   }

  //Update the position of the rest of the elements when a element removed
   updateShowcaseObjectsPositionWhenDelete= function(position){
    for(var i = 0; i<$scope.showcases[$scope.selectedShowcase].objects.length;i++){
      var objPosition = eval($scope.showcases[$scope.selectedShowcase].objects[i].position);
      if(objPosition>=position)
        $scope.showcases[$scope.selectedShowcase].objects[i].position= ""+objPosition-1;
    }
   }

   //Others

   //Remove the current cropper
   removeCropper= function(){
      if(showCaseCropper !=null){
        showCaseCropper.destroy();
        showCaseCropper = null;
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
      $(element).draggable({appendTo: '.colOptions',containment: '.showcaseWorkArea', cursor: "move", scroll: true, helper: 'clone',snap: true, snapTolerance: 5,
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
        var dragPosition = scope.$eval(attrs.elementPosition);
        scope.insertElementAfter(scope.dragElementIndex,dragPosition);
        $(element).next(".dropColumn").addClass('hide');              
      },
      over:function( event, ui ){

        $(element).next(".dropColumn").removeClass('hide');

      /*var moveScrollTo =$(element).offset().top-20;
      console.log(moveScrollTo);
      $(element).closest("[slimscroll]").slimscroll({ scrollTo: moveScrollTo+"px" });
        var moveScrollTo =$(element).offset().top+200;
        console.log(moveScrollTo);
        //Scroll to the element
        $(element).closest("[slimscroll]").slimscroll({ scrollTo: moveScrollTo+"px" });
      */
      },
      out:function( event, ui ){
        $(element).next(".dropColumn").addClass('hide');
      }
    });
    }
  }
});  

//Dropable zones in showcase
biinAppShowCases.directive('droppableShowcasePreview',function(){
  return{
    restrict:'A',
    link:function(scope,element,attrs){
        $(element).droppable({
        drop: function( event, ui ) {
          scope.insertElementAfter(scope.dragElementIndex,0);
          $(".dropColumn:first",".previewShowcaseElements").addClass('hide');  
        },
        over:function( event, ui ){
          $(".dropColumn:first",".previewShowcaseElements").removeClass('hide');
        },
        out:function( event, ui ){
          $(".dropColumn:first",".previewShowcaseElements").addClass('hide');
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

//Custom Filters

//Filter for get the intersection of two list of objects
biinAppShowCases.filter("difference",function(){
  return function intersection(haysTack, needle){
    //call function in utilities
    return differenceObjects(haysTack,needle,function(item1,item2){
      return item1.objectIdentifier===item2.objectIdentifier;
    });
  }

});