var biinLandingPage = angular.module('landingPage',['pascalprecht.translate','biin.services']);
//Translation Provider
 biinLandingPage.config(function($translateProvider) {
    // Our translations will go in here
     $translateProvider.useStaticFilesLoader({
      prefix: '/landingPage/locals/',
      suffix: '.json'
    });

     //var language = window.navigator.userLanguage || window.navigator.language
    $translateProvider.preferredLanguage('es');
});

biinLandingPage.controller("indexController",['$translate','$scope', '$http',function($translate,$scope,$http){
  $scope.lang="ES";
  $scope.processing=false;

  $scope.succesSaveShow=false;  
  $scope.credentialsError=false;  
  $scope.connectionError=false;  
  $scope.authView="singin";

  $scope.profile={
      displayName:"",
      lastName:"",
      name:"",
      emails:[""],
      phoneNumber:"",
      password:"",
      password2:""
  }

  //Test Binnies
  $scope.binnie={};
  $scope.binnie.message="";
  $scope.binnie.identifier="";

  //Switch landing page preferences
  $scope.changeLanguage = function (langKey) {
    $translate.use(langKey.toLowerCase());
    $scope.lang=langKey;
  };

//Switch landing page preferences
  $scope.changeLanguage = function (langKey) {
    $translate.use(langKey.toLowerCase());
    $scope.lang=langKey;
  };

  //Validate the form information
  $scope.validate=function(){

  }

  //Validate the information
  $scope.submit=function(){
      $http.post('api/singup',{model:$scope.profile}).success(function(data,status){
        if(status==500){
          displayValidationErrors(data);
        }else{            
            $scope.succesSaveShow=true;

        }
      });
  }

  //Login Procesing
  $scope.login=function(){
    var name= $("input[name='username']","form.loginForm").val();
    var pass= $("input[name='password']","form.loginForm").val();
    var model={username:name,password:pass};

    $scope.processing=true;

    $http.post('/login',model).success(function(data,status){
      $scope.processing=false;
      if(status!==200){
        $scope.succesSaveShow=false;
        $scope.connectionError=true;
      }else{
        if(data.status==="success"){
          $scope.succesSaveShow=true;
          //Redirection to Dashboard
          window.location = data.url;
        }else{
          var pass= $("input[name='password']","form.loginForm").val('');
          $scope.succesSaveShow=false;
          $scope.credentialsError=true;
        }
      }
    })
  }
  //Binnies

  //Validate the information
  $scope.submitBinnie=function(){
      $http.put('/mobile/binnies',{model:$scope.binnie}).success(function(data,status){        
        $scope.binnie.message="";
        if(status==500){
          displayValidationErrors(data);
        }else{          
          if(data.data.status===0){            
              $scope.binnie={};              
              $scope.binnie.message= "The binnie was registered";
              $scope.binnie.identifier = data.data.identifier;


            }else{
              if(data.data.status===1)
                $scope.binnie.message= "The user name is all ready taken"
              else
                $scope.binnie.message= "The binnie was NO registered, there are many Validation errors" + data.data.errors;          

            }
        }
      });
  }

  //Verify the binnie e-mail validation
  $scope.verifyBinnie =function(){

    $scope.binnie.emailVerificationStatus ="";
    $http.get('/mobile/binnies/'+$scope.binnie.identifier+'/isactivate').success(function(data,status){
      if(status==500){
      }else{ 
        if(data.data.status===0){
          var result="The e-mail is NOT verified";
          if(data.data.result===true){            
            result="The e-mail WAS verified";
          }
          $scope.binnie.emailVerificationStatus = result;          
        }

      }
    });
  }

  //Switch the view (singin/sing)
  $scope.switchAuthView=function(method){
    $scope.authView = method; 
  }
  
}]);

//Directive for login when press the enter key
biinLandingPage.directive("login",function(){
  return{
    restrict:'A',
    link:function(scope, element, attrs){
        //Click event of the style button
        $(element[0]).on("keypress",function(e){
          if(e.keyCode===13){//The key press enter
            scope.login();
          }
        });
    }
  }
});



