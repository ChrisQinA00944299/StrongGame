<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

$router->get('/', function () use ($router) {
    //return $router->app->version();
});



//*********************************** authentication API handlers... ************************************
$router->post('auth', 'Auth@authenticate'); //authenticates passed in username/password
$router->get('bcrypt/{item}', 'Auth@bcrypt'); //by passing text, created hash

//*********************************** catalog_questions API handlers... ************************************
$router->get('catalog_questions', function () {
   $questions = DB::table('catalog_questions')->get();
   return json_encode($questions);
}); //gets all catalog_questions

$router->get('catalog_games', function () {
   $games = DB::table('catalog_games')->get();
   return json_encode($games);
}); //gets all catalog_questions
//*********************************** catalog_games API handlers... ************************************
// $router->get('catalog_games/user/{ID}', 'CatalogueGames@getByID'); //gets all catalog_games based on userID


//*********************************** user API handlers... ************************************
$router->get('users', 'User@get');  //gets all users
$router->post('users', 'User@add'); //adds new user to system


//*********************************** Theme API Handlers. ************************************
$router->get('themes', 'Theme@get');  //gets all themes
$router->get('themes/{id}', 'Theme@getByID'); //gets theme by its ID
$router->get('themes/user/{id}', 'Theme@getByHostID'); //gets CSS of selected theme
$router->post('themes', 'Theme@add'); //adds a new theme
$router->delete('themes/{id}', 'Theme@delete'); //deletes a selected theme
$router->get('themes/{id}/css', 'Theme@css'); //gets CSS of selected theme
$router->get('themes/image/{name}', 'Theme@getImage'); //gets theme images
$router->post('themes/image/upload', 'Theme@uploadImage'); //adds theme image
$router->options('themes/{id}', function (){return json_encode(true);});


//*********************************** game API handlers... ************************************
$router->get('games', 'Game@get');
$router->get('games/{id}', 'Game@getByID');
$router->get('games/reservations/{id}', 'Game@getByReservationID');


$router->get('games/user/{id}/count', function ($id)
{
   $results = DB::table('games')->select(DB::raw('count(*) as total'))->where('userID','=', $id )->get();
   return json_encode($results[0]);
});


$router->get('games/user/{userID}', function ($userID)
{
   $results = DB::table('games')->where('userID','=', $userID )->orderBy('date_updated', 'desc')->get();
   return json_encode($results);
});


$router->get('games/sessions/{gameID}', function ($gameID)
{
   $results = DB::table('sessions')->join('games', 'games.id', '=', 'sessions.gameID')->where('gameID','=', $gameID )->orderBy('sessions.ID', 'desc')->get();;
   return json_encode($results);
});



$router->put('games/{id}', 'Game@update');
$router->post('games', 'Game@add');
$router->delete('games/{id}', 'Game@delete');
$router->options('games/{id}', function (){return json_encode(true);});



//*********************************** session API handlers... ************************************
$router->get('sessions', function ()
{
   //$results = DB::table('sessions')->get();;
   //return json_encode($results);
});



$router->get('sessions/user/{id}', function ($id)
{
   $results = DB::table('sessions')->join('games', 'games.id', '=', 'sessions.gameID')->where('hostID','=', $id )->orderBy('sessions.ID', 'desc')->get();;
   return json_encode($results);
});


//get specific session by its ID
$router->get('sessions/{id}', function ($id)
{
   $results = DB::table('sessions')->where('sessionID','=', $id )->get();
   return json_encode($results[0]);
});





$router->get('sessions/{id}/responses', function ($id)
{
   $results = DB::table('sessions')->where('sessionID','=', $id )->get();
   $results = $results[0];
   $responses = json_decode($results->questionResponses);
   $data = "";
   $PSTTZ = new DateTimeZone('America/Los_Angeles');
   foreach ($responses as $item)
   {


      if($item->questionType != "survey" && $item->questionType != "social")
      {

         $time = new DateTime($item->time);
         $time->setTimezone($PSTTZ);
         $data .= $item->timestamp . ";";
         $data .= $time->format('Y-m-d H:i:s') . ";";
         $data .= $item->questionID . ";";
         $data .= $item->questionType . ";";
         $data .= $item->questionTimestamp . ";";
         $data .= $item->correctAnswer . ";";
         $data .= $item->team . ";";
         $data .= $item->player . ";";
         $data .= $item->response . "";
         $data .= "\n";
      }
   }

   header("Content-type: text/csv");
   header("Content-Disposition: attachment; filename=" . $id . "_responses.csv");
   header("Pragma: no-cache");
   header("Expires: 0");

   echo "timestamp;time;questionID;questionType;questionTimestamp;correctAnswer;team;player;response\n";
   echo $data;


   //return json_encode($results->questionResponses);
});



