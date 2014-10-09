// JavaScript Document

/*----------------------------------------------------*/
/*	Preloader
 /*----------------------------------------------------*/

$(window).load(function () {

    "use strict";
    $('#status').delay(100).fadeOut('slow');
    $('#preloader').delay(500).fadeOut('slow');
    $('body').delay(500).css({'overflow': 'visible'});
});


$(window).load(function () {

    "use strict";

    $(window).stellar({});

});

/*----------------------------------------------------*/
/*	Scroll Navbar
 /*----------------------------------------------------*/
$(window).scroll(function () {

    "use strict";

    var b = $(window).scrollTop();

    if (b > 60) {
        $(".navbar").addClass("scroll-fixed-navbar");
    } else {
        $(".navbar").removeClass("scroll-fixed-navbar");
    }

});


/*----------------------------------------------------*/
/*	Mobile Menu Toggle
 /*----------------------------------------------------*/
$(document).ready(function () {

    "use strict";

    $('.navbar-nav li a').click(function () {
        $('#navigation-menu').css("height", "1px").removeClass("in").addClass("collapse");
        $('#navigation-menu').removeClass("open");
    });
});


/*----------------------------------------------------*/
/*	Animated Scroll To Anchor
 /*----------------------------------------------------*/
/**
 * Animated Scroll To Anchor v0.3
 * Author: David Vogeleer
 * http://www.individual11.com/
 *
 * THANKS:
 *
 * -> solution for setting the hash without jumping the page -> Lea Verou : http://leaverou.me/2011/05/change-url-hash-without-page-jump/
 * -> Add stop  - Joe Mafia
 * -> add some easing - Daniel Garcia
 * -> added use strict, cleaned up some white space adn added conditional for anchors without hashtag -> Bret Morris, https://github.com/bretmorris
 *
 * TODO:
 * -> Add hashchange support, but make it optional http://leaverou.me/2011/05/get-your-hash-the-bulletproof-way/
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 */

