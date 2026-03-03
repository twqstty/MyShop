# Backend (Express + Prisma + JWT)

## Что сделано по заданию
- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`
- **CRUD для posts**: `GET/POST /api/posts`, `GET/PUT/DELETE /api/posts/:id`
- Защищённые запросы (create/update/delete) требуют **Bearer JWT** в заголовке `Authorization`.

## Быстрый старт
1) Установи зависимости:
```bash
npm i
```

2) Добавь в `.env` (пример):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shop"
JWT_SECRET="super_secret_string"
PORT=3000
```

3) Прогони миграции (если нужно):
```bash
npx prisma migrate dev
```

4) Запусти:
```bash
npm run dev
```

## Примеры запросов (curl)

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@mail.com","password":"123456"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@mail.com","password":"123456"}'
```

Ответ вернёт `token`. Дальше используй его так:

### Create post (protected)
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Hello","content":"My first post"}'
```

### Update post (protected)
```bash
curl -X PUT http://localhost:3000/api/posts/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Updated title"}'
```

### Delete post (protected)
```bash
curl -X DELETE http://localhost:3000/api/posts/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
