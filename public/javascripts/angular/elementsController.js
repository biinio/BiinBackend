var biinAppObjects = angular.module('biinAppElements',['ngRoute','angularSpectrumColorpicker','ui.slimscroll','naturalSort']);

var elementCropper=null;
//App configuration
biinAppObjects.config(['$routeProvider',
	function($routeProvider){
	$routeProvider.
		when('/list',{
			templateUrl:'partials/elementList',
			controller:'elementsController'
		}).
    otherwise({
        redirectTo: '/list'
      });
}]);

biinAppObjects.controller("elementsController",['$scope', '$http',function($scope,$http){
  //Utils vars
  $scope.selectedElement=null;
  $scope.currentModelId = null;

  //Get the List of Objects
  $http.get('api/elements').success(function(data){
  	$scope.elements = data.data;    
    $scope.elementPrototype = data.prototypeObj;
    $scope.elementPrototypeBkp = $.extend(true, {}, data.prototypeObj);
    if($scope.elements && $scope.elements != null &&  $scope.elements.length>0){
      
      //Select the first element
      $scope.edit(0);  
    } 
  });	

  //Push a new showcase in the list
  $scope.create = function(){
    var newObject=$scope.elementPrototype;
    if($scope.elements.indexOf(newObject)>-1){      
      $scope.selectedElement=$scope.elements.indexOf(newObject); 
    }else{
        $scope.elementPrototype =  $.extend(true, {}, $scope.elementPrototypeBkp);
        $scope.elementPrototype.isNew=true;
        $scope.elements.push($scope.elementPrototype);     
        $scope.edit($scope.elements.indexOf($scope.elementPrototype)); 
    }
     
  }

  //Edit an element
  $scope.edit = function(index){
    $scope.selectedElement = index;
    $scope.currentModelId = $scope.elements[index].objectIdentifier;
    //Remove the cropper
    removeCropper();

    //Instanciate cropper
    elementCropper= createElementCropper("wrapperShowcase");
    var imgUrl = $scope.elements[index].imageUrl;
    elementCropper.preInitImage(imgUrl);
  }

  //Remove element at specific position
  $scope.removeElementAt = function(index){
    if($scope.selectedElement==index){
      $scope.selectedElement =null;
      $scope.currentModelId =null;

      //Remove the cropper
      removeCropper();
    }
    if('isNew' in $scope.elements[index] ){
      //remove the showcase
      $scope.elements.splice(index,1);
    }else//If the element is new is not in the data base      
    {
      var elementId = $scope.elements[index].objectIdentifier;      
      $scope.elements.splice(index,1);
      $http.delete('api/elements/'+elementId).success(function(data){
          if(data.state=="success"){
            //Todo: implement a pull of messages
          }
        }
      );
    }
  }

  //Save detail model object
  $scope.saveDetail= function(){  
    $http.put('api/elements/'+$scope.currentModelId,{model:$scope.elements[$scope.selectedElement]}).success(function(data,status){
      if("replaceModel" in data){
        $scope.elements[$scope.selectedElement] = data.replaceModel;
        $scope.elementPrototype =  $.extend(true, {}, $scope.elementPrototypeBkp);
      }
      if(data.state=="success")
        $scope.succesSaveShow=true;
    });          
  } 

   //Others

   //Remove the current cropper
   removeCropper= function(){
      if(elementCropper !=null){
        elementCropper.destroy();
        elementCropper = null;
      }
   }
}]);

//Define the Directives
biinAppObjects.directive('imageCropper',function(){
  return{
    restrict:'A',
    link:function(scope,element){       
       elementCropper= createElementCropper(element[0].attributes["id"].value);
       var index =scope.selectedElement;
       var imgUrl = scope.elements[index].imageUrl;
       elementCropper.preInitImage(imgUrl);
    }
  }
});

//Change of image directive
biinAppObjects.directive('inputChange',function(){
  return{
    restrict:'A',
    link:function(scope,element){       
      $el = $(element);
       $el.on('change',function(e){
          var index =scope.selectedElement;
          scope.elements[index].imageUrl= $el.val();
          scope.$digest();
          scope.$apply();
       });
    }
  }
});