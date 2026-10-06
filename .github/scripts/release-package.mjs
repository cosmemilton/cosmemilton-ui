import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { basename, join } from "node:path";
import process from "node:process";
import console from "node:console";
import { setTimeout } from "node:timers";

const registry = "https://registry.npmjs.org";
const outputDirectory = "release-output";
const stableVersion = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const command = process.argv[2];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function output(key, value) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
}

function integrity(path) {
  return `sha512-${createHash("sha512").update(readFileSync(path)).digest("base64")}`;
}

function validateVersion(pkg) {
  assert(pkg.name === "cosmemilton-ui", "Unexpected package name.");
  assert(stableVersion.test(pkg.version), "The release branch publishes stable versions only.");
  assert(pkg.private !== true, "A private package cannot be published.");
  const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
  assert(
    lock.version === pkg.version && lock.packages[""].version === pkg.version,
    "Package and lockfile versions differ.",
  );
}

function pack() {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  if (process.env.GITHUB_EVENT_NAME !== "pull_request") validateVersion(pkg);
  mkdirSync(outputDirectory, { recursive: true });
  const [packed] = JSON.parse(
    execFileSync(
      "npm",
      ["pack", "--json", "--ignore-scripts", "--pack-destination", outputDirectory],
      { encoding: "utf8" },
    ),
  );
  const files = new Set(packed.files.map((file) => file.path));
  const allowedRoot = new Set(["package.json", "README.md", "LICENSE", "CHANGELOG.md"]);
  const stray = [...files].filter(
    (file) => !file.startsWith("dist/") && !file.startsWith("bin/") && !allowedRoot.has(file),
  );
  assert(stray.length === 0, `Unexpected files in tarball: ${stray.join(", ")}`);
  function checkExport(value) {
    if (typeof value === "string")
      assert(files.has(value.replace(/^\.\//, "")), `Missing exported file: ${value}`);
    else for (const nested of Object.values(value)) checkExport(nested);
  }
  checkExport(pkg.exports);
  for (const file of [
    "dist/styles.css",
    "dist/cm-ui.min.js",
    "dist/brand.svg",
    "dist/manifest.json",
  ]) {
    assert(files.has(file), `Missing public asset: ${file}`);
  }
  const tarball = basename(packed.filename);
  const metadata = {
    name: pkg.name,
    version: pkg.version,
    tarball,
    integrity: integrity(join(outputDirectory, tarball)),
  };
  assert(
    metadata.integrity === packed.integrity,
    "Packed artifact integrity differs from npm metadata.",
  );
  writeFileSync(join(outputDirectory, "release.json"), `${JSON.stringify(metadata, null, 2)}\n`);
  for (const key of ["name", "version", "tarball"]) output(key, metadata[key]);
  console.log(`Validated ${metadata.name}@${metadata.version}: ${files.size} packaged files.`);
}

function artifact() {
  const metadata = JSON.parse(readFileSync(join(outputDirectory, "release.json"), "utf8"));
  assert(
    metadata.name === "cosmemilton-ui" && stableVersion.test(metadata.version),
    "Invalid release artifact metadata.",
  );
  assert(
    metadata.tarball === `cosmemilton-ui-${metadata.version}.tgz`,
    "Invalid tarball filename.",
  );
  const path = join(outputDirectory, metadata.tarball);
  assert(
    existsSync(path) && integrity(path) === metadata.integrity,
    "Downloaded artifact integrity check failed.",
  );
  return metadata;
}

function view(spec, ...fields) {
  const result = spawnSync(
    "npm",
    [
      "view",
      spec,
      ...fields,
      "--json",
      "--registry",
      registry,
      "--fetch-retries=2",
      "--fetch-timeout=20000",
    ],
    { encoding: "utf8", timeout: 90000 },
  );
  if (result.status === 0) return JSON.parse(result.stdout);
  // Only a genuine not-found response means the version is unpublished.
  let error;
  try {
    error = JSON.parse(result.stdout).error;
  } catch {
    /* npm may report only stderr */
  }
  if (error?.code === "E404") return null;
  throw new Error(
    `npm registry query failed (${error?.code ?? result.error?.code ?? result.status}); publication was not attempted.`,
  );
}

function compareVersions(left, right) {
  const a = left.split(".").map(Number);
  const b = right.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
}

function inspect() {
  const metadata = artifact();
  const existing = view(`${metadata.name}@${metadata.version}`, "version", "dist.integrity");
  if (existing) {
    assert(
      existing.version === metadata.version && existing["dist.integrity"] === metadata.integrity,
      "This version already exists with different contents. Increment the version before releasing.",
    );
    output("publish", "false");
    console.log(
      `${metadata.name}@${metadata.version} already exists with identical integrity; skipping publication.`,
    );
    return;
  }
  const latest = view(metadata.name, "dist-tags.latest");
  assert(
    latest === null ||
      (stableVersion.test(latest) && compareVersions(metadata.version, latest) > 0),
    "The release version must be newer than npm's latest stable version.",
  );
  output("publish", "true");
  console.log(`${metadata.name}@${metadata.version} is unpublished and ready for publication.`);
}

async function confirm() {
  const metadata = artifact();
  // npm/CDN metadata may take several minutes to expose a successful publication.
  for (let attempt = 1; attempt <= 30; attempt++) {
    const published = view(`${metadata.name}@${metadata.version}`, "version", "dist.integrity");
    const latest = published ? view(metadata.name, "dist-tags.latest") : null;
    if (
      published?.version === metadata.version &&
      published["dist.integrity"] === metadata.integrity &&
      latest === metadata.version
    ) {
      console.log(
        `Confirmed ${metadata.name}@${metadata.version}, latest tag and tarball integrity on npm.`,
      );
      return;
    }
    console.log(`Waiting for npm propagation (${attempt}/30).`);
    if (attempt < 30) await new Promise((resolve) => setTimeout(resolve, 10000));
  }
  throw new Error(
    "npm publication was attempted, but registry propagation was not confirmed within the polling window. Check the registry before retrying.",
  );
}

try {
  if (command === "version") validateVersion(JSON.parse(readFileSync("package.json", "utf8")));
  else if (command === "pack") pack();
  else if (command === "inspect") inspect();
  else if (command === "confirm") await confirm();
  else throw new Error("Expected command: version, pack, inspect or confirm.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
