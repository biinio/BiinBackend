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

    controls();

});

//Cropper Controls
createShowcaseCropper=function(id){
      return croppeShowcasesHeader = new Croppic(id,{
            uploadUrl:'showcases/imageUpload',
            outputUrlId:'showcaseImage',
            cropData:{
                "section":"showcase"
            },
            cropUrl:'/showcases/imageCrop',
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



var showcaseHammerManager = function(){
    var hammer_options = {drag:true, transform: false};
    $("[data-hm-showcase]")
      .hammer(hammer_options)
      .on("swipeleft", function(ev) { 
        console.log(ev); 
    })
      .on("touch drag dragend",function(ev){
        var $target = $(ev.target);
        var posX=0, posY=0,
            lastPosX=0, lastPosY=0,
            bufferX=0, bufferY=0,
            scale=1, last_scale,
            rotation= 1, last_rotation, dragReady=0;
        switch(ev.type) {
            case 'touch':
                last_scale = scale;
                last_rotation = rotation; 
                break;
            case 'drag':
                    posX = ev.gesture.deltaX + lastPosX;
                    posY = ev.gesture.deltaY + lastPosY;
                break; 
            case 'transform':
                rotation = last_rotation + ev.gesture.rotation;
                scale = Math.max(1, Math.min(last_scale * ev.gesture.scale, 10));
                break;
            case 'dragend':
                lastPosX = posX;
                lastPosY = posY;
                break;
        }
        $target.translate3d({x:posX,y:posY,z:0});
        console.log(ev);
        /*
            $target[0].style.transform = transform;
            $target[0].style.oTransform = transform;
            $target[0].style.msTransform = transform;
            $target[0].style.mozTransform = transform;
            $target[0].style.webkitTransform = transform; 
        */
        //$target.css('webkitTransform', "rotateX("+xAngle+"deg) rotateY("+yAngle+"deg)" );
      });
}