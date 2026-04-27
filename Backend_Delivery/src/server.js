import { config } from "./config.js";
import { app } from "./app.js";
import { initDb } from "./db.js";

await initDb();

app.listen(config.port, () => {
  console.log(`Delivery service listening on http://localhost:${config.port}`);
});