$router->get('sessions/{id}/responseSummary', function ($id)
{
   $results = DB::table('sessions')->where('sessionID','=', $id )->get();
   $results = $results[0];

   $gameInfo = DB::table('games')->where('ID','=', $results->gameID )->get();
   $gameInfo = $gameInfo[0];
   $gameQuestions = json_decode($gameInfo->questions);


   $questionResponses = json_decode($results->questionResponses);
   $data = "";
   $responses = [];
   $numberPlayers = 0;
   $numberQuestions = 0;
   $hardestQuestion = new stdclass();
   $easiestQuestion = new stdclass();
   $outStat = [];
   $gameQuestionsCount = count($gameQuestions);
   $playersCount = null;

   if(is_array(json_decode($results->players)))
   {
      $playersCount = count(json_decode($results->players));
   }




   //prep our data....
   foreach ($questionResponses as $item)
   {

      if($item->questionType != "survey" && $item->questionType != "social" )
      {

         $playerResponse = new stdclass();
         $startTime = $item->questionTimestamp;
         $answerTime = $item->timestamp;
         $deltaTime = $item->timestamp - $item->questionTimestamp;
         $firstCorrect = false;
         $item->deltaTime = $deltaTime;

         if(!isset($responses[$item->questionID]))
            $responses[$item->questionID] = [];
         if(!isset($responses[$item->questionID][$item->player]))
            $responses[$item->questionID][$item->player] = [];


            array_push($responses[$item->questionID][$item->player],$item);

            //echo $item->questionID . " - " . $item->correctAnswer . " - " .  $item->player . " - " . $item->response . " - " . $deltaTime . "<br/>";

      }


   }

   $data = "";

   //loop through each question and get stats...
   foreach ($responses as $key => $item)
   {
      $averagePlayerResponses = 0.0;
      $averageSecsFirstResponse = 0.0;
      $averageCorrectInitial = 0;
      $averageCorrectFinal = 0;
      $firstDelta = 0;
      $totalResponses = 0;
      $totalFirstCorrect = 0;
      $totalFinalCorrect = 0;
      $totalSecondsFirstResponse = 0;



      //get player stats...
      foreach ($item as $playerId => $playerInfo)
      {

         $firstResponse = null;


            foreach ($playerInfo as $playerResponse)
            {

               if($firstResponse == null)
                  $firstResponse = $playerResponse;

               $totalResponses++;
            }

         if($firstResponse->correctAnswer == $firstResponse->response)
            $totalFirstCorrect++;

          if($playerResponse->correctAnswer == $playerResponse->response)
            $totalFinalCorrect++;

         $firstDelta += $firstResponse->deltaTime;



      }


      $averagePlayerResponses = $totalResponses / count($item);
      $averageSecsFirstResponse = $firstDelta / count($item);
      $averageCorrectInitial = $totalFirstCorrect / count($item);
      $averageCorrectFinal = $totalFinalCorrect / count($item);


      $tempItem = new stdclass();
      $tempItem->questionID = $firstResponse->questionID;
      $tempItem->question = $firstResponse->question;
      $tempItem->averagePlayerResponses = round($averagePlayerResponses,1);
      $tempItem->averageSecsFirstResponse = round($averageSecsFirstResponse,1);
      $tempItem->averageCorrectInitial = round($averageCorrectInitial,3);
      $tempItem->averageCorrectFinal = round($averageCorrectFinal,3);
      $tempItem->numberofResponses = $totalResponses;
      $tempItem->totalQuestions = $gameQuestionsCount;
      $tempItem->totalPlayers = $playersCount;


      array_push($outStat, $tempItem);

      //echo $key . ";" . $firstResponse->question . ";" . round($averagePlayerResponses,1) . ";" . round($averageSecsFirstResponse,1) . ";" . round($averageCorrectInitial,3) . ";" . round($averageCorrectFinal,3) .  "\n";
   }


   return json_encode($outStat);



   //return json_encode($results->questionResponses);
});




