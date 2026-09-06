import { fileURLToPath } from "node:url";
import { checkFiles, violations } from "./metrics.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const results = checkFiles(root);
const failures = results.flatMap(violations);

console.table(
  results.map((result) => ({
    file: result.file,
    lines: result.lines,
    "max cyclomatic": Math.max(
      0,
      ...result.functions.map((fn) => fn.cyclomatic),
    ),
    "max Halstead difficulty": Math.max(
      0,
      ...result.functions.map((fn) => fn.difficulty),
    ).toFixed(2),
  })),
);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Metrics passed for ${results.length} source/configuration files.`,
  );
}
