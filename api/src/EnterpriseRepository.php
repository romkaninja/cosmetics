<?php

declare(strict_types=1);

namespace App;

use PDO;

class EnterpriseRepository
{
    public function __construct(private readonly PDO $db)
    {
    }

    public function all(): array
    {
        $rows = $this->db->query(
            'SELECT enterprise_id, name, phone, address FROM Enterprise ORDER BY name, enterprise_id'
        )->fetchAll();

        return array_map($this->map(...), $rows);
    }

    public function find(int $id): ?array
    {
        $statement = $this->db->prepare(
            'SELECT enterprise_id, name, phone, address FROM Enterprise WHERE enterprise_id = ?'
        );
        $statement->execute([$id]);
        $row = $statement->fetch();

        return $row ? $this->map($row) : null;
    }

    public function create(array $data): int
    {
        $statement = $this->db->prepare(
            'INSERT INTO Enterprise (name, phone, address) VALUES (:name, :phone, :address)'
        );
        $this->bind($statement, $data);
        $statement->execute();

        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): void
    {
        $statement = $this->db->prepare(
            'UPDATE Enterprise SET name = :name, phone = :phone, address = :address WHERE enterprise_id = :id'
        );
        $this->bind($statement, $data);
        $statement->bindValue(':id', $id, PDO::PARAM_INT);
        $statement->execute();
    }

    public function delete(int $id): void
    {
        $statement = $this->db->prepare('DELETE FROM Enterprise WHERE enterprise_id = ?');
        $statement->execute([$id]);
    }

    public function orderCount(int $id): int
    {
        $statement = $this->db->prepare('SELECT COUNT(*) FROM Orders WHERE enterprise_id = ?');
        $statement->execute([$id]);

        return (int) $statement->fetchColumn();
    }

    private function bind(\PDOStatement $statement, array $data): void
    {
        $statement->bindValue(':name', $data['name']);
        Sql::bindNullable($statement, ':phone', $data['phone']);
        Sql::bindNullable($statement, ':address', $data['address']);
    }

    private function map(array $row): array
    {
        return [
            'enterprise_id' => (int) $row['enterprise_id'],
            'name' => $row['name'],
            'phone' => $row['phone'],
            'address' => $row['address'],
        ];
    }
}
