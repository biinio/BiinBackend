// Define the service of galleries
var biinServicesModule= angular.module('biin.services',[]);

//Propertie
biinServicesModule.value('scrollbarOptionsStandard', {"type": "simple"});

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


//Stickers Services
biinServicesModule.factory('stickersSrv', ['$http', function (async) {
    return {
      getList: function () {
              var promise = async({method:'GET', url:'api/stickers'})
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
          var autoInsert = typeof(attrs["drop-Files"])==='undefined' || attrs["drop-Files"] =='';

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
            if(files.length){
              var formData = new FormData();
              for (var i = 0; i < files.length; i++) {
                var mediaFile = files[i];
                mediaFile.originalFilename=files[i].name;
                formData.append('file', mediaFile);
              }

              //Upload The media information
              uploadMedia(scope,formData);
            }
              
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

biinServicesModule.directive('imageCheckbox', function() {
  return {
    restrict: 'A',
    link: function(scope, el, attr) {
      scope.isSelected = el.find('input').val() == 'false';
      el.on('click', function() {
        scope.isSelected = !scope.isSelected;
        scope.$apply();
      });
    }
  }
})

//Single upload files directive
biinServicesModule.directive('uploadFiles',function(){
  return{
    restrict:'A',
    link:function(scope, element, attrs){
      var $inputFileElement=$(attrs['uploadFiles']);
      var autoInsert=false;//Set to false default auto insert
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
            uploadMedia(scope,formData);
        })
        //Click event of the style button
        $(element[0]).on('click touch',function(e){          
          $inputFileElement.trigger('click');
        });
    }
  }
})

//Define the directives of drag
biinServicesModule.directive('drag',function(){
  return{
    restrict:'A',
    link:function(scope,element, attrs){       
      $el = $(element);
    
      $el.draggable({appendTo: '.colAppend',containment: '.workArea', cursor: "move", scroll: false, helper: 'clone',snap: true, snapTolerance: 5, cancel: ".dragDisabled", 
        start:function(e, ui){  
          $(ui.helper).addClass("ui-draggable-helper");
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

//Define the drop system
biinServicesModule.directive('notification',function(){
  return{
    restrict:'E',
    templateUrl:'partials/notificationWidget',
    link:function(scope, element, attrs){
       
    }
  }
});

//Define the guide window behaviour
biinServicesModule.directive('guide',function(){
  return{
    restrict:'A',
    link:function(scope, element, attrs){
      $('.guide-header .close-guide',element).on('click touch',function(){
        //Todo add the missing animation
        $(element).toggle();
      })
    }
  }
});


//Directive for numberFields
biinServicesModule.directive('isNumber',function(){
  return{
    restrict:'A',
    link:function(scope, element, attrs){
      $(element).on('keypress',function(evt){            
            evt = (evt) ? evt : window.event;
            var charCode = (evt.which) ? evt.which : evt.keyCode;
            if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                return false;
            }
        return true;
        });
    }
  }
});


//Define the map window behaviour
biinServicesModule.directive('map',function(){
  return{
    restrict:'A',
    link:function(scope, element, attrs){
    var zoom = eval(attrs['zoom']);
    var defPosition =new google.maps.LatLng(0 ,0);        
    var defOptions = {
      center: defPosition,
      zoom: zoom
    };
    var map=new google.maps.Map(element[0],defOptions);
    var marker;
      //Get the Geolocation
      function getLocation() {
          if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(showPosition,errorCallback,{timeout:10000});
          } else {
              element[0].innerHTML = "Geolocation is not supported by this browser.";
          }
      }
      //Show the position in the map
      function showPosition(position,otherZoom) {              
        if(typeof(otherZoom)!=='undefined'){
          zoom=otherZoom;
        }
         var myPosition =new google.maps.LatLng( position.coords.latitude ,  position.coords.longitude);        
           var mapOptions = {
            center: myPosition,
            zoom: zoom
          };

            map.setOptions(mapOptions);

            marker = new google.maps.Marker({
              map:map,
              draggable:true,
              animation: google.maps.Animation.DROP,
              position: myPosition
            });

            //Change Location Event Refresh the model
            google.maps.event.addListener(marker, 'position_changed', function(){
              var newPosition = marker.getPosition();
              scope.changeLocation(newPosition.lat(),newPosition.lng());
            });

            google.maps.event.addDomListener(window, 'resize', function(){
              
              //scope.changeLocation(newPosition.lat(),newPosition.lng());
            });
            google.maps.event.trigger(map, 'resize');
        }      

      function errorCallback(err){
        var coords ={latitude:local_lat,longitude: local_lng};
        showPosition({coords:coords},1);
        console.warn('ERROR(' + err.code + '): ' + err.message);
      }
      var local_lat =0;

      var local_lng=0;

      if(attrs['lat'] && attrs['lng']){
        local_lat = eval(attrs['lat']);
        local_lng = eval(attrs['lng']);        
      }

      //Call get location
      if(local_lat==0&& local_lng==0)
        getLocation();
      else{
        var coords ={latitude:local_lat,longitude: local_lng};
         showPosition({coords:coords});
      }        
    }
  }
});


//Define the map window behaviour
biinServicesModule.directive('staticmap',function(){
  return{
    restrict:'A',
    link:function(scope, element, attrs){
      var zoom = eval(attrs['zoom']);
      var marker;
      //Get the Geolocation
      function getLocation() {
          if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(showPosition,errorCallback,{timeout:10000});
          } else {
              element[0].innerHTML = "Geolocation is not supported by this browser.";
          }
      }
      //Show the position in the map
      function showPosition(position,otherZoom) {              
        if(typeof(otherZoom)!=='undefined'){
          zoom=otherZoom;
        }
        if($(element).children("img").length != 0){
            $(element).children("img")[0].remove();
        }
        
        var imageElement = document.createElement("img");
        imageElement.setAttribute("src","https://maps.googleapis.com/maps/api/staticmap?center="+position.coords.latitude+","+position.coords.longitude+
        "&zoom="+zoom+"&size=1024x512&markers="+scope.sites[scope.selectedSite].lat+","+scope.sites[scope.selectedSite].lng);
        element[0].appendChild(imageElement);
      }      

      function errorCallback(err){
        var coords ={latitude:local_lat,longitude: local_lng};
        showPosition({coords:coords},1);
        console.warn('ERROR(' + err.code + '): ' + err.message);
      }

      var local_lat =0;
      var local_lng=0;

      function showMap(){
        if(attrs['lat'] && attrs['lng']){
          local_lat = eval(attrs['lat']);
          local_lng = eval(attrs['lng']);        
        }

        //Call get location
        if(local_lat==0&& local_lng==0)
          getLocation();
        else{
          var coords ={latitude:local_lat,longitude: local_lng};
           showPosition({coords:coords});
        }
      }

      showMap();

      attrs.$observe('lat',function(newValue,oldValue) {
          showMap();
      });
      attrs.$observe('lng',function(newValue,oldValue) {
        showMap();
      });
    }
  }
});


//Scroll bar initialization
biinServicesModule.directive('scrollbar', function(){
    return {
        "link": function(scope, element){
            //scope.options
            $(element[0]).scrollbar().on('$destroy', function(){
                $(element[0]).scrollbar('destroy');
            });
        },
        "restring": "AC",
        "scope": {
            "options": "=scrollbar"
        }
    };
  });
/*
This directive allows us to pass a function in on an enter key to do what we want.
 */
biinServicesModule.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });
 
                event.preventDefault();
            }
        });
    };
});


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

//Filter for telephone format inputs
biinServicesModule.filter('tel', function () {
    return function (tel) {
        if (!tel) { return ''; }

        var value = tel.toString().trim().replace(/^\+/, '');

        if (value.match(/[^0-9]/)) {
            return tel;
        }

        var country, city, number;

        switch (value.length) {
            case 10: // +1PPP####### -> C (PPP) ###-####
                country = 1;
                city = value.slice(0, 3);
                number = value.slice(3);
                break;

            case 11: // +CPPP####### -> CCC (PP) ###-####
                country = value[0];
                city = value.slice(1, 4);
                number = value.slice(4);
                break;

            case 12: // +CCCPP####### -> CCC (PP) ###-####
                country = value.slice(0, 3);
                city = value.slice(3, 5);
                number = value.slice(5);
                break;

            default:
                return tel;
        }

        if (country == 1) {
            country = "";
        }

        number = number.slice(0, 3) + '-' + number.slice(3);

        return (country + " (" + city + ") " + number).trim();
    };
});


//Custom Methods
var uploadMedia = function(scope,formData, autoInsert){
    scope.loadingImagesChange(true);
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
        scope.loadingImagesChange(false);
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
}