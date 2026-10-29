<?php

declare(strict_types=1);

namespace App;

class BrandController
{
    public function __construct(
        private readonly BrandRepository $brands,
        private readonly Validator $validator,
    ) {
    }

    public function index(): void
    {
        Response::json(['data' => $this->brands->all()]);
    }

    public function show(int $id): void
    {
        $row = $this->brands->find($id);
        if ($row === null) {
            Response::fail(404, 'Бренд не найден');
        }
        Response::json(['data' => $row]);
    }

    public function create(): void
    {
        $parsed = $this->validator->brand(Response::readJson());
        if ($parsed['errors'] !== []) {
            Response::fail(422, 'Проверьте поля формы', $parsed['errors']);
        }
        $id = $this->brands->create($parsed['data']);
        Response::json(['data' => $this->brands->find($id)], 201);
    }

    public function update(int $id): void
    {
        if ($this->brands->find($id) === null) {
            Response::fail(404, 'Бренд не найден');
        }
        $parsed = $this->validator->brand(Response::readJson());
        if ($parsed['errors'] !== []) {
            Response::fail(422, 'Проверьте поля формы', $parsed['errors']);
        }
        $this->brands->update($id, $parsed['data']);
        Response::json(['data' => $this->brands->find($id)]);
    }

    public function delete(int $id): void
    {
        if ($this->brands->find($id) === null) {
            Response::fail(404, 'Бренд не найден');
        }
        if ($this->brands->productCount($id) > 0) {
            Response::fail(409, 'Нельзя удалить бренд: есть товары этого бренда');
        }
        $this->brands->delete($id);
        Response::json(null, 204);
    }
}
