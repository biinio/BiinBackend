var biinAppBiins= angular.module('biinAppBiins',['ngRoute','ui.slimscroll','naturalSort','biin.services','ui.bootstrap']);

biinAppBiins.controller("biinsController",['$scope','$http','$location','$modal',function($scope,$http,$location,$modal){
    var defaultTab = 'details';
    $scope.organizationId=selectedOrganization();
    $scope.selectedBiin = null;
    $scope.wizardPosition="1";

    $http.get('api/organizations/'+$scope.organizationId+'/biins/').success(function(data){
      $scope.biins = data.data;  
    }).error(function(err){
      console.log(err);
    })
    
    //Get the elements
    $http.get('api/organizations/'+$scope.organizationId+'/elements/').success(function(data){
      $scope.elements = data.data.elements;  
    }).error(function(err){
      console.log(err);
    })

    //Get the showcases
    $http.get('api/organizations/'+$scope.organizationId+'/showcases/').success(function(data){
      $scope.showcases = data.data;  
    }).error(function(err){
      console.log(err);
    })

    //Edit a specific biin
    $scope.edit=function(index){
        $scope.selectedBiin = index;
    }

    //Confirmation Modal of Remove
    $scope.biinObject = function (size, type, obj) {

        var modalInstance = $modal.open({
          templateUrl: 'partials/biinObjectModal',
          controller: 'objectController',
          size: size,
          resolve: {
            selectedObj: function () {            
              if(type==='create')
                return {type:type};//name:$scope.sites[selectedIndex].title1,index:selectedIndex};
              else
                return {type:type, obj:obj};//name:$scope.sites[selectedIndex].title1,index:selectedIndex};
            },
            elements: function(){
              return $scope.elements;
            },
            showcases: function(){
              return $scope.showcases;
            },
          }
        });

      modalInstance.result.then(function (itemIndex) {      
      }, function () {
        //$log.info('Modal dismissed at: ' + new Date());
      });
    };

    turnLoaderOff();
}]);

biinAppBiins.controller('objectController', function ($scope, $modalInstance, selectedObj,elements,showcases) {
  $scope.type = selectedObj.type;
  $scope.obj =selectedObj.obj;
  $scope.elements=elements;
  $scope.showcases=showcases;
  //$scope.objectName = selectedElement.name;
  //$scope.objectIndex = selectedElement.index;


  $scope.changeObjectType=function(){
    if($scope.obj.objectType==='element'){
      $scope.objects=$scope.elements;
    }
    else
     $scope.objects=$scope.showcases; 
  }

  $scope.ok = function () {
    $modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.changeObjectType();
});

