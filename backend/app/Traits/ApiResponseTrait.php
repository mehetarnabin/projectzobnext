<?php

namespace App\Traits;

trait ApiResponseTrait
{
    public function success($data, $message = 'Success', $code = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $code);
    }

    public function error($message = 'Error', $code = 500)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
        ], $code);
    }
}
