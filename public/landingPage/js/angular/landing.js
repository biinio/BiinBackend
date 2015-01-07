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

  //Switch landing page preferences
  $scope.changeLanguage = function (langKey) {
    $translate.use(langKey.toLowerCase());
    $scope.lang=langKey;
  };


}]);

