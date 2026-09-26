<?php

use App\Http\Controllers\Api\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\DriverController as AdminDriverController;
use App\Http\Controllers\Api\Admin\FareSettingsController as AdminFareSettingsController;
use App\Http\Controllers\Api\Admin\VehicleTypeController as AdminVehicleTypeController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\DemoRequestController;
use App\Http\Controllers\Api\FareQuoteController;
use App\Http\Controllers\Api\FareSettingsController;
use App\Http\Controllers\Api\FavouriteAddressController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PaymentMethodController;
use App\Http\Controllers\Api\QuickBookingController;
use App\Http\Controllers\Api\StripeWebhookController;
use App\Http\Controllers\Api\VehicleTypeController;
use Illuminate\Support\Facades\Route;

// -- Public --

Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:register');
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:password-reset');
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:password-reset');

Route::get('/vehicle-types', [VehicleTypeController::class, 'index']);
Route::get('/fare-settings', [FareSettingsController::class, 'show']);
Route::post('/fare-quote', [FareQuoteController::class, 'store']);

Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:contact');
Route::post('/demo-requests', [DemoRequestController::class, 'store'])->middleware('throttle:contact');

// Stripe calls this directly — no auth, verified by signature inside the controller.
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle'])->middleware('throttle:stripe-webhook');

// -- Authenticated --

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::patch('/auth/profile', [AuthController::class, 'updateProfile']);

    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store'])->middleware('throttle:booking-create');
    Route::get('/bookings/{booking}', [BookingController::class, 'show']);
    Route::post('/bookings/{booking}/cancel', [BookingController::class, 'cancel']);

    Route::get('/favourites', [FavouriteAddressController::class, 'index']);
    Route::post('/favourites', [FavouriteAddressController::class, 'store']);
    Route::delete('/favourites/{favourite}', [FavouriteAddressController::class, 'destroy']);

    Route::get('/quick-bookings', [QuickBookingController::class, 'index']);
    Route::post('/quick-bookings', [QuickBookingController::class, 'store']);
    Route::delete('/quick-bookings/{quickBooking}', [QuickBookingController::class, 'destroy']);

    Route::post('/payments/intents', [PaymentController::class, 'createIntent'])->middleware('throttle:payment-intent');
    Route::post('/payments/sumup/charge', [PaymentController::class, 'chargeSumUp'])->middleware('throttle:payment-intent');

    Route::get('/payment-methods', [PaymentMethodController::class, 'index']);
    Route::post('/payment-methods/setup-intent', [PaymentMethodController::class, 'setupIntent']);
    Route::post('/payment-methods/sumup/checkout', [PaymentMethodController::class, 'sumupCheckout'])->middleware('throttle:payment-intent');
    Route::post('/payment-methods/sumup/confirm', [PaymentMethodController::class, 'sumupConfirm'])->middleware('throttle:payment-intent');
    Route::post('/payment-methods', [PaymentMethodController::class, 'store']);
    Route::delete('/payment-methods/{paymentMethod}', [PaymentMethodController::class, 'destroy']);
    Route::post('/payment-methods/{paymentMethod}/default', [PaymentMethodController::class, 'setDefault']);
});

// -- Admin --

Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/stats', [AdminDashboardController::class, 'stats']);

    Route::get('/fare-settings', [AdminFareSettingsController::class, 'show']);
    Route::patch('/fare-settings', [AdminFareSettingsController::class, 'update']);

    Route::get('/drivers', [AdminDriverController::class, 'index']);
    Route::post('/drivers', [AdminDriverController::class, 'store']);
    Route::patch('/drivers/{driver}', [AdminDriverController::class, 'update']);
    Route::delete('/drivers/{driver}', [AdminDriverController::class, 'destroy']);

    Route::get('/vehicle-types', [AdminVehicleTypeController::class, 'index']);
    Route::post('/vehicle-types', [AdminVehicleTypeController::class, 'store']);
    Route::patch('/vehicle-types/{vehicleType}', [AdminVehicleTypeController::class, 'update']);

    Route::get('/bookings', [AdminBookingController::class, 'index']);
    Route::patch('/bookings/{booking}/status', [AdminBookingController::class, 'updateStatus']);
    Route::post('/bookings/{booking}/assign-driver', [AdminBookingController::class, 'assignDriver']);
});
