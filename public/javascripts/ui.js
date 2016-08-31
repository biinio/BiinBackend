     //Global variables
var selectedOrganization=function(){
    return $("#organizationNav").attr("data-organization");
};

;(function($) {
    var delay = 0;
    $.fn.translate3d = function(translations, speed, easing, complete) {
        var opt = $.speed(speed, easing, complete);
        opt.easing = opt.easing || 'ease';
        translations = $.extend({x: 0, y: 0, z: 0}, translations);

        return this.each(function() {
            var $this = $(this);

            $this.css({ 
                transitionDuration: opt.duration + 'ms',
                transitionTimingFunction: opt.easing,
                transform: 'translate3d(' + translations.x + 'px, ' + translations.y + 'px, ' + translations.z + 'px)'
            });

            setTimeout(function() { 
                $this.css({ 
                    transitionDuration: '0s', 
                    transitionTimingFunction: 'ease'
                });

                opt.complete();
            }, opt.duration + (delay || 0));
        });
    };


})(jQuery);

//Jquery Controls
function controls(){

    //Boostrap Modal
   var modal =  $('.modal').modal({
        "backdrop" : "static"
    });

}

jQuery(function ($) {
    //Update bootstrap menu selection
    var url = window.location.pathname;
    // Will only work if string in href matches with location
    $('ul.nav a[href="'+ url +'"]').parent().addClass('active');

    // Will also work for relative and absolute hrefs
    $('ul.nav a').filter(function() {
        if(!this.hasAttribute('data-toggle'))
            return this.href == url;
    }).parent().addClass('active');

    //Navigation Tabs
    $('body','a[data-toggle="tab"]').on('click touch',function (e) {
      e.preventDefault();
      $(this).tab('show');
    });

    //Side bar code for menu
    /*var $sidebar =$(".sidebar");
    if($sidebar.length>0){
        $sidebar.scrollbar({"type": "simple"}).on('$destroy', function(){
            $sidebar.scrollbar('destroy');
        });        
    }*/

    //Load Controls
    controls();

});

jQuery(function($){  

    $('.hideButton','.left-section-content').click(function(){
      var $parent = $('.left-section-content');
      if($parent.hasClass('unretracted')){
        $parent.removeClass('unretracted').addClass('retracted');
        $parent.stop().animate({'width': '0%'},'300');
      }else{
        $parent.removeClass('retracted').addClass('unretracted');
        $parent.stop().animate({'width': '25%'},'300');        
      }
      var rightSection = $('.right-section-content');
      if(rightSection.hasClass('normalSize')){
        rightSection.removeClass('normalSize').addClass('fullSize');
        rightSection.stop().animate({'width': '100%'},'300');
      }else{
        rightSection.removeClass('fullSize').addClass('normalSize');
        rightSection.stop().animate({'width': '75%'},'300');        
      }
      
    });
      
    /*
   $('.left-section-content').mouseover(function() {          
      //$(this).stop().animate({'width': '250px'},'300');
    });

   $('.left-section-content').mouseout(function() {
      //$(this).stop().animate({'width': '0px'},'300');
    });*/

})
//Cropper Controls
createElementCropper=function(id){
      Croppic.imgInitW=320;
      Croppic.imgInitH=320;
      return croppeShowcasesHeader = new Croppic(id,{
            uploadUrl:'elements/imageUpload',
            outputUrlId:'elementImage',
            cropData:{
                "section":"element"
            },
            cropUrl:'/elements/imageCrop',
            modal:false,
            loaderHtml:'<div class="loader bubblingG"><span id="bubblingG_1"></span><span id="bubblingG_2"></span><span id="bubblingG_3"></span></div> ',
            onBeforeImgUpload: function(){ console.log('onBeforeImgUpload') },
            onAfterImgUpload: function(){ console.log('onAfterImgUpload') },
            onImgDrag: function(){ console.log('onImgDrag') },
            onImgZoom: function(){ console.log('onImgZoom') },
            onBeforeImgCrop: function(){ console.log('onBeforeImgCrop') },
            onAfterImgCrop:function(){ console.log('onAfterImgCrop') }
        });
}

//Cropper Controls
createOrganizationsCropper=function(id){
      Croppic.imgInitW=320;
      Croppic.imgInitH=320;
      return croppeShowcasesHeader = new Croppic(id,{
            uploadUrl:'organizations/imageUpload',
            outputUrlId:'organizationImage',
            cropData:{
                "section":"organization"
            },
            cropUrl:'/organizations/imageCrop',
            modal:false,
            loaderHtml:'<div class="loader bubblingG"><span id="bubblingG_1"></span><span id="bubblingG_2"></span><span id="bubblingG_3"></span></div> ',
            onBeforeImgUpload: function(){ console.log('onBeforeImgUpload') },
            onAfterImgUpload: function(){ console.log('onAfterImgUpload') },
            onImgDrag: function(){ console.log('onImgDrag') },
            onImgZoom: function(){ console.log('onImgZoom') },
            onBeforeImgCrop: function(){ console.log('onBeforeImgCrop') },
            onAfterImgCrop:function(){ console.log('onAfterImgCrop') }
        });
}

//Set the Organization Menu
setOrganizationMenu = function(organizationId, organizationName,callback){
    if(organizationId){
      $("#organizationNav").removeClass("hide");
      $("#organizationNav").attr("data-organization",organizationId);
      $("#organizationMenu .name").text(organizationName);

      $('a[data-org-link]').each(function(i){
        var $el= $(this);
        var pattern =$el.attr("data-org-link");
        pattern= pattern.replace('{0}',organizationId);
        $el.attr("href",pattern);
      })

    }
    
    if(callback)
      callback();
  }

//Display the validations Errors
displayValidationErrors=function(errors){
    for(var i =0; i<errors.length;i++){
        errors[i].msg;  //The message description ** Could be a resource
        errors[i].param; //The parameter
        errors[i].value;

    }
}

displayErrorMessage=function(error,section,status){
        console.log(error)
}

turnLoaderOff= function(){
    $('#wrapperContent').addClass('loaded');
    $('.left-section-content').show();
    $('.right-section-content').show();
}

