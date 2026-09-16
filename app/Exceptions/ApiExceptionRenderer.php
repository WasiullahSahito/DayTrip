<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

/**
 * A single, consistent JSON envelope for every API error — and, critically,
 * the one place that guarantees stack traces, SQL, and internal exception
 * messages never leak to a client regardless of what throws. APP_DEBUG has
 * no bearing on this renderer; production behavior is identical to local.
 */
class ApiExceptionRenderer
{
    public static function register(Exceptions $exceptions): void
    {
        $exceptions->render(function (Throwable $e, Request $request) {
            if (! $request->is('api/*') && ! $request->expectsJson()) {
                return null;
            }

            if ($e instanceof ValidationException) {
                return response()->json([
                    'success' => false,
                    'message' => 'The given data was invalid.',
                    'errors' => $e->errors(),
                ], 422);
            }

            if ($e instanceof AuthenticationException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.',
                    'errors' => null,
                ], 401);
            }

            if ($e instanceof AuthorizationException) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to perform this action.',
                    'errors' => null,
                ], 403);
            }

            if ($e instanceof ModelNotFoundException || $e instanceof NotFoundHttpException) {
                return response()->json([
                    'success' => false,
                    'message' => 'The requested resource could not be found.',
                    'errors' => null,
                ], 404);
            }

            if ($e instanceof \Illuminate\Http\Exceptions\ThrottleRequestsException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many requests. Please try again shortly.',
                    'errors' => null,
                ], 429);
            }

            $status = $e instanceof HttpExceptionInterface ? $e->getStatusCode() : 500;

            if ($status >= 500) {
                Log::error($e->getMessage(), ['exception' => $e]);
            }

            return response()->json([
                'success' => false,
                'message' => $status >= 500
                    ? 'Something went wrong on our end. Please try again later.'
                    : ($e->getMessage() ?: 'Unable to process the request.'),
                'errors' => null,
            ], $status);
        });
    }
}
