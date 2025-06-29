import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const projectRoot = process.cwd();
const inPath = resolve(projectRoot, "scripts/serviceAccountKey.json");
const outPath = resolve(projectRoot, "svc-base64.txt");

try {
  const buf = readFileSync(inPath);
  const b64 = buf.toString("base64");
  writeFileSync(outPath, b64);
  console.log(`✅ Wrote Base64 to ${outPath}`);
} catch (err) {
  console.error("❌ Error reading or writing file:", err);
}
