var biinAppSite= angular.module('biinAppSites',['ngRoute','ui.slimscroll','naturalSort','biin.galleryService']);

var tabBiin="biins", tabDetails="details";
var organizationsCropper=null
//App configuration
biinAppSite.config(['$routeProvider' ,'$locationProvider',
	function($routeProvider,$locationProvider){
	$routeProvider.
		when('/organizations/:organizationId/sites',{
			templateUrl:'partials/siteList',
			controller:'siteController'
		});
    
    // use the HTML5 History API
    $locationProvider.html5Mode(true);
}]);

biinAppSite.controller("siteController",['$scope','$http','$location','$routeParams','categorySrv','gallerySrv',function($scope,$http,$location,$routeParams,categorySrv,gallerySrv){

  //Constants
  $scope.maxMedia=3;

  //Init the the sites
  $scope.activeTab=tabDetails;
  $scope.selectedSite = null;
  $scope.selectedBiin = null;
  $scope.currentModelId = null;
  $scope.organizationId =$routeParams.organizationId;

  //Draggable Properties
  $scope.dragCategoryIndex =-1;
  $scope.dragGalleryIndex=-1;

  //Get the List of Showcases
  if($routeParams.organizationId){
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

   $scope.$watch('activeTab', function(newValue, oldValue) {
      console.log("Change of activeTab old: "+ oldValue+" -  to new: " +newValue);
       $scope.counter = $scope.counter + 1;
     });
  }

  //Get the List of Categories
  categorySrv.getList().then(function(promise){
    $scope.categories = promise.data.data;    
  });

  //Get the list of the gallery
  gallerySrv.getList().then(function(promise){
    $scope.galleries= promise.data;
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
        $scope.sitePrototype =  $.extend(true, {}, $scope.sitePrototypeBkp);
        $scope.sitePrototype.isNew=true;
        $scope.sites.push($scope.sitePrototype);     
        $scope.edit($scope.sites.indexOf($scope.sitePrototype)); 
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

  //Biins

  //Create a  new Biin
  $scope.createBiin=function(){

    var newObject = $scope.biinPrototype;

    if($scope.sites[$scope.selectedSite].biins.indexOf(newObject)>-1){
        $scope.selectedBiin = $scope.sites[$scope.selectedSite].biins.indexOf(newObject);
    }       
     else{
        $scope.biinPrototype=$.extend(true, {}, $scope.biinPrototypeBkp);
        $scope.biinPrototype.isNew=true;
        $scope.sites[$scope.selectedSite].biins.splice(0,0,$scope.biinPrototype);      
        $scope.editBiin(0);
     }
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
      newObj.imgUrl = $scope.galleries[index].serverUrl;
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
  $scope.onGalleryChange= function(obj){
    //Do a callback logic by caller
    $scope.galleries = $scope.galleries.concat(obj);;
    $scope.$digest();

    //Insert the images to the preview
    var cantToInsert=$scope.maxMedia- $scope.sites[$scope.selectedSite].media.length;
    for(var i=0; i< cantToInsert; i++){
      $scope.insertGalleryItem($scope.galleries.indexOf(obj[i]));
    }

  }

  }]);

// Define the service of categories
biinAppSite.factory('categorySrv', ['$http', function (async) {
    return {
      getList: function () {
        var promise = async({method:'GET', url:'/api/categories'})
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

//Define the directives of categories
biinAppSite.directive('drop',function(){
  return{
    restrict:'A',
    link:function(scope,element, attrs){       
      $el = $(element);

      $el.droppable({
        drop:function(event,ui){

          switch(ui.draggable[0].attributes["drag"].value){
            //scope insert of the category
            case "categories":
              //Todo put the logic for add the category
              scope.insertCategory(scope.dragCategoryIndex);            
              break;
            case "galleries":
              //Todo put the logic for add the gallery
              scope.insertGalleryItem(scope.dragGalleryIndex);            
              break;
          }
        },
        over:function(event,ui){
          $el.next(".dropColumn").addClass('hide');
        }
      })
      
      
    }
  }
});

//Define the directives of categories
biinAppSite.directive('drag',function(){
  return{
    restrict:'A',
    link:function(scope,element, attrs){       
      $el = $(element);
    
      $el.draggable({appendTo: '.colCategories',containment: '.workArea', cursor: "move", scroll: true, helper: 'clone',snap: true, snapTolerance: 5, 
        start:function(){          
            switch(attrs.drag)
            {
              case "categories":
                scope.setDragCategory(scope.$eval(attrs.elementIndex));        
              break;
              case "galleries":
                scope.setDragGallery(scope.$eval(attrs.elementIndex));        
              break;             

            }
          }
        });
    }
  }
});

/****
    Custom Filters
****/

//Filter for get the intersection of two list of objects
biinAppSite.filter("difference",function(){
  return function intersection(haysTack, needle){
    //call function in utilities
    return differenceObjects(haysTack,needle,function(item1,item2){
      return item1.identifier===item2.identifier;
    });
  }
});

