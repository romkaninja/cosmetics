<?php

declare(strict_types=1);

namespace App;

class ReportController
{
    public function __construct(private readonly ReportRepository $reports)
    {
    }

    public function years(): void
    {
        Response::json(['data' => $this->reports->years()]);
    }

    public function statement(): void
    {
        $year = $_GET['year'] ?? '';
        if (!is_string($year) || !preg_match('/^\d{4}$/', $year)) {
            Response::fail(422, 'Укажите год из списка');
        }
        Response::json(['data' => $this->reports->statement((int) $year)]);
    }
}
