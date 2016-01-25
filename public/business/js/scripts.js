/*!
 * 
 * Angle - Bootstrap Admin App
 * 
 * Version: 3.1.0
 * Author: @themicon_co
 * Website: http://themicon.co
 * License: https://wrapbootstrap.com/help/licenses
 * 
 */

(function ($) {
  'use strict';

  if (typeof $ === 'undefined') { throw new Error('This site\'s JavaScript requires jQuery'); }

  // cache common elements
  var $win  = $(window);
  var $doc  = $(document);
  var $body = $('body');
  

  // Site Preloader
  // ----------------------------------- 
  
  NProgress.start();

  $('#header').waitForImages(function() {
      NProgress.done();
      $body.addClass('site-loaded');
  });

  // Init Writing Mode
  // ----------------------------------- 

  // Global RTL Flag
  window.modeRTL = false;
  // get mode from local storage
  modeRTL = $.localStorage.get('modeRTL');
  console.log('Site is in '+(modeRTL?'RTL':'LTR')+' mode.');


  // Show sticky topbar on scroll
  // ----------------------------------- 
  
  var stickyNavScroll;
  var stickySelector = '.navbar-sticky';

  // Setup functions based on screen
  if (matchMedia('(min-width: 992px), (max-width: 767px)').matches) {
    stickyNavScroll = function () {
      var top = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
      if (top > 40) $(stickySelector).stop().animate({'top': '0'});

      else $(stickySelector).stop().animate({'top': '-80'});
    };
  }

  if (matchMedia('(min-width: 768px) and (max-width: 991px)').matches) {
    stickyNavScroll = function () {
      var top = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
      if (top > 40) $(stickySelector).stop().animate({'top': '0'});

      else $(stickySelector).stop().animate({'top': '-120'});
    };
  }

  // Finally attach to events
  $doc.ready(stickyNavScroll);
  $win.scroll(stickyNavScroll);


  // Sticky Navigation
  // ----------------------------------- 
  
  $(function() {

    $('.main-navbar').onePageNav({
      scrollThreshold: 0.25,
      filter: ':not(.external)', // external links
      changeHash: true,
      scrollSpeed: 750
    });
    
  });


  // Video Background
  // ----------------------------------- 

  $(function() {

    /*if (matchMedia('(min-width: 640px)').matches) {
      
      var videoContainer = $('<div id="video-container"/>').prependTo($body);
      var videobackground = new $.backgroundVideo( 
        // create a container
        videoContainer, 
        {
          'align':    'centerXY',
          'width':    1280,
          'height':   720,
          'path':     'video/',
          'filename': 'video',
          'types':    ['webm', 'mp4']
      
      }).$videoEl.on('loadeddata', function(){
        $('#header').removeClass('novideo');
      });
    }*/

  });


  // Smooth Scroll
  // ----------------------------------- 
  var scrollAnimationTime = 1200,
      scrollAnimationFunc = 'easeInOutExpo',
      $root               = $('html, body');

  $(function(){
    $('.scrollto').on('click.smoothscroll', function (event) {
      
      event.preventDefault();
      
      var target = this.hash;
      
      // console.log($(target).offset().top)
      
      $root.stop().animate({
          'scrollTop': $(target).offset().top
      }, scrollAnimationTime, scrollAnimationFunc, function () {
          window.location.hash = target;
      });
    });
  
  });

  // Self close navbar on mobile click
  // ----------------------------------- 
  $(function(){
       var navMain = $("#navbar-main");
       var navToggle = $('.navbar-toggle');

       navMain.on('click', 'a', null, function () {
          if ( navToggle.is(':visible') )
            navMain.collapse('hide');
       });
   });


  // Wow Animation
  // ----------------------------------- 

  // setup global config
  window.wow = (
      new WOW({
      mobile: false
    })
  ).init();


  // Owl Crousel
  // ----------------------------------- 
  
  $(function () {

    $('#feedback-carousel').owlCarousel({
        rtl:              modeRTL,
        responsiveClass:  true,
        responsive: {
            0: {
                items: 1,
                nav:   false
            }
        }
    });

    $('#appshots').owlCarousel({
        rtl:             modeRTL,
        margin:          10,
        responsiveClass: true,
        responsive:      {
            0: {
                items: 1,
                nav:   false
            },
            500: {
                items: 2,
                nav:   false
            },
            1000: {
                items: 4,
                nav:   false,
                loop:  false
            }
        }
    });

  });


  // Nivo Lightbox 
  // ----------------------------------- 
  $(function () {

    $('#appshots a').nivoLightbox({

      effect: 'fadeScale',                        // The effect to use when showing the lightbox
      theme: 'default',                           // The lightbox theme to use
      keyboardNav: true                           // Enable/Disable keyboard navigation (left/right/escape)
    
    });

  });

})(window.jQuery);
/**
 * Created by Ivan on 1/14/16.
 */

