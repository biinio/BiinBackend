var biinAppBlog = angular.module('biinAppBlog',['ngRoute']);

biinAppBlog.controller("blogController",['$scope', '$http',function($scope,$http){
  $http.get('/api/blog').success(function(data){
    $scope.blogs = data.blogs;
  });


}]);

biinAppBlog.directive('dynamic', function ($compile) {
  return {
    restrict: 'A',
    replace: true,
    link: function (scope, ele, attrs) {
      scope.$watch(attrs.dynamic, function(html) {
        ele.html(html);
        $compile(ele.contents())(scope);
      });
    }
  };
});
