<?php

namespace App\Services;

use App\Models\Setting;

/**
 * Fare rates the admin can change. Values saved in the `settings` table win;
 * config/fare.php supplies the defaults until something has been saved.
 * `max_waiting_minutes` is deliberately not editable (waiting is billed for
 * one hour at most).
 */
class FareSettings
{
    public const EDITABLE = ['base_fare', 'per_km', 'per_passenger', 'waiting_per_minute'];

    /**
     * @return array{base_fare: float, per_km: float, per_passenger: float, waiting_per_minute: float, max_waiting_minutes: int}
     */
    public function all(): array
    {
        $stored = Setting::whereIn('key', array_map(fn ($k) => "fare.$k", self::EDITABLE))
            ->pluck('value', 'key');

        $rates = [];
        foreach (self::EDITABLE as $key) {
            $rates[$key] = (float) ($stored["fare.$key"] ?? config("fare.$key"));
        }

        return $rates + ['max_waiting_minutes' => (int) config('fare.max_waiting_minutes')];
    }

    public function update(array $values): array
    {
        foreach (self::EDITABLE as $key) {
            if (array_key_exists($key, $values)) {
                Setting::updateOrCreate(['key' => "fare.$key"], ['value' => (string) $values[$key]]);
            }
        }

        return $this->all();
    }

    /**
     * Camel-cased shape shared by the public and admin endpoints.
     */
    public function toResponse(): array
    {
        $a = $this->all();

        return [
            'baseFare' => $a['base_fare'],
            'perKm' => $a['per_km'],
            'perPassenger' => $a['per_passenger'],
            'waitingPerMinute' => $a['waiting_per_minute'],
            'maxWaitingMinutes' => $a['max_waiting_minutes'],
        ];
    }
}
