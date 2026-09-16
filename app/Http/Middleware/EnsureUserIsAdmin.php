<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;

/**
 * Must run after `auth:sanctum` so $request->user() is already resolved.
 * Throws rather than building a response inline — ApiExceptionRenderer
 * already renders AuthorizationException as the standard 403 envelope, so
 * this stays on the same code path every other authorize() failure uses.
 */
class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next)
    {
        if (! $request->user()?->is_admin) {
            throw new AuthorizationException('You are not authorized to perform this action.');
        }

        return $next($request);
    }
}
