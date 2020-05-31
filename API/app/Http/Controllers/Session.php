<?php

namespace App\Http\Controllers;

use Laravel\Lumen\Routing\Controller as BaseController;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class Session extends BaseController
{
    

    public function add(Request $request)
    {

    	$data = $request->json()->all();


		$results = DB::table('games')->where('ID','=', $data['gameID'] )->get();
		$hostID = $results[0]->userID;

        DB::table('sessions')->insert(
	    [
	    	'gameID' => $data['gameID'],
	    	'hostID' => $hostID,
	    	'sessionID' => $data['sessionID'],
	    	'surveyResponses' => json_encode($data['surveyResponses']),
	    	'questionResponses' => json_encode($data['questionResponses']),
	    	'activity' => json_encode($data['activity']),
	    	'players' => json_encode($data['players']),
	    	'scores' => json_encode($data['scores']),
	    	'date' => date("Y-m-d H:i:s"),
		]
		);

		return json_encode(true);
    }


     public function delete($id)
    {
        DB::table('sessions')->where('ID', '=', $id)->delete();
		return json_encode(true);
    }




}
