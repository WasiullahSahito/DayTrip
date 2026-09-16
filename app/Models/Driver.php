<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Driver extends Model
{
    use HasFactory;

    /**
     * Safe as $guarded = ['id'] (like VehicleType) — every write to this
     * model goes through an admin-only, validated FormRequest; nothing ever
     * mass-assigns it from unvalidated input.
     */
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'rating' => 'decimal:1',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return HasMany<Booking, $this>
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * The single source of truth for what gets copied into
     * Booking::driver_snapshot — used by both the automatic random-pick
     * assignment and the admin's manual reassignment, so the two paths can
     * never produce differently-shaped snapshots.
     */
    public function toSnapshot(): array
    {
        return [
            'name' => $this->name,
            'rating' => (float) $this->rating,
            'reg' => $this->reg,
            'car' => $this->car,
            'color' => $this->color,
        ];
    }
}
