var biinAppObjects = angular.module('biinAppElements',['ngRoute','angularSpectrumColorpicker','ui.slimscroll','naturalSort','biin.services']);


biinAppObjects.controller("elementsController",['$scope', '$http','categorySrv','gallerySrv','stickersSrv',function($scope,$http,categorySrv,gallerySrv,stickersSrv){
  
  //Constants
  $scope.maxMedia=0;

  //Draggable Properties
  $scope.dragCategoryIndex =-1;
  $scope.dragGalleryIndex=-1;  
  $scope.selectedElement=null;
  $scope.currentModelId = null;
  $scope.organizationId=selectedOrganization();
  $scope.activeTab ='details';
  $scope.newTagField="";

  //Loading images service propertie
  $scope.loadingImages =false;

  //Draggable Properties
  //Wizard validations indicatos
  $scope.wizard1IsValid = false;
  $scope.wizard2IsValid =false;

  //Get the List of Objects
  $http.get('api/organizations/'+$scope.organizationId+'/elements').success(function(data){
  	$scope.elements = data.data.elements;    
    if($scope.elements && $scope.elements != null &&  $scope.elements.length>0){
      
      //Select the first element
      $scope.edit(0);  

    } 
  });	

  //Push a new showcase in the list
  $scope.create = function(){
    $http.post('api/organizations/'+$scope.organizationId+"/elements").success(function(element,status){
      if(status==201){
        $scope.elements.push(element);
        $scope.wizardPosition=1;
        $scope.clearValidations();
        $scope.edit($scope.elements.indexOf(element));
      }else{
        displayErrorMessage(element,"Element Creation",status);
      }
    });
  }

  //Edit an element
  $scope.edit = function(index){

    $scope.selectedElement = index;
    $scope.currentModelId = $scope.elements[index].objectIdentifier;
    $scope.clearValidations();
    $scope.wizardPosition=1;
    $scope.validate(); 

  }

  //Remove element at specific position
  $scope.removeElementAt = function(index){
    if($scope.selectedElement==index){
      $scope.selectedElement =null;
      $scope.currentModelId =null;
    }

    var elementId = $scope.elements[index].objectIdentifier;      
    $scope.elements.splice(index,1);
    $http.delete('api/organizations/'+$scope.organizationId+'/elements/'+elementId).success(function(data){
        if(data.state=="success"){
          //Todo: implement a pull of messages
        }
      }
    );
  }

  //Save detail model object
  $scope.save= function(){  
    $http.put('api/organizations/'+$scope.organizationId+'/elements/'+$scope.currentModelId,{model:$scope.elements[$scope.selectedElement]}).success(function(data,status){
      if("replaceModel" in data){
        console.log("save")
        $scope.elements[$scope.selectedElement] = data.replaceModel;
        $scope.elementPrototype =  $.extend(true, {}, $scope.elementPrototypeBkp);
      }
      if(data.state=="success")
        $scope.succesSaveShow=true;
    });          
  } 

  //Change Wizad tab manager
  $scope.changeWizardTab=function(option){
    switch(option){
      case 1:
        $scope.wizardPosition =option;
      break;
      case 2:
        if($scope.wizard1IsValid)
          $scope.wizardPosition =option;        
      break      
      case 3:
        if($scope.wizard1IsValid&& $scope.wizard2IsValid)
          $scope.wizardPosition =option;
          $scope.wizard3IsValid=true;
      break  
      case 4:
        if($scope.wizard1IsValid&& $scope.wizard2IsValid && $scope.wizard3IsValid)
          $scope.wizardPosition =option;
      break 
      case 5:
        if($scope.wizard1IsValid&& $scope.wizard2IsValid && $scope.wizard3IsValid && $scope.wizard4IsValid)
          $scope.wizardPosition =option;
      break   
      case 6:
        if($scope.wizard1IsValid&& $scope.wizard2IsValid && $scope.wizard3IsValid && $scope.wizard4IsValid&& $scope.wizard5IsValid)
          $scope.wizardPosition =option;
      break         
      default:
        $scope.wizardPosition =option;
      break;        
    }

    //Validate the current option
    $scope.validate();
  }

  //Add tag information
  $scope.addElementTag=function(value){

    if(!$scope.elements[$scope.selectedElement].searchTags)
      $scope.elements[$scope.selectedElement].searchTags=[];
    
    if(value!=""){    
      //If the values is not in the array
      if($.inArray(value, $scope.elements[$scope.selectedElement].searchTags)==-1)
      {
        $scope.elements[$scope.selectedElement].searchTags.push(value);
        $scope.newTagField=""; 
      }

    }
  }

  //Remove of Site Tag
  $scope.removeElementTag=function(index){
    if($scope.elements[$scope.selectedElement].searchTags.length>index){
      $scope.elements[$scope.selectedElement].searchTags.splice(index,1);
    }
  }


  //Validations
  //Validate the steps
  $scope.validate=function(validateAll){
    var validate=typeof(validateAll)!='undefined';
    var currentValid=false;

      if(eval($scope.wizardPosition)==1 || validate){     
        if($scope.elements[$scope.selectedElement])
          $scope.wizard1IsValid= (typeof($scope.elements[$scope.selectedElement].title)!='undefined' && $scope.elements[$scope.selectedElement].title.length>0) && (typeof($scope.elements[$scope.selectedElement].description)!='undefined' && $scope.elements[$scope.selectedElement].description.length>0);
        else{
          $scope.wizard1IsValid=false; 
        }         
        currentValid = $scope.wizard1IsValid;
      }
      if(eval($scope.wizardPosition)==2 || validate){
        $scope.wizard2IsValid= (typeof($scope.elements[$scope.selectedElement].media)!='undefined' && $scope.elements[$scope.selectedElement].media.length>0);
      }

      $scope.isValid = $scope.wizard1IsValid && $scope.wizard2IsValid;

      return currentValid;
  }
  //Clear the validations
  $scope.clearValidations=function(){
      $scope.isValid = false;    
      $scope.wizard1IsValid =false;
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

  //Select an sticker
  $scope.selectSticker=function(index){
    if($scope.elements[$scope.selectedElement].sticker.identifier==""){
      if($scope.elements[$scope.selectedElement].sticker.identifier !==$scope.stickers[index].identifier){
        $scope.elements[$scope.selectedElement].sticker.identifier= $scope.stickers[index].identifier;
        $scope.elements[$scope.selectedElement].sticker.color= $scope.stickers[index].color;        
      }else{
        $scope.elements[$scope.selectedElement].sticker.identifier="";
        $scope.elements[$scope.selectedElement].sticker.color="";
      }

    }

  }

  //Gallery Media Images

  //Insert a gallery item to site
  $scope.insertGalleryItem = function(index){
    if(($scope.elements[$scope.selectedElement].media.length < $scope.maxMedia &&  index < $scope.galleries.length && $scope.galleries[index])||$scope.maxMedia==0){
      var newObj = {};
      newObj.identifier = $scope.galleries[index].identifier;
      newObj.imgUrl = $scope.galleries[index].url;
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
  gallerySrv.getList($scope.organizationId).then(function(promise){
    $scope.galleries = promise.data.data;
  });

  //Get the list of stickers
  stickersSrv.getList().then(function(promise){
    $scope.stickers = promise.data.data;
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
