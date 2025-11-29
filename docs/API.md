# API Documentation

> **Note**: This is a placeholder for future API documentation. The REST API is not yet implemented.

## Planned Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| POST | /api/auth/logout | Logout user |

### Cards

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/cards | Search cards |
| GET | /api/cards/:id | Get card by ID |
| POST | /api/cards/sync | Sync card from Scryfall |

### Inventory

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/inventory | List user's inventory |
| POST | /api/inventory | Add card to inventory |
| PUT | /api/inventory/:id | Update inventory item |
| DELETE | /api/inventory/:id | Remove from inventory |

### Locations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/locations | List user's locations |
| POST | /api/locations | Create location |
| PUT | /api/locations/:id | Update location |
| DELETE | /api/locations/:id | Delete location |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/categories | List categories |

### Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/transactions | List transactions |
| GET | /api/transactions/:itemId | Get item history |

### Trades

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/trades | List user's trades |
| POST | /api/trades | Create trade |
| PUT | /api/trades/:id | Update trade |
| POST | /api/trades/:id/accept | Accept trade |
| POST | /api/trades/:id/reject | Reject trade |

## Response Format

All responses will follow this format:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 100
  }
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": { ... }
  }
}
```

## Authentication

API will use JWT tokens:

```
Authorization: Bearer <token>
```

## Rate Limiting

Planned rate limits:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Coming Soon

- WebSocket support for real-time updates
- Batch operations for inventory management
- Export/Import functionality
- Price alert webhooks
