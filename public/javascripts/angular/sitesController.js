var biinAppSite= angular.module('biinAppSites',['ngRoute','ui.slimscroll','naturalSort','biin.services','ngAnimate']);

var tabBiin="biins", tabDetails="details";

biinAppSite.controller("siteController",['$scope','$http','$location','$routeParams','categorySrv','gallerySrv',function($scope,$http,$location,$routeParams,categorySrv,gallerySrv){

  //Constants
  $scope.maxMedia=4;

  //Init the the sites
  $scope.activeTab=tabDetails;
  $scope.selectedSite = null;
  $scope.selectedBiin = null;
  $scope.currentModelId = null;
  $scope.organizationId = selectedOrganization();
  $scope.wizardPosition =1;
  $scope.newTagField="";

  //Draggable Properties
  $scope.dragCategoryIndex =-1;
  $scope.dragGalleryIndex=-1;

  //Get the List of Showcases
  $http.get('/api/organizations/'+ $scope.organizationId+'/sites').success(function(data){
    if(data.data)
      $scope.sites = data.data.sites;
    else
      $scope.sites=[];
    $scope.sitePrototype = data.prototypeObj;
    $scope.sitePrototypeBkp =  $.extend(true, {}, data.prototypeObj);
    $scope.biinPrototype = data.prototypeObjBiin;
    $scope.biinPrototypeBkp =  $.extend(true, {}, data.prototypeObjBiin);

    if($scope.selectedSite == null && $scope.sites && $scope.sites.length>0){
      //Select the first element
      $scope.edit(0);  
    } 
  });

  //Get the List of Categories
  categorySrv.getList().then(function(promise){
    $scope.categories = promise.data.data;    
  });

  //Return the categories of the sites
  $scope.ownCategories=function(){
    return $scope.sites[$scope.selectedSite].categories;
  }

  //Get the list of the gallery
  gallerySrv.getList($scope.organizationId).then(function(promise){
    $scope.galleries= promise.data.data;
  });

  //Chante the tab selected
  $scope.changeTabTo=function(tabName){
    $scope.activeTab=tabName;
  }

  //Create a new Site
  $scope.create = function(){
    var newObject=$scope.sitePrototype;

    if($scope.sites.indexOf(newObject)>-1)
      $scope.selectedSite=$scope.sites.indexOf(newObject);
    else{
        //Get the Mayor from server
        $http.get('api/organizations/'+$scope.organizationId+"/major").success(function(data,status){
          $scope.sitePrototype =  $.extend(true, {}, $scope.sitePrototypeBkp);
        $scope.sitePrototype.isNew=true;
        $scope.sitePrototype.major = data.data;
        $scope.sites.push($scope.sitePrototype);     

        $scope.edit($scope.sites.indexOf($scope.sitePrototype)); 
        });

    }
  }

  //Edit an site
  $scope.edit = function(index){
    $scope.selectedSite = index;
    $scope.currentModelId = $scope.sites[index].identifier;
  }

  //Remove site at specific position
  $scope.removeSiteAt = function(index){
    if($scope.selectedSite==index){
      $scope.selectedSite =null;
      $scope.currentModelId =null;
    }
    if('isNew' in $scope.sites[index] ){
      //remove the showcase
      $scope.sites.splice(index,1);
    }else//If the element is new is not in the data base      
    {
      var siteId = $scope.sites[index].identifier;      
      $scope.sites.splice(index,1);
      $http.delete('api/showcases/'+$scope.organizationId+'/sites/'+siteId).success(function(data){
          if(data.state=="success"){
            //Todo: implement a pull of messages
          }
        }
      );
    }
  }

  //Save detail model object
  $scope.save= function(){  
    $http.put('api/showcases/'+$scope.organizationId+'/sites/'+$scope.currentModelId,{model:$scope.sites[$scope.selectedSite]}).success(function(data,status){
      if("replaceModel" in data){
        $scope.sites[$scope.selectedSite] = data.replaceModel;
        $scope.sitePrototype =  $.extend(true, {}, $scope.sitePrototypeBkp);
      }
      if(data.state=="success")
        $scope.succesSaveShow=true;
    });          
  } 

  //Details

  //Add tag information
  $scope.addSiteTag=function(value){

    if(!$scope.sites[$scope.selectedSite].searchTags)
      $scope.sites[$scope.selectedSite].searchTags=[];
    
    if(value!=""){    
      //If the values is not in the array
      if($.inArray(value, $scope.sites[$scope.selectedSite].searchTags))
      {
        $scope.sites[$scope.selectedSite].searchTags.push(value);
        $scope.newTagField=""; 
      }

    }
  }

  //Remove of Site Tag
  $scope.removeSiteTag=function(index){
    if($scope.sites[$scope.selectedSite].searchTags.length>index){
      $scope.sites[$scope.selectedSite].searchTags.splice(index,1);
    }
  }

  //Location Methods
  $scope.changeLocation=function(lat,lng){
    $scope.sites[$scope.selectedSite].lat=lat;
    $scope.sites[$scope.selectedSite].lng=lng;

    //Apply the changes
    $scope.$digest();
    $scope.$apply();    
  }
  //Biins

  //Create a  new Biin
  $scope.createBiin=function(){
     $http.get("api/organizations/"+$scope.organizationId+"/"+$scope.sites[$scope.selectedSite].identifier+"/minor").success(function(data){
        $scope.biinPrototype=$.extend(true, {}, $scope.biinPrototypeBkp);
        $scope.biinPrototype.isNew=true;
        
        if('isNew' in $scope.sites[$scope.selectedSite]){
          $scope.biinPrototype.major = $scope.sites[$scope.selectedSite].major;
          $scope.biinPrototype.minor= $scope.sites[$scope.selectedSite].minorCounter;
          $scope.sites[$scope.selectedSite].minorCounter += data.data;
        }else
        {
          $scope.biinPrototype.major = $scope.sites[$scope.selectedSite].major;
          $scope.biinPrototype.minor= data.data;
        }
        
        $scope.sites[$scope.selectedSite].biins.splice(0,0,$scope.biinPrototype);      
        $scope.editBiin(0);

     });
  }

  //Edit a Biin
  $scope.editBiin= function(index){
    $scope.selectedBiin = index;
    $scope.activeTab=tabBiin;
  }

  //Save the new Biin in the selected site
  $scope.saveNewBiin=function(){
    $scope.biinPrototype=$.extend(true, {}, $scope.biinPrototypeBkp);
    $scope.selectedBiin=null;
    $scope.activeTab = tabDetails;
  }


  //Categories

  //Remove categorie a specific position
  $scope.removeCategoryAt=function(scopeIndex){
    $scope.sites[$scope.selectedSite].categories.splice(scopeIndex,1);
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
    if(!$scope.sites[$scope.selectedSite].categories)
      $scope.sites[$scope.selectedSite].categories=[];

    //$scope.sites[$scope.selectedSite].categories.push(elementToPush);
    $scope.sites[$scope.selectedSite].categories.splice(0, 0, elementToPush);

    //Apply the changes
    $scope.$digest();
    $scope.$apply();    
  }

  //Insert a gallery item to site
  $scope.insertGalleryItem = function(index){
    if($scope.sites[$scope.selectedSite].media.length < $scope.maxMedia &&  index < $scope.galleries.length && $scope.galleries[index]){
      var newObj = {};
      newObj.identifier = $scope.galleries[index].identifier;
      newObj.imgUrl = $scope.galleries[index].url;
      $scope.sites[$scope.selectedSite].media.push(newObj);  

      //Apply the changes
      $scope.$digest();
      $scope.$apply();    
    }
  }

  //Remove the media object at specific index
  $scope.removeMediaAt=function(index){
    if($scope.sites[$scope.selectedSite].media.length>=index)
      $scope.sites[$scope.selectedSite].media.splice(index,1)
  }

  /**** 
    Methods
  ****/

  //On gallery change method                
  $scope.onGalleryChange= function(obj,autoInsert){
    
    //Do a callback logic by caller
    $scope.galleries = $scope.galleries.concat(obj);
    $scope.$digest();

    //Insert the images to the preview
    if(autoInsert){
      var cantToInsert=$scope.maxMedia- $scope.sites[$scope.selectedSite].media.length;
      for(var i=0; i< cantToInsert; i++){
        $scope.insertGalleryItem($scope.galleries.indexOf(obj[i]));
      }
    }
  }

  }]);

