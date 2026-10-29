<?php

declare(strict_types=1);

namespace App;

use PDO;

class Validator
{
    public function __construct(private readonly PDO $db)
    {
    }

    /** @return array{errors: array<string, string>, data: array<string, mixed>} */
    public function brand(array $input): array
    {
        $errors = [];
        $name = $this->requiredText($input['name'] ?? null, 'name', 'Укажите название бренда', 100, $errors);
        $description = $this->optionalText($input['description'] ?? null, 'description', 5000, $errors);

        return [
            'errors' => $errors,
            'data' => [
                'name' => $name,
                'description' => $description,
            ],
        ];
    }

    /** @return array{errors: array<string, string>, data: array<string, mixed>} */
    public function product(array $input): array
    {
        $errors = [];
        $name = $this->requiredText($input['name'] ?? null, 'name', 'Укажите наименование товара', 100, $errors);
        $description = $this->optionalText($input['description'] ?? null, 'description', 5000, $errors);
        $price = $this->price($input['price'] ?? null, $errors);
        $brandId = $this->optionalForeignKey(
            $input['brand_id'] ?? null,
            'brand_id',
            'SELECT 1 FROM Brand WHERE brand_id = ?',
            'Выберите бренд из списка',
            $errors,
        );

        return [
            'errors' => $errors,
            'data' => [
                'name' => $name,
                'description' => $description,
                'price' => $price,
                'brand_id' => $brandId,
            ],
        ];
    }

    /** @return array{errors: array<string, string>, data: array<string, mixed>} */
    public function enterprise(array $input): array
    {
        $errors = [];
        $name = $this->requiredText($input['name'] ?? null, 'name', 'Укажите наименование предприятия', 150, $errors);
        $phone = $this->phone($input['phone'] ?? null, $errors);
        $address = $this->optionalText($input['address'] ?? null, 'address', 255, $errors);

        return [
            'errors' => $errors,
            'data' => [
                'name' => $name,
                'phone' => $phone,
                'address' => $address,
            ],
        ];
    }

    /** @return array{errors: array<string, string>, data: array<string, mixed>} */
    public function order(array $input): array
    {
        $errors = [];
        $productId = $this->requiredForeignKey(
            $input['product_id'] ?? null,
            'product_id',
            'SELECT 1 FROM Product WHERE product_id = ?',
            'Выберите товар',
            'Выбранный товар не найден',
            $errors,
        );
        $enterpriseId = $this->requiredForeignKey(
            $input['enterprise_id'] ?? null,
            'enterprise_id',
            'SELECT 1 FROM Enterprise WHERE enterprise_id = ?',
            'Выберите предприятие',
            'Выбранное предприятие не найдено',
            $errors,
        );
        $quantity = $this->quantity($input['quantity'] ?? null, $errors);
        $orderDate = $this->date($input['order_date'] ?? null, 'order_date', 'дату заказа', $errors);
        $deliveryDate = $this->date($input['delivery_date'] ?? null, 'delivery_date', 'дату исполнения', $errors);

        if (!isset($errors['order_date']) && !isset($errors['delivery_date']) && $orderDate !== null && $deliveryDate !== null && $deliveryDate < $orderDate) {
            $errors['delivery_date'] = 'Дата исполнения не может быть раньше даты заказа';
        }

        return [
            'errors' => $errors,
            'data' => [
                'order_date' => $orderDate,
                'quantity' => $quantity,
                'delivery_date' => $deliveryDate,
                'product_id' => $productId,
                'enterprise_id' => $enterpriseId,
            ],
        ];
    }

    /** @param array<string, string> $errors */
    private function requiredText(mixed $value, string $field, string $emptyMessage, int $max, array &$errors): string
    {
        $text = trim((string) ($value ?? ''));
        if ($text === '') {
            $errors[$field] = $emptyMessage;
            return '';
        }
        if ($this->length($text) > $max) {
            $errors[$field] = 'Не длиннее ' . $max . ' символов';
        }

        return $text;
    }

    /** @param array<string, string> $errors */
    private function optionalText(mixed $value, string $field, int $max, array &$errors): ?string
    {
        $text = trim((string) ($value ?? ''));
        if ($text === '') {
            return null;
        }
        if ($this->length($text) > $max) {
            $errors[$field] = 'Не длиннее ' . $max . ' символов';
        }

        return $text;
    }

