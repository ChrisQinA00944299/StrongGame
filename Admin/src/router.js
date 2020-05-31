//-----------------------------------------------------------------
//       Name: router.js
//Description: Handles the URL routing for the SSO application.
//----------------------------------------------------------------

import {loadGames} from './components/games/games.js';


var guid = docCookies.getItem('strong_guid');


//listener to detect any changes to the hash in the URL
$(window).on('hashchange',function(){ 
  routePage();
});

//router actions...
function routePage()
{
  
  var page = window.location.hash;

  $("#app").hide();
  $('.nav-item').removeClass('active');
  $('body').removeClass('login-page');

  page = page.split('?');


 //load the appropriate navigation...



 //load the appropriate page items...
  switch(page[0]) {
  case "#login":
    $("#app").load('./src/components/auth/login.html'); 
    $('#nav-login').addClass('active');
    $('body').addClass('login-page');  
    break;
  
  case "#logout":
    console.log("logging out");
    $('header').load('./src/components/header/header-public.html');
      docCookies.removeItem('strong_guid'); 
      window.location.hash = '#login';
    break;

  case "#games":
    $("#app").load('./src/components/games/games.html'); 
    $('#nav-games').addClass('active');
    break;

  case "#play":
    $("#app").load('./src/components/games/play.html'); 
    $('#nav-games').addClass('active');
    break;


    case "#stats":
    $("#app").load('./src/components/games/stats.html'); 
    $('#nav-games').addClass('active');
    break;


  case "#teams":
    $("#app").load('./src/components/teams/teams.html');  
    $('#nav-teams').addClass('active');
    break;

  case "#themes":
    $("#app").load('./src/components/themes/themes.html');  
    $('#nav-themes').addClass('active');
    break;


  case "#dashboard":
    $("#app").load('./src/components/dashboard/dashboard.html');  
    $('#nav-dashboard').addClass('active');
    break;

  default:
    window.location.hash = '#login';
    break;
    
} 
  $("#app").fadeIn();
  $.get('pages/'+page+'.html', function(pageContent){
     //$('.page-container').html(pageContent);
  })   

}


$( document ).ready(function() {
    routePage();

});

