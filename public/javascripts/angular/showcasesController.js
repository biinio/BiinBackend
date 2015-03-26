var biinAppShowCases = angular.module('biinAppShowCases',['pascalprecht.translate','ngRoute','angularSpectrumColorpicker','ui.slimscroll','naturalSort','biin.services','ui.bootstrap']);

//Translation Provider
biinAppShowCases.config(function($translateProvider) {
    // Our translations will go in here
     $translateProvider.useStaticFilesLoader({
      prefix: '/locals/showcase/',
      suffix: '.json'
    });

     //var language = window.navigator.userLanguage || window.navigator.language
    $translateProvider.preferredLanguage('es');
});

//App define controllers
biinAppShowCases.controller('showcasesController', ['$scope', '$http','$routeParams','elementSrv','biinSrv', function($scope,$http,$routeParams, elementSrv,biinSrv) {
  $scope.selectedShowcase = null;
  $scope.currentModelId = null;
  $scope.dragElementIndex=-1;
  $scope.dragBiinIndex =-1;
  $scope.organizationId =selectedOrganization();
  $scope.activeValue='1';
  $scope.search='';

  //Draggable Properties
  //Wizard validations indicatos
  $scope.wizard0IsValid = false;
  $scope.wizard1IsValid = false;
  $scope.wizard2IsValid =false;
  $scope.wizard3IsValid =false;
  $scope.wizard4IsValid =false;

  //Get the List of Showcases
  $http.get('api/organizations/'+$scope.organizationId+'/showcases').success(function(data){
  	$scope.showcases = data.data;
    $scope.showcasePrototype = data.prototypeObj;
    $scope.showcasePrototypeBkp =  $.extend(true, {}, data.prototypeObj);
    if($scope.selectedShowcase == null && $scope.showcases && $scope.showcases.length>0){
      //Select the first element
      $scope.edit(0);  
    }    
  });

  //Get the List of Elements
  elementSrv.getList($scope.organizationId).then(function(promise){
    $scope.elements = promise.data.data.elements;    
  });

  //Get the List of Biins
  biinSrv.getList($scope.organizationId).then(function(promise){
    $scope.biinSite = promise.data.data;
  });  

  //Push a new showcase in the list
  $scope.create = function(){
    //Create a new Showcase
    $http.post('api/organizations/'+$scope.organizationId+"/showcases").success(function(showcase,status){
      if(status==201){
        $scope.showcases.push(showcase);
        $scope.wizardPosition=1;
        $scope.clearValidations();
        $scope.edit($scope.showcases.indexOf(showcase));
      }else{
        displayErrorMessage(element,"Showcases Creation",status);
      }
    });

  }

  //Edit an showcase
  $scope.edit = function(index){
    $scope.selectedShowcase = index;
    $scope.currentModelId = $scope.showcases[index].identifier;

    $scope.clearValidations();
    $scope.wizardPosition=1;
    $scope.validate(true); 

  }

  //Select the showcase theme function
  $scope.selectTheme=function(index){
    if($scope.showcases[$scope.selectedShowcase].theme!==''+index)
      $scope.showcases[$scope.selectedShowcase].theme=""+index;
    else
      $scope.showcases[$scope.selectedShowcase].theme="";

    $scope.validate(true);

  }  
  //Remove showcase at specific position
  $scope.removeShowcaseAt = function(index){
    if($scope.selectedShowcase==index){
      $scope.selectedShowcase =null;
      $scope.currentModelId =null;
    }

    var showcaseId = $scope.showcases[index].identifier;      
    $scope.showcases.splice(index,1);
    $http.delete('api/organizations/'+$scope.organizationId+'/showcases/'+showcaseId).success(function(data){
        if(data.state=="success"){
          //Todo: implement a pull of messages
        }
      }
    );
    
  }

  //Save detail model object
  $scope.save= function(){ 

    $http.put('api/showcases/'+$scope.currentModelId,{model:$scope.showcases[$scope.selectedShowcase]}).success(function(data,status){
      if("replaceModel" in data){
        $scope.showcases[$scope.selectedShowcase] = data.replaceModel;
        $scope.showcasePrototype =  $.extend(true, {}, $scope.showcasePrototypeBkp);
      }
      if(data.state=="success"){
      //Save the changes in the biins
        biinSrv.saveList($scope.organizationId, $scope.biinSite).then(function(promise){
          if(promise.data.state=='success'){
            //Todo put the update was success
            console.log("Update of the list of biins");
          }  
          else
            //Todo handle the errors
            console.log("there was an error");
        });
        $scope.succesSaveShow=true;
      }
    });          
  } 

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
      break  
      case 4:
        if($scope.wizard1IsValid&& $scope.wizard2IsValid && $scope.wizard3IsValid )
          $scope.wizardPosition =option;
      break   
      default:
        $scope.wizardPosition =option;
      break;        
    }

    //Validate the current option
    $scope.validate();
  }

  //Validations
  //Validate the steps
  $scope.validate=function(validateAll){
    var validate=typeof(validateAll)!='undefined';
    var currentValid=false;

      //Validation of Details
      if(eval($scope.wizardPosition)==1 || validate){     
         $scope.wizard1IsValid= (typeof($scope.showcases[$scope.selectedShowcase].name)!='undefined' && $scope.showcases[$scope.selectedShowcase].name!='') && (typeof($scope.showcases[$scope.selectedShowcase].titleColor)!='undefined' && $scope.showcases[$scope.selectedShowcase].titleColor!='');
      }

      //Validation of Elements
      if(eval($scope.wizardPosition)==2 || validate){
        $scope.wizard2IsValid=  (typeof($scope.showcases[$scope.selectedShowcase].elements) != 'undefined' && $scope.showcases[$scope.selectedShowcase].elements.length>0);
      }      


      //Validaton of Biin Sites
      if(eval($scope.wizardPosition)==3 || validate){      
        $scope.wizard3IsValid= typeof($scope.biinSite)!='undefined'&& $scope.biinSite!=null && $scope.biinSite.length>0;
      }

      //Validation of Notificatins
      if(eval($scope.wizardPosition)==4 || validate){
        var wizard4IsValid = false;

        //var isShowcaseTypeValid = $scope.showcases[$scope.selectedShowcase].showcaseType=='1' || $scope.showcases[$scope.selectedShowcase].showcaseType=='2';
        //Validate the Notification
        if($scope.showcases[$scope.selectedShowcase].activateNotification===$scope.activeValue ){
           wizard4IsValid=true;
          for(var i=0; i<$scope.showcases[$scope.selectedShowcase].notifications.length;i++){
            if($scope.showcases[$scope.selectedShowcase].notifications[i].isActive===$scope.activeValue)
              wizard4IsValid = wizard4IsValid && $scope.showcases[$scope.selectedShowcase].notifications[i].isActive === $scope.activeValue && typeof($scope.showcases[$scope.selectedShowcase].notifications[i].text)!=='undefined' && $scope.showcases[$scope.selectedShowcase].notifications[i].text.length>0;
          }                 
        }else{
         wizard4IsValid=true; 
        }

        $scope.wizard4IsValid= wizard4IsValid ;//&& isShowcaseTypeValid; 
      }
      $scope.isValid = $scope.wizard1IsValid && $scope.wizard2IsValid && $scope.wizard4IsValid;

      return currentValid;
  }


  //Remove an element of a Showcase
  $scope.removeElementAt=function(index){
    var position = $scope.showcases[$scope.selectedShowcase].elements[index].position;
    $scope.showcases[$scope.selectedShowcase].elements.splice(index,1);

    //Update the elements position
    updateShowcaseObjectsPositionWhenDelete(eval(position));

    $scope.validate();
  }

  //Clear the validations
  $scope.clearValidations=function(){
      $scope.isValid = false;    
      $scope.wizard1IsValid =false;
  }

  //Move element of a showcase to up
  $scope.moveElementUp=function(index){
    var oldPosition =eval($scope.showcases[$scope.selectedShowcase].elements[index].position);
    if(oldPosition>1){      
      var newPosition =oldPosition-1;

      var prevObj= _.find($scope.showcases[$scope.selectedShowcase].elements, function (obj) { return eval(obj.position) === newPosition})
      $scope.showcases[$scope.selectedShowcase].elements[index].position=""+newPosition;
      
      //Modify the position of the prev object
      prevObj.position = ""+oldPosition;

      if(!$scope.$$phase) {
        $scope.$digest();
      }
    }
  }  

  //Move element of a showcase to down
  $scope.moveElementDown=function(index){
    var oldPosition =eval($scope.showcases[$scope.selectedShowcase].elements[index].position);
    if(oldPosition<$scope.showcases[$scope.selectedShowcase].elements.length){        
        var newPosition =oldPosition+1;
        var nextObj= _.find($scope.showcases[$scope.selectedShowcase].elements, function (obj) { return eval(obj.position) === newPosition })
        $scope.showcases[$scope.selectedShowcase].elements[index].position= ""+newPosition;        
        nextObj.position = ""+oldPosition;
    }
  }

  //Add element to a showcase
  $scope.insertElementAfter= function(indexElementToDrop,position){
  
    // Deep copy
    //var elementToPush = jQuery.extend({}, $scope.elements[indexElementToDrop]);
  
    var elementToPush = {};
    jQuery.extend(elementToPush,$scope.elements[indexElementToDrop]);    
    var positionToGive= eval(position)+1;
    //Give the position of the next element
    elementToPush.position= ""+positionToGive;
    //Update the elements before
    updateShowcaseObjectsPosition(positionToGive)

    delete elementToPush._id;
    
    //Push the element int he collection
    $scope.showcases[$scope.selectedShowcase].elements.push(elementToPush);

    $scope.validate();

    //Apply the changes
    $scope.$digest();
    $scope.$apply();

  } 

  //Set the dragged biin showcase
  $scope.setDropableBiinInShowcase=function(){
    if($scope.dragBiinIndex>-1){
      $scope.biins[$scope.dragBiinIndex].showcaseIdentifier = $scope.showcases[$scope.selectedShowcase].identifier;
      //Apply the changes
      $scope.$digest();
      $scope.$apply();
    }
  }

  //Set current dragget element index in the scope
  $scope.setDragElement=function(scopeIndex){
    $scope.dragElementIndex=scopeIndex;
  }

  //Get the first element by position
  $scope.getFirstElementByPosition =function(element){
    var foundPosition=0;
    if(element.objects.length===1)
      return element.objects[0];
    else{
      var foundFirst =false;
      for(var i=0; i< element.objects.length && foundFirst===false;i++){
        if(eval(element.objects[i].position)===1){
          foundFirst =true;
          foundPosition=i;
        }
      }
    }
    return element.objects[foundPosition];
  }

  //Get the status of a Biin
  $scope.getBiinStatus =function(biin){
    var result="";
    for(var i=0;i<biin.showcases.length && result==="";i++){
      if(biin.showcases[i].showcaseIdentifier===$scope.currentModelId)
        return "active";
    }
    return result;
  }


  //Get the online status of showcase in a site
  $scope.getOnlineInSite= function(site){
    //Get the site by id to eval is online
    var siteOnline=_.find($scope.showcases[$scope.selectedShowcase].webAvailable,function(siteId){
      return siteId=== site.identifier;
    })
    
    if(typeof(siteOnline)!=="undefined")
      return "active";
    return "";
  }

  //Set the showcase estatus in a site
  $scope.setOnlineSite=function(site){
    //Get the site by id to eval is online
    var siteOnline=_.find($scope.showcases[$scope.selectedShowcase].webAvailable,function(siteId){
      return siteId=== site.identifier;
    })
    
    if(typeof($scope.showcases[$scope.selectedShowcase].webAvailable)==='undefined')
      $scope.showcases[$scope.selectedShowcase].webAvailable=[];

    if(typeof(siteOnline)!=="undefined"){

      var siteIndex=$scope.showcases[$scope.selectedShowcase].webAvailable.indexOf(siteOnline);
      $scope.showcases[$scope.selectedShowcase].webAvailable.splice(siteIndex,1);

    }else{
      $scope.showcases[$scope.selectedShowcase].webAvailable.push(site.identifier);      
    }
  }

  //Get the Shoscase by identifier
  $scope.getShowcaseByIdentifier=function(identifier){
   var showcaseObj= _.find($scope.showcases, function (obj) { return obj.identifier === identifier })
   return showcaseObj;
  }

  //Update the position of the rest of the elements to add one when is added a new element
  updateShowcaseObjectsPosition= function(position){
    for(var i = 0; i<$scope.showcases[$scope.selectedShowcase].elements.length;i++){
      var objPosition = eval($scope.showcases[$scope.selectedShowcase].elements[i].position);
       if(objPosition>=position)
        $scope.showcases[$scope.selectedShowcase].elements[i].position= ""+ eval(objPosition+1);
    }
  }

  //Update the position of the rest of the elements when a element removed
   updateShowcaseObjectsPositionWhenDelete= function(position){
    for(var i = 0; i<$scope.showcases[$scope.selectedShowcase].elements.length;i++){
      var objPosition = eval($scope.showcases[$scope.selectedShowcase].elements[i].position);
      if(objPosition>=position)
        $scope.showcases[$scope.selectedShowcase].elements[i].position= ""+objPosition-1;
    }
   }

  //Biins Logic    
  //Set the Showcase in Biin as Active
  $scope.setShowcaseInBiinActive=function(indexSite,indexBiin){

    if(typeof($scope.biinSite[indexSite]!='undefined')){

      var existShowcaseInBiin = _.findWhere($scope.biinSite[indexSite].biins[indexBiin].showcases,{showcaseIdentifier:$scope.currentModelId})
      if(typeof(existShowcaseInBiin)==='undefined'){
          var asignedBiin = {showcaseIdentifier:$scope.currentModelId, startTime:$scope.showcases[$scope.selectedShowcase].startTime,endTime:$scope.showcases[$scope.selectedShowcase].endTime};
          if(!$scope.biinSite[indexSite].biins[indexBiin].showcases)          
            $scope.biinSite[indexSite].biins[indexBiin].showcases=[];
          asignedBiin.isDefault= $scope.biinSite[indexSite].biins[indexBiin].showcases.length==0?'1':'0';
          $scope.biinSite[indexSite].biins[indexBiin].showcases.push(asignedBiin);
      }

      //Set is default if the lenght of the showcase is one
      if($scope.biinSite[indexSite].biins[indexBiin].showcases.length===1){
        $scope.biinSite[indexSite].biins[indexBiin].showcases[0].isDefault='1';
      }
    }
  }

  //Return if a selected Showcase exist in the selected biin
  $scope.existSelectedShowcaseHere=function(indexSite,indexBiin){
    return typeof(_.findWhere($scope.biinSite[indexSite].biins[indexBiin].showcases,{showcaseIdentifier:$scope.currentModelId}))!=='undefined';
  }

  //Remove the showcase in a Specifica Biin at 
  $scope.removeShowcaseInBiinAt=function(indexSite,indexBiin,indexShowcase){
    $scope.biinSite[indexSite].biins[indexBiin].showcases.splice(indexShowcase,1);
    //Set is default if the lenght of the showcase is one
    if($scope.biinSite[indexSite].biins[indexBiin].showcases.length===1){
      $scope.biinSite[indexSite].biins[indexBiin].showcases[0].isDefault='1';
    }
  }

  $scope.elementInShowcase=function(elIndex){
    var elementToCompare = $scope.elements[elIndex];
    var check = _.some( $scope.showcases[$scope.selectedShowcase].elements, function( el ) {
      return el.elementIdentifier === elementToCompare.elementIdentifier;
    } );
    if(check)
      return "dragDisabled";
    else
      return "";
  }

  //Notification Section

  //Toggle notifications state
  $scope.setNotificationActive=function(){
    if($scope.showcases[$scope.selectedShowcase].activateNotification!=='1')
      $scope.showcases[$scope.selectedShowcase].activateNotification=$scope.activeValue;
    else
      $scope.showcases[$scope.selectedShowcase].activateNotification='0';
    $scope.validate();
  }

  //Toggle a specific notification enabled
  $scope.setNotificationActiveAt=function(index){
    if($scope.showcases[$scope.selectedShowcase].activateNotification==='1')
    {
      if($scope.showcases[$scope.selectedShowcase].notifications[index].isActive!==$scope.activeValue)
        $scope.showcases[$scope.selectedShowcase].notifications[index].isActive=$scope.activeValue;
      else
        $scope.showcases[$scope.selectedShowcase].notifications[index].isActive='0';
    }      
    $scope.validate();
  }

}]);

