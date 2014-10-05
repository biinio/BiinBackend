var biinAppSite= angular.module('biinAppSites',['ngRoute','ui.slimscroll','naturalSort','biin.services','ngAnimate','angularSpectrumColorpicker']);

var tabBiin="biins", tabDetails="details";

biinAppSite.controller("siteController",['$scope','$http','$location','$routeParams','categorySrv','gallerySrv',function($scope,$http,$location,$routeParams,categorySrv,gallerySrv){

  //Constants
  $scope.maxMedia=0;

  //Init the the sites
  $scope.activeTab=tabDetails;
  $scope.selectedSite = null;
  $scope.selectedBiin = null;
  $scope.currentModelId = null;
  $scope.organizationId = selectedOrganization();
  $scope.wizardPosition =1;
  $scope.newTagField="";
  $scope.isValid =false;
  //Wizard validations indicatos
  $scope.wizard1IsValid = false;
  $scope.wizard2IsValid = false;
  $scope.wizard3IsValid =false;
  $scope.wizard4IsValid =false;
  $scope.wizard5IsValid =false;
  $scope.wizard6IsValid =false;

  //Loading images service propertie
  $scope.loadingImages =false;

  //Draggable Properties
  $scope.dragCategoryIndex =-1;
  $scope.dragGalleryIndex=-1;

  //Biins to Purchase Site
  $scope.biinsQty=0;

  //Get the List of Showcases
  $http.get('/api/organizations/'+ $scope.organizationId+'/sites').success(function(data){
    if(data.data)
      $scope.sites = data.data.sites;
    else
      $scope.sites=[];
    $scope.sitePrototype = data.data.prototypeObj;
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
      //Get the Mayor from server
      $http.post('api/organizations/'+$scope.organizationId+"/sites").success(function(site,status){
        if(status==201){
          $scope.sites.push(site);     
          $scope.biinsQty=0;
          $scope.wizardPosition=1;
          $scope.clearValidations();
          $scope.edit($scope.sites.indexOf(site)); 
        }else
        {
          displayErrorMessage(site,"Sites Creation",status)
        }
      });    
  }

  //Edit an site
  $scope.edit = function(index){
    $scope.selectedSite = index;
     $scope.activeTab=tabDetails;
    $scope.currentModelId = $scope.sites[index].identifier;
    $scope.clearValidations();
    $scope.wizardPosition=1;
    $scope.validate(true);
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
      console.log("save");
      $http.put('api/showcases/'+$scope.organizationId+'/sites/'+$scope.currentModelId,{model:$scope.sites[$scope.selectedSite]}).success(function(data,status){
        if("replaceModel" in data){
          $scope.sites[$scope.selectedSite] = data.replaceModel;
        }
        if(data.state=="success")
          $scope.succesSaveShow=true;
      });            
    
  } 

  //Details
  //Change Wizad tab manager
  $scope.changeWizardTab=function(option){
    switch(option){
      case 1:
        $scope.wizardPosition =option;
      break;
      case 2:
        if($scope.wizard1IsValid)
          $scope.wizardPosition =option;        
      break      
      case 3:
        if($scope.wizard1IsValid&& $scope.wizard2IsValid)
          $scope.wizardPosition =option;
          $scope.wizard3IsValid=true;
      break  
      case 4:
        if($scope.wizard1IsValid&& $scope.wizard2IsValid && $scope.wizard3IsValid)
          $scope.wizardPosition =option;
      break 
      case 5:
        if($scope.wizard1IsValid&& $scope.wizard2IsValid && $scope.wizard3IsValid && $scope.wizard4IsValid)
          $scope.wizardPosition =option;
      break   
      case 6:
        if($scope.wizard1IsValid&& $scope.wizard2IsValid && $scope.wizard3IsValid && $scope.wizard4IsValid&& $scope.wizard5IsValid)
          $scope.wizardPosition =option;
      break         
      default:
        $scope.wizardPosition =option;
      break;        
    }

    //Validate the current option
    $scope.validate();
  }

  //Add tag information
  $scope.addSiteTag=function(value){

    if(!$scope.sites[$scope.selectedSite].searchTags)
      $scope.sites[$scope.selectedSite].searchTags=[];
    
    if(value!=""){    
      //If the values is not in the array
      if($.inArray(value, $scope.sites[$scope.selectedSite].searchTags)==-1)
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

  //Purchase Biin Function
  $scope.purchaseBiin=function(qty){
    //Put the purchase order
    $http.post("api/organizations/"+$scope.organizationId+"/sites/"+$scope.sites[$scope.selectedSite].identifier+"/biins",{biinsQty:qty}).success(function(data,status){
      if(status==201){
        //Push the
        for(var i=0; i<data.length;i++)
          $scope.sites[$scope.selectedSite].biins.push(data[i]);
        $('#purchaseBeaconModal').modal('hide');
        $scope.biinsQty=0;
        $scope.validate();
      }else
         displayErrorMessage(data,"Purchase Biin",status)

    });
  }
  //Category return if contains a specific categoru
  $scope.containsCategory=function(category){
    if(typeof(_.findWhere($scope.sites[$scope.selectedSite].categories,{identifier:category.identifier}))!='undefined')
      return 'active'
    else
      return "";
  }
  //Change the state of the category relation with the Site
  $scope.switchCategoryState =function(category){
    var index =-1;
    var cat = _.findWhere($scope.sites[$scope.selectedSite].categories,{identifier:category.identifier});
    if(typeof(cat)!='undefined'){
      index=$scope.sites[$scope.selectedSite].categories.indexOf(cat);
    }

    if(index>=0)
      $scope.sites[$scope.selectedSite].categories.splice(index,1)
    else
      $scope.sites[$scope.selectedSite].categories.push(category);

    $scope.validate();
    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
        $scope.$apply();
        $scope.$digest();
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
    if(($scope.sites[$scope.selectedSite].media.length < $scope.maxMedia &&  index < $scope.galleries.length && $scope.galleries[index])||$scope.maxMedia==0){
      var newObj = {};
      newObj.identifier = $scope.galleries[index].identifier;
      newObj.imgUrl = $scope.galleries[index].url;
      $scope.sites[$scope.selectedSite].media.push(newObj);  

      $scope.wizard2IsValid= typeof($scope.sites[$scope.selectedSite].media)!='undefined'&& $scope.sites[$scope.selectedSite].media.length>0
      //Apply the changes
      $scope.$digest();
      $scope.$apply();    
    }
  }

  //Remove the media object at specific index
  $scope.removeMediaAt=function(index){
    if($scope.sites[$scope.selectedSite].media.length>=index)
      $scope.sites[$scope.selectedSite].media.splice(index,1)

    $scope.wizard2IsValid= typeof($scope.sites[$scope.selectedSite].media)!='undefined'&& $scope.sites[$scope.selectedSite].media.length>0
  }

  $scope.validate=function(validateAll){
    var validate=typeof(validateAll)!='undefined';
    //var validations =$scope.sitePrototype.validations();
    var currentValid=false;

      if(eval($scope.wizardPosition)==1 || validate){     
        if($scope.sites[$scope.selectedSite])
          $scope.wizard1IsValid= (typeof($scope.sites[$scope.selectedSite].title1)!='undefined' && $scope.sites[$scope.selectedSite].title1.length>0) && (typeof($scope.sites[$scope.selectedSite].title2)!='undefined' && $scope.sites[$scope.selectedSite].title2.length>0);
        else{
          $scope.wizard1IsValid=false; 
        }         
        currentValid = $scope.wizard1IsValid;
      }
      if(eval($scope.wizardPosition)==2 || validate){
        $scope.wizard2IsValid= (typeof($scope.sites[$scope.selectedSite].media)!='undefined' && $scope.sites[$scope.selectedSite].media.length>0);
      }

      if( eval($scope.wizardPosition)==3 || validate){
         $scope.wizard3IsValid=true;
      }

      if( eval($scope.wizardPosition)==4 || validate){
        var locationValidate = false;
        if($scope.sites[$scope.selectedSite]){
          locationValidate =typeof($scope.sites[$scope.selectedSite].country)!='undefined' && $scope.sites[$scope.selectedSite].country.length>0;
          locationValidate =locationValidate && typeof($scope.sites[$scope.selectedSite].state)!='undefined' && $scope.sites[$scope.selectedSite].state.length>0;
          locationValidate =locationValidate && typeof($scope.sites[$scope.selectedSite].city)!='undefined' && $scope.sites[$scope.selectedSite].city.length>0;
          locationValidate =locationValidate && typeof($scope.sites[$scope.selectedSite].zipCode)!='undefined' && $scope.sites[$scope.selectedSite].zipCode.length>0;
          locationValidate =locationValidate && typeof($scope.sites[$scope.selectedSite].streetAddres)!='undefined' && $scope.sites[$scope.selectedSite].streetAddres.length>0;                    
          locationValidate =locationValidate && typeof($scope.sites[$scope.selectedSite].phoneNumber)!='undefined' && $scope.sites[$scope.selectedSite].phoneNumber.length>0;
           $scope.wizard4IsValid=locationValidate;
        }
        else{
          $scope.wizard4IsValid=false; 
        } 
        currentValid = $scope.wizard4IsValid;
      }
      if( eval($scope.wizardPosition)== 5 || validate)
      {
        if($scope.sites[$scope.selectedSite]){
         $scope.wizard5IsValid=$scope.sites[$scope.selectedSite].biins.length>0;
        }else{
          $scope.wizard5IsValid=false; 
        }        
      }
      if(eval($scope.wizardPosition)== 6 || validate)
      {
        if($scope.sites[$scope.selectedSite]){
         $scope.wizard6IsValid=$scope.sites[$scope.selectedSite].categories.length>0;
        }else{
          $scope.wizard6IsValid=false; 
        }
      }

    $scope.isValid = $scope.wizard1IsValid && $scope.wizard2IsValid&& $scope.wizard3IsValid&& $scope.wizard4IsValid&& $scope.wizard5IsValid&& $scope.wizard6IsValid;

    return currentValid;

  }
  $scope.clearValidations=function(){
    $scope.isValid = false;    
    $scope.wizard1IsValid =false;
    $scope.wizard2IsValid=false;
    $scope.wizard3IsValid=false;
    $scope.wizard4IsValid=false;
    $scope.wizard5IsValid=false;
    $scope.wizard6IsValid=false;
  }
  /**** 
    Methods
  ****/
  //validation methods
  /*$scope.$watch('form.$valid', function(newVal, oldVal) {
    console.log('Validaion')
   $scope.$emit('validityChange', {'form':newVal});
  });*/


  //On gallery change method                
  $scope.onGalleryChange= function(obj,autoInsert){
    
    //Do a callback logic by caller
    $scope.galleries = $scope.galleries.concat(obj);
    $scope.$digest();

    //Insert the images to the preview
    if(autoInsert){
      var cantToInsert= obj.length;
      if(maxMedia>0)
        cantToInsert=$scope.maxMedia- $scope.sites[$scope.selectedSite].media.length;

      for(var i=0; i< cantToInsert; i++){
        $scope.insertGalleryItem($scope.galleries.indexOf(obj[i]));
      }
    }
  }

  $scope.loadingImagesChange=function(state){
    $scope.loadingImages = state;
    $scope.$digest();
  }

  //Scroll Bars Options
  /*$scope.scrollbarOptionsOwnedGallery = {
        "type": "simple",
        "onScroll":function(y, x){
            if(x.scroll == x.maxScroll){
                alert('Scrolled to bottom');
            }
        }
    }; 

  $scope.scrollbarOptionsStandard = {
        "type": "simple"
    }; */
  }]);

