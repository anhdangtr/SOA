#!/bin/sh
set -eu

cat > /app/dist/app-config.js <<EOF
window.__APP_CONFIG__ = {
  orderServiceUrl: "${VITE_ORDER_SERVICE_URL:-}",
  paymentServiceUrl: "${VITE_PAYMENT_SERVICE_URL:-}",
  deliveryServiceUrl: "${VITE_DELIVERY_SERVICE_URL:-}"
};
EOF

exec serve -s dist -l 3000
