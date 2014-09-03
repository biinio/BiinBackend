// Define the service of galleries
var biinServicesModule= angular.module('biin.services',[]);

//Image Services
biinServicesModule.factory('gallerySrv', ['$http', function (async) {
    return {
      getList: function (organization) {
        var promise = async({method:'GET', url:'api/organizations/'+organization+'/gallery'})
            .success(function (data, status, headers, config) {
              return data.data;
            })
            .error(function (data, status, headers, config) {
              return {"status": false};
            });
          
          return promise;
      }
  }
}
]); 

//Image uploades pending indicator
biinServicesModule.directive('pendingIndicator', function(){
    return {
        restrict: 'A',
        link: function(scope, element) {
          var $el=  $(element);
          var $parent = $el.parent();

            // setup the container for ImagesLoaded ... note instead of using
            // this directive on an individual image, you may consider using
            // it on the element that contains many images...
            scope.imagesLoaded = imagesLoaded(element);
            // start your progress/loading animation here
            // (or whenever you attempt to load the images)
            scope.imagesLoaded.on('always', function() {
              //console.log('always event: Triggered after all images have been either loaded or confirmed broken.');
              // end the progress/loading animation here for all images or do
              // it individually in the progress event handler below
            });

            scope.imagesLoaded.on('done', function() {
              $parent.css({"background-image":""});              
              //console.log('done event: Triggered after all images have successfully loaded without any broken images.');

            });

            scope.imagesLoaded.on('fail', function() {
                $parent.css({"background-image":"" });            
                $el.attr("src","/images/warning_not_found.png");
              //console.log('fail event: Triggered after all images have been loaded with at least one broken image.');
            });

            scope.imagesLoaded.on('progress', function(instance, image) {
              $parent.css({"background-image":"url(/images/icons/loader.gif)" ,
                            "background-size": "100% 100%",
                            "background-repeat": "no-repeat"
                });

              //console.log('proress event: Triggered after each image has been loaded.', instance, image);
              // end the progress/loading animation here or do it for all images in the always
              // event handler above
            });

        }
    };
});

//Drop Files Directive
biinServicesModule.directive("dropFiles", function(){
  return{
        restrict:'A',
        link:function(scope,element,attrs){       
          var drop = element;
          var autoInsert = attrs["drop-Files"] =='';

          //dragIcon.src="/images/headerBg.jpg";
          //Tells the browser that we *can* drop on this target
          addEvent(drop, 'dragover', cancel);
          addEvent(drop, 'dragenter', cancel);

          //Drag start
          addEvent(drop, 'dragstart', function (event) {
            // store the ID of the element, and collect it on the drop later on
            //event.dataTransfer.setData('Text', this.id);
            //event.dataTransfer.setDragImage(dragIcon, -10, -10);
            return false;
          });

          addEvent(drop, 'drop', function (event) {
            // stops the browser from redirecting off to the text.
            if (event.preventDefault) {
              event.preventDefault(); 
            }

            var files = event.dataTransfer.files;
            var formData = new FormData();
            for (var i = 0; i < files.length; i++) {
              formData.append('file', files[i]);
            }

            // now post a new XHR request
            var xhr = new XMLHttpRequest();

            xhr.open('POST', 'api/organizations/'+scope.organizationId+'/gallery');
            xhr.onload = function (data) {
              if (xhr.status === 200) {
                var obj= $.parseJSON(xhr.response);

                //Do a callback logic by caller
                if(scope.onGalleryChange)
                  scope.onGalleryChange(obj,autoInsert);

                console.log('all done: ' + xhr.status);
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
            return false;
          });

          function cancel(event) {
            if (event.preventDefault) {
              event.preventDefault();
            }
            return false;
          }
      }
    }
  });

//Define the directives of drag
biinServicesModule.directive('drag',function(){
  return{
    restrict:'A',
    link:function(scope,element, attrs){       
      $el = $(element);
    
      $el.draggable({appendTo: '.colAppend',containment: '.workArea', cursor: "move", scroll: true, helper: 'clone',snap: true, snapTolerance: 5, 
        start:function(){          
            switch(attrs.drag)
            {
              case "categories":
                scope.setDragCategory(scope.$eval(attrs.elementIndex));        
              break;
              case "galleries":
                scope.setDragGallery(scope.$eval(attrs.elementIndex));        
                break;
              case "showcaseElement":
                scope.setDragElement(scope.$eval(attrs.elementIndex));
                break;             

            }
          }
        });
    }
  }
});

//Define the drop system
biinServicesModule.directive('drop',function(){
  return{
    restrict:'A',
    link:function(scope, element, attrs){       
      $el = $(element);

      $el.droppable({

        //Drop function
        drop:function(event,ui){

          switch(ui.draggable[0].attributes["drag"].value){
            //scope insert of the category
            case "categories":
              //Todo put the logic for add the category
              scope.insertCategory(scope.dragCategoryIndex);            
              break;
            case "galleries":
              //Todo put the logic for add the gallery
              scope.insertGalleryItem(scope.dragGalleryIndex);            
              break;
            case "showcaseElement":
              var dragPosition = scope.$eval(attrs.elementPosition);
              if(!dragPosition)
                dragPosition=0;
              scope.insertElementAfter(scope.dragElementIndex,dragPosition);
              $(element).next(".dropColumn").addClass('hide');                          
              break;
          }
        },
        over:function(event,ui){
          $el.next(".dropColumn").addClass('hide');
        },
        out:function(event,ui){
          //Set the logic for the out when the mouse over is lost
        }
      })
      
      
    }
  }
});

//Define the service of categories 
biinServicesModule.factory('categorySrv', ['$http', function (async) {
    return {
      getList: function () {
        var promise = async({method:'GET', url:'/api/categories'})
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
//Custom Filters

//Filter for get the intersection of two list of objects
biinServicesModule.filter("difference",function(){
  return function intersection(haysTack, needle,property){
    //call function in utilities
    return differenceObjects(haysTack,needle,function(item1,item2){
      return item1[property]===item2[property];
    });
  }
});