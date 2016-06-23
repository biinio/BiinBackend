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
  //Turn off the Loader
  turnLoaderOff();

}]);