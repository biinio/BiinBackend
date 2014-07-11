var biinAppOrganization= angular.module('biinAppOrganizations',['ngRoute','ui.slimscroll','naturalSort']);

var organizationsCropper=null
//App configuration
biinAppOrganization.config(['$routeProvider',
	function($routeProvider){
	$routeProvider.
		when('/list',{
			templateUrl:'partials/organizationList',
			controller:'organizationsController'
		}).
    otherwise({
        redirectTo: '/list'
      });
}]);

biinAppOrganization.controller("organizationsController",['$scope','$http',function($scope,$http){
  $scope.selectedOrganization = null;
  $scope.selectedSite = null;
  //Get the List of Objects
  $http.get('api/organizations').success(function(data){
  	$scope.organizations = data.data;
    $scope.currentModelId = null;

    $scope.organizationPrototype = data.prototypeObj;
    $scope.sitePrototype = data.sitePrototypeObj;

    //Site Prototypes Backup
    $scope.organizationPrototypeBkp =  $.extend(true, {}, data.prototypeObj);    
    $scope.sitePrototypeBkp = $.extend(true, {}, data.sitePrototypeObj);    

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
    if($scope.selectedOrganization==index){
      $scope.selectedOrganization =null;
      $scope.currentModelId =null;

      //Remove the cropper
      removeCropper();
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

  //Edit an organization
  $scope.edit = function(index){
    $scope.clearSelectedSite();
    $scope.selectedOrganization = index;
    $scope.currentModelId = $scope.organizations[index].identifier;
    //Remove the cropper
    removeCropper();

    //Instanciate cropper
    organizationsCropper= createOrganizationsCropper("wrapperOrganization");
    var imgUrl = $scope.organizations[index].imgUrl;
    organizationsCropper.preInitImage(imgUrl);
  }  

  //Save the organization model
  $scope.save= function(){
      var organizationModel = $scope.organizations[$scope.selectedOrganization];
      $http.put('api/organizations/'+$scope.currentModelId,{model:organizationModel}).success(function(data,status){
      if("replaceModel" in data){
        $scope.organizations[$scope.selectedOrganization] = data.replaceModel;
        $scope.organizationPrototype =  $.extend(true, {}, $scope.organizationPrototypeBkp);
        $scope.sitePrototype = $.extend(true,{},$scope.sitePrototypeBkp);
      }
      if(data.state=="success")
        $scope.succesSaveShow=true;
    });     
  }

   //Others

   //Remove the current cropper
   removeCropper= function(){
      if(organizationsCropper !=null){
        organizationsCropper.destroy();
        organizationsCropper = null;
      }
   }

   /*-----------------------------------------------------
   /* Sites Functionality
   /*-----------------------------------------------------*/

  //Push a new site to the list of the selected site
  $scope.createSite= function(){
    var newObj = $scope.sitePrototype;
    var objIndex =$scope.organizations[$scope.selectedOrganization].sites.indexOf(newObj);
    if(objIndex>-1)
      $scope.selectedSite=objIndex
    else
    {
      $scope.sitePrototype =$.extend(true, {}, $scope.sitePrototypeBkp);
      $scope.sitePrototype.isNew = true;
      $scope.organizations[$scope.selectedOrganization].sites.push($scope.sitePrototype);
      $scope.editSite($scope.organizations[$scope.selectedOrganization].sites.indexOf($scope.sitePrototype)); 
    }
  }

  //Return the missing media of a site
  $scope.mediaMissing=function(){
    var cantOfItems = 3- $scope.organizations[$scope.selectedOrganization].sites[$scope.selectedSite].media.length;
    var arrayItems = [];

    //Array items
    for(var i=0; i< cantOfItems;i++)
      arrayItems.push(i);

    return arrayItems;
  }

  //Indicates if the selected site is new
  $scope.isSelectedSiteNew=function(){
    return 'isNew' in $scope.organizations[$scope.selectedOrganization].sites[$scope.selectedSite];
  }

  $scope.removeSiteAt= function(index){
    if($scope.selectedSite == index)
      $scope.selectedSite = null;
    $scope.organizations[$scope.selectedOrganization].sites.splice(index,1);
  }

  $scope.editSite= function(index){
    $scope.selectedSite = index;
    $scope.currentModelSiteId = $scope.organizations[$scope.selectedOrganization].sites[index].identifier;
  }

  $scope.clearSelectedSite = function(){
    $scope.selectedSite =null;
    $scope.currentModelSiteId = null;
  }
  }]);

  //Change of image directive
  biinAppOrganization.directive('inputChange',function(){
    return{
      restrict:'A',
      link:function(scope,element){       
        $el = $(element);
         $el.on('change',function(e){
            var index =scope.selectedOrganization;
            scope.organizations[index].imgUrl= $el.val();
            scope.$digest();
            scope.$apply();
         });
      }
    }
  });

  //Define the Directives
  biinAppOrganization.directive('imageCropper',function(){
    return{
      restrict:'A',
      link:function(scope,element){       
         organizationsCropper= createOrganizationsCropper(element[0].attributes["id"].value);
         var index =scope.selectedOrganization;
         var imgUrl = scope.organizations[index].imgUrl;
         organizationsCropper.preInitImage(imgUrl);
      }
    }
  });