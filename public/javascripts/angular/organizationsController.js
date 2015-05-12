var biinAppOrganization= angular.module('biinAppOrganizations',['ngRoute','ui.slimscroll','naturalSort','biin.services']);

biinAppOrganization.controller("organizationsController",['$scope','$http','$location','gallerySrv','$modal',function($scope,$http,$location,gallerySrv,$modal){
  var defaultTab = 'details';
  $scope.maxMedia =4;
  $scope.selectedOrganization = null;
  $scope.activeTab =defaultTab;

  //Get the List of Objects
  $http.get('api/organizations').success(function(data){
  	$scope.organizations = data.data;
    $scope.currentModelId = null;
    $scope.organizationId= null;
    $scope.organizationPrototype = data.prototypeObj;

    //Site Prototypes Backup
    $scope.organizationPrototypeBkp =  $.extend(true, {}, data.prototypeObj);    

    //Select the first showcase
    if(data.data.length>0)
     $scope.edit(0)
  });	

  /**** 
    Methods
  ****/
  //Push a new organization in the list
  $scope.create = function(){
    var newObject=$scope.organizationPrototype;
    var objIndex=$scope.organizations.indexOf(newObject);
    if(objIndex>-1){      
      $scope.selectedOrganization=objIndex; 
    }else{
        $scope.organizationPrototype =  $.extend(true, {}, $scope.organizationPrototypeBkp);
        $scope.organizationPrototype.isNew=true;
        $scope.organizations.push($scope.organizationPrototype);     
        $scope.edit($scope.organizations.indexOf($scope.organizationPrototype)); 
    }
  }

  //Remove showcase at specific position
  $scope.removeOrganizationAt = function(index){
    clearSelectedOrganization();
    if($scope.selectedOrganization==index){
      $scope.selectedOrganization =null;
      $scope.currentModelId =null;

    }
    if('isNew' in $scope.organizations[index] ){
      //remov of the Organization
      $scope.organizations.splice(index,1);
    }else//If the element is new is not in the data base      
    {
      var organizationId = $scope.organizations[index].identifier;      
      $scope.organizations.splice(index,1);
      $http.delete('api/organizations/'+organizationId).success(function(data){
          if(data.state=="success"){
            //Todo: implement a pull of messages
          }
        }
      );
    }
  }

  //Change tab to a specific section
  $scope.changeTabTo= function(tabToChange){
    $scope.activeTab = tabToChange;
  }

  //Edit an organization
  $scope.edit = function(index){
    $scope.selectedOrganization = index;
    $scope.currentModelId = $scope.organizations[index].identifier;
    $scope.organizationId= $scope.organizations[index].identifier;
    $scope.changeTabTo(defaultTab);
    //Get the list of the gallery
    gallerySrv.getList($scope.currentModelId).then(function(promise){
      $scope.galleries= promise.data.data;
    });

    if('isNew' in $scope.organizations[index])
      clearSelectedOrganization();
    else
      setOrganization();
  } 
  
  //Save the organization model
  $scope.save= function(){
      var organizationModel = $scope.organizations[$scope.selectedOrganization];
      $http.put('api/organizations/'+$scope.currentModelId,{model:organizationModel}).success(function(data,status){
      
      if(status==400){
        displayValidationErrors(data);
      }else{
        if("replaceModel" in data){
          $scope.organizations[$scope.selectedOrganization] = data.replaceModel;
          $scope.currentModelId=$scope.organizations[$scope.selectedOrganization].identifier;
          $scope.organizationId= $scope.organizations[$scope.selectedOrganization].identifier;
          $scope.organizationPrototype =  $.extend(true, {}, $scope.organizationPrototypeBkp);
        }
        if(data.state=="success")
          $scope.succesSaveShow=true;

        setOrganization();
      }
    });
  }

  //Set the gallery index when start draggin
  $scope.setDragGallery=function(scopeIndex){
    $scope.dragGalleryIndex= scopeIndex;
  }

  //Insert a gallery item to the organization
  $scope.insertGalleryItem = function(index){

    if($scope.organizations[$scope.selectedOrganization].media.length < $scope.maxMedia &&  index < $scope.galleries.length && $scope.galleries[index]){

      var newObj = {};
      newObj.identifier = $scope.galleries[index].identifier;
      newObj.imgUrl = $scope.galleries[index].url;
      $scope.organizations[$scope.selectedOrganization].media.push(newObj);  

      //Apply the changes
      $scope.$digest();
      $scope.$apply();    
    }

  } 

  //Remove the media object at specific index
  $scope.removeMediaAt=function(index){
    if($scope.organizations[$scope.selectedOrganization].media.length>=index)
      $scope.organizations[$scope.selectedOrganization].media.splice(index,1)
  }

  //On gallery change method                
  $scope.onGalleryChange= function(obj,autoInsert){
    //Do a callback logic by caller
    if(!$scope.galleries)
      $scope.galleries =[];
    $scope.galleries = $scope.galleries.concat(obj);;
    $scope.$digest();

    if(autoInsert)
    {
      //Insert the images to the preview
      var mediaCount =0;
      if(typeof($scope.organizations[$scope.selectedOrganization].media)!=='undefined')
        mediaCount=$scope.organizations[$scope.selectedOrganization].media.length;
      var cantToInsert=$scope.maxMedia- mediaCount;
      if(obj.length<cantToInsert)
        cantToInsert = obj.length;
      for(var i=0; i< cantToInsert; i++){
        $scope.insertGalleryItem($scope.galleries.indexOf(obj[i]));
      }      
    }
  }

   /*-----------------------------------------------------
   /* Sites Functionality
   /*-----------------------------------------------------*/

  //Clear selected organization
  clearSelectedOrganization= function(){
    var $organizationEl =$("#organizationNav");
    $organizationEl.addClass("hide");
    $organizationEl.attr("data-organization",'');
  }

  //Set the organization selected
  setOrganization = function(){
    if($scope.organizations[$scope.selectedOrganization]){
      setOrganizationMenu($scope.currentModelId, $scope.organizations[$scope.selectedOrganization].name)
    }
  }

  }]);


