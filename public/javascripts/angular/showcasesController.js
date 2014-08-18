var biinAppShowCases = angular.module('biinAppShowCases',['ngRoute','angularSpectrumColorpicker','ui.slimscroll','naturalSort','biin.services']);

//App define controllers
biinAppShowCases.controller('showcasesController', ['$scope', '$http','$routeParams','elementSrv','biinSrv', function($scope,$http,$routeParams, elementSrv,biinSrv) {
  $scope.activeTab='details';
  $scope.selectedShowcase = null;
  $scope.currentModelId = null;
  $scope.dragElementIndex=-1;
  $scope.dragBiinIndex =-1;
  $scope.organizationId =selectedOrganization();
    
  //Get the List of Showcases
  $http.get('api/organizations/'+$scope.organizationId+'/showcases').success(function(data){
  	$scope.showcases = data.data;
    $scope.showcasePrototype = data.prototypeObj;
    $scope.showcasePrototypeBkp =  $.extend(true, {}, data.prototypeObj);
    if($scope.selectedShowcase == null && $scope.showcases && $scope.showcases.length>0){
      //Select the first element
      $scope.edit(0);  
    }    
  });

  //Get the List of Elements
  elementSrv.getList($scope.organizationId).then(function(promise){
    $scope.elements = promise.data.data;    
  });

  //Get the List of Biins
  biinSrv.getList($scope.organizationId).then(function(promise){
    $scope.biinSite = promise.data.data;
  });  

  //Push a new showcase in the list
  $scope.create = function(){
    var newObject=$scope.showcasePrototype;
    if($scope.showcases.indexOf(newObject)>-1){      
      $scope.selectedShowcase=$scope.showcases.indexOf(newObject); 
    }else{

        //Generate an identifier for the showcase and set it to the prototype object
        $http.get('api/organizations/'+$scope.organizationId+'/showcases/id').success(function(data){
          $scope.showcasePrototype =  $.extend(true, {}, $scope.showcasePrototypeBkp);
          $scope.showcasePrototype.identifier =data.data;
          $scope.showcasePrototype.isNew=true;
          $scope.showcases.push($scope.showcasePrototype);     
          $scope.edit($scope.showcases.indexOf($scope.showcasePrototype)); 
        });
    }
  }

  //Edit an showcase
  $scope.edit = function(index){
    $scope.selectedShowcase = index;
    $scope.currentModelId = $scope.showcases[index].identifier;
  }

  //Remove showcase at specific position
  $scope.removeShowcaseAt = function(index){
    if($scope.selectedShowcase==index){
      $scope.selectedShowcase =null;
      $scope.currentModelId =null;
    }
    if('isNew' in $scope.showcases[index] ){
      //remove the showcase
      $scope.showcases.splice(index,1);
    }else//If the element is new is not in the data base      
    {
      var showcaseId = $scope.showcases[index].identifier;      
      $scope.showcases.splice(index,1);
      $http.delete('api/organizations/'+$scope.organizationId+'/showcases/'+showcaseId).success(function(data){
          if(data.state=="success"){
            //Todo: implement a pull of messages
          }
        }
      );
    }
  }

  //Save detail model object
  $scope.saveDetail= function(){ 

    $http.put('api/showcases/'+$scope.currentModelId,{model:$scope.showcases[$scope.selectedShowcase]}).success(function(data,status){
      if("replaceModel" in data){
        $scope.showcases[$scope.selectedShowcase] = data.replaceModel;
        $scope.showcasePrototype =  $.extend(true, {}, $scope.showcasePrototypeBkp);
      }
      if(data.state=="success"){
      //Save the changes in the biins
        biinSrv.saveList($scope.organizationId, $scope.biinSite).then(function(promise){
          if(promise.data.state=='success'){
            //Todo put the update was success
            console.log("Update of the list of biins");
          }  
          else
            //Todo handle the errors
            console.log("there was an error");
        });
        $scope.succesSaveShow=true;
      }
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

  //Set the dragged biin showcase
  $scope.setDropableBiinInShowcase=function(){
    if($scope.dragBiinIndex>-1){
      $scope.biins[$scope.dragBiinIndex].showcaseIdentifier = $scope.showcases[$scope.selectedShowcase].identifier;
      //Apply the changes
      $scope.$digest();
      $scope.$apply();
    }
  }

  //Set current dragget element index in the scope
  $scope.setDragElement=function(scopeIndex){
    $scope.dragElementIndex=scopeIndex;
  }

  //Get the first element by position
  $scope.getFirstElementByPosition =function(element){
    var foundPosition=0;
    if(element.objects.length===1)
      return element.objects[0];
    else{
      var foundFirst =false;
      for(var i=0; i< element.objects.length && foundFirst===false;i++){
        if(eval(element.objects[i].position)===1){
          foundFirst =true;
          foundPosition=i;
        }
      }
    }
    return element.objects[foundPosition];
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

    //Biins Logic
    $scope.setBiinToShowcase= function(indexSite,indexBiin){
      if(!$scope.biinSite[indexSite].biins[indexBiin].showcaseAsigned)
        $scope.biinSite[indexSite].biins[indexBiin].showcaseAsigned = $scope.currentModelId;
      else
        $scope.biinSite[indexSite].biins[indexBiin].showcaseAsigned=undefined
    }
}]);

// Define the Elements Service
biinAppShowCases.factory('elementSrv', ['$http', function (async) {
    return {
      getList: function (organizationId) {
        var promise = async({method:'GET', url:'/api/organizations/'+organizationId+'/elements'})
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

// Define the service for Biins
biinAppShowCases.factory("biinSrv",['$http',function(async){
    return {
      getList: function(organizationId){
        var promise = async({method:'GET',url:'/api/organizations/'+organizationId+'/biins'})
        .success(function (data,status,headers,config){
          return data;
        }).error(function(data,status,headers,config){
          return {"status":false};
        });

        return promise;
      },
      saveList:function(organizationId,biinSite){
        var promise= async({method:'POST',url:'/api/organizations/'+organizationId+'/sites/biins', data:biinSite}).success(function(data,status,headers,config){
          return data;
        }).error(function(data,status,headers,config){
          return {"status":false};
        });

        return promise;
      }
    }  
}]);

//Change of image directive
biinAppShowCases.directive('inputChange',function(){
  return{
    restrict:'A',
    link:function(scope,element){       
      $el = $(element);
       $el.on('change',function(e){
          var index =scope.selectedShowcase;
          scope.showcases[index].mainImageUrl= $el.val();
          scope.$digest();
          scope.$apply();
       });
    }
  }
});

//Dropable zones in showcase
biinAppShowCases.directive('drop',function(){
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

/****
    Custom Filters
****/

//Filter for get the objects with undefined value
biinAppShowCases.filter("undefinedValue",function(){
  return function undefinedValue(haysTack, prop){
    var result= _.filter(haysTack, function(hay) {
        return hay[prop]=== undefined || hay[prop]===null || hay==='';
    });
    return result;
  }
});