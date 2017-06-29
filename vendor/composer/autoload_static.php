<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInit0d2a1ca305d12238d11d6b4b6cb92e8d
{
    public static $prefixLengthsPsr4 = array (
        'S' => 
        array (
            'Stripe\\' => 7,
        ),
    );

    public static $prefixDirsPsr4 = array (
        'Stripe\\' => 
        array (
            0 => __DIR__ . '/..' . '/stripe/stripe-php/lib',
        ),
    );

    public static function getInitializer(ClassLoader $loader)
    {
        return \Closure::bind(function () use ($loader) {
            $loader->prefixLengthsPsr4 = ComposerStaticInit0d2a1ca305d12238d11d6b4b6cb92e8d::$prefixLengthsPsr4;
            $loader->prefixDirsPsr4 = ComposerStaticInit0d2a1ca305d12238d11d6b4b6cb92e8d::$prefixDirsPsr4;

        }, null, ClassLoader::class);
    }
}