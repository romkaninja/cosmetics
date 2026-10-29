<?php

declare(strict_types=1);

namespace App;

class Response
{
    public static function json(mixed $data, int $status = 200): never
    {
        http_response_code($status);
        if ($status !== 204) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
        }
        exit;
    }

    public static function readJson(): array
    {
        $raw = file_get_contents('php://input');
        if ($raw === false || trim($raw) === '') {
            return [];
        }

        try {
            $data = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            self::json(['message' => 'Ожидался корректный JSON'], 400);
        }

        if (!is_array($data)) {
            self::json(['message' => 'Ожидался JSON-объект'], 400);
        }

        return $data;
    }

    public static function fail(int $status, string $message, array $errors = []): never
    {
        $payload = ['message' => $message];
        if ($errors !== []) {
            $payload['errors'] = $errors;
        }
        self::json($payload, $status);
    }
}
