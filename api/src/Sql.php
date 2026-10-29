<?php

declare(strict_types=1);

namespace App;

use PDO;
use PDOStatement;

class Sql
{
    public static function bindNullable(PDOStatement $statement, string $name, mixed $value, int $type = PDO::PARAM_STR): void
    {
        if ($value === null) {
            $statement->bindValue($name, null, PDO::PARAM_NULL);
            return;
        }

        $statement->bindValue($name, $value, $type);
    }
}
