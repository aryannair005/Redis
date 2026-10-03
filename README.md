# Redis Learning Projects

A collection of Node.js examples for learning how **Redis** can be used in backend applications.

This repository contains practical implementations of:

- **API Caching** with Redis
- **OTP Storage & Verification** with Redis TTL
- **Background Job Queues** with BullMQ + Redis
- **API Rate Limiting** with Redis
- **Dockerized Redis** using Docker Compose

The examples use **Node.js, Express, MongoDB/Mongoose, ioredis, and BullMQ**.

---

## 📚 Projects

### 1. API Caching

📁 `api-caching/`

Demonstrates how Redis can cache frequently requested database results and reduce repeated database queries.

### Flow

```text
Client
  ↓
GET /get-with-redis
  ↓
Check Redis
  ├── Cache Hit → Return cached users
  └── Cache Miss
        ↓
      MongoDB
        ↓
   Store result in Redis
        ↓
      Return users
```

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/create` | Create a new user |
| GET | `/get-without-redis` | Fetch users directly from MongoDB |
| GET | `/get-with-redis` | Fetch users using Redis caching |

The cache uses the key:

```text
user:all
```

When a new user is created, that cache key is deleted so the next request fetches fresh data from MongoDB.

---

## 2. OTP Storage

📁 `Otp-storage/`

Demonstrates how Redis can be used to temporarily store OTPs with an expiration time.

### Flow

```text
Generate OTP
    ↓
Store in Redis
    ↓
OTP expires automatically
    ↓
Verify OTP
```

Each OTP is stored using:

```text
otp:<email>
```

with a **60-second expiration**.

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/send-otp` | Generate and store an OTP |
| POST | `/verify-otp` | Verify the stored OTP |

Example request:

```json
{
  "email": "user@example.com"
}
```

For verification:

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

After successful verification, the OTP is deleted from Redis.

> **Note:** The current example returns the OTP in the API response for learning purposes. A production application should send the OTP through an email/SMS provider and never expose it in the response.

---

## 3. Queue Using BullMQ

📁 `queue-using-bullmq/`

Demonstrates how **BullMQ** uses Redis as the backend for background jobs.

In this example, user creation adds an email job to a queue instead of performing the email task during the request itself.

### Architecture

```text
Client
  ↓
POST /create
  ↓
Create User in MongoDB
  ↓
Add Job → Redis / BullMQ Queue
  ↓
HTTP response returned
  ↓
Worker picks up job
  ↓
Send Email Task
```

The queue is named:

```text
emailQueue
```

The worker processes jobs from the same queue.

### Main files

| File | Purpose |
|---|---|
| `index.js` | Express API and job producer |
| `queue.js` | BullMQ queue configuration |
| `worker.js` | Background job processor |
| `config/sendEmail.config.js` | Simulated email task |

The current email function simulates a 5-second task so that the benefit of background processing can be observed.

---

## 4. Redis Rate Limiter

📁 `rate-limmiter/`

Demonstrates a simple API rate limiter using Redis counters and key expiration.

The middleware tracks requests based on the client's IP address.

### Algorithm

```text
Request
  ↓
Get client IP
  ↓
INCR rate_limit:<ip>
  ↓
First request?
  └── Yes → Set 60-second expiration
  ↓
Requests > 5?
  ├── Yes → 429 Too Many Requests
  └── No  → next()
```

### Endpoint

| Method | Endpoint | Description |
|---|---|---|
| POST | `/create` | Create a new user |
| GET | `/get-users` | Fetch users with rate limiting |

The rate-limit key follows:

```text
rate_limit:<ip>
```

The current implementation allows **5 requests per IP within a 60-second window**.

---

# 🐳 Redis with Docker

The root of the repository contains a `docker-compose.yml` that starts a Redis container.

Start Redis with:

```bash
docker compose up -d
```

Check running containers:

```bash
docker ps
```

Redis is exposed on:

```text
localhost:6379
```

Stop the container:

```bash
docker compose down
```

---

# 🛠️ Tech Stack

- **Node.js**
- **Express.js**
- **Redis**
- **ioredis**
- **BullMQ**
- **MongoDB**
- **Mongoose**
- **Docker / Docker Compose**
- **dotenv**
- **Nodemon**

---

# 📂 Repository Structure

```text
Redis/
│
├── api-caching/
│   ├── config/
│   ├── models/
│   ├── index.js
│   └── package.json
│
├── Otp-storage/
│   ├── config/
│   ├── index.js
│   └── package.json
│
├── queue-using-bullmq/
│   ├── config/
│   │   └── sendEmail.config.js
│   ├── models/
│   ├── index.js
│   ├── queue.js
│   ├── worker.js
│   └── package.json
│
├── rate-limmiter/
│   ├── config/
│   ├── middlewares/
│   │   └── rate-limiter.js
│   ├── models/
│   ├── index.js
│   └── package.json
│
└── docker-compose.yml
```

---

# ⚙️ Setup

## 1. Clone the repository

```bash
git clone https://github.com/aryannair005/Redis.git
cd Redis
```

## 2. Start Redis

Using Docker:

```bash
docker compose up -d
```

Or run a Redis server locally on port `6379`.

## 3. Configure environment variables

Each project can use environment variables through a `.env` file.

Typical values used by the examples are:

```env
PORT=8000
REDIS_URL=redis://localhost:6379
MONGO_URI=mongodb://127.0.0.1:27017/redis
```

Use the variable names expected by the specific project's configuration files.

## 4. Install dependencies

Move into the example you want to run:

```bash
cd api-caching
npm install
```

Then start the development server:

```bash
npm run dev
```

Repeat the same process inside `Otp-storage`, `rate-limmiter`, or `queue-using-bullmq`.

---

# 🔄 Running the BullMQ Example

The BullMQ example has two separate processes:

### Terminal 1 — API

```bash
cd queue-using-bullmq
npm install
npm run dev
```

### Terminal 2 — Worker

```bash
cd queue-using-bullmq
node worker.js
```

The worker listens for jobs from:

```text
emailQueue
```

When a user is created through `POST /create`, an email job is added to the queue and the worker processes it asynchronously.

---

# 🧠 Redis Concepts Covered

This repository is designed as a hands-on Redis learning project and demonstrates several important Redis concepts:

### Caching

Using:

```text
GET
SET
DEL
```

to cache API/database results.

### Expiration / TTL

Using:

```text
SET key value EX 60
```

to automatically remove temporary data.

### Atomic Counters

Using:

```text
INCR
EXPIRE
```

to implement request counters for rate limiting.

### Queues

Using **BullMQ + Redis** to store and process background jobs.

---

# ⚠️ Notes

These projects are educational examples rather than production-ready services.

For production systems, consider adding:

- Input validation
- Authentication and authorization
- Robust Redis connection/error handling
- Secure OTP delivery
- Proper email provider integration
- More sophisticated rate-limiting strategies
- Logging and monitoring
- Retry and failure handling for background jobs
- Secure environment-variable management

---

# 🎯 Purpose

This repository was created to learn how Redis fits into real-world backend systems rather than using Redis only as a standalone data store.

The examples progress from simple key-value operations to practical backend patterns such as:

```text
Redis Basics
    ↓
Caching
    ↓
Temporary Data / OTP
    ↓
Rate Limiting
    ↓
Background Jobs with BullMQ
```

---

## 👨‍💻 Author

**Aryan Nair**

GitHub: [aryannair005](https://github.com/aryannair005)

---

## ⭐ If this repository helped you

Consider giving the repository a star and using the examples to experiment with Redis in your own Node.js projects.