$router->get('sessions/{id}/exportResponseStats', function ($id)
{
   $results = DB::table('sessions')->where('sessionID','=', $id )->get();
   $results = $results[0];
   $questionResponses = json_decode($results->questionResponses);
   $data = "";
   $responses = [];
   $PSTTZ = new DateTimeZone('America/Los_Angeles');


   //prep our data....
   foreach ($questionResponses as $item)
   {

      if($item->questionType != "survey" && $item->questionType != "social" )
      {

         $playerResponse = new stdclass();
         $startTime = $item->questionTimestamp;
         $answerTime = $item->timestamp;
         $deltaTime = $item->timestamp - $item->questionTimestamp;
         $firstCorrect = false;
         $item->deltaTime = $deltaTime;

         if(!isset($responses[$item->questionID]))
            $responses[$item->questionID] = [];
         if(!isset($responses[$item->questionID][$item->player]))
            $responses[$item->questionID][$item->player] = [];


            array_push($responses[$item->questionID][$item->player],$item);

            //echo $item->questionID . " - " . $item->correctAnswer . " - " .  $item->player . " - " . $item->response . " - " . $deltaTime . "<br/>";


      }


   }

   $data = "";
   echo "ID;Question;Average number of responses per player;Average seconds to first response;Average correct initial answers;Average correct final answers\n";


   //loop through each question and get stats...
   foreach ($responses as $key => $item)
   {
      $averagePlayerResponses = 0.0;
      $averageSecsFirstResponse = 0.0;
      $averageCorrectInitial = 0;
      $averageCorrectFinal = 0;
      $firstDelta = 0;
      $totalResponses = 0;
      $totalFirstCorrect = 0;
      $totalFinalCorrect = 0;
      $totalSecondsFirstResponse = 0;




      //get player stats...
      foreach ($item as $playerId => $playerInfo)
      {

         $firstResponse = null;


            foreach ($playerInfo as $playerResponse)
            {

               if($firstResponse == null)
                  $firstResponse = $playerResponse;

               $totalResponses++;
            }

         if($firstResponse->correctAnswer == $firstResponse->response)
            $totalFirstCorrect++;

          if($playerResponse->correctAnswer == $playerResponse->response)
            $totalFinalCorrect++;

         $firstDelta += $firstResponse->deltaTime;



      }


      $averagePlayerResponses = $totalResponses / count($item);
      $averageSecsFirstResponse = $firstDelta / count($item);
      $averageCorrectInitial = $totalFirstCorrect / count($item);
      $averageCorrectFinal = $totalFinalCorrect / count($item);



      echo $key . ";" . $firstResponse->question . ";" . round($averagePlayerResponses,1) . ";" . round($averageSecsFirstResponse,1) . ";" . round($averageCorrectInitial,3) . ";" . round($averageCorrectFinal,3) .  "\n";
   }


//   echo $data;


   //var_dump($responses);

   header("Content-type: text/csv");
   header("Content-Disposition: attachment; filename=" . $id . "_responseStats.csv");
   header("Pragma: no-cache");
   header("Expires: 0");




   //return json_encode($results->questionResponses);
});




$router->get('sessions/{id}/exportScores', function ($id)
{
   $results = DB::table('sessions')->where('sessionID','=', $id )->get();
   $results = $results[0];
   $scores = json_decode($results->scores);
   $data = "";
   $responses = [];
   $PSTTZ = new DateTimeZone('America/Los_Angeles');

   echo "rank;type;name;score\n";
   $counter = 1;

   foreach ($scores->teams as $item)
   {
      echo $counter . ";Team;" . $item->name . ";" . $item->score . "\n";
   }

   $counter = 1;
   foreach ($scores->players as $item)
   {
      echo $counter . ";Player;" . $item->name . ";" . $item->score . "\n";
   }


   header("Content-type: text/csv");
   header("Content-Disposition: attachment; filename=" . $id . "_responseStats.csv");
   header("Pragma: no-cache");
   header("Expires: 0");


});





$router->post('sessions', 'Session@add');


//*********************************** Image Uploading... ************************************
$router->get('image/{name}', 'Image@get');
$router->post('image/upload', 'Image@upload');

//*********************************** Teams************************************
$router->get('teams/{id}', function ($id)
{
   $results = DB::table('teams')->where('ID','=', $id )->get();
   return json_encode($results[0]);
});


$router->get('teams/user/{id}/count', function ($id)
{
   $results = DB::table('teams')->select(DB::raw('count(*) as total'))->where('hostID','=', $id )->get();
   return json_encode($results[0]);
});


$router->get('teams/user/{id}', function ($id)
{
   $results = DB::table('teams')->where('hostID','=', $id )->get();;
   return json_encode($results);
});





$router->get('teams/image/{name}', 'Team@getImage');
$router->post('teams/image/upload', 'Team@uploadImage');
$router->put('teams/{id}', 'Team@update');
$router->post('teams', 'Team@add');
$router->delete('teams/{id}', 'Team@delete');
$router->options('teams/{id}', function (){return json_encode(true);});