// Settings Handler
// -----------------------------------

(function ($) {
    'use strict';
    $('#featurescarrusel').owlCarousel({
        items: 1,
        singleItem: true,
        autoplay: true,
        loop: true,
        rewind: true,
        smartSpeed: 1000
    });

})(window.jQuery);

// END Settings Handler
// -----------------------------------
/**
 * Created by Ivan on 1/13/16.
 */
(function ($) {
    'use strict';

    if (typeof $ === 'undefined') {
        throw new Error('This site\'s JavaScript requires jQuery');
    }

    // cache common elements
    var $win = $(window);
    var $doc = $(document);
    var $body = $('body');
    var nameHeaderField = $("#nameInputHeader");
    var emailHeaderField = $("#emailInputHeader");
    var phoneHeaderField = $("#phoneInputHeader");
    var companyHeaderField = $("#companyInputHeader");

    var nameBottomField = $("#nameInputBottom");
    var emailBottomField = $("#emailInputBottom");
    var phoneBottomField = $("#phoneInputBottom");
    var companyBottomField = $("#companyInputBottom");

    $.validator.addMethod("phoneCR", function(phone_number, element) {
        phone_number = phone_number.replace(/\s+/g, "");
        return this.optional(element) || phone_number.length > 7 &&
            phone_number.match(/^(00)?[\s|-]?((\+)?[\s|-]?[0-9]{3})?[\s|-]?([0-9]{2})[\s|-]?([0-9]{2})[\s|-]?([0-9]{2})[\s|-]?([0-9]{2})[\s|-]?$/);
    }, "Please specify a valid phone number");

    $.extend($.validator.messages, {
        phoneCR: "Escriba un teléfono válido de Costa Rica, ej. +5068888888"
    });

    $("#headerform").validate(
        {
            debug: true
        }
    );
    $("#formBottom").validate(
        {
            debug: true
        }
    );


    function sendEmailHeader() {
        var nameHeaderValue = nameHeaderField.val();
        var emailHeaderValue = emailHeaderField.val();
        var phoneHeaderValue = phoneHeaderField.val();
        var companyHeaderValue = companyHeaderField.val();

        if ($("#headerform").valid()) {
            sendRequestEmail(nameHeaderValue, emailHeaderValue, phoneHeaderValue, companyHeaderValue);
        }
        else {
            console.log("Some or all fields in header are empty");
        }
    }

    function sendEmailBottom() {
        var nameBottomValue = nameBottomField.val();
        var emailBottomValue = emailBottomField.val();
        var phoneBottomValue = phoneBottomField.val();
        var companyBottomValue = companyBottomField.val();

        if ($("#formBottom").valid()) {
            sendRequestEmail(nameBottomValue, emailBottomValue, phoneBottomValue, companyBottomValue);
        }
        else {
            console.log("Some or all fields in bottom are empty");
        }
    }

    function validateEmail(emailField) {
        var textToTest = emailField.val();
        var regexEmail = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)$/i;
        return regexEmail.test(textToTest);
    }

    function sendRequestEmail(name, email, phone, company) {
        console.log("send Email");
        $.ajax({
            type: "POST",
            url: "https://mandrillapp.com/api/1.0/messages/send.json",
            data: {
                'key': 'zjKEi4IkVNcbqJ0r0HJoYw',
                'message': {
                    'from_email': 'contact@biin.io',
                    'to': [
                        {
                            'email': 'contact@biin.io',
                            'name': 'Contacto',
                            'type': 'to'
                        }/*,
                        {
                            'email': 'carce@biin.io',
                            'name': 'Cesar Arce',
                            'type': 'to'
                        }*/
                    ],
                    'autotext': 'true',
                    'subject': name + ' is interested in trying our product!!!',
                    'html': '<h1>Great news! ' + name + ' is interested in Biin</h1><h2> Get in contact with him/her!!! </h2><p>Here is the contact information</p><p>Name: ' + name + '</p><p>Phone: ' + phone + '</p><p>Email: <a href="mailto:"' + email + '>' + email + '</a></p><p>Company: ' + company + '</p> '
                }
            }
        }).done(function (response) {
            sendClientEmail(name,email);
        });
    }

    function sendClientEmail(name, email) {
        console.log("send Email");
        $.ajax({
            type: "POST",
            url: "https://mandrillapp.com/api/1.0/messages/send.json",
            data: {
                'key': 'zjKEi4IkVNcbqJ0r0HJoYw',
                'message': {
                    'from_email': 'contact@biin.io',
                    'to': [
                        {
                            'email': email,
                            'name': name,
                            'type': 'to'
                        }
                    ],
                    'autotext': 'true',
                    'subject': 'Gracias por su interés en Biin',
                    'html': 'Estaremos pronto en contacto para conocer más de su negocio e iniciar con la puesta en marcha de Biin<br/>Saludos,<br/><br/>César Arce<br/>CEO en biin'
                }
            }
        }).done(function (response) {
            $('#headerDemoButton').text("Prueba solicitada").unbind('click');
            $('#bottomDemoButton').text("Prueba solicitada").unbind('click');
        });
    }


    $('#headerDemoButton').click(sendEmailHeader);
    $('#bottomDemoButton').click(sendEmailBottom);

})(window.jQuery);