// Define the Elements Service
biinAppShowCases.factory('elementSrv', ['$http', function (async) {
    return {
      getList: function (organizationId) {
        var promise = async({method:'GET', url:'/api/organizations/'+organizationId+'/elements'})
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

// Define the service for Biins
biinAppShowCases.factory("biinSrv",['$http',function(async){
    return {
      getList: function(organizationId){
        var promise = async({method:'GET',url:'/api/organizations/'+organizationId+'/biins'})
        .success(function (data,status,headers,config){
          return data;
        }).error(function(data,status,headers,config){
          return {"status":false};
        });

        return promise;
      },
      saveList:function(organizationId,biinSite){
        var promise= async({method:'POST',url:'/api/organizations/'+organizationId+'/sites/biins', data:biinSite}).success(function(data,status,headers,config){
          return data;
        }).error(function(data,status,headers,config){
          return {"status":false};
        });

        return promise;
      }
    }  
}]);

//Change of image directive
biinAppShowCases.directive('inputChange',function(){
  return{
    restrict:'A',
    link:function(scope,element){       
      $el = $(element);
       $el.on('change',function(e){
          var index =scope.selectedShowcase;
          scope.showcases[index].mainImageUrl= $el.val();
          scope.$digest();
          scope.$apply();
       });
    }
  }
});

//Sortable directive
biinAppShowCases.directive('dropElement',function(){
  return{
    restrict:'A',
    link:function(scope,element, attrs){       
      $el = $(element);
      var higthLigthObj=null;

       $el.droppable({ over: function( event, ui ) {          
          $('.elementHigthLight').remove();
          if(!higthLigthObj)
            higthLigthObj= $( "<div class='.col-xs-4 col-sm-6 col-md-6 col-lg-6 nopadding moduleWrapper elementHigthLight'/>" );
          $('.elementDropContainerHelper').append(higthLigthObj);
       },
        out:function(event,ui){
          if(higthLigthObj){
            $('.elementHigthLight').remove();
            higthLigthObj=null;
          }
        },
        drop:function( event, ui )
        {
          $('.elementHigthLight').remove();
          var dragPosition = scope.$eval(attrs.elementPosition);
          if(!dragPosition)
            dragPosition=0;
          scope.insertElementAfter(scope.dragElementIndex,dragPosition);          
        }        
     });
    }
  }
});


//Sortable directive
biinAppShowCases.directive('dropUp',function(){
  return{
    restrict:'A',
    link:function(scope,element, attrs){       
      $el = $(element);
      var higthLigthObj=null;
      var elementIndex= scope.$eval(attrs.dropUp);
      var elementId = scope.showcases[scope.selectedShowcase].elements[elementIndex].elementIdentifier;

      var functionDrop= function(event, ui){
          $('.elementHigthLight').remove();
          var dragPosition = scope.$eval(attrs.elementPosition);
          if(!dragPosition)
            dragPosition=0;
          scope.insertElementAfter(scope.dragElementIndex,dragPosition);           
      }

       $el.droppable({ 
        over: function( event, ui ) {          
          $('.elementHigthLight').remove();
          if(!higthLigthObj){

            higthLigthObj= $( "<div class='.col-xs-4 col-sm-6 col-md-6 col-lg-6 nopadding moduleWrapper elementHigthLight'/>" );
            higthLigthObj.droppable({drop:functionDrop});
          }

          $('#'+elementId).before(higthLigthObj);

        },
        drop:functionDrop,       
        out:function(event,ui){
          if(higthLigthObj){
            $('.elementHigthLight').remove();
            higthLigthObj=null;
          }
        }
     });
    }
  }
});

biinAppShowCases.directive('dropDown',function(){
  return{
    restrict:'A',
    link:function(scope,element, attrs){       
      $el = $(element);
  
      var higthLigthObj=null;
      var elementIndex= scope.$eval(attrs.dropDown);
      var elementId = scope.showcases[scope.selectedShowcase].elements[elementIndex].elementIdentifier;
             
      var functionDrop= function(event, ui){
          $('.elementHigthLight').remove();
          var dragPosition = scope.$eval(attrs.elementPosition);
          if(!dragPosition)
            dragPosition=0;
          //Post insert
          dragPosition=dragPosition+1;
          scope.insertElementAfter(scope.dragElementIndex,dragPosition);           
      }

       $el.droppable({ over: function( event, ui ) {          
          $('.elementHigthLight').remove();
          if(!higthLigthObj)
          {
            higthLigthObj= $( "<div class='.col-xs-4 col-sm-6 col-md-6 col-lg-6 nopadding moduleWrapper elementHigthLight'/>" );
            higthLigthObj.droppable({drop:functionDrop});
          }
            
          $('#'+elementId).after(higthLigthObj);
       },
        out:function(event,ui){
          if(higthLigthObj){
            $('.elementHigthLight').remove();
            higthLigthObj=null;
          }
        },
        drop:functionDrop
     });
    }
  }
});
/****
    Custom Filters
****/

//Filter for get the objects with undefined value
biinAppShowCases.filter("undefinedValue",function(){
  return function undefinedValue(haysTack, prop){
    var result= _.filter(haysTack, function(hay) {
        return hay[prop]=== undefined || hay[prop]===null || hay==='';
    });
    return result;
  }
});