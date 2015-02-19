var biinAppBinnies= angular.module('biinAppBinnies',['ngRoute','biin.services']);

biinAppBinnies.controller("binniesController",['$scope', '$http','categorySrv',function($scope,$http,categorySrv){
  $scope.newObjects=[];
  $scope.organizationId = selectedOrganization();
  $scope.selectedBinnie="-1";
  $scope.currentModelId="";
  var protoTypeObj = null;
  //Get the binnies list
  $http.get('api/biinies').success(function(data){
    $scope.binnies= data.data;
    $scope.protoTypeObj = data.prototype;
  });

  //Create a new Binnie
  $scope.create=function(){
  	var newObject = _.clone($scope.protoTypeObj)
  	newObject.isNew =true;
  	$scope.binnies.push(newObject);
  	$scope.edit($scope.binnies.indexOf(newObject));
  }

  //Edit a Biinie
  $scope.edit =function(index){
  	$scope.selectedBinnie =index;
  	$scope.currentModelId = $scope.binnies[$scope.selectedBinnie].identifier;
  	if(typeof($scope.binnies[$scope.selectedBinnie].categories)==='undefined'){
  		$scope.binnies[$scope.selectedBinnie].categories=[];
  	}
  }

  //Save the Biinie information
  $scope.save = function(){
    $http.put('api/biinies',{model:$scope.binnies[$scope.selectedBinnie]}).success(function(data,status){
      if(status==201){
        console.log("save")       
        if('isNew' in $scope.binnies[$scope.selectedBinnie])
        	delete $scope.binnies[$scope.selectedBinnie].isNew;
        $scope.succesSaveShow=true;
      }
        
    });   	
  }	

  //Remove site at specific position
  $scope.removeAt = function(index){
    if($scope.selectedBinnie==index){
      $scope.selectedBinnie ="-1";
      $scope.currentModelId =null;
    }
    if('isNew' in $scope.binnies[index] ){
      //remove the showcase
      $scope.binnies.splice(index,1);
    }else//If the element is new is not in the data base      
    {
      var binnieId = $scope.binnies[index].identifier;      
      $http.delete('api/biinies/'+binnieId).success(function(data,status){
          if(status===200){
               $scope.binnies.splice(index,1);
          }
        }
      );
    }
  }


  //Change the image of a binnie
  $scope.binnieImage=function(imageObj){
  	$scope.binnies[$scope.selectedBinnie].imgUrl= imageObj.imgUrl;
  }

  //Get the List of Categories
  categorySrv.getList().then(function(promise){
    $scope.categories = promise.data.data;    
  });  

  //Return the categories of the Binnie
  $scope.ownCategories=function(){
    return $scope.binnies[$scope.selectedBinnie].categories;
  }

 //Category return if contains a specific category
  $scope.containsCategory=function(category){
    if(typeof(_.findWhere($scope.binnies[$scope.selectedBinnie].categories,{identifier:category.identifier}))!='undefined')
      return 'active'
    else
      return "";
  }  

  //Change the state of the category relation with the Site
  $scope.switchCategoryState =function(category){
    var index =-1;
    var cat = _.findWhere($scope.binnies[$scope.selectedBinnie].categories,{identifier:category.identifier});
    if(typeof(cat)!='undefined'){
      index=$scope.binnies[$scope.selectedBinnie].categories.indexOf(cat);
    }

    if(index>=0)
      $scope.binnies[$scope.selectedBinnie].categories.splice(index,1)
    else
      $scope.binnies[$scope.selectedBinnie].categories.push(category);

    //$scope.validate();
    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
        $scope.$apply();
        $scope.$digest();
    }
  }
}]);

//Upload the profile Image
biinAppBinnies.directive('uploadBinnieImage',function(){
  return{
    restrict:'A',
    link:function(scope, element, attrs){
      var $inputFileElement=$(attrs['uploadBinnieImage']);

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

            xhr.open('POST', 'api/biinies/'+scope.currentModelId+'/image');
            xhr.onload = function (data) {
              if (xhr.status === 200) {
                var obj= $.parseJSON(xhr.response);

                scope.binnieImage(obj.data);                

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
