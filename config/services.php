<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'stripe' => [
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
    ],

    'sumup' => [
        'api_key' => env('SUMUP_API_KEY'),
        'merchant_code' => env('SUMUP_MERCHANT_CODE'),
        'base_url' => env('SUMUP_BASE_URL', 'https://api.sumup.com'),
        'setup_amount' => (float) env('SUMUP_SETUP_AMOUNT', 0),
    ],

    'frontend' => [
        'url' => env('FRONTEND_URL', 'http://localhost:5173'),
    ],

    'admin' => [
        'notification_email' => env('ADMIN_NOTIFICATION_EMAIL'),
    ],

];
