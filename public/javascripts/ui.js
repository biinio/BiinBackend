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

//Files Uploader
function s3_upload(elId){
    var elementId =  "#"+elId;
    var element = $(elementId);
    var elementToUpdate = $(element).data("update-value");
    var $parent = element.parent();
    var $process = $(".dial");

    //Hide the image section
    $parent.addClass('hidden');
    var wrapperProcess = $process.closest(".hidden");
    wrapperProcess.removeClass('hidden');
    var s3upload = new S3Upload({
        file_dom_selector:elementId,
        s3_sign_put_url: $(element).data("img-url"),        
        onProgress: function(percent, message) {
            var showcaseRoundedProgress = roundedProgressBar(percent);
            $('#status').html('Upload progress: ' + percent + '% ' + message);
            $process.val(percent);
            showcaseRoundedProgress.val = percent;
            
        },
        onFinishS3Put: function(public_url) {
            $('#status').html('Upload completed. Uploaded to: '+ public_url);
            var $element=$(elementToUpdate);
            var $scope=angular.element($element).scope();
            $scope.change(public_url);

            //Switch view
            $parent.removeClass('hidden');
            wrapperProcess.addClass('hidden');
        },
        onError: function(status,err) {
            console.log(err);
            $('#status').html('Upload error: ' + status);

            //Switch view
            $parent.removeClass('hidden');
            wrapperProcess.addClass('hidden');
        }
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

});