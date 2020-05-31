<?php

namespace App\Http\Controllers;

use Laravel\Lumen\Routing\Controller as BaseController;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class CatalogueQuestions extends BaseController
{

   //---------------------------------- get() -----------------------------------
       // Description: gets all games in the system
       //
       //----------------------------------------------------------------------------
       public function get()
       {
           //$results = DB::table('catalogue_games')->get();;
           //return json_encode($results);

           echo "Not Available";
       }

       //---------------------------------- getByID() -----------------------------------
       // Description: gets a new game by its ID
       //
       //----------------------------------------------------------------------------
       public function getByID($id)
       {
           $results = DB::table('catalogue_games')->where('ID','=', $id )->get();
           return json_encode($results[0]);
       }

       //---------------------------------- getByReservationID() -----------------------------------
       // Description: gets game info by its reservation ID
       //
       //----------------------------------------------------------------------------
       public function getByReservationID($id)
       {
           $results = DB::table('reservations')->where('reservationID','=', $id )->get();

           if(count($results) > 0)
           {
               $result = $results[0];
               $results = DB::table('catalogue_games')->where('ID','=', $result->gameID )->get();
               return json_encode($results[0]);
           }
           else
           {
               return json_encode(false);
           }

       }






       //---------------------------------- add() -----------------------------------
       // Description: Adds a new game to the system...
       //
       //----------------------------------------------------------------------------
       public function add(Request $request)
       {

   		//grab the JSON data and post it to the DB...
       	$data = $request->json()->all();
       	$questions = $data['questions'];
       	$formItems = $data['formItems'];
       	$teams = $data['teams'];

       	for($i = 0; $i < count($questions); $i++)
       	{

       		if($questions[$i]['type'] == "social")
       		{

       			for($i = 0; $i < count($formItems); $i++ )
   		    	{
   		    		if($formItems[$i]['question'] == $questions[$i]['id'])
   		    		{
   		    			$formItems[$i]['question'] = $i + 1;
   		    		}

   		    	}

       		}
       		$questions[$i]['id'] = $i + 1;
       	}


       	for($i = 0; $i < count($teams); $i++ )
       	{
       		$teams[$i]['id'] = $i + 1;
       	}


       	for($i = 0; $i < count($formItems); $i++ )
       	{
       		$formItems[$i]['id'] = $i + 1;
       	}



           DB::table('catalogue_games')->insert(
   	    [
   	    	'title' => $data['title'],
   	    	'description' => $data['description'],
   	    	'timings' => json_encode($data['timings']),
   	    	'questions' => json_encode($questions),
   	    	'form_items' => json_encode($formItems),
   	    	'teams' => json_encode($teams),
   	    	'userID' => $data['userID'],
               'themeID' => $data['themeID'],

   		]
   		);


   		return json_encode(true);
       }



       //---------------------------------- update() -----------------------------------
       // Description: updates a current game
       //
       //----------------------------------------------------------------------------
        public function update(Request $request)
       {

       	$data = $request->json()->all();
       	$questions = $data['questions'];
       	$formItems = [];
           //$formItems = $data['formItems'];
       	$teams = $data['teams'];

       	for($i = 0; $i < count($questions); $i++)
       	{

       		if($questions[$i]['type'] == "social")
       		{

       			$tempItem = new \stdclass();
                   $tempItem->question = $i + 1;
                   $tempItem->type = "text";
                   $tempItem->title = $questions[$i]['entryQuestion'];

                   array_push($formItems, $tempItem);

                   /*
       			for($j = 0; $j < count($formItems); $j++ )
   		    	{
   		    		if($formItems[$j]['question'] == $questions[$i]['id'])
   		    		{
   		    			$formItems[$j]['question'] = $i + 1;
                           break;
   		    		}

   		    	}
                   */


       		}





       		$questions[$i]['id'] = $i + 1;
       	}


       	for($i = 0; $i < count($teams); $i++ )
       	{
       		$teams[$i]['id'] = $i + 1;
       	}


       	for($i = 0; $i < count($formItems); $i++ )
       	{
       		$formItems[$i]->id = $i + 1;
       	}



           $data = $request->json()->all();
           $dateUpdated = date_create()->format('Y-m-d H:i:s');

           DB::table('catalogue_games')->where('ID', $data['id'])->update(
   	    [
   	    	'title' => $data['title'],
   	    	'description' => $data['description'],
   	    	'timings' => json_encode($data['timings']),
   	    	'questions' => json_encode($questions),
   	    	'form_items' => json_encode($formItems),
   	    	'teams' => json_encode($teams),
   	    	'userID' => $data['userID'],
               'themeID' => $data['themeID'],
               'date_updated' => $dateUpdated,
   		]
   		);

   		return json_encode(true);

       }



       //---------------------------------- delete() -----------------------------------
       // Description: Deletes the selected game
       //
       //----------------------------------------------------------------------------
        public function delete($id)
       {

           DB::table('catalogue_games')->where('ID', '=', $id)->delete();
   		return json_encode(true);
       }

}
