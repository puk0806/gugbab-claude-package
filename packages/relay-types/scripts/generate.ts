import { execSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generateTypes } from "@gugbab/types-generator";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const RELAY_OPENAPI_URL = "https://gugbab-claude-relay.vercel.app/api/openapi.json";
const tmpFile = join(tmpdir(), "relay-openapi.json");

// curl을 사용해 다운로드 (Node.js fetch의 TLS 체인 검증 우회)
execSync(`curl -sf "${RELAY_OPENAPI_URL}" -o "${tmpFile}"`);

await generateTypes({
    input: tmpFile,
    output: resolve(__dirname, "../src/generated.ts"),
});
