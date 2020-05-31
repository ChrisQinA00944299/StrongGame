<?php

namespace App\Http\Controllers;

use Laravel\Lumen\Routing\Controller as BaseController;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class Auth extends BaseController
{
    

    //---------------------------------- authenticate() ------------------------------
    // Description: Authenticates the signing in user
    //
    //----------------------------------------------------------------------------
    public function authenticate(Request $request)
    {

    	$data = $request->json()->all();

    	$hashedPassword = app('hash')->make('test', ['rounds' => 10]);

    	//var_dump($data);
        $results = DB::table('users')->select('email','guid','password')->where('email','=',$data['email'])->get();


        if(count($results) > 0)
        {
            $item = $results[0];
            $matched = app('hash')->check($data['password'], $item->password);

            //echo $item->password;

            if($matched)
            {
            	$result = new \stdclass();
            	$result->email = $item->email;
            	$result->guid = $item->guid;
            	return json_encode($result);
            }
            else
            {
            	return "false";
            }
        }
        else
        {
            return "false";
        }

   			
    }

    //---------------------------------- bcrypt() ------------------------------
    // Description: Creates new bcrypt hash
    //
    //----------------------------------------------------------------------------
    public function bcrypt($item)
    {
       
        $hashedPassword = app('hash')->make($item, ['rounds' => 10]);
        echo $hashedPassword;
    }




}
