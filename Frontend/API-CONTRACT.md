# API Contract

Recommended service contract for the frontend and backend teams.

---

## Service Summary

| Service          | Base URL                | Responsibility            |
| ---------------- | ----------------------- | ------------------------- |
| Order Service    | `http://localhost:8081` | Create and manage orders  |
| Payment Service  | `http://localhost:8082` | Process payments          |
| Delivery Service | `http://localhost:8083` | Manage delivery lifecycle |

---

## Shared Enums

### Order Status

```text
PENDING_PAYMENT
CONFIRMED
DELIVERING
DELIVERED
CANCELLED
```

### Payment Method

```text
card
ewallet
cod
```

### Payment Status

```text
PENDING
SUCCESS
FAILED
```

---

## Order Service

Base URL:

```text
http://localhost:8081
```

### Endpoints

| Method  | Path                      | Purpose             |
| ------- | ------------------------- | ------------------- |
| `POST`  | `/orders`                 | Create a new order  |
| `GET`   | `/orders`                 | List all orders     |
| `GET`   | `/orders/:orderId`        | Get one order       |
| `PATCH` | `/orders/:orderId/status` | Update order status |

### `POST /orders`

Request:

```json
{
  "customer": {
    "name": "Nguyen Van A",
    "phone": "0900000000",
    "address": "123 Le Loi, District 1"
  },
  "lines": [
    {
      "item": {
        "id": "mon-1",
        "name": "Salt Baked Chicken",
        "price": 250,
        "image": "https://example.com/item.jpg"
      },
      "qty": 2
    }
  ],
  "paymentMethod": "card"
}
```

Response:

```json
{
  "id": "ORD-ABC123",
  "createdAt": 1710000000000,
  "customer": {
    "name": "Nguyen Van A",
    "phone": "0900000000",
    "address": "123 Le Loi, District 1"
  },
  "lines": [
    {
      "item": {
        "id": "mon-1",
        "name": "Salt Baked Chicken",
        "price": 250,
        "image": "https://example.com/item.jpg"
      },
      "qty": 2
    }
  ],
  "total": 500,
  "paymentMethod": "card",
  "status": "PENDING_PAYMENT",
  "payment": {
    "orderId": "ORD-ABC123",
    "method": "card",
    "status": "PENDING"
  },
  "history": [
    {
      "status": "PENDING_PAYMENT",
      "at": 1710000000000,
      "service": "Order Service",
      "note": "Order created, awaiting payment."
    }
  ]
}
```

### `GET /orders`

Response:

```json
[
  {
    "id": "ORD-ABC123",
    "createdAt": 1710000000000,
    "customer": {
      "name": "Nguyen Van A",
      "phone": "0900000000",
      "address": "123 Le Loi, District 1"
    },
    "lines": [],
    "total": 500,
    "paymentMethod": "card",
    "status": "CONFIRMED",
    "history": []
  }
]
```

### `GET /orders/:orderId`

Response:

```json
{
  "id": "ORD-ABC123",
  "createdAt": 1710000000000,
  "customer": {
    "name": "Nguyen Van A",
    "phone": "0900000000",
    "address": "123 Le Loi, District 1"
  },
  "lines": [],
  "total": 500,
  "paymentMethod": "card",
  "status": "DELIVERING",
  "payment": {
    "orderId": "ORD-ABC123",
    "method": "card",
    "status": "SUCCESS",
    "txnId": "TXN-1710000000000"
  },
  "delivery": {
    "id": "DLV-XYZ123",
    "etaMinutes": 25,
    "courier": "Minh N."
  },
  "history": []
}
```

### `PATCH /orders/:orderId/status`

Request:

```json
{
  "status": "DELIVERED"
}
```

Response:

```json
{
  "success": true
}
```

---

## Payment Service

Base URL:

```text
http://localhost:8082
```

### Endpoints

| Method | Path                 | Purpose                 |
| ------ | -------------------- | ----------------------- |
| `POST` | `/payments`          | Process payment         |
| `GET`  | `/payments/:orderId` | Get payment by order ID |

### `POST /payments`

Request:

```json
{
  "orderId": "ORD-ABC123",
  "outcome": "SUCCESS"
}
```

Response:

```json
{
  "orderId": "ORD-ABC123",
  "method": "card",
  "status": "SUCCESS",
  "txnId": "TXN-1710000000000"
}
```

### `GET /payments/:orderId`

Response:

```json
{
  "orderId": "ORD-ABC123",
  "method": "card",
  "status": "SUCCESS",
  "txnId": "TXN-1710000000000"
}
```

---

## Delivery Service

Base URL:

```text
http://localhost:8083
```

### Endpoints

| Method  | Path                             | Purpose                    |
| ------- | -------------------------------- | -------------------------- |
| `POST`  | `/deliveries`                    | Create delivery record     |
| `GET`   | `/deliveries/:orderId`           | Get delivery by order ID   |
| `PATCH` | `/deliveries/:orderId/delivered` | Mark delivery as completed |

### `POST /deliveries`

Request:

```json
{
  "orderId": "ORD-ABC123"
}
```

Response:

```json
{
  "orderId": "ORD-ABC123",
  "id": "DLV-XYZ123",
  "etaMinutes": 25,
  "courier": "Minh N.",
  "status": "DELIVERING"
}
```

### `GET /deliveries/:orderId`

Response:

```json
{
  "orderId": "ORD-ABC123",
  "id": "DLV-XYZ123",
  "etaMinutes": 25,
  "courier": "Minh N.",
  "status": "DELIVERING"
}
```

### `PATCH /deliveries/:orderId/delivered`

Response:

```json
{
  "success": true
}
```

---

## Integration Notes

### For backend

- Frontend mode is controlled by `VITE_API_MODE`.
- In `mock` mode, the frontend uses local mock modules.
- In `live` mode, the frontend calls:
  - [order.api.ts](/D:/ChauNgocThao-Web_FE/src/services/order/order.api.ts)
  - [payment.api.ts](/D:/ChauNgocThao-Web_FE/src/services/payment/payment.api.ts)
  - [delivery.api.ts](/D:/ChauNgocThao-Web_FE/src/services/delivery/delivery.api.ts)

### For frontend

If backend endpoints differ from this contract, update only the API layer. Routes and components should remain unchanged.
