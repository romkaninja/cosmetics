<?php

declare(strict_types=1);

namespace App;

use PDO;

class ProductRepository
{
    public function __construct(private readonly PDO $db)
    {
    }

    public function all(): array
    {
        $sql = 'SELECT p.product_id, p.name, p.description, p.price, p.brand_id, b.name AS brand_name
                FROM Product p
                LEFT JOIN Brand b ON b.brand_id = p.brand_id
                ORDER BY p.name, p.product_id';

        return array_map($this->map(...), $this->db->query($sql)->fetchAll());
    }

    public function find(int $id): ?array
    {
        $sql = 'SELECT p.product_id, p.name, p.description, p.price, p.brand_id, b.name AS brand_name
                FROM Product p
                LEFT JOIN Brand b ON b.brand_id = p.brand_id
                WHERE p.product_id = ?';
        $statement = $this->db->prepare($sql);
        $statement->execute([$id]);
        $row = $statement->fetch();

        return $row ? $this->map($row) : null;
    }

    public function create(array $data): int
    {
        $sql = 'INSERT INTO Product (name, description, price, brand_id)
                VALUES (:name, :description, :price, :brand_id)';
        $statement = $this->db->prepare($sql);
        $this->bind($statement, $data);
        $statement->execute();

        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): void
    {
        $sql = 'UPDATE Product
                SET name = :name, description = :description, price = :price, brand_id = :brand_id
                WHERE product_id = :id';
        $statement = $this->db->prepare($sql);
        $this->bind($statement, $data);
        $statement->bindValue(':id', $id, PDO::PARAM_INT);
        $statement->execute();
    }

    public function delete(int $id): void
    {
        $statement = $this->db->prepare('DELETE FROM Product WHERE product_id = ?');
        $statement->execute([$id]);
    }

    public function orderCount(int $id): int
    {
        $statement = $this->db->prepare('SELECT COUNT(*) FROM Orders WHERE product_id = ?');
        $statement->execute([$id]);

        return (int) $statement->fetchColumn();
    }

    private function bind(\PDOStatement $statement, array $data): void
    {
        $statement->bindValue(':name', $data['name']);
        Sql::bindNullable($statement, ':description', $data['description']);
        Sql::bindNullable($statement, ':price', $data['price']);
        Sql::bindNullable($statement, ':brand_id', $data['brand_id'], PDO::PARAM_INT);
    }

    private function map(array $row): array
    {
        return [
            'product_id' => (int) $row['product_id'],
            'name' => $row['name'],
            'description' => $row['description'],
            'price' => $row['price'] === null ? null : Money::fromCents(Money::toCents((string) $row['price'])),
            'brand_id' => $row['brand_id'] === null ? null : (int) $row['brand_id'],
            'brand_name' => $row['brand_name'],
        ];
    }
}
