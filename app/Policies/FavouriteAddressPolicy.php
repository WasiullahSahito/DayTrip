<?php

namespace App\Policies;

use App\Models\FavouriteAddress;
use App\Models\User;

class FavouriteAddressPolicy
{
    public function delete(User $user, FavouriteAddress $favourite): bool
    {
        return $user->id === $favourite->user_id;
    }
}
