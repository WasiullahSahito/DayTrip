<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Booking extends Model
{
    use HasFactory;

    public const CANCELLABLE_STATUSES = [
        'pending_payment', 'confirmed', 'searching', 'driver_assigned', 'driver_en_route',
    ];

    /**
     * Deliberately narrow. `reference`, `user_id`, `fare`, `status`,
     * `driver_id`, and `driver_snapshot` are never set from request input —
     * the booking service assigns them explicitly after server-side
     * calculation, so they're excluded here even though nothing currently
     * mass-assigns this model from raw request data.
     */
    protected $fillable = [
        'vehicle_type_id', 'pickup', 'destination', 'stops', 'distance_km', 'duration_min',
        'currency', 'passenger_name', 'phone', 'notes', 'flight_number', 'confirmation_email',
        'return_journey', 'payment_method', 'scheduled_for', 'is_scheduled', 'idempotency_key',
    ];

    protected function casts(): array
    {
        return [
            'pickup' => 'array',
            'destination' => 'array',
            'stops' => 'array',
            'return_journey' => 'array',
            'driver_snapshot' => 'array',
            'distance_km' => 'decimal:2',
            'fare' => 'decimal:2',
            'is_scheduled' => 'boolean',
            'scheduled_for' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<VehicleType, $this>
     */
    public function vehicleType(): BelongsTo
    {
        return $this->belongsTo(VehicleType::class);
    }

    /**
     * @return BelongsTo<Driver, $this>
     */
    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    /**
     * @return HasOne<Payment, $this>
     */
    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function isCancellable(): bool
    {
        return in_array($this->status, self::CANCELLABLE_STATUSES, true);
    }

    public function isPayable(): bool
    {
        return $this->payment_method === 'card' && $this->status === 'pending_payment';
    }
}
