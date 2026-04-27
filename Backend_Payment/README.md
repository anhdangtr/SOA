# Payment Microservice

This is a Payment Microservice for the FoodSaleWeb system, built with Node.js and Express.js.

## Features

- RESTful API for payment operations
- CORS enabled
- JSON responses
- Docker support
- Mock data (no database required)

## Endpoints

- `POST /api/payments/create` — Create a payment
- `POST /api/payments/process` — Process a payment (simulate success)
- `GET /api/payments/:id` — Get payment status
- `GET /api/payments` — List all payments
- `POST /api/payments/webhook` — Webhook for payment confirmation

## Payment Fields

- paymentId
- orderId
- userId
- amount
- paymentMethod (cash, credit_card, momo, paypal)
- status (pending, success, failed)
- createdAt

## Run Locally

```bash
npm install
npm start
```

Service runs on [http://localhost:5003](http://localhost:5003)

## Docker

Build and run:

```bash
docker build -t payment-service .
docker run -p 5003:5003 payment-service
```

## Notes

- This service uses in-memory mock data. For production, connect to a real database.
