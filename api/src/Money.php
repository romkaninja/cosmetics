<?php

declare(strict_types=1);

namespace App;

class Money
{
    public const MAX_CENTS = 9999999999;

    public static function normalize(string $text): ?string
    {
        $text = str_replace(',', '.', trim($text));
        if ($text === '') {
            return null;
        }
        if (!preg_match('/^\d{1,8}(?:\.\d{1,2})?$/', $text)) {
            return null;
        }

        $cents = self::toCents($text);
        if ($cents > self::MAX_CENTS) {
            return null;
        }

        return self::fromCents($cents);
    }

    public static function toCents(string $text): int
    {
        $text = str_replace(',', '.', trim($text));
        [$whole, $fraction] = array_pad(explode('.', $text, 2), 2, '0');
        $fraction = substr(str_pad($fraction, 2, '0'), 0, 2);

        return ((int) $whole) * 100 + (int) $fraction;
    }

    public static function fromCents(int $cents): string
    {
        $sign = $cents < 0 ? '-' : '';
        $cents = abs($cents);

        return $sign . intdiv($cents, 100) . '.' . str_pad((string) ($cents % 100), 2, '0', STR_PAD_LEFT);
    }
}
