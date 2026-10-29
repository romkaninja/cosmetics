FROM php:8.3-apache

RUN docker-php-ext-install pdo_mysql \
    && a2enmod rewrite

COPY docker/php/php.ini /usr/local/etc/php/conf.d/app.ini
COPY docker/php/apache.conf /etc/apache2/sites-available/000-default.conf
COPY api/ /var/www/html/
