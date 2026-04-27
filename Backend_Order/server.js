const app = require("./src/app");
const { config } = require("./src/config");
const { initDb } = require("./src/db");

async function start() {
  await initDb();

  app.listen(config.port, () => {
    console.log(`Order service running on port ${config.port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start order service", error);
  process.exit(1);
});
