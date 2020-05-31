<?php

namespace App\Http\Controllers;

use Laravel\Lumen\Routing\Controller as BaseController;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class Theme extends BaseController
{


	//---------------------------------- get() -----------------------------------
    // Description: gets all themes in the system
    //
    //----------------------------------------------------------------------------
    public function get()
    {
        //$results = DB::table('games')->get();;
        //return json_encode($results);

        echo "Not Available";
    }



    //---------------------------------- getByID() -----------------------------------
    // Description: gets a theme by its ID
    //
    //----------------------------------------------------------------------------
    public function getByID($id)
    {
        $results = DB::table('themes')->where('themeID','=', $id )->get();
        return json_encode($results[0]);
    }

    //---------------------------------- getByHostID() -----------------------------------
    // Description: gets a theme by its ID
    //
    //----------------------------------------------------------------------------
    public function getByHostID($id)
    {
        $results = DB::table('themes')->where('hostID','=', $id )->get();
   		return json_encode($results);
    }



	//---------------------------------- add() -----------------------------------
    // Description: Adds a new theme to the system...
    //
    //----------------------------------------------------------------------------
    public function add(Request $request)
    {

		//grab the JSON data and post it to the DB...
    	$data = $request->json()->all();
    	$properties = $data['properties'];

    	
        DB::table('themes')->insert(
	    [
	    	'themeID' => md5(time()),
	    	'hostID' => $data['hostID'],
	    	'name' => $data['name'],
	    	'properties' => json_encode($properties),
		]
		); 
		return json_encode(true);
    }


	//---------------------------------- delete() -----------------------------------
    // Description: Deletes the specific theme
    //
    //----------------------------------------------------------------------------
    public function delete($id)
    {

        DB::table('themes')->where('themeID', '=', $id)->delete();
        return json_encode(true);
    }


    //---------------------------------- css() -----------------------------------
    // Description: generates CSS from given theme ID
    //
    //----------------------------------------------------------------------------
    public function css($id)
    {

    	$results = DB::table('themes')->where('themeID','=', $id )->get();
        echo "css";

    }

	//---------------------------------- getImage() -----------------------------------
    // Description: retrieves theme specific image
    //
    //----------------------------------------------------------------------------
    public function getImage($name)
    {
        header("Content-type: image/jpeg");

        echo Storage::get('themes/' . $name);
    }

    //---------------------------------- uploadImage() -----------------------------------
    // Description: Adds a new theme specific image to the system
    //
    //----------------------------------------------------------------------------
    public function uploadImage(Request $request)
    {
    	

        if ($request->hasFile('flLoaderImage')) 
        {
            $result = $request->file('flLoaderImage')->store('themes');

            $result = str_replace('themes/','', $result);
            $result = str_replace('"','', $result);
            echo json_encode($result);
        }
        else if ($request->hasFile('flScoreImage')) 
        {
            $result = $request->file('flScoreImage')->store('themes');

            $result = str_replace('themes/','', $result);
            $result = str_replace('"','', $result);
            echo json_encode($result);
        }
        else
        {
            $file = "";
        }	

    }


}