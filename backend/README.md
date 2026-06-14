# SkillSwap Backend

A **database-driven** Node.js + Express API for the SkillSwap student skill exchange platform.

> **Architecture principle:** MySQL handles ALL business logic. Node.js is a pure API relay layer.

---

## Project Structure

```
backend/
├── config/
│   └── db.js                    # MySQL connection pool
├── routes/
│   ├── auth.js                  # POST /register, /login
│   ├── profile.js               # GET  /profile/:studentID
│   ├── skills.js                # GET  /skills/search, /skills/all
│   ├── requests.js              # POST /request/send, /request/accept
│   ├── dashboard.js             # GET  /dashboard/:studentID
│   ├── notifications.js         # GET  /notifications/:userID
│   └── exchanges.js             # GET  /exchanges/:studentID
├── controllers/
│   ├── authController.js
│   ├── profileController.js
│   ├── skillsController.js
│   ├── requestsController.js
│   ├── dashboardController.js
│   ├── notificationsController.js
│   └── exchangesController.js
├── services/
│   ├── authService.js
│   ├── profileService.js
│   ├── skillsService.js
│   ├── requestsService.js
│   ├── dashboardService.js
│   ├── notificationsService.js
│   └── exchangesService.js
├── server.js
├── package.json
├── .env.example
└── README.md
```

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure database credentials
cp .env.example .env
# then edit .env with your MySQL credentials

# 3. Make sure skill_swap DB is loaded
mysql -u root -p < skill_swap.sql

# 4. Start server
npm start        # production
npm run dev      # development (nodemon auto-reload)
```

Server runs at `http://localhost:3000`

---

## API Reference

All responses follow this shape:
```json
{ "success": true | false, "data": <payload>, "message": "<string>" }
```

### Authentication

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/register` | `{ name, email, password, department, phonenumber? }` | Register new student |
| POST | `/login` | `{ email, password }` | Login, returns student row |

**Register example:**
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ali","email":"ali@uni.com","password":"pass123","department":"CS"}'
```

**Login example:**
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ali@gmail.com","password":"pass123"}'
```

---

### Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile/:studentID` | Reads from `Student_profile` VIEW |

```bash
curl http://localhost:3000/profile/1
```

---

### Skills

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/skills/search?query=Python` | Search students offering a skill |
| GET | `/skills/all` | Return all skills in master table |

```bash
curl "http://localhost:3000/skills/search?query=Python"
curl http://localhost:3000/skills/all
```

---

### Requests

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/request/send` | `{ senderID, receiverID, skillID, offeredSkillID }` | Calls `send_request` procedure |
| POST | `/request/accept` | `{ requestID }` | Calls `AcceptRequestTransaction` procedure |

```bash
# Send a swap request
curl -X POST http://localhost:3000/request/send \
  -H "Content-Type: application/json" \
  -d '{"senderID":1,"receiverID":2,"skillID":3,"offeredSkillID":1}'

# Accept a request (atomic transaction in MySQL)
curl -X POST http://localhost:3000/request/accept \
  -H "Content-Type: application/json" \
  -d '{"requestID":5}'
```

> **Note:** Accepting a request triggers `trig_exchange_update` and `trg_accepted_notification` automatically inside MySQL. Node never touches Exchanges or Notifications directly.

---

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/:studentID` | Reads from `RequestDashboard` VIEW |

```bash
curl http://localhost:3000/dashboard/1
```

---

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications/:userID` | Reads from `Notifications` table |

```bash
curl http://localhost:3000/notifications/1
```

> Notifications are **never** inserted by Node. MySQL triggers (`trig__request_notification`, `trg_accepted_notification`) handle this automatically.

---

### Exchange History

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/exchanges/:studentID` | Reads from `ExchangeHistory` VIEW |

```bash
curl http://localhost:3000/exchanges/1
```

---

## MySQL Features Used

| Feature | Name | Used by endpoint |
|---------|------|------------------|
| Stored Procedure | `send_request` | `POST /request/send` |
| Stored Procedure | `AcceptRequestTransaction` | `POST /request/accept` |
| Trigger | `trig__request_notification` | Fires on Requests INSERT |
| Trigger | `trig_exchange_update` | Fires on Requests UPDATE |
| Trigger | `trg_accepted_notification` | Fires on Requests UPDATE |
| View | `Student_profile` | `GET /profile/:studentID` |
| View | `RequestDashboard` | `GET /dashboard/:studentID` |
| View | `ExchangeHistory` | `GET /exchanges/:studentID` |

---

## What Node.js Does NOT Do

- ❌ No request status logic
- ❌ No notification insertion
- ❌ No exchange record creation
- ❌ No ranking or filtering computation
- ❌ No data transformation or business rules

Node.js only: connects, routes, calls DB, returns JSON.
