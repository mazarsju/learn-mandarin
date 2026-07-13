import { cpSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const outDir = join(root, "coverage-site");

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

cpSync(join(root, "frontend/coverage"), join(outDir, "frontend"), { recursive: true });
cpSync(join(root, "backend/coverage"), join(outDir, "backend"), { recursive: true });

writeFileSync(
  join(outDir, "index.html"),
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>learn-mandarin — test coverage</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 3rem auto; padding: 0 1rem; }
    ul { line-height: 2; }
  </style>
</head>
<body>
  <h1>Test coverage</h1>
  <ul>
    <li><a href="frontend/index.html">Frontend coverage report</a></li>
    <li><a href="backend/index.html">Backend coverage report</a></li>
  </ul>
</body>
</html>
`,
);