    /** @param array<string, string> $errors */
    private function phone(mixed $value, array &$errors): ?string
    {
        $text = trim((string) ($value ?? ''));
        if ($text === '') {
            return null;
        }
        if ($this->length($text) > 20 || !preg_match('/^[0-9+\-()\s]{5,20}$/u', $text)) {
            $errors['phone'] = 'Телефон: от 5 до 20 символов, цифры, пробел, +, скобки и дефис';
        }

        return $text;
    }

    /** @param array<string, string> $errors */
    private function price(mixed $value, array &$errors): ?string
    {
        if ($value === null || (is_string($value) && trim($value) === '')) {
            return null;
        }

        $normalized = Money::normalize((string) $value);
        if ($normalized === null) {
            $errors['price'] = 'Укажите цену числом не меньше нуля, не больше двух знаков после запятой и не больше 99999999.99';
            return null;
        }

        return $normalized;
    }

    /** @param array<string, string> $errors */
    private function quantity(mixed $value, array &$errors): ?int
    {
        if ($value === null || $value === '') {
            $errors['quantity'] = 'Укажите количество товара';
            return null;
        }
        if (is_string($value) && !preg_match('/^\d+$/', $value)) {
            $errors['quantity'] = 'Количество должно быть целым числом от 1 до 1000000';
            return null;
        }
        if (is_float($value)) {
            $errors['quantity'] = 'Количество должно быть целым числом от 1 до 1000000';
            return null;
        }

        $number = filter_var($value, FILTER_VALIDATE_INT);
        if ($number === false || $number < 1 || $number > 1000000) {
            $errors['quantity'] = 'Количество должно быть целым числом от 1 до 1000000';
            return null;
        }

        return $number;
    }

    /** @param array<string, string> $errors */
    private function date(mixed $value, string $field, string $label, array &$errors): ?string
    {
        $text = trim((string) ($value ?? ''));
        if ($text === '') {
            return null;
        }

        $date = \DateTimeImmutable::createFromFormat('!Y-m-d', $text);
        $last = \DateTimeImmutable::getLastErrors();
        $broken = $last !== false && ($last['warning_count'] > 0 || $last['error_count'] > 0);
        if (!$date || $broken || $date->format('Y-m-d') !== $text) {
            $errors[$field] = 'Укажите ' . $label . ' в формате ГГГГ-ММ-ДД';
            return null;
        }

        return $text;
    }

    /** @param array<string, string> $errors */
    private function optionalForeignKey(mixed $value, string $field, string $sql, string $invalidMessage, array &$errors): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        $id = $this->positiveInt($value);
        if ($id === null || !$this->exists($sql, $id)) {
            $errors[$field] = $invalidMessage;
            return null;
        }

        return $id;
    }

    /** @param array<string, string> $errors */
    private function requiredForeignKey(
        mixed $value,
        string $field,
        string $sql,
        string $emptyMessage,
        string $missingMessage,
        array &$errors,
    ): ?int {
        if ($value === null || $value === '') {
            $errors[$field] = $emptyMessage;
            return null;
        }

        $id = $this->positiveInt($value);
        if ($id === null) {
            $errors[$field] = $missingMessage;
            return null;
        }
        if (!$this->exists($sql, $id)) {
            $errors[$field] = $missingMessage;
            return null;
        }

        return $id;
    }

    private function positiveInt(mixed $value): ?int
    {
        if (is_string($value) && !preg_match('/^\d+$/', $value)) {
            return null;
        }
        if (is_float($value)) {
            return null;
        }

        $number = filter_var($value, FILTER_VALIDATE_INT);
        if ($number === false || $number < 1) {
            return null;
        }

        return $number;
    }

    private function length(string $text): int
    {
        if (function_exists('mb_strlen')) {
            return mb_strlen($text);
        }

        $count = preg_match_all('/./u', $text);

        return $count === false ? 0 : $count;
    }

    private function exists(string $sql, int $id): bool
    {
        $statement = $this->db->prepare($sql);
        $statement->execute([$id]);

        return (bool) $statement->fetchColumn();
    }
}
