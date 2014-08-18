var biinAppObjects = angular.module('biinAppElements',['ngRoute','angularSpectrumColorpicker','ui.slimscroll','naturalSort','biin.services']);


biinAppObjects.controller("elementsController",['$scope', '$http','categorySrv','gallerySrv',function($scope,$http,categorySrv,gallerySrv){
  
  //Constants
  $scope.maxMedia=3;

  //Draggable Properties
  $scope.dragCategoryIndex =-1;
  $scope.dragGalleryIndex=-1;  
  $scope.selectedElement=null;
  $scope.currentModelId = null;
  $scope.organizationId=selectedOrganization();
  $scope.activeTab ='details';

  //Get the List of Objects
  $http.get('api/organizations/'+$scope.organizationId+'/elements').success(function(data){
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
  }

  //Remove element at specific position
  $scope.removeElementAt = function(index){
    if($scope.selectedElement==index){
      $scope.selectedElement =null;
      $scope.currentModelId =null;
    }
    if('isNew' in $scope.elements[index] ){
      //remove the showcase
      $scope.elements.splice(index,1);
    }else//If the element is new is not in the data base      
    {
      var elementId = $scope.elements[index].objectIdentifier;      
      $scope.elements.splice(index,1);
      $http.delete('api/organizations/'+$scoper.organizationId+'/elements/'+elementId).success(function(data){
          if(data.state=="success"){
            //Todo: implement a pull of messages
          }
        }
      );
    }
  }

  //Save detail model object
  $scope.saveDetail= function(){  
    $http.put('api/organizations/'+$scope.organizationId+'/elements/'+$scope.currentModelId,{model:$scope.elements[$scope.selectedElement]}).success(function(data,status){
      if("replaceModel" in data){
        $scope.elements[$scope.selectedElement] = data.replaceModel;
        $scope.elementPrototype =  $.extend(true, {}, $scope.elementPrototypeBkp);
      }
      if(data.state=="success")
        $scope.succesSaveShow=true;
    });          
  } 

  //Change tab to a specific section
  $scope.changeTabTo= function(tabToChange){
    $scope.activeTab = tabToChange;
  }

  //Get the List of Categories
  categorySrv.getList().then(function(promise){
    $scope.categories = promise.data.data;    
  });

  //Return the categories of the selected element
  $scope.ownCategories=function(){
    var categories=[];
    if($scope.elements[$scope.selectedElement] && $scope.elements[$scope.selectedElement].categories)
      categories = $scope.elements[$scope.selectedElement].categories;
    return categories;
  }

  //Set the category index when start draggin
  $scope.setDragCategory=function(scopeIndex){
    $scope.dragCategoryIndex= scopeIndex;
  }

  //Set the gallery index when start draggin
  $scope.setDragGallery=function(scopeIndex){
    $scope.dragGalleryIndex= scopeIndex;
  }

 //Insert category in the site
  $scope.insertCategory = function(index){

    var elementToPush =$scope.categories[$scope.dragCategoryIndex];

    delete elementToPush._id;
    if(!$scope.elements[$scope.selectedElement].categories)
      $scope.elements[$scope.selectedElement].categories=[];

    //$scope.sites[$scope.selectedSite].categories.push(elementToPush);
    $scope.elements[$scope.selectedElement].categories.splice(0, 0, elementToPush);

    //Apply the changes    },

    $scope.$digest();
    $scope.$apply();    
  }

  //Remove categorie a specific position
  $scope.removeCategoryAt=function(scopeIndex){
    $scope.elements[$scope.selectedElement].categories.splice(scopeIndex,1);
  }

  //Gallery Media Images

  //Insert a gallery item to site
  $scope.insertGalleryItem = function(index){
    if($scope.elements[$scope.selectedElement].media.length < $scope.maxMedia &&  index < $scope.galleries.length && $scope.galleries[index]){
      var newObj = {};
      newObj.identifier = $scope.galleries[index].identifier;
      newObj.imgUrl = $scope.galleries[index].serverUrl;
      $scope.elements[$scope.selectedElement].media.push(newObj);  

      //Apply the changes
      $scope.$digest();
      $scope.$apply();    
    }
  } 

  //Remove the media object at specific index
  $scope.removeMediaAt=function(index){
    if($scope.elements[$scope.selectedElement].media.length>=index)
      $scope.elements[$scope.selectedElement].media.splice(index,1)
  }

  //Get the list of the gallery
  gallerySrv.getList().then(function(promise){
    $scope.galleries= promise.data;
  });

  //On gallery change method                
  $scope.onGalleryChange= function(obj,autoInsert){
    //Do a callback logic by caller
    $scope.galleries = $scope.galleries.concat(obj);;
    $scope.$digest();

    if(autoInsert)
    {
      //Insert the images to the preview
      var cantToInsert=$scope.maxMedia- $scope.elements[$scope.selectedElement].media.length;
      for(var i=0; i< cantToInsert; i++){
        $scope.insertGalleryItem($scope.galleries.indexOf(obj[i]));
      }      
    }
  }

}]);

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
