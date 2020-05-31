import './scss/application.scss';
import './router.js';
import './components/dashboard/dashboard.js'; 
import './components/auth/auth.js'; 
 

var guid = docCookies.getItem('strong_guid');
console.log(guid);
var navType = "";

//should we load the member nav or the public nav?
if(guid != undefined)
{
  navType = './src/components/header/header-member.html';
}
else
{
  navType = './src/components/header/header-public.html';
  window.location.hash = '#login';
}


$( document ).ready(function() {
    $('header').load(navType);
});





