<?php

declare(strict_types=1);

namespace App;

use PDO;
use PDOException;

class Database
{
    private static ?PDO $pdo = null;

    public static function pdo(): PDO
    {
        if (self::$pdo instanceof PDO) {
            return self::$pdo;
        }

        $last = null;
        for ($attempt = 1; $attempt <= 15; $attempt++) {
            try {
                self::$pdo = self::connect();
                return self::$pdo;
            } catch (PDOException $exception) {
                $last = $exception;
                $message = $exception->getMessage();
                $retryable = str_contains($message, '[2002]')
                    || str_contains($message, '[2006]')
                    || str_contains($message, 'Connection refused');
                if (!$retryable || $attempt === 15) {
                    throw $exception;
                }
                sleep(1);
            }
        }

        throw $last instanceof PDOException
            ? $last
            : new PDOException('Нет подключения к базе данных');
    }

    private static function connect(): PDO
    {
        $host = self::env('DB_HOST', '127.0.0.1');
        $port = self::env('DB_PORT', '3306');
        $name = self::env('DB_NAME', 'lab_orders');
        $user = self::env('DB_USER', 'root');
        $password = getenv('DB_PASSWORD');
        if ($password === false) {
            $password = '';
        }

        $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $name);

        return new PDO($dsn, $user, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }

    private static function env(string $name, string $default): string
    {
        $value = getenv($name);
        if ($value === false || $value === '') {
            return $default;
        }

        return $value;
    }
}
