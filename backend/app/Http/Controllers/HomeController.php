<?php

namespace App\Http\Controllers;

class HomeController extends Controller
{
    public function index()
    {
        return response()->json([
            'message' => 'Laravel is working!',
            'time' => now(),
        ]);
    }
}
