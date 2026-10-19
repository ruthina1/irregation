<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

abstract class Controller
{
    /**
     * Return a standardized success JSON response.
     */
    protected function successResponse(mixed $data = null, string $message = 'Success', int $status = 200): JsonResponse
    {
        $payload = [];
        if ($data !== null) {
            $payload['data'] = $data;
        }
        if ($message !== '') {
            $payload['message'] = $message;
        }

        return response()->json($payload, $status);
    }

    /**
     * Return a standardized error JSON response.
     */
    protected function errorResponse(string $message = 'Error', int $status = 400, mixed $errors = null): JsonResponse
    {
        $payload = ['message' => $message];
        if ($errors !== null) {
            $payload['errors'] = $errors;
        }

        return response()->json($payload, $status);
    }
}
