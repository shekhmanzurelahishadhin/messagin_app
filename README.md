# 📬 Messaging Inbox

A full-stack messaging application built with **Laravel 12** (API) and **React 19 + Vite** (frontend), featuring real-time-like inbox with thread-based conversations.

---

## Tech Stack

| Layer    | Technology                                       |
|----------|--------------------------------------------------|
| Backend  | Laravel 12, Sanctum (token auth), SQLite / MySQL |
| Frontend | React 19, Vite, Tailwind CSS, Zustand, Axios     |
| Styling  | Tailwind CSS (dark theme), DM Sans font          |

---

## Project Structure

```
messaging-app/
├── backend/       ← Laravel 12 API
└── frontend/      ← React 19 + Vite SPA
```

---

## 🚀 Quick Start

### 1 — Backend Setup

```bash
cd backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate

# Install and configure Reverb (interactive — accept all defaults)
php artisan reverb:install

# Create SQLite database (default) — or configure MySQL in .env
touch database/database.sqlite

# Run migrations and seed demo data
php artisan migrate --seed

# Terminal A — API server
php artisan serve

# Terminal B — Reverb WebSocket server
php artisan reverb:start
```

**MySQL instead of SQLite:** Edit `backend/.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=messaging_inbox
DB_USERNAME=root
DB_PASSWORD=your_password
```

---

### 2 — Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Start the dev server
npm run dev
# → http://localhost:5173
```

> The Vite dev server proxies `/api/*` to `http://localhost:8000` automatically.

---

## Demo Accounts

After seeding, these accounts are ready to log in:

| Name           | Email               | Password |
|----------------|---------------------|----------|
| Alice Johnson  | alice@example.com   | password |
| Bob Smith      | bob@example.com     | password |
| Carol Williams | carol@example.com   | password |
| Dave Martinez  | dave@example.com    | password |
| Eve Chen       | eve@example.com     | password |

---

## API Reference

All endpoints are prefixed with `/api`.

### Auth

| Method | Endpoint      | Auth | Description               |
|--------|---------------|------|---------------------------|
| POST   | /register     | No   | Register new user         |
| POST   | /login        | No   | Login, returns token      |
| POST   | /logout       | Yes  | Revoke token              |
| GET    | /user         | Yes  | Get authenticated user    |

### Users

| Method | Endpoint | Auth | Description            |
|--------|----------|------|------------------------|
| GET    | /users   | Yes  | List all users (for participant picker) |

### Threads

| Method | Endpoint                  | Auth | Description                           |
|--------|---------------------------|------|---------------------------------------|
| GET    | /threads                  | Yes  | List threads (paginated, 20/page)     |
| POST   | /threads                  | Yes  | Create thread with initial message    |
| GET    | /threads/{id}             | Yes  | Get thread + messages (20/page)       |
| PUT    | /threads/{id}/read        | Yes  | Mark thread as read                   |
| DELETE | /threads/{id}             | Yes  | Leave/delete thread                   |
| GET    | /threads/unread/count     | Yes  | Total unread messages count           |

### Messages

| Method | Endpoint                        | Auth | Description             |
|--------|---------------------------------|------|-------------------------|
| POST   | /threads/{id}/messages          | Yes  | Send message to thread  |
| PUT    | /messages/{id}/read             | Yes  | Mark message as read    |

### Request Bodies

**POST /register**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "password_confirmation": "secret123"
}
```

**POST /login**
```json
{ "email": "jane@example.com", "password": "secret123" }
```

**POST /threads**
```json
{
  "subject": "Meeting tomorrow",
  "participants": [2, 3],
  "body": "Hey, are you available at 3pm?"
}
```

**POST /threads/{id}/messages**
```json
{ "body": "Sounds good to me!" }
```

---

## Features

- 🔐 **Token auth** via Laravel Sanctum (stored in localStorage)
- ⚡ **Real-time messaging** via Laravel Reverb (WebSockets, no polling)
- 💬 **Thread-based conversations** with multiple participants
- ✍️  **Typing indicators** — live "Alice is typing…" powered by presence channels
- 📥 **Unread badge counts** per thread and in header — update in real-time
- 🔌 **Connection status badge** — shows Connecting / Reconnecting / Offline states
- 🔍 **Client-side search** across thread subjects + previews
- 📜 **Pagination** for both thread list and message history
- 📱 **Responsive** — mobile sidebar drawer + desktop two-column layout
- ✉️ **Compose modal** with multi-participant selector
- ⌨️ **Enter to send**, Shift+Enter for new line
- 🗑️ **Leave conversation** (removes you as participant)
- 👤 **Avatar generation** via ui-avatars.com

## Real-time Architecture

```
Browser (Echo + pusher-js)
    │
    │  WebSocket (ws://localhost:8080)
    ▼
Laravel Reverb
    │
    │  PHP events via broadcast()
    ▼
Laravel App (MessageController)

Channels used:
  private  thread.{id}           → MessageSent (new messages)
  private  user.{id}             → UserThreadsUpdated (inbox list updates)
  presence presence-thread.{id}  → client whispers for typing indicators
```

---

## Production Build

```bash
# Build frontend assets
cd frontend && npm run build

# Copy dist/ into Laravel's public/ folder (optional, for monorepo deploy)
cp -r dist/* ../backend/public/

# Or serve them separately behind a reverse proxy (nginx, Caddy)
```

### CORS for production

Update `backend/.env`:
```env
FRONTEND_URL=https://your-frontend-domain.com
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable                 | Description                          |
|--------------------------|--------------------------------------|
| `APP_KEY`                | Laravel app key (auto-generated)     |
| `DB_CONNECTION`          | `sqlite` or `mysql`                  |
| `SANCTUM_STATEFUL_DOMAINS` | Your frontend domain(s)            |
| `FRONTEND_URL`           | Used for CORS allowed origins        |

### Frontend (`frontend/.env` — optional)

The Vite proxy handles API routing in development. For production, create:
```env
VITE_API_BASE_URL=https://your-api-domain.com/api
```
Then update `src/services/api.js` `baseURL` to `import.meta.env.VITE_API_BASE_URL`.

---

## License

MIT
