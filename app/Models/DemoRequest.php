<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DemoRequest extends Model
{
    protected $fillable = ['company_name', 'name', 'email', 'phone', 'business_type', 'users_count', 'message'];
}
