<?php

namespace App\Http\Controllers\Api;

use App\Http\Concerns\ApiResponses;
use App\Http\Controllers\Controller;
use App\Http\Requests\FavouriteAddressRequest;
use App\Http\Resources\FavouriteAddressResource;
use App\Models\FavouriteAddress;
use Illuminate\Http\Request;

class FavouriteAddressController extends Controller
{
    use ApiResponses;

    public function index(Request $request)
    {
        return $this->ok(FavouriteAddressResource::collection($request->user()->favouriteAddresses));
    }

    public function store(FavouriteAddressRequest $request)
    {
        $favourite = $request->user()->favouriteAddresses()->create($request->validated());

        return $this->created(new FavouriteAddressResource($favourite), 'Address added to favourites.');
    }

    public function destroy(Request $request, FavouriteAddress $favourite)
    {
        $this->authorize('delete', $favourite);
        $favourite->delete();

        return $this->ok(FavouriteAddressResource::collection($request->user()->favouriteAddresses), 'Favourite removed.');
    }
}
