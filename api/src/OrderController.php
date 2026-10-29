<?php

declare(strict_types=1);

namespace App;

class OrderController
{
    public function __construct(
        private readonly OrderRepository $orders,
        private readonly Validator $validator,
    ) {
    }

    public function index(): void
    {
        Response::json(['data' => $this->orders->all()]);
    }

    public function show(int $id): void
    {
        $row = $this->orders->find($id);
        if ($row === null) {
            Response::fail(404, 'Заказ не найден');
        }
        Response::json(['data' => $row]);
    }

    public function create(): void
    {
        $parsed = $this->validator->order(Response::readJson());
        if ($parsed['errors'] !== []) {
            Response::fail(422, 'Проверьте поля формы', $parsed['errors']);
        }
        $id = $this->orders->create($parsed['data']);
        Response::json(['data' => $this->orders->find($id)], 201);
    }

    public function update(int $id): void
    {
        if ($this->orders->find($id) === null) {
            Response::fail(404, 'Заказ не найден');
        }
        $parsed = $this->validator->order(Response::readJson());
        if ($parsed['errors'] !== []) {
            Response::fail(422, 'Проверьте поля формы', $parsed['errors']);
        }
        $this->orders->update($id, $parsed['data']);
        Response::json(['data' => $this->orders->find($id)]);
    }

    public function delete(int $id): void
    {
        if ($this->orders->find($id) === null) {
            Response::fail(404, 'Заказ не найден');
        }
        $this->orders->delete($id);
        Response::json(null, 204);
    }
}
