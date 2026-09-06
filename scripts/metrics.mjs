import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import {
  calculateCyclomaticComplexity,
  calculateHalstead,
} from "@makerx/complexity-verifier";

// Use the analyzer's own parser version so SyntaxKind values stay compatible.
const requireAnalyzer = createRequire(
  import.meta.resolve("@makerx/complexity-verifier"),
);
const ts = requireAnalyzer("typescript");

export const limits = { cyclomatic: 22, difficulty: 80, lines: 500 };
const excluded =
  /(^|\/)(\.agents|\.claude|node_modules|\.next|dist|build|out|coverage|public|docs)\//;
const sourceExtension = /\.(?:[cm]?[jt]sx?|css|json)$/;

export function sourceFiles(root) {
  const output = execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { cwd: root, encoding: "utf8" },
  );
  return [...new Set(output.split("\0"))]
    .filter((file) => sourceExtension.test(file))
    .filter((file) => !excluded.test(file))
    .filter((file) => !/\.d\.[cm]?ts$/.test(file))
    .filter((file) => existsSync(`${root}/${file}`))
    .sort();
}

export function physicalLines(source) {
  if (source.length === 0) return 0;
  const lines = source.split(/\r\n|\n|\r/);
  return lines.length - Number(lines.at(-1) === "");
}

function isFunction(node) {
  return ts.isFunctionLike(node) && node.body !== undefined;
}

export function analyzeSource(file, source) {
  const result = { file, lines: physicalLines(source), functions: [] };
  if (/\.(css|json)$/.test(file)) return result;

  const kind = /\.[jt]sx$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const ast = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    kind,
  );
  if (ast.parseDiagnostics.length > 0) {
    const diagnostic = ast.parseDiagnostics[0];
    throw new Error(
      `${file}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`,
    );
  }

  function visit(node) {
    if (isFunction(node)) {
      result.functions.push({
        name: node.name?.getText(ast) ?? "<anonymous>",
        line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1,
        cyclomatic: calculateCyclomaticComplexity(node),
        difficulty: calculateHalstead(node).difficulty,
      });
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return result;
}

export function violations(result) {
  const failures = [];
  if (result.lines >= limits.lines) {
    failures.push(
      `${result.file}: ${result.lines} lines; required < ${limits.lines}`,
    );
  }
  for (const fn of result.functions) {
    for (const metric of ["cyclomatic", "difficulty"]) {
      if (!Number.isFinite(fn[metric]) || fn[metric] >= limits[metric]) {
        failures.push(
          `${result.file}:${fn.line} ${fn.name}: ${metric}=${fn[metric]}; required < ${limits[metric]}`,
        );
      }
    }
  }
  return failures;
}

export function checkFiles(root) {
  return sourceFiles(root).map((file) =>
    analyzeSource(file, readFileSync(`${root}/${file}`, "utf8")),
  );
}
