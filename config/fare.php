<?php

// Fare = base_fare + per_km x km + per_passenger x passengers + waiting charge.
// Waiting is billed per minute at waiting_per_minute, for at most
// max_waiting_minutes (one hour).
return [
    'base_fare' => 7.40,
    'per_km' => 2.20,
    'per_passenger' => 1.00,
    'waiting_per_minute' => 1.00,
    'max_waiting_minutes' => 60,
];
