<?php

namespace App\Http\Controllers;

use Laravel\Lumen\Routing\Controller as BaseController;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
//use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
//use Illuminate\Support\Facades\File;

class Team extends BaseController
{
    

    public function uploadImage(Request $request)
    {
    	
        //are there any images to upload?

        //var_dump($request->all());    

        if ($request->hasFile('flImage')) 
        {
            $result = $request->file('flImage')->store('teams');

            $result = str_replace('teams/','', $result);
            $result = str_replace('"','', $result);
            echo json_encode($result);
        }
        else
        {
            $file = "";
        }	

    }



     public function getImage($name)
    {

        //$url = Storage::url('/app/questions/' . $name);
        //header("Content-type: image/jpeg");
        echo Storage::get('teams/' . $name);

    }


    public function add(Request $request)
    {

        //grab the JSON data and post it to the DB...
        $data = $request->json()->all();      

        DB::table('teams')->insert(
        [
            'name' => $data['name'],
            'description' => $data['description'],
            'image' => json_encode($data['image']),
            'hostID' => $data['hostID'],
        ]
        ); 

        return json_encode(true);
    }

     public function update(Request $request)
    {

        //grab the JSON data and post it to the DB...
        $data = $request->json()->all();      

        DB::table('teams')->where('ID', $data['id'])->update(
        [
            'name' => $data['name'],
            'description' => $data['description'],
            'image' => json_encode($data['image']),
            'hostID' => $data['hostID'],
        ]
        ); 

        return json_encode(true);
    }

    public function delete($id)
    {

        DB::table('teams')->where('ID', '=', $id)->delete();
        return json_encode(true);
    }






}

