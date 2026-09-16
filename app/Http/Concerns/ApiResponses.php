<?php

namespace App\Http\Concerns;

use Illuminate\Http\JsonResponse;

trait ApiResponses
{
    protected function ok(mixed $data = null, string $message = 'Success', int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    protected function created(mixed $data = null, string $message = 'Created successfully.'): JsonResponse
    {
        return $this->ok($data, $message, 201);
    }

    protected function fail(string $message = 'Unable to process the request.', int $status = 400, mixed $errors = null): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $status);
    }
}
