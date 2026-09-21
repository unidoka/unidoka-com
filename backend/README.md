# Backend Template (FastAPI Microservices)

[English version](#english) | [Русская версия](#russian)

## English Version

### Project Concept
This template provides a ready-to-use environment for developing scalable microservices using **FastAPI**. It includes infrastructure for database management (PostgreSQL), caching storage (Valkey), and reverse proxying (Nginx). The architecture supports polyglot development but is currently optimized for Python services.

### Tech Stack
*   **Framework**: FastAPI
*   **Database**: PostgreSQL
*   **Cache/Queue**: Valkey (Redis-compatible)
*   **ORM**: SQLAlchemy 2.0
*   **Migrations**: Alembic
*   **Proxy**: Nginx
*   **Containerization**: Docker & Docker Compose

## Quick Start

### Clone the repository

```bash
git clone git@github.com:unidoka/simplebase.git
cd simplebase
```

### Configure Enviroment

Copy the example env file and fill in your secrets (JWT keys, DB passwords, SMTP credentials):

```bash
cp .env.example .env
```

### Run Services

Build and start all containers in detached mode:

```bash
docker compose up -d --build
```

### Access the API
- Swagger: http://localhost/docs
- Health check: http://localhost/health
- Main Service: http://localhost/api/main/v1


# Шаблон бэкенда (микросервисы на FastAPI)

[English version](#english) | [Русская версия](#russian)

## Русская версия

### Концепция проекта
Этот шаблон предоставляет готовую среду для разработки масштабируемых микросервисов с использованием **FastAPI**. Он включает инфраструктуру для управления базами данных (PostgreSQL), кэширования (Valkey) и обратного проксирования (Nginx). Архитектура поддерживает полиглотную разработку, но в настоящее время оптимизирована для сервисов на Python.

### Технологический стек
*   **Фреймворк**: FastAPI
*   **База данных**: PostgreSQL
*   **Кэш/Очередь**: Valkey (совместим с Redis)
*   **ORM**: SQLAlchemy 2.0
*   **Миграции**: Alembic
*   **Прокси-сервер**: Nginx
*   **Контейнеризация**: Docker и Docker Compose

## Быстрый старт

### Клонирование репозитория

```bash
git clone git@github.com:unidoka/simplebase.git
cd simplebase
```

### Настройка окружения

Скопируйте пример файла переменных окружения и заполните его секретными данными (ключи JWT, пароли БД, учетные данные SMTP):

```bash
cp .env.example .env
```

### Запуск сервисов

Соберите и запустите все контейнеры в фоновом режиме:

```bash
docker compose up -d --build
```

```bash
docker exec -it main-service alembic upgrade head
```

### Доступ к API
- Swagger: http://localhost/docs
- Health check: http://localhost/health
- Main Service: http://localhost/api/main/v1
