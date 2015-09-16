var biinAppAccount = angular.module('biinAppAccount',['pascalprecht.translate','ngRoute','ui.checkbox','ui.bootstrap']);

//Translation Provider
biinAppAccount.config(function($translateProvider) {
    // Our translations will go in here
     $translateProvider.useStaticFilesLoader({
      prefix: '/locals/account/',
      suffix: '.json'
    });

     //var language = window.navigator.userLanguage || window.navigator.language
    $translateProvider.preferredLanguage('es');
});

biinAppAccount.controller("accountController",['$translate','$scope', '$http','$modal','$log',function($translate,$scope,$http,$modal,$log){

  $scope.wizardPosition=1;
  $scope.selectedOrganization='';
  $scope.isDefaultOrganization=false;

  $scope.prevSaveOrganization=null;
  $scope.isAnalazingOrg=false;//Indicates if the organization form is analyzed to detect changes


  $http.get('/api/accounts/').success(function(data){
    $scope.account = data.data;

    //Verify the Fields
    if(!('profilePhoto' in $scope.account.profile)){
    	$scope.account.profile.profilePhoto="";
    }
    if(!('lastName' in $scope.account.profile))
      $scope.account.profile.lastName=""; 

    if(!('phoneNumber' in $scope.account.profile))
      $scope.account.profile.phoneNumber=""; 

  });

  //Get the organizations of the Account
  $http.get('api/organizations').success(function(data){
    $scope.organizations = data.data;
    $scope.currentModelId = null;
    $scope.organizationId= null;

    //Set the default organization
    if($scope.account.profile.defaultOrganization){

      var defaultOrg =_.findWhere($scope.organizations,{identifier:$scope.account.profile.defaultOrganization});
      if(defaultOrg){
        var index =$scope.organizations.indexOf(defaultOrg);
        $scope.editOrganization(index);
      }        

    }
  });


  //Change the wizard to an specific option
  $scope.changeWizardTo = function(index){
  	$scope.wizardPosition=index;
  }

  $scope.changeProfileImage=function(image){
    $scope.account.profile.profilePhoto=image+ '?' + new Date().getTime();;

    //Apply the changes
    $scope.$digest();
    $scope.$apply();
  }

  $scope.changeOrganizationImage=function(media){
    $scope.organizations[$scope.selectedOrganization].media =[];
    $scope.organizations[$scope.selectedOrganization].media.push(media);

    //Apply the changes
    $scope.$digest();
    $scope.$apply();
  }

  changeOrganizationToDefault=function(){    
    var organizationId = $scope.organizations[$scope.selectedOrganization].identifier;
    if($scope.account.profile.defaultOrganization!==organizationId){      
      setOrganization();
      $scope.account.profile.defaultOrganization=organizationId;
      $http.post('api/accounts/'+organizationId+'/default').success(function(data,status){
        if(data.status===200){
          $scope.succesSaveShow=true;
        }else
          $scope.errorSaveShow=true;
      }).error(function(data, status, headers, config) {
        $scope.errorSaveShow=true;
      });                
    }else{
      setOrganization();
    }
    

  }

/*********************  Organization Methods ********************/

 /**** 
    Methods
  ****/
  //Push a new organization in the list
  $scope.createOrganization = function(){
    //Get the Mayor from server
    $http.post('api/organizations/').success(function(org,status){
      if(status==201 || status==200){
        $scope.organizations.push(org);    
        $scope.editOrganization($scope.organizations.indexOf(org)); 
      }else
      {
        displayErrorMessage(org,"Organizations Creation",status)
      }
    });    
  }

  //Edit an site
  $scope.editOrganization = function(index){
      $scope.selectedOrganization = index;
      $scope.currentModelId = $scope.organizations[index].identifier;
      $scope.organizationId =$scope.organizations[index].identifier;
      $scope.prevSaveOrganization =  jQuery.extend({}, $scope.organizations[index]);      
      changeOrganizationToDefault();
    //$scope.clearValidations();
    //$scope.wizardPosition=1;
    //$scope.validate(true);
  }

  //Remove showcase at specific position
  $scope.removeOrganizationAt = function(index){
    //clearSelectedOrganization();
    if($scope.selectedOrganization==index){
      $scope.selectedOrganization =null;
      $scope.currentModelId =null;

    }
    var isDefaultOrganization = $scope.organizations[index].identifier === $scope.account.profile.defaultOrganization;

    var organizationId = $scope.organizations[index].identifier;      
      $scope.organizations.splice(index,1);
      $http.delete('api/organizations/'+organizationId).success(function(data){
          if(data.state=="success"){
            //Todo: implement a pull of messages
              if(isDefaultOrganization)
                clearSelectedOrganization();
          }
        }
      );
  }


  //Save the Profile Settings
  $scope.save=function(){
    if(typeof($scope.account) !== 'undefined' ){
      if(typeof($scope.account.profile) !=='undefined'){      
        if(isProfileDirty()){//If is Profile Dirty
          $http.put('api/accounts',{model:$scope.account.profile}).success(function(data,status){      
            if(status===200){      
              $scope.succesSaveShow=true;
            }else
              $scope.errorSaveShow=true;
          });                       
        }
    }
    }     
  }


  //Update the changes of the Selected Organization
  $scope.saveOrganization=function(){
    if(typeof($scope.currentModelId)!=='undefined' && $scope.currentModelId !== null && $scope.selectedOrganization>=0){
      if(!$scope.isAnalazingOrg){
        if(isOrganizationDirty()){

          $scope.prevSaveOrganization=jQuery.extend({}, $scope.organizations[$scope.selectedOrganization]);
          $scope.isAnalazingOrg=false;          

          $http.put('api/organizations/'+$scope.currentModelId,{model:$scope.organizations[$scope.selectedOrganization]}).success(function(data,status){
            if(status===200){
              $scope.succesSaveShow=true;
            }else
              $scope.errorSaveShow=true;
          });          

        }
        $scope.isAnalazingOrg=false;        
      }
    }
              
  }

  //Confirmation Modal of Remove
  $scope.openConfirmation = function (size, selectedIndex) {

      var modalInstance = $modal.open({
        templateUrl: 'partials/removeConfirmationModal',
        controller: 'responseInstanceCtrl',
        size: size,
        resolve: {
          selectedElement: function () {            
            return {name:$scope.organizations[selectedIndex].name,index:selectedIndex};
          }
        }
      });

    modalInstance.result.then(function (itemIndex) {
      $scope.removeOrganizationAt(itemIndex)
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };


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

  //Models Validators
  isProfileDirty=function(){
    var propertiesToCheck= ["displayName","lastName","name","phoneNumber"];
    //emails[0]
    return true;
  }

  //Indicate if an organization data is changed
  isOrganizationDirty =function(){
    $scope.isAnalazingOrg=true;
    var propertiesToCheck= ["name","brand","description","extraInfo","loyaltyEnabled"];

    if($scope.prevSaveOrganization != null){
      var foundChange= false;//$scope.organizations[$scope.selectedOrganization].media[0].imgUrl!==$scope.prevSaveOrganization.media[0].imgUrl;
      for(var i =0; i<propertiesToCheck.length && !foundChange; i++){
        foundChange=  $scope.organizations[$scope.selectedOrganization][propertiesToCheck[i]] !== $scope.prevSaveOrganization[propertiesToCheck[i]];
      }
    }

    return foundChange;
  }

  //Turn off the Loader
  turnLoaderOff();

}]);

//Upload the profile Image
biinAppAccount.directive('uploadProfileImage',function(){
  return{
    restrict:'A',
    link:function(scope, element, attrs){
      var $inputFileElement=$(attrs['uploadProfileImage']);

        //Change event when an image is selected
        $inputFileElement.on('change',function(){
          console.log("Change beginning the upload");

            var files = $inputFileElement[0].files;
            var formData = new FormData();
            for (var i = 0; i < files.length; i++) {
              var mediaFile = files[i];
              mediaFile.originalFilename=files[i].name;
              formData.append('file', mediaFile);
            }

            //Upload The media information

            //scope.loadingImagesChange(true);
            // now post a new XHR request
            var xhr = new XMLHttpRequest();

            xhr.open('POST', 'api/imageProfile');
            xhr.onload = function (data) {
              if (xhr.status === 200) {
                var obj= $.parseJSON(xhr.response);

                scope.changeProfileImage(obj.data);                

                console.log('all done: ' + xhr.status);
                //scope.loadingImagesChange(false);
              } else {
                console.log('Something went terribly wrong...');
              }
            };

            xhr.upload.onprogress = function (event) {
              if (event.lengthComputable) {
                var complete = (event.loaded / event.total * 100 | 0);
                //progress.value = progress.innerHTML = complete;
              }
            };

            xhr.send(formData);
          
        })
        //Click event of the style button
        $(element[0]).on('click touch',function(e){          
          $inputFileElement.trigger('click');
        });
    }
  }
});

//Upload the profile Image
biinAppAccount.directive('uploadOrganizationImage',function(){
  return{
    restrict:'A',
    link:function(scope, element, attrs){
      var $inputFileElement=$(attrs['uploadOrganizationImage']);

        //Change event when an image is selected
        $inputFileElement.on('change',function(){
          console.log("Change beginning the upload");

            var files = $inputFileElement[0].files;
            var formData = new FormData();
            for (var i = 0; i < files.length; i++) {
              var mediaFile = files[i];
              mediaFile.originalFilename=files[i].name;
              formData.append('file', mediaFile);
            }

            //Upload The media information

            //scope.loadingImagesChange(true);
            // now post a new XHR request
            var xhr = new XMLHttpRequest();

            var organization=scope.currentModelId;

            xhr.open('POST', 'api/organizations/'+organization+"/image");
            xhr.onload = function (data) {
              if (xhr.status === 200) {
                var obj= $.parseJSON(xhr.response);

                scope.changeOrganizationImage(obj.data);                

                console.log('all done: ' + xhr.status);
                //scope.loadingImagesChange(false);
              } else {
                console.log('Something went terribly wrong...');
              }
            };

            xhr.upload.onprogress = function (event) {
              if (event.lengthComputable) {
                var complete = (event.loaded / event.total * 100 | 0);
                //progress.value = progress.innerHTML = complete;
              }
            };

            xhr.send(formData);
          
        })
        //Click event of the style button
        $(element[0]).on('click touch',function(e){          
          $inputFileElement.trigger('click');
        });
    }
  }
});

  
biinAppAccount.controller('responseInstanceCtrl', function ($scope, $modalInstance, selectedElement) {

  $scope.objectName = selectedElement.name;
  $scope.objectIndex = selectedElement.index;


  $scope.ok = function () {
    $modalInstance.close($scope.objectIndex);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});