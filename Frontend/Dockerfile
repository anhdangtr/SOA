FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
COPY scripts ./scripts
RUN npm ci

FROM deps AS dev

WORKDIR /app

COPY . .

ENV NODE_ENV=development
EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]

FROM deps AS builder

COPY . .

ARG VITE_API_MODE=live
ARG VITE_DELIVERY_API_MODE=live
ARG VITE_ORDER_SERVICE_URL
ARG VITE_PAYMENT_SERVICE_URL
ARG VITE_DELIVERY_SERVICE_URL

ENV VITE_API_MODE=$VITE_API_MODE
ENV VITE_DELIVERY_API_MODE=$VITE_DELIVERY_API_MODE
ENV VITE_ORDER_SERVICE_URL=$VITE_ORDER_SERVICE_URL
ENV VITE_PAYMENT_SERVICE_URL=$VITE_PAYMENT_SERVICE_URL
ENV VITE_DELIVERY_SERVICE_URL=$VITE_DELIVERY_SERVICE_URL

RUN npm run build

FROM node:22-alpine AS production

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

ENV NODE_ENV=production
EXPOSE 3000

CMD ["./docker-entrypoint.sh"]