$(document).ready(function () {


    "use strict";
    $.fn.scrollTo = function (options) {

        var settings = {
            offset: -60,       //an integer allowing you to offset the position by a certain number of pixels. Can be negative or positive
            speed: 'slow',   //speed at which the scroll animates
            override: null,  //if you want to override the default way this plugin works, pass in the ID of the element you want to scroll through here
            easing: null //easing equation for the animation. Supports easing plugin as well (http://gsgd.co.uk/sandbox/jquery/easing/)
        };

        if (options) {
            if (options.override) {
                //if they choose to override, make sure the hash is there
                options.override = (override('#') != -1) ? options.override : '#' + options.override;
            }
            $.extend(settings, options);
        }

        return this.each(function (i, el) {
            $(el).click(function (e) {
                var idToLookAt;
                if ($(el).attr('href').match(/#/) !== null) {
                    e.preventDefault();
                    idToLookAt = (settings.override) ? settings.override : $(el).attr('href');//see if the user is forcing an ID they want to use
                    //if the browser supports it, we push the hash into the pushState for better linking later
                    if (history.pushState) {
                        history.pushState(null, null, idToLookAt);
                        $('html,body').stop().animate({scrollTop: $(idToLookAt).offset().top + settings.offset}, settings.speed, settings.easing);
                    } else {
                        //if the browser doesn't support pushState, we set the hash after the animation, which may cause issues if you use offset
                        $('html,body').stop().animate({scrollTop: $(idToLookAt).offset().top + settings.offset}, settings.speed, settings.easing, function (e) {
                            //set the hash of the window for better linking
                            window.location.hash = idToLookAt;
                        });
                    }
                }
            });
        });
    };

    $('#GoToMainContent, #GoToHome, #GoToFeatures, #GoToNewsletter, #GoToScreens, #GoToPricing, #GoToContact').scrollTo({ speed: 1400 });

});


/*----------------------------------------------------*/
/*	Current Menu Item
 /*----------------------------------------------------*/
$(document).ready(function () {

    //Bootstraping variable
    headerWrapper = parseInt($('#navigation-menu').height());
    offsetTolerance = 100;

    //Detecting user's scroll
    $(window).scroll(function () {

        //Check scroll position
        scrollPosition = parseInt($(this).scrollTop());

        //Move trough each menu and check its position with scroll position then add selected-nav class
        $('.navbar-nav > li > a').each(function () {
            thisHref = $(this).attr('href');
            if (thisHref) {
                thisTruePosition = parseInt($(thisHref).offset().top);
                thisPosition = thisTruePosition - headerWrapper - offsetTolerance;

                if (scrollPosition >= thisPosition) {
                    $('.selected-nav').removeClass('selected-nav');
                    $('.navbar-nav > li > a[href=' + thisHref + ']').addClass('selected-nav');
                }
            }
        });


        //If we're at the bottom of the page, move pointer to the last section
        bottomPage = parseInt($(document).height()) - parseInt($(window).height());

        if (scrollPosition == bottomPage || scrollPosition >= bottomPage) {

            $('.selected-nav').removeClass('selected-nav');
            $('navbar-nav > li > a:last').addClass('selected-nav');
        }
    });

});


/*----------------------------------------------------*/
/*	Intro Page Slider
 /*----------------------------------------------------*/
$(document).ready(function () {

    "use strict";

    $("#slides").superslides({
        play: 9000,
        animation: "fade",
        pagination: true
    });

});


/*----------------------------------------------------*/
/*	Parallax
 /*----------------------------------------------------*/
$(window).bind('load', function () {

    "use strict";
    parallaxInit();

});

function parallaxInit() {
    $('#newsletter').parallax("30%", 0.3);
    $('#features').parallax("30%", 0.3);
    $('#testimonials-rotator').parallax("30%", 0.3);
}


/*----------------------------------------------------*/
/*	Lightbox
 /*----------------------------------------------------*/
$(document).ready(function () {

    "use strict";

    $('.image_zoom').magnificPopup({type: 'image'});

});


/*----------------------------------------------------*/
/*	Flexslider
 /*----------------------------------------------------*/

$(document).ready(function () {

    "use strict";

    $('.flexslider').flexslider({
        animation: "fade",
        controlNav: true,
        directionNav: false,
        slideshowSpeed: 4000,
        animationSpeed: 800,
        start: function (slider) {
            $('body').removeClass('loading');
        }
    });

});


/*----------------------------------------------------*/
/*	Newsletter Form Validation
 /*----------------------------------------------------*/

$(document).ready(function () {

    "use strict";

    $("#subscribe-form").validate({
        rules: {
            email: {
                required: true,
                email: true,
            }
        },
        messages: {
            email: {
                required: "We need your email address to contact you",
                email: "Your email address must be in the format of name@domain.com"
            },
        }
    });

});


/*----------------------------------------------------*/
/*	Contact Form Validation
 /*----------------------------------------------------*/

$(document).ready(function () {

    "use strict";

    $("#contact-form").validate({
        rules: {
            email: {
                required: true,
                email: true,
            },
            subject: {
                required: true,
                minlength: 4,
                maxlength: 24,
            },
            message: {
                required: true,
                minlength: 2,
            }
        },
        messages: {
            email: {
                required: "We need your email address to contact you",
                email: "Your email address must be in the format of name@domain.com"
            },
            message: {
                required: "Please enter no more than (2) characters"
            },
        }
    });

});


/*----------------------------------------------------*/
/*	ScrollUp
 /*----------------------------------------------------*/
/**
 * scrollUp v1.1.0
 * Author: Mark Goodyear - http://www.markgoodyear.com
 * Git: https://github.com/markgoodyear/scrollup
 *
 * Copyright 2013 Mark Goodyear
 * Licensed under the MIT license
 * http://www.opensource.org/licenses/mit-license.php
 */

$(document).ready(function () {

    'use strict';

    $.scrollUp = function (options) {

        // Defaults
        var defaults = {
            scrollName: 'scrollUp', // Element ID
            topDistance: 600, // Distance from top before showing element (px)
            topSpeed: 1200, // Speed back to top (ms)
            animation: 'fade', // Fade, slide, none
            animationInSpeed: 200, // Animation in speed (ms)
            animationOutSpeed: 200, // Animation out speed (ms)
            scrollText: '', // Text for element
            scrollImg: false, // Set true to use image
            activeOverlay: false // Set CSS color to display scrollUp active point, e.g '#00FFFF'
        };

        var o = $.extend({}, defaults, options),
            scrollId = '#' + o.scrollName;

        // Create element
        $('<a/>', {
            id: o.scrollName,
            href: '#top',
            title: o.scrollText
        }).appendTo('body');

        // If not using an image display text
        if (!o.scrollImg) {
            $(scrollId).text(o.scrollText);
        }

        // Minium CSS to make the magic happen
        $(scrollId).css({'display': 'none', 'position': 'fixed', 'z-index': '2147483647'});

        // Active point overlay
        if (o.activeOverlay) {
            $("body").append("<div id='" + o.scrollName + "-active'></div>");
            $(scrollId + "-active").css({ 'position': 'absolute', 'top': o.topDistance + 'px', 'width': '100%', 'border-top': '1px dotted ' + o.activeOverlay, 'z-index': '2147483647' });
        }

        // Scroll function
        $(window).scroll(function () {
            switch (o.animation) {
                case "fade":
                    $(($(window).scrollTop() > o.topDistance) ? $(scrollId).fadeIn(o.animationInSpeed) : $(scrollId).fadeOut(o.animationOutSpeed));
                    break;
                case "slide":
                    $(($(window).scrollTop() > o.topDistance) ? $(scrollId).slideDown(o.animationInSpeed) : $(scrollId).slideUp(o.animationOutSpeed));
                    break;
                default:
                    $(($(window).scrollTop() > o.topDistance) ? $(scrollId).show(0) : $(scrollId).hide(0));
            }
        });

        // To the top
        $(scrollId).click(function (event) {
            $('html, body').animate({scrollTop: 0}, o.topSpeed);
            event.preventDefault();
        });

    };

    $.scrollUp();

});

/*----------------------------------------------------*/
/*	Form login cancel click action
 /*----------------------------------------------------*/
$(document).ready(function() {

    $("body").on("click touch",".loginDropDown", function(e){
        e.stopPropagation();
        e.stopImmediatePropagation();
    });

    //On submit the login form
    $("body").on("submit","form.loginForm",function(e){
        e.preventDefault();

        //Post the login information
        $.ajax({
            type: "POST",
            url: $(this).attr("action"),
            data: $(this).serialize(),
            success: function(e){
                if(e.status=="success")
                    window.location = e.url;
                else
                    $("#passwordInput").val("");
            }
        });
    });

    //Submit of the login button
    $("body").on("click touch","#buttonLogin",function(e){
        loginLogic();
    });

    //Passwod Enter Key Event
    $("body").on("keypress","#passwordInput",function(e){
        if(e.keyCode===13){//The key press enter
            loginLogic();
        }
    });

    //Logic for do the login
    function loginLogic(){
        $("form.loginForm").submit();
    }

    //Send Subscription
    $('.subscribe-submit').click(function(e){
        var subsEmail = $('.subscribe-input').val();

        var htmlBody = "<h3>Nuevo email subscrito en la pagina biinapp.com</h3>" +
                       "<b>Email</b>: <pre>" + subsEmail + "</pre>";

        $.ajax({
            type: "GET",
            data: {
                to       : "carce@biinapp.com, epadilla@biinapp.com, lbonilla@biinapp.com, cdominguez@biinapp.com",
                //to     : "krlosnando@gmail.com, krlosnando@hotmail.com",
                subject  : "Nuevo email subscrito en biinapp.com",
                htmlBody : htmlBody
            },
            url: "sendEmail/",
            beforeSend: function(){
                $('.newsletterFirstText').text("Enviando tu solicitud...");
                $('.newsletterSecondText').text("Procesando...");
            },
            success: function(){
                $('.newsletterFirstText').text("Tu correo ha sido agregado exitosamente! muchas gracias!");
                $('.newsletterSecondText').text("Ahora recibira noticias importantes de Biin en su correo electrónico.");
            },
            error: function(){
                $('.newsletterFirstText').text("Lo sentimos mucho");
                $('.newsletterSecondText').text("Ocurrio un error inesperado al tratar de agregar tu email.");
            }
        });

        e.preventDefault();
    });

    //Contact Biin
    $('.btn-contact').click(function(e){
        var nombre   = $('#name').val();
        var email    = $('#email').val();
        var titulo   = $('#subject').val();
        var comments = $('#comments').val();

        var htmlBody = "<h3>Alguien desea contactarse con Biinapp</h3>" +
                       "<b>Nombre</b>: <pre>" + nombre + "</pre>" + 
                       "<b>Email</b>: <pre>" + email + "</pre>" + 
                       "<b>Titulo</b>: <pre>" + titulo + "</pre>" + 
                       "<b>Mensaje</b>: <pre>" + comments + "</pre>";

        $.ajax({
            type: "GET",
            data: {
                to       : "carce@biinapp.com, epadilla@biinapp.com, lbonilla@biinapp.com, cdominguez@biinapp.com",
                //to     : "krlosnando@gmail.com, krlosnando@hotmail.com",
                subject  : "Nuevo email para contactarse con Binapp",
                htmlBody : htmlBody
            },
            url: "sendEmail/",
            beforeSend: function(){
                $('.btn-contact').val("Enviando mensaje...");
            },
            success: function(){
                $('.btn-contact').val("Mensaje enviado!");
            },
            error: function(){
                $('.btn-contact').val("Error al enviar el mensaje");
            }
        });

        e.preventDefault();
    });
});

