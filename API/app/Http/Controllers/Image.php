<?php

namespace App\Http\Controllers;

use Laravel\Lumen\Routing\Controller as BaseController;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
//use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
//use Illuminate\Support\Facades\File;

class Image extends BaseController
{
    

    public function upload(Request $request)
    {
    	
        //are there any images to upload?

        //var_dump($request->all());    

        if ($request->hasFile('flImage')) 
        {
            $result = $request->file('flImage')->store('questions');
            $result = str_replace('questions/','', $result);
            
        }
        else if ($request->hasFile('flMedia')) 
        {
            $result = $request->file('flMedia')->store('questions');
            $result = str_replace('questions/','', $result);
            
        }
        else
        {
            $file = "";
            $result = "error";
        }	

        //$result = $request->file('flMedia')->store('questions');
        //$result = str_replace('questions/','', $result);

        echo json_encode($result);

    }



     public function get($name)
    {

        //$url = Storage::url('/app/questions/' . $name);
        header("Content-type: image/jpeg");
        echo Storage::get('questions/' . $name);


     


    }






}

