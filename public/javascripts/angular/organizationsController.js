var biinAppOrganization= angular.module('biinAppOrganizations',['ngRoute','ui.slimscroll','naturalSort']);

var organizationsCropper=null
//App configuration
biinAppOrganization.config(['$routeProvider' ,'$locationProvider',
	function($routeProvider,$locationProvider){
	$routeProvider.
		when('/organizations/:organizationId',{
			templateUrl:'partials/organizationList',
			controller:'organizationsController'
		}).
    when('/organizations',{
      templateUrl:'partials/organizationList',
      controller:'organizationsController'
    }).    
    otherwise({
        redirectTo: '/organizations'
      });

    // use the HTML5 History API
    $locationProvider.html5Mode(true);
}]);

biinAppOrganization.controller("organizationsController",['$scope','$http','$location',function($scope,$http,$location){
  $scope.selectedOrganization = null;

  //Get the List of Objects
  $http.get('api/organizations').success(function(data){
  	$scope.organizations = data.data;
    $scope.currentModelId = null;

    $scope.organizationPrototype = data.prototypeObj;

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
    clearSelectedOrganization();
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
    $scope.selectedOrganization = index;
    $scope.currentModelId = $scope.organizations[index].identifier;
    //Remove the cropper
    removeCropper();

    //Instanciate cropper
    organizationsCropper= createOrganizationsCropper("wrapperOrganization");
    var imgUrl = $scope.organizations[index].imgUrl;
    organizationsCropper.preInitImage(imgUrl);

    if('isNew' in $scope.organizations[index])
      clearSelectedOrganization();
    else
      setOrganization();
  } 

  //Save the organization model
  $scope.save= function(){
      var organizationModel = $scope.organizations[$scope.selectedOrganization];
      $http.put('api/organizations/'+$scope.currentModelId,{model:organizationModel}).success(function(data,status){
      if("replaceModel" in data){
        $scope.organizations[$scope.selectedOrganization] = data.replaceModel;
        $scope.currentModelId=$scope.organizations[$scope.selectedOrganization].identifier;
        $scope.organizationPrototype =  $.extend(true, {}, $scope.organizationPrototypeBkp);
        $scope.sitePrototype = $.extend(true,{},$scope.sitePrototypeBkp);
      }
      if(data.state=="success")
        $scope.succesSaveShow=true;

      setOrganization();
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


