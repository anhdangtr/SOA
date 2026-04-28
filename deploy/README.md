# CI/CD deployment bundle

This folder is the production bundle used by `.github/workflows/cd.yml`.

## Server prerequisites

- Docker Engine with Docker Compose plugin installed
- A Linux host reachable through SSH
- A directory on the server that will match the `DEPLOY_PATH` GitHub secret
- Three env files created from:
  - `deploy/env/backend-order.env.example`
  - `deploy/env/backend-payment.env.example`
  - `deploy/env/backend-delivery.env.example`
- One root `.env` file created from `deploy/.env.example`

## Required GitHub secrets

- `SSH_HOST`
- `SSH_PORT`
- `SSH_USER`
- `SSH_PRIVATE_KEY`
- `DEPLOY_PATH`
- `GHCR_USERNAME`
- `GHCR_TOKEN`

`GHCR_TOKEN` should be a GitHub personal access token with package read access on the server side.

## Required GitHub repository variables

- `VITE_ORDER_SERVICE_URL`
- `VITE_PAYMENT_SERVICE_URL`
- `VITE_DELIVERY_SERVICE_URL`

These values are injected during the frontend image build so the production bundle points at the correct backend URLs.

## First-time server setup

1. Copy this folder to the target host.
2. Create `env/backend-order.env`, `env/backend-payment.env`, and `env/backend-delivery.env`.
3. Create a root `.env` file beside `docker-compose.prod.yml`.
4. Run `docker compose -f docker-compose.prod.yml config` to verify interpolation.

Once that is done, every push to `main` will build new images, push them to GHCR, sync this folder to the server, and restart the stack with the new `sha-<commit>` image tag.
