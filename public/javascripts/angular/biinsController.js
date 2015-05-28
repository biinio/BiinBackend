var biinAppBiins= angular.module('biinAppBiins',['ngRoute','ui.slimscroll','naturalSort','biin.services','ui.bootstrap','ui.checkbox']);

biinAppBiins.controller("biinsController",['$scope','$http','$location','$modal',function($scope,$http,$location,$modal){
    var defaultTab = 'details';
    $scope.organizationId=selectedOrganization();
    $scope.selectedBiin = null;
    $scope.wizardPosition="1";

    //Get the Sites Information
    $http.get('api/organizations/'+$scope.organizationId+'/sites/').success(function(data){
      $scope.sites = data.data.sites;  
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

    $http.get('api/organizations/'+$scope.organizationId+'/biins/').success(function(data){
      $scope.biins = data.data;  
    }).error(function(err){
      console.log(err);
    })
    

    //Edit a specific biin
    $scope.edit=function(index){
        $scope.selectedBiin = index;
    }

    $scope.getSiteName=function(identifier){
      var site =_.findWhere($scope.sites,{identifier:identifier});
      if(site){
        return site.title1;
      }else{
        return "";
      }        
    }
    $scope.getObjectName=function(identifier,type){
      if(identifier&&type){
        if(type="element"){
          var el=_.findWhere($scope.elements,{elementIdentifier:identifier});
          if(el)
            return el.title;
        }
        else{
          var sh=_.findWhere($scope.showcases,{identifier:identifier});
          if(sh)
            return sh.name;
        }
      }
        return "name not available"
    }
    $scope.removeObject=function(index){
      $scope.biins[$scope.selectedBiin].objects.splice(index,1);
    }

    //Save The Biin Objects Changes
    $scope.save=function(){
      //Get the showcases
      $http.post('api/organizations/'+$scope.organizationId+'/biins/'+$scope.biins[$scope.selectedBiin].identifier+'/objects',{model:$scope.biins[$scope.selectedBiin]}).success(function(data){
        $scope.showcases = data.data;  
      }).error(function(err){
        console.log(err);
      })      
    }

    //Add an object to the objects collection
    $scope.saveObject=function(obj){
      if(obj)
        if('isNew' in obj){
          delete obj.isNew;
          $scope.biins[$scope.selectedBiin].objects.push(obj);
        }
        else{}
        //$scope.biins.push(obj);
        //Todo Do the method to save the save the data
    }

    //Modal to edit or create an Object
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

      modalInstance.result.then(function (objectToCreate) {      
        $scope.saveObject(objectToCreate);
      }, function () {        
        //$log.info('Modal dismissed at: ' + new Date());
      });
    };


    turnLoaderOff();
}]);

biinAppBiins.controller('objectController', function ($scope, $modalInstance, selectedObj,elements,showcases) {

  $scope.type = selectedObj.type;  
  $scope.elements=elements;
  $scope.showcases=showcases;
  //Create the modal for the creation Model
  if($scope.type==='create'){
    var obj={objectType:'element',notification:'', hasNotification:'0', isNew:true};
    obj.onMonday='1';
    obj.onTuesday='1';
    obj.onWednesday='1';
    obj.onThursday='1';
    obj.onFriday='1';
    obj.onSaturday='1';
    obj.onSunday='1';

    $scope.objects=$scope.elements;
    $scope.obj= obj;
  }else
  {
    if(selectedObj.obj.objectType==='element')
        $scope.objects=$scope.elements;
    else
      $scope.objects=$scope.showcases;
      $scope.obj =selectedObj.obj;  
  }
  //$scope.objects=[];
  $scope.hasNotificationBool=false;
  $scope.hasTimeOptionsBool=false;

  //Days Activation
  $scope.mondayBool=false;
  $scope.tuesdayBool=false;
  $scope.wednesdayBool=false;
  $scope.thursdayBool=false;
  $scope.fridayBool=false;
  $scope.saturdayBool=false;
  $scope.sundayBool=false;  
  
  //Set the scope values
  $scope.hasNotificationBool = $scope.obj.hasNotification==='1';
  $scope.hasTimeOptionsBool = $scope.obj.hasTimeOptions==='1';

  $scope.mondayBool =$scope.obj.onMonday==='1';
  $scope.tuesdayBool =$scope.obj.onTuesday==='1';
  $scope.wednesdayBool = $scope.obj.onWednesday==='1';
  $scope.thursdayBool = $scope.obj.onThursday==='1';
  $scope.fridayBool = $scope.obj.onFriday==='1';
  $scope.saturdayBool = $scope.obj.onSaturday==='1';
  $scope.sundayBool = $scope.obj.onSunday==='1';
  
  //Change the Object Type
  $scope.changeObjectType=function(selected){
      setTimeout(function () {
        $scope.$apply(function () {
            if($scope.obj.objectType==='element'){
              $scope.objects=$scope.elements;
            }
            else{
             $scope.objects=$scope.showcases;  
            }
            $scope.obj.identifier='';
        });
    }, 100);
  }

  //Change the notification State
  $scope.changeNotificationState=function(){
   $scope.obj.hasNotification= $scope.hasNotificationBool?'1':'0';
  }

  //Change the notification State
  $scope.changeTimeOptionsState=function(){
   $scope.obj.hasTimeOptions= $scope.hasTimeOptionsBool?'1':'0';
  } 

  //Change the day State
  $scope.changeDayState=function(varName, boolVarName){
    $scope.obj[varName] =$scope[boolVarName]?'1':'0';
  }
  
  $scope.save = function () {
    $modalInstance.close($scope.obj);
  }

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});

