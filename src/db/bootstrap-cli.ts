import { bootstrap } from "./bootstrap";
import { sqlClient } from "./client";

await bootstrap();
await sqlClient.end();
console.info("Administrative bootstrap completed");
