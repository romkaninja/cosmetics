<?php

declare(strict_types=1);

namespace App;

class EnterpriseController
{
    public function __construct(
        private readonly EnterpriseRepository $enterprises,
        private readonly Validator $validator,
    ) {
    }

    public function index(): void
    {
        Response::json(['data' => $this->enterprises->all()]);
    }

    public function show(int $id): void
    {
        $row = $this->enterprises->find($id);
        if ($row === null) {
            Response::fail(404, 'Предприятие не найдено');
        }
        Response::json(['data' => $row]);
    }

    public function create(): void
    {
        $parsed = $this->validator->enterprise(Response::readJson());
        if ($parsed['errors'] !== []) {
            Response::fail(422, 'Проверьте поля формы', $parsed['errors']);
        }
        $id = $this->enterprises->create($parsed['data']);
        Response::json(['data' => $this->enterprises->find($id)], 201);
    }

    public function update(int $id): void
    {
        if ($this->enterprises->find($id) === null) {
            Response::fail(404, 'Предприятие не найдено');
        }
        $parsed = $this->validator->enterprise(Response::readJson());
        if ($parsed['errors'] !== []) {
            Response::fail(422, 'Проверьте поля формы', $parsed['errors']);
        }
        $this->enterprises->update($id, $parsed['data']);
        Response::json(['data' => $this->enterprises->find($id)]);
    }

    public function delete(int $id): void
    {
        if ($this->enterprises->find($id) === null) {
            Response::fail(404, 'Предприятие не найдено');
        }
        if ($this->enterprises->orderCount($id) > 0) {
            Response::fail(409, 'Нельзя удалить предприятие: на него оформлены заказы');
        }
        $this->enterprises->delete($id);
        Response::json(null, 204);
    }
}
