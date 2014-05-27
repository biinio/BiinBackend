 var croppeShowcasesHeader =null;
 var croppeElementHeader = null;
//Rounded Progress Bar
function roundedProgressBar(val){
   return new  $(".dial").knob({
         value: val,
        'readOnly': true,
        'width': 300,
        'height': 300,
        'dynamicDraw': true,
        'thickness': 0.2,
        'tickColorizeValues': true,
        'skin': 'tron'
    });
}


//Jquery Controls
function controls(){

    //Boostrap Modal
   var modal =  $('.modal').modal({
        "backdrop" : "static"
    });

    modalControls();

}

//Modal Controls to init
function modalControls(){

    //Init the cropper for showcases
    if(!croppeShowcasesHeader && $("#showcaseImages").length>0)
        croppeShowcasesHeader = new Croppic('showcaseImages',{
            uploadUrl:'showcases/imageUpload',
            outputUrlId:'showcaseImageUrlCropped',
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

       //Init the cropper for elements
    if(!croppeElementHeader && $("#elementImages").length>0)
        croppeElementHeader = new Croppic('elementImages',{
            uploadUrl:'elements/imageUpload',
            outputUrlId:'elementImageUrlCropped',
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

jQuery(function ($) {
    //Update bootstrap menu selection
    var url = window.location;
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

    //Modal Events
    $('body').on('shown.bs.modal',function(e){
       modalControls();

       //Open the modal of select an image
       if($(".cropControlUpload",".modal:visible").length>0){
            //$(".cropControlUpload",".modal:visible").trigger('click');
            $('input[type="file"]',".modal:visible").trigger('click');
       }
    });

    //On modal hide
    $('body').on('hidden.bs.modal', function () {
        
        //Remove the control for the showcase images
        if($("#showcaseImages").length>0 && croppeShowcasesHeader){
            croppeShowcasesHeader.destroy();
            croppeShowcasesHeader = null;
        }

        //Remove the control for the element imaeges
        if($("#elementImages").length>0 && croppeElementHeader){
            croppeElementHeader.destroy();
            croppeElementHeader = null;
        }        
    });

});