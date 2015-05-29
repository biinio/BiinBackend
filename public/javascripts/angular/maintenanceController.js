var biinAppMaintenance= angular.module('biinAppMaintenance',['ngRoute','ui.slimscroll','naturalSort','biin.services','ui.bootstrap','ui.bootstrap.datepicker']);

biinAppMaintenance.controller("maintenanceController",['$scope','$http','$location','$modal',function($scope,$http,$location,$modal){

  $http.get('maintenance/organizations').success(function(data){
    $scope.organizations = data;

    for (var i = 0; i < $scope.organizations.length ; i++) {
      $scope.organizations[i].unassignedBeacons = $scope.organizations[i].biinsCounter - $scope.organizations[i].biinsAssignedCounter;
      $scope.organizations[i].assignedBeacons = $scope.organizations[i].biinsAssignedCounter;
    }

    $scope.selectedOrganization = null;
    $scope.biinsXOrganization = null;
    $scope.defaultUUID = "";

    $scope.showBiinsPerOrganization = function(index)
    {
      $http.get('maintenance/getBiinsOrganizationInformation/'+$scope.organizations[index].identifier).success(function(data){
        $scope.selectedOrganization = index;
        $scope.organizations[index].biins = data.biins;
        $scope.defaultUUID = data.defaultUUID;
        $scope.biinsXOrganization = $scope.organizations[index].biins;
        for(var i = 0; i < $scope.biinsXOrganization.length; i++)
        {
          for(var j = 0; j < $scope.organizations[index].sites.length; j++)
          {
            if($scope.biinsXOrganization[i].siteIdentifier == $scope.organizations[index].sites[j].identifier)
            {
              $scope.biinsXOrganization[i].siteName = $scope.organizations[index].sites[j].title2;
              break;
            }
          }
        }
      });
    }
    $scope.showBiinsPerOrganization(0);

    $scope.showAddBiintoOrganizationModal = function ( mode, beacon)
    {
      var modalInstance = $modal.open({
        templateUrl: 'maintenance/addBiinToOrganizationModal',
        controller: 'addOrEditBeaconController',
        size:'lg',
        resolve:{
          selectedElement : function()
          {
            return { sites: $scope.organizations[$scope.selectedOrganization].sites};
          },
          mode : function() { return mode },
          beacon : function(){ return beacon},
          selectedOrganization : function()
          {
            return { organization: $scope.organizations[$scope.selectedOrganization]};
          },
          defaultUUID : function() { return $scope.defaultUUID; }
        }
      });
      modalInstance.result.then(function ( beacon ) {
        $scope.showBiinsPerOrganization($scope.selectedOrganization);
        if(mode == "create" ){
          $scope.organizations[$scope.selectedOrganization].sites[beacon.siteIndex].minorCounter = $scope.organizations[$scope.selectedOrganization].sites[beacon.siteIndex].minorCounter ? $scope.organizations[$scope.selectedOrganization].sites[beacon.siteIndex].minorCounter+1 : 1;
          $scope.organizations[$scope.selectedOrganization].biinsAssignedCounter = $scope.organizations[$scope.selectedOrganization].biinsAssignedCounter ? $scope.organizations[$scope.selectedOrganization].biinsAssignedCounter+1 : 1;
        }
      }, function () {
        $scope.showBiinsPerOrganization($scope.selectedOrganization);
      });
    }
  }).error(function(err){
    console.log(err);
  })
  
  turnLoaderOff();
  }]);


biinAppMaintenance.controller('addOrEditBeaconController', function ($scope, $modalInstance, $http, selectedElement, mode, beacon, selectedOrganization, defaultUUID) {

  $scope.sites = selectedElement.sites;
  $scope.mode = mode;
  $scope.beacon = null;
  $scope.selectedOrganization = selectedOrganization.organization;
  $scope.minor = 0;
  $scope.siteIndexFromBeacon = 0;
  $scope.lockValues = false;

  if(mode == "create")
  {
    if($scope.sites.length > 0){
        $scope.selectedSite = 0;
        $scope.minor = parseInt($scope.sites[$scope.selectedSite].minorCounter) + 1;
    }

    $scope.beacon = { 
      identifier:"",
      name:"",
      status:"No Programmed",
      proximityUUID:defaultUUID,
      registerDate:""
    }
  }
  else
  {
    $scope.beacon = beacon;
    $scope.minor = parseInt(beacon.minor);
    $scope.lockValues = $scope.beacon.status != "No Programmed";
    var end=false;
    var indiceSelect= -1;
    for(var i = 0; i < $scope.sites.length && !end; i++)
    {
       if($scope.sites[i].identifier == $scope.beacon.siteIdentifier)
       {
          indiceSelect=i;
          end=true;

          //Binding the value in the view
          setTimeout(function(){
            $scope.selectedSite = indiceSelect;
            $scope.siteIndexFromBeacon = indiceSelect;
            $scope.$apply(); //this triggers a $digest

          },50);
       }
    }
  }

  $scope.save = function()
  {

    $scope.beacon.major = $scope.sites[$scope.selectedSite].major;
    $scope.beacon.siteIdentifier = $scope.sites[$scope.selectedSite].identifier;
    $scope.beacon.siteIndex = $scope.selectedSite;
    $scope.beacon.isAssigned = true;
    $scope.beacon.organizationIdentifier = $scope.selectedOrganization.identifier;
    $scope.beacon.accountIdentifier = $scope.selectedOrganization.accountIdentifier;
    $scope.beacon.minor = $scope.minor;

    if($scope.mode == "create"){
      $scope.beacon.mode = "create";
      $http.put('/maintenance/insertBiin',$scope.beacon).success(function(data,status){
          $modalInstance.close($scope.beacon);
        }).error(function(data,status){
          console.log(data);
          console.log(status);
        });
    }
    else{
      $scope.beacon.mode = "edit";
      $http.post('/maintenance/insertBiin',$scope.beacon).success(function(data,status){
          console.log("success");
          $modalInstance.close($scope.beacon);
        }).error(function(data,status){
          console.log(data);
          console.log(status);
        });
    }
  }

  $scope.selectSite = function(index){
    if(mode=="create")
    {
      $scope.minor = parseInt($scope.sites[index].minorCounter) +1;
    }
    else
    {
      if($scope.siteIndexFromBeacon == index)
        $scope.minor = parseInt($scope.beacon.minor);
      else
        $scope.minor = parseInt($scope.sites[index].minorCounter)+1;
    }
  }
  $scope.selectStatus = function(status)
  {
      $scope.lockValues = status != "No Programmed"
  }

  $scope.ok = function () {
    $modalInstance.close($scope.objectIndex);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});

