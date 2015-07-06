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

    $scope.getTypeName = function(type)
    {
       if(type == "1")
       {
          return "External";
       }
       else if (type == "2")
       {
          return "Internal";
       }
       else
       {
          return "Product"
       }
    }

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
        else{
          if(beacon.minorHasChanged && beacon.biinType != "1"){
            $scope.organizations[$scope.selectedOrganization].sites[beacon.siteIndex].minorCounter = $scope.organizations[$scope.selectedOrganization].sites[beacon.siteIndex].minorCounter+1;            
            delete beacon.minorHasChanged;
          }
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
  $scope.minorHasChanged = false;
  $scope.siteMinor = 0;

  if(mode == "create")
  {
    if($scope.sites.length > 0){
        $scope.selectedSite = 0;
        $scope.minor = parseInt($scope.sites[$scope.selectedSite].minorCounter) + 1;
        $scope.siteMinor = parseInt($scope.sites[$scope.selectedSite].minorCounter) + 1;

    }

    $scope.beacon = { 
      identifier:"",
      name:"",
      status:"No Programmed",
      proximityUUID:defaultUUID,
      registerDate:"",
      biinType:"3",
      venue:""
    }
  }
  else
  {
    $scope.beacon = beacon;
    $scope.minor = parseInt(beacon.minor);
    $scope.lockValues = $scope.beacon.status != "No Programmed";
    $scope.initialBeaconType = $scope.beacon.biinType;
    $scope.isExternalBeaconType = $scope.beacon.biinType=="1"; 
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
            $scope.siteMinor = parseInt($scope.sites[indiceSelect].minorCounter);
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
    $scope.beacon.siteMinor = $scope.siteMinor;

    if($scope.mode == "create"){
      $scope.beacon.mode = "create";
      $http.put('/maintenance/insertBiin',$scope.beacon).success(function(data,status){
          $modalInstance.close($scope.beacon);
        }).error(function(data,status){
          $scope.message = data.message;
          console.log(data);
          console.log(status);
        });
    }
    else{
      $scope.beacon.mode = "edit";
      $http.post('/maintenance/insertBiin',$scope.beacon).success(function(data,status){
          console.log("success");
          $scope.beacon.minorHasChanged = $scope.minorHasChanged;
          $modalInstance.close($scope.beacon);
        }).error(function(data,status){
          console.log(data);
          console.log(status);
        });
    }
  }

  $scope.selectSite = function(index){
    if($scope.beacon.biinType == "1"){
      $scope.minor = 1;
      $scope.siteMinor = mode=="create" ? parseInt($scope.sites[index].minorCounter) : parseInt($scope.sites[index].minorCounter) + 1;
    }else{
      if(mode=="create"){
        $scope.minor = parseInt($scope.sites[index].minorCounter) +1;
        $scope.siteMinor = parseInt($scope.sites[index].minorCounter) +1;
      }else{
        if($scope.siteIndexFromBeacon == index && $scope.isExternalBeaconType == (value=="1")){
          $scope.minor = parseInt($scope.beacon.minor);
          $scope.siteMinor = parseInt($scope.sites[index].minorCounter);
          $scope.minorHasChanged = false;
        }else{
          $scope.minor = parseInt($scope.sites[index].minorCounter) +1;
          $scope.siteMinor = parseInt($scope.sites[index].minorCounter) +1;
          $scope.minorHasChanged = true;
        }
      }
    }
    $scope.selectedSite = index;
  }

  $scope.onTypeChange = function(value){
    if(value == "1"){
      $scope.minor = 1;
      $scope.minorHasChanged = !$scope.isExternalBeaconType;
      $scope.siteMinor = pmode=="create" ? parseInt($scope.sites[index].minorCounter) : parseInt($scope.sites[index].minorCounter) + 1;
    }else{
      if($scope.siteIndexFromBeacon == $scope.selectedSite && $scope.isExternalBeaconType == (value=="1")){
        $scope.minor = parseInt($scope.beacon.minor);
        $scope.siteMinor = parseInt($scope.sites[$scope.selectedSite].minorCounter);
        $scope.minorHasChanged = false;
      }else{
        $scope.minorHasChanged = true;
        $scope.minor = parseInt($scope.sites[$scope.selectedSite].minorCounter)+1;
        $scope.siteMinor = parseInt($scope.sites[$scope.selectedSite].minorCounter) +1;
      }
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

