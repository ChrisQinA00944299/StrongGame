<?php

namespace App\Http\Controllers;

use Laravel\Lumen\Routing\Controller as BaseController;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class User extends BaseController
{
    
 
    //---------------------------------- retrieve() -----------------------------------
    // Description: Retrieve all the users in the system...
    //
    //----------------------------------------------------------------------------
    public function get(Request $request)
    {
    	//$results = DB::table('users')->get();
   		//return json_encode($results);

   		echo "IT CHANGED";
    } 

    //---------------------------------- add() -----------------------------------
    // Description: adds new user in the system
    //
    //----------------------------------------------------------------------------
    public function add(Request $request)
    {
    	//TODO add logic to add new user to DB
    }



}