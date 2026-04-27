require("dotenv").config();

function readEnv(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBoolean(value) {
  return String(value).toLowerCase() === "true";
}

module.exports.config = {
  port: parseNumber(process.env.PORT ?? "8081", 8081),
  db: {
    host: readEnv("DB_HOST", "localhost"),
    port: parseNumber(process.env.DB_PORT ?? "5432", 5432),
    database: readEnv("DB_NAME", "SOA_Order"),
    user: readEnv("DB_USER", "postgres"),
    password: readEnv("DB_PASSWORD", "anh1234"),
    ssl: parseBoolean(process.env.DB_SSL ?? "false"),
  },
  paymentServiceUrl: readEnv("PAYMENT_SERVICE_URL", "http://localhost:8082"),
  deliveryServiceUrl: readEnv("DELIVERY_SERVICE_URL", "http://localhost:8083"),
};
