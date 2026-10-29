<?php

declare(strict_types=1);

use App\BrandController;
use App\BrandRepository;
use App\Database;
use App\EnterpriseController;
use App\EnterpriseRepository;
use App\HttpException;
use App\OrderController;
use App\OrderRepository;
use App\ProductController;
use App\ProductRepository;
use App\ReportController;
use App\ReportRepository;
use App\Response;
use App\Router;
use App\Validator;

require dirname(__DIR__) . '/src/bootstrap.php';

try {
    $db = Database::pdo();
    $validator = new Validator($db);
    $brands = new BrandController(new BrandRepository($db), $validator);
    $products = new ProductController(new ProductRepository($db), $validator);
    $enterprises = new EnterpriseController(new EnterpriseRepository($db), $validator);
    $orders = new OrderController(new OrderRepository($db), $validator);
    $report = new ReportController(new ReportRepository($db));

    $router = new Router();
    $router->add('GET', '#^/api/health$#', static function () use ($db): void {
        $db->query('SELECT 1');
        Response::json(['ok' => true]);
    });

    $router->add('GET', '#^/api/brands$#', static fn () => $brands->index());
    $router->add('POST', '#^/api/brands$#', static fn () => $brands->create());
    $router->add('GET', '#^/api/brands/(\d+)$#', static fn (array $matches) => $brands->show((int) $matches[1]));
    $router->add('PUT', '#^/api/brands/(\d+)$#', static fn (array $matches) => $brands->update((int) $matches[1]));
    $router->add('DELETE', '#^/api/brands/(\d+)$#', static fn (array $matches) => $brands->delete((int) $matches[1]));

    $router->add('GET', '#^/api/products$#', static fn () => $products->index());
    $router->add('POST', '#^/api/products$#', static fn () => $products->create());
    $router->add('GET', '#^/api/products/(\d+)$#', static fn (array $matches) => $products->show((int) $matches[1]));
    $router->add('PUT', '#^/api/products/(\d+)$#', static fn (array $matches) => $products->update((int) $matches[1]));
    $router->add('DELETE', '#^/api/products/(\d+)$#', static fn (array $matches) => $products->delete((int) $matches[1]));

    $router->add('GET', '#^/api/enterprises$#', static fn () => $enterprises->index());
    $router->add('POST', '#^/api/enterprises$#', static fn () => $enterprises->create());
    $router->add('GET', '#^/api/enterprises/(\d+)$#', static fn (array $matches) => $enterprises->show((int) $matches[1]));
    $router->add('PUT', '#^/api/enterprises/(\d+)$#', static fn (array $matches) => $enterprises->update((int) $matches[1]));
    $router->add('DELETE', '#^/api/enterprises/(\d+)$#', static fn (array $matches) => $enterprises->delete((int) $matches[1]));

    $router->add('GET', '#^/api/orders$#', static fn () => $orders->index());
    $router->add('POST', '#^/api/orders$#', static fn () => $orders->create());
    $router->add('GET', '#^/api/orders/(\d+)$#', static fn (array $matches) => $orders->show((int) $matches[1]));
    $router->add('PUT', '#^/api/orders/(\d+)$#', static fn (array $matches) => $orders->update((int) $matches[1]));
    $router->add('DELETE', '#^/api/orders/(\d+)$#', static fn (array $matches) => $orders->delete((int) $matches[1]));

    $router->add('GET', '#^/api/reports/fulfilled-orders/years$#', static fn () => $report->years());
    $router->add('GET', '#^/api/reports/fulfilled-orders$#', static fn () => $report->statement());

    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $requestUri = $_SERVER['REQUEST_URI'] ?? '/';
    $path = parse_url($requestUri, PHP_URL_PATH) ?: '/';
    if (($path === '/index.php' || $path === '/') && isset($_SERVER['REDIRECT_URL'])) {
        $path = $_SERVER['REDIRECT_URL'];
    }
    $path = rtrim($path, '/') ?: '/';
    $router->dispatch($method, $path);
} catch (HttpException $exception) {
    Response::fail($exception->status, $exception->getMessage(), $exception->errors);
} catch (Throwable $exception) {
    error_log($exception->__toString());
    $payload = ['message' => 'Не удалось выполнить операцию'];
    if (getenv('APP_DEBUG') === '1') {
        $payload['detail'] = $exception->getMessage();
    }
    Response::json($payload, 500);
}
