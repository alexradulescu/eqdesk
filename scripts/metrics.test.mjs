import { expect, test } from "bun:test";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  analyzeSource,
  physicalLines,
  sourceFiles,
  violations,
} from "./metrics.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));

function branches(count) {
  return `function example(x: number) { ${"if (x) { x--; }".repeat(count)} }`;
}

test("cyclomatic 21 passes and 22 fails on real TypeScript", () => {
  const passing = analyzeSource("example.ts", branches(20));
  const failing = analyzeSource("example.ts", branches(21));
  expect(passing.functions[0].cyclomatic).toBe(21);
  expect(violations(passing)).toEqual([]);
  expect(failing.functions[0].cyclomatic).toBe(22);
  expect(violations(failing).join()).toContain("cyclomatic=22");
});

test("Halstead 79.5 passes and exactly 80 fails", () => {
  const prefix = `function f(x) { ${"x += x;".repeat(78)}`;
  const passing = analyzeSource("example.js", `${prefix} return x; }`);
  const failing = analyzeSource("example.js", `${prefix} x; return x; }`);
  expect(passing.functions[0].difficulty).toBe(79.5);
  expect(violations(passing)).toEqual([]);
  expect(failing.functions[0].difficulty).toBe(80);
  expect(violations(failing).join()).toContain("difficulty=80");
});

test("physical lines include comments and blanks, with no phantom final line", () => {
  expect(physicalLines("")).toBe(0);
  expect(physicalLines("a")).toBe(1);
  expect(physicalLines("a\n")).toBe(1);
  expect(physicalLines("a\r\n\r\n// comment\r\n")).toBe(3);
  expect(violations(analyzeSource("style.css", "\n".repeat(499)))).toEqual([]);
  expect(
    violations(analyzeSource("style.css", "\n".repeat(500))).join(),
  ).toContain("500 lines");
});

test("TSX and JSX expressions are analyzed without compiling JSX away", () => {
  for (const extension of ["tsx", "jsx"]) {
    const result = analyzeSource(
      `view.${extension}`,
      'const View = ({active}) => <div title="ready">{active ? "yes" : "no"}</div>;',
    );
    expect(result.functions).toHaveLength(1);
    expect(result.functions[0].cyclomatic).toBe(2);
    expect(result.functions[0].difficulty).toBeGreaterThan(0);
  }
});

test("methods, accessors, constructors and nested callbacks are discovered", () => {
  const result = analyzeSource(
    "example.ts",
    `class Example {
      constructor() {}
      get value() { return 1; }
      set value(x) {}
      run() { return [1].map(x => x ? 1 : 0); }
    }`,
  );
  expect(result.functions).toHaveLength(5);
  expect(result.functions.map((fn) => fn.cyclomatic)).toEqual([1, 1, 1, 2, 2]);
});

test("invalid source fails instead of producing a passing report", () => {
  expect(() => analyzeSource("broken.ts", "function broken( {")).toThrow(
    "broken.ts:",
  );
});

test("Biome accepts cognitive 21 and rejects 22 with the repository config", () => {
  const directory = mkdtempSync(join(tmpdir(), "eqdesk-cognitive-"));
  const file = join(directory, "fixture.ts");
  try {
    for (const [count, expectedStatus] of [
      [21, 0],
      [22, 1],
    ]) {
      writeFileSync(file, branches(count));
      const result = spawnSync(
        join(root, "node_modules/.bin/biome"),
        [
          "lint",
          "--only=complexity/noExcessiveCognitiveComplexity",
          "--config-path",
          root,
          file,
        ],
        { cwd: root, encoding: "utf8" },
      );
      expect(result.status).toBe(expectedStatus);
      if (expectedStatus === 1) {
        expect(result.stderr).toContain(
          "Excessive complexity of 22 detected (max: 21)",
        );
      }
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("discovery includes new source files and excludes generated or deleted files", () => {
  const directory = mkdtempSync(join(tmpdir(), "eqdesk-metrics-"));
  try {
    execFileSync("git", ["init", "--quiet"], { cwd: directory });
    const files = [
      "tracked.ts",
      "deleted.ts",
      "new component.tsx",
      "scripts/check.mjs",
      "app/style.css",
      "biome.json",
      "node_modules/vendor.ts",
      ".agents/skills/vendor.mjs",
      ".claude/skills/vendor.mjs",
      ".next/types.ts",
      "dist/output.js",
      "docs/notes.ts",
      "public/asset.js",
      "types.d.ts",
      "ignored.ts",
      ".gitignore",
    ];
    for (const file of files) {
      const path = join(directory, file);
      mkdirSync(join(path, ".."), { recursive: true });
      writeFileSync(path, "");
    }
    writeFileSync(join(directory, ".gitignore"), "ignored.ts\n");
    execFileSync("git", ["add", "tracked.ts", "deleted.ts"], {
      cwd: directory,
    });
    rmSync(join(directory, "deleted.ts"));
    expect(sourceFiles(directory)).toEqual([
      "app/style.css",
      "biome.json",
      "new component.tsx",
      "scripts/check.mjs",
      "tracked.ts",
    ]);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
