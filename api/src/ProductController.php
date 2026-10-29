<?php

declare(strict_types=1);

namespace App;

class ProductController
{
    public function __construct(
        private readonly ProductRepository $products,
        private readonly Validator $validator,
    ) {
    }

    public function index(): void
    {
        Response::json(['data' => $this->products->all()]);
    }

    public function show(int $id): void
    {
        $row = $this->products->find($id);
        if ($row === null) {
            Response::fail(404, 'Товар не найден');
        }
        Response::json(['data' => $row]);
    }

    public function create(): void
    {
        $parsed = $this->validator->product(Response::readJson());
        if ($parsed['errors'] !== []) {
            Response::fail(422, 'Проверьте поля формы', $parsed['errors']);
        }
        $id = $this->products->create($parsed['data']);
        Response::json(['data' => $this->products->find($id)], 201);
    }

    public function update(int $id): void
    {
        if ($this->products->find($id) === null) {
            Response::fail(404, 'Товар не найден');
        }
        $parsed = $this->validator->product(Response::readJson());
        if ($parsed['errors'] !== []) {
            Response::fail(422, 'Проверьте поля формы', $parsed['errors']);
        }
        $this->products->update($id, $parsed['data']);
        Response::json(['data' => $this->products->find($id)]);
    }

    public function delete(int $id): void
    {
        if ($this->products->find($id) === null) {
            Response::fail(404, 'Товар не найден');
        }
        if ($this->products->orderCount($id) > 0) {
            Response::fail(409, 'Нельзя удалить товар: он указан в заказах');
        }
        $this->products->delete($id);
        Response::json(null, 204);
    }
}
