$('.home #Content-Text > .module.first, .home #Content-Text .module-row.second, .home #Content-Text .module-row.third, .home #Content-Text .module-row.fourth').wrapAll('<div class="section1 section"><div class="void section-void"></div></div>');
$('.home #Content-Text .module.fifth, .home #Content-Text .module-row.sixth, .home #Content-Text .module.seventh').wrapAll('<div class="section2 section"><div class="void section-void"></div></div>');
$('.home #Content-Text .module.eighth, .home #Content-Text .module-row.ninth, .home #Content-Text .module-row.tenth').wrapAll('<div class="section3 section"><div class="void section-void"></div></div>');
$('.home #Content-Text .module.eleventh').wrapAll('<div class="section4 section"><div class="void section-void"></div></div>');
$('.home #Content-Text .module.twelveth, .home #Content-Text .module-row.thirteenth').wrapAll('<div class="section5 section"><div class="void section-void"></div></div>');

$('.home .mailchimp-module').wrapAll('<div class="section6 section"><div class="void section-void"></div><div class="catchall"></div></div>');
$('.home .mailchimp-module input').attr('placeholder','enter email');
$('<h3>Sign up for upcoming promotions!</h3>').insertBefore('.mailchimp-module .indicates-required');

$('.service-areas #Content-Text .module-row.first').wrapAll('<div class="service-areas section1 section"><div class="void section-void"></div><div class="catchall"></div></div>');
$('.service-areas #Content-Text > .module.second, .service-areas #Content-Text .module-row.items-5.third').wrapAll('<div class="service-areas section2 section"><div class="void section-void"></div><div class="catchall"></div></div>');
$('.pricing #Content-Text .module.first.of-five, .pricing #Content-Text .module-row.second, .pricing #Content-Text .module-row.third, .pricing #Content-Text .module-row.fourth ').wrapAll('<div class="pricing section1 section"><div class="void section-void"></div><div class="catchall"></div></div>');
$('.pricing #Content-Text .module-row.fifth ').wrapAll('<div class="pricing section2 section"><div class="void section-void"></div><div class="catchall"></div></div>');


$('.service-areas input#name1').attr('placeholder','name');
$('.service-areas input#email-addre2').attr('placeholder','email address');
$('.service-areas input#zip-code3').attr('placeholder','zip code');

$('.pricing input#name3').attr('placeholder','name');
$('.pricing input#phone-numbe4').attr('placeholder','phone number');
$('.pricing input#email3').attr('placeholder','email');
$('.pricing input#fuel6').attr('placeholder','fuel type');

$('#Header .extra .module.third').addClass('panel');
 $('#Header .extra .module.third').attr('id', 'Menu');
$('#Header .extra .module.third').attr('role', 'navigation');
$('#Main').addClass('push');
$('#Header .extra .module.third').prependTo('body');

$('.error .not-logged-in-options').append('<br/><a id="CreateAccount" href="https://joulerefuel.blazonco.com/create-an-account">Create an Account</a>')

/*
$('#Content-Text .module-row.items-2 .module.first').addClass('wow slideInLeft');
$('#Content-Text .module-row.items-2 .module.second').addClass('wow slideInRight');


$('#Content-Text .module-row.items-3 .module.first').addClass('wow slideInLeft');
$('#Content-Text .module-row.items-3 .module.second').addClass('wow slideInUp');
$('#Content-Text .module-row.items-3 .module.third').addClass('wow slideInRight');

$('#Content-Text .section4 .module').addClass('wow fadeIn');
*/

$('.client-login-module').each(function(){
    if($(this).hasClass('logged-in')) {
        $("#Main").addClass("logged-in");
    } 
});

$('#Main').each(function(){
    if($(this).hasClass('secureauth')) {
        $("body").addClass("secureauth");
    } 
});

$('ul.posts li').each(function(){

	$postTitle = $(this).find('p').html();
	$(this).find('p').remove();
	$(this).find('h4').before('<p>' + $postTitle + '</p>');

})

$( document ).ready(function() {
	$('#Footer .module-row').each(function() {
		$(this).find('.component').wrapAll("<div class='void'></div>");
	});
});

$(document).ready(function (){
$('body.home').css('opacity', '0').fadeTo(1500, 1,'swing'); 
});

$(window).scroll(function() {
if ($(this).scrollTop() > 100){  
    $('#Header, #PrimaryNavigation, #Header h1 a, html #Header .extra, html #StockImage').addClass("sticky");
  }
  else{
    $('#Header, #PrimaryNavigation, #Header h1 a, html #Header .extra, html #StockImage').removeClass("sticky");
  }
});

$(document).ready(function (){
    mapbox.auto('map', 'examples.map-vyofok3q', function(map) {
        map.eventHandlers[3].remove();
    });
});




