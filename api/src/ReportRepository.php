<?php

declare(strict_types=1);

namespace App;

use PDO;

class ReportRepository
{
    public function __construct(private readonly PDO $db)
    {
    }

    /** @return list<int> */
    public function years(): array
    {
        $rows = $this->db->query(
            'SELECT DISTINCT YEAR(delivery_date) AS report_year
             FROM Orders
             WHERE delivery_date IS NOT NULL
             ORDER BY report_year'
        )->fetchAll();

        return array_map(static fn (array $row): int => (int) $row['report_year'], $rows);
    }

    public function statement(int $year): array
    {
        if (!in_array($year, $this->years(), true)) {
            throw new HttpException(422, 'Выберите год из списка');
        }

        $statement = $this->db->prepare(
            'SELECT e.enterprise_id,
                    e.name AS enterprise_name,
                    p.name AS product_name,
                    b.name AS brand_name,
                    o.delivery_date,
                    o.quantity,
                    p.price
             FROM Orders o
             INNER JOIN Product p ON p.product_id = o.product_id
             INNER JOIN Enterprise e ON e.enterprise_id = o.enterprise_id
             LEFT JOIN Brand b ON b.brand_id = p.brand_id
             WHERE o.delivery_date IS NOT NULL
               AND YEAR(o.delivery_date) = :year
             ORDER BY e.name, o.delivery_date, p.name, o.order_id'
        );
        $statement->bindValue(':year', $year, PDO::PARAM_INT);
        $statement->execute();

        $groups = [];
        $grandQuantity = 0;
        $grandCents = 0;

        foreach ($statement->fetchAll() as $row) {
            $enterpriseId = (int) $row['enterprise_id'];
            if (!isset($groups[$enterpriseId])) {
                $groups[$enterpriseId] = [
                    'enterprise_id' => $enterpriseId,
                    'enterprise_name' => $row['enterprise_name'],
                    'rows' => [],
                    'totals' => ['quantity' => 0, 'cost' => '0.00'],
                    '_cents' => 0,
                ];
            }

            $quantity = $row['quantity'] === null ? 0 : (int) $row['quantity'];
            $cost = null;
            if ($row['price'] !== null) {
                $cents = Money::toCents((string) $row['price']) * $quantity;
                $cost = Money::fromCents($cents);
                $groups[$enterpriseId]['_cents'] += $cents;
                $grandCents += $cents;
            }

            $groups[$enterpriseId]['rows'][] = [
                'product_name' => $row['product_name'],
                'brand_name' => $row['brand_name'],
                'delivery_date' => $row['delivery_date'],
                'quantity' => $quantity,
                'price' => $row['price'] === null ? null : Money::fromCents(Money::toCents((string) $row['price'])),
                'cost' => $cost,
            ];
            $groups[$enterpriseId]['totals']['quantity'] += $quantity;
            $grandQuantity += $quantity;
        }

        foreach ($groups as &$group) {
            $group['totals']['cost'] = Money::fromCents($group['_cents']);
            unset($group['_cents']);
        }
        unset($group);

        return [
            'year' => $year,
            'groups' => array_values($groups),
            'totals' => [
                'quantity' => $grandQuantity,
                'cost' => Money::fromCents($grandCents),
            ],
        ];
    }
}
