Simple CRUD API (in-memory)

REST-сервер для управления пользователями (in-memory). Реализованы CRUD-эндпоинты, корректная обработка ошибок и запуск в dev/prod режимах. Порт берётся из .env.

Требования
Node.js: 24.10.0 или выше (24.x.x).
Пакетный менеджер: npm.
Разрешённые зависимости по заданию (см. package.json).

Hacker Scope  There is horizontal scaling for application with a load balancer 
are not implemented!

Установка 
git clone <url-репозитория>
cd simple-crud-api
npm install

Конфигурация

Создай файл .env (в репозиторий не коммитится) на основе примера:

.env.example 
PORT=4000
PORT — порт HTTP-сервера (по умолчанию 4000).

Скрипты

В проекте уже настроены следующие команды:
- npm run build           # Компиляция TypeScript в dist/
- npm run start:dev       # Dev-режим: ts-node + nodemon, без сборки
- npm run start:dev:build # Вотчер компилятора TypeScript (опционально, параллельно с dev)
- npm run start:prod      # Prod-режим: build -> node dist/server.js
- npm test                # Тесты (Node test runner + ts-node loader)

Запуск
Development
# в корне проекта
cp .env.example .env   # при необходимости
npm run start:dev

# ожидаемый вывод: сервер слушает http://localhost:4000 (если PORT=4000)

Production
# в корне проекта
cp .env.example .env   # при необходимости
npm run start:prod

API
Базовый URL: /api/users
Модель пользователя
id: string (uuid)      # генерируется на сервере
username: string       # обязательное поле
age: number            # обязательное поле
hobbies: string[]      # обязательное поле (может быть пустым массивом)

Эндпоинты и статусы
рекомендую использовать bash

- curl -i http://localhost:4000/api/users
- GET /api/users → 200 OK — список пользователей (может быть пустой массив).


- GET /api/users/{userId}
- ID="<вставь_id_из_POST /api/users>"
- curl -i http://localhost:4000/api/users/$ID
- 200 OK — пользователь найден.


- POST /api/users
- curl -i -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"Alice","age":30,"hobbies":["reading"]}'
- Body: { username, age, hobbies }
- 201 Created — созданная запись (включая id).


- PUT /api/users/{userId}
- curl -i -X PUT http://localhost:4000/api/users/$ID \
  -H "Content-Type: application/json" \
  -d '{"username":"Alice Updated","age":31,"hobbies":["reading","sport"]}'
- Body: { username, age, hobbies }
- 200 OK — обновлённая запись.


- DELETE /api/users/{userId}
- curl -i -X DELETE http://localhost:4000/api/users/$ID
- 204 No Content — запись удалена.

- curl -i http://localhost:4000/api/users/not-a-uuid
- 400 Bad Request — userId невалидный.

- curl -i http://localhost:4000/api/users/$ID
- 404 Not Found — запись не найдена.

- Немаршрутные запросы
- curl -i http://localhost:4000/some-non/existing/resource
- Любой неизвестный путь → 404 Not Found с сообщением.

- Ошибки сервера
- Необработанные ошибки → 500 Internal Server Error с message.
