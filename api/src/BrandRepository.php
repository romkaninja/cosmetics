<?php

declare(strict_types=1);

namespace App;

use PDO;

class BrandRepository
{
    public function __construct(private readonly PDO $db)
    {
    }

    public function all(): array
    {
        $rows = $this->db->query('SELECT brand_id, name, description FROM Brand ORDER BY name, brand_id')->fetchAll();

        return array_map($this->map(...), $rows);
    }

    public function find(int $id): ?array
    {
        $statement = $this->db->prepare('SELECT brand_id, name, description FROM Brand WHERE brand_id = ?');
        $statement->execute([$id]);
        $row = $statement->fetch();

        return $row ? $this->map($row) : null;
    }

    public function create(array $data): int
    {
        $statement = $this->db->prepare('INSERT INTO Brand (name, description) VALUES (:name, :description)');
        $statement->bindValue(':name', $data['name']);
        Sql::bindNullable($statement, ':description', $data['description']);
        $statement->execute();

        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): void
    {
        $statement = $this->db->prepare('UPDATE Brand SET name = :name, description = :description WHERE brand_id = :id');
        $statement->bindValue(':name', $data['name']);
        Sql::bindNullable($statement, ':description', $data['description']);
        $statement->bindValue(':id', $id, PDO::PARAM_INT);
        $statement->execute();
    }

    public function delete(int $id): void
    {
        $statement = $this->db->prepare('DELETE FROM Brand WHERE brand_id = ?');
        $statement->execute([$id]);
    }

    public function productCount(int $id): int
    {
        $statement = $this->db->prepare('SELECT COUNT(*) FROM Product WHERE brand_id = ?');
        $statement->execute([$id]);

        return (int) $statement->fetchColumn();
    }

    private function map(array $row): array
    {
        return [
            'brand_id' => (int) $row['brand_id'],
            'name' => $row['name'],
            'description' => $row['description'],
        ];
    }
}
