<?php

declare(strict_types=1);

namespace App;

use PDO;

class OrderRepository
{
    public function __construct(private readonly PDO $db)
    {
    }

    public function all(): array
    {
        $sql = 'SELECT o.order_id, o.order_date, o.quantity, o.delivery_date,
                       o.product_id, p.name AS product_name,
                       o.enterprise_id, e.name AS enterprise_name
                FROM Orders o
                INNER JOIN Product p ON p.product_id = o.product_id
                INNER JOIN Enterprise e ON e.enterprise_id = o.enterprise_id
                ORDER BY o.order_date IS NULL, o.order_date DESC, o.order_id DESC';

        return array_map($this->map(...), $this->db->query($sql)->fetchAll());
    }

    public function find(int $id): ?array
    {
        $sql = 'SELECT o.order_id, o.order_date, o.quantity, o.delivery_date,
                       o.product_id, p.name AS product_name,
                       o.enterprise_id, e.name AS enterprise_name
                FROM Orders o
                INNER JOIN Product p ON p.product_id = o.product_id
                INNER JOIN Enterprise e ON e.enterprise_id = o.enterprise_id
                WHERE o.order_id = ?';
        $statement = $this->db->prepare($sql);
        $statement->execute([$id]);
        $row = $statement->fetch();

        return $row ? $this->map($row) : null;
    }

    public function create(array $data): int
    {
        $sql = 'INSERT INTO Orders (order_date, quantity, delivery_date, product_id, enterprise_id)
                VALUES (:order_date, :quantity, :delivery_date, :product_id, :enterprise_id)';
        $statement = $this->db->prepare($sql);
        $this->bind($statement, $data);
        $statement->execute();

        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): void
    {
        $sql = 'UPDATE Orders
                SET order_date = :order_date,
                    quantity = :quantity,
                    delivery_date = :delivery_date,
                    product_id = :product_id,
                    enterprise_id = :enterprise_id
                WHERE order_id = :id';
        $statement = $this->db->prepare($sql);
        $this->bind($statement, $data);
        $statement->bindValue(':id', $id, PDO::PARAM_INT);
        $statement->execute();
    }

    public function delete(int $id): void
    {
        $statement = $this->db->prepare('DELETE FROM Orders WHERE order_id = ?');
        $statement->execute([$id]);
    }

    private function bind(\PDOStatement $statement, array $data): void
    {
        Sql::bindNullable($statement, ':order_date', $data['order_date']);
        $statement->bindValue(':quantity', $data['quantity'], PDO::PARAM_INT);
        Sql::bindNullable($statement, ':delivery_date', $data['delivery_date']);
        $statement->bindValue(':product_id', $data['product_id'], PDO::PARAM_INT);
        $statement->bindValue(':enterprise_id', $data['enterprise_id'], PDO::PARAM_INT);
    }

    private function map(array $row): array
    {
        return [
            'order_id' => (int) $row['order_id'],
            'order_date' => $row['order_date'],
            'quantity' => $row['quantity'] === null ? null : (int) $row['quantity'],
            'delivery_date' => $row['delivery_date'],
            'product_id' => (int) $row['product_id'],
            'product_name' => $row['product_name'],
            'enterprise_id' => (int) $row['enterprise_id'],
            'enterprise_name' => $row['enterprise_name'],
        ];
    }
}
