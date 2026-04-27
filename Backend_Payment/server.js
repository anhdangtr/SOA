const app = require("./src/app");
const { config } = require("./src/config");
const { initDb } = require("./src/db");

async function startServer() {
  await initDb();

  app.listen(config.port, () => {
    console.log(`Payment service running on port ${config.port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start payment service:", error);
  process.exit(1);
});