// Settings Handler
// ----------------------------------- 

(function ($) {
  'use strict';

  // SHOW HIDE SETTINGS
  var settings = $('.settings');
  $('.settings-ctrl').on('click', function(){
    settings.toggleClass('show');
  });

  // Load THEME CSS 

  var $loaders = $('[data-load-css]');
  $loaders.on('click', function (e) {
      var element = $(this);

      $loaders.removeClass('checked');
      element.addClass('checked');

      if(element.is('a')) e.preventDefault();
      var uri = element.data('loadCss'),
          link;

      if(uri) {
        link = createLink(uri);
        if ( !link ) { $.error('Error creating stylesheet link element.'); }
      }
      else { $.error('No stylesheet location defined.'); }

  });

  function createLink(uri) {
    var linkId = 'autoloaded-stylesheet',
        oldLink = $('#'+linkId).attr('id', linkId + '-old');

    $('head').append($('<link/>').attr({
      'id':   linkId,
      'rel':  'stylesheet',
      'href': uri
    }));

    if( oldLink.length ) { oldLink.remove(); }

    return $('#'+linkId);
  }

  // SET WRITING MODE

  var stylesCss = $('#stylescss'),
      rtlSwitch = $('#rtlswitch');

  $(function(){
    var uri = modeRTL ? 'css/styles-rtl.css' : 'css/styles.css';
    stylesCss.attr('href', uri);
    rtlSwitch[0].checked = modeRTL;
  });

  rtlSwitch.on('change', function(){

    var isRTL = this.checked;

    $.localStorage.set('modeRTL', isRTL);
    // reload is required to initialize plugins in RTL mode
    window.location.reload();

  });


})(window.jQuery);

// END Settings Handler
// ----------------------------------- 