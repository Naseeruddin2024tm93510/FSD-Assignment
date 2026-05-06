# API Documentation

The Nexus Backend exposes a RESTful API. Below are the key endpoints.

## Authentication
### `POST /api/auth/signup`
Registers a new user.
- **Body**: `{ "username", "email", "password", "role" }`

### `POST /api/auth/signin`
Authenticates user and returns JWT.
- **Body**: `{ "username", "password" }`
- **Response**: `{ "token", "username", "email", "role" }`

## Equipment
### `GET /api/equipment`
Returns all equipment.

### `POST /api/equipment` (Admin only)
Adds new equipment.

### `PUT /api/equipment/{id}` (Admin only)
Updates existing equipment.

## Borrowing
### `POST /api/borrow/request/{equipmentId}`
Submits a borrow request.

### `GET /api/borrow/my-requests`
Returns requests for the logged-in user.

### `PUT /api/borrow/approve/{requestId}` (Admin/Staff only)
Approves a request and decrements inventory.

### `PUT /api/borrow/return/{requestId}` (Admin/Staff only)
Marks as returned and increments inventory.

---
**Interactive Docs**: Once the server is running, visit `http://localhost:8080/swagger-ui/index.html` for full interactive documentation.
