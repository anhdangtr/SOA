import "dotenv/config";

function readEnv(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseBoolean(value) {
  return value.toLowerCase() === "true";
}

function parseNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const config = {
  port: parseNumber(process.env.PORT ?? "8083", 8083),
  corsOrigins: readEnv("CORS_ORIGIN", "http://localhost:3000,http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  db: {
    host: readEnv("DB_HOST", "localhost"),
    port: parseNumber(process.env.DB_PORT ?? "5432", 5432),
    database: readEnv("DB_NAME", "SOA_delivery"),
    user: readEnv("DB_USER", "postgres"),
    password: readEnv("DB_PASSWORD", "anh1234"),
    ssl: parseBoolean(process.env.DB_SSL ?? "false"),
  },
  defaultEtaMinutes: parseNumber(process.env.DELIVERY_DEFAULT_ETA_MINUTES ?? "25", 25),
};
