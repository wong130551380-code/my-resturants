import app from "../src/index";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

async function main() {
  const res = await app.request("/openapi.json");
  const spec = await res.text();

  const outputPath = resolve(process.cwd(), "openapi.json");

  writeFileSync(outputPath, spec, "utf-8");

  console.log(`OpenAPI spec generated: ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});