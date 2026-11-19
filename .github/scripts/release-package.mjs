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
const auroraVersion = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)-aurora\.(0|[1-9]\d*)$/;
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

function releaseTag(version) {
  if (stableVersion.test(version)) return "latest";
  if (auroraVersion.test(version)) return "aurora";
  throw new Error("Use a stable version or a prerelease ending with -aurora.N.");
}

function validateVersion(pkg) {
  assert(pkg.name === "@cosmemilton/ui", "Unexpected package name.");
  const tag = releaseTag(pkg.version);
  assert(pkg.private !== true, "A private package cannot be published.");
  const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
  assert(
    lock.version === pkg.version && lock.packages[""].version === pkg.version,
    "Package and lockfile versions differ.",
  );
  return tag;
}

function pack() {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  const tag = process.env.GITHUB_EVENT_NAME === "pull_request" ? null : validateVersion(pkg);
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
    "dist/brand.png",
    "dist/manifest.json",
  ]) {
    assert(files.has(file), `Missing public asset: ${file}`);
  }
  const tarball = basename(packed.filename);
  const metadata = {
    name: pkg.name,
    version: pkg.version,
    tag,
    tarball,
    integrity: integrity(join(outputDirectory, tarball)),
  };
  assert(
    metadata.integrity === packed.integrity,
    "Packed artifact integrity differs from npm metadata.",
  );
  writeFileSync(join(outputDirectory, "release.json"), `${JSON.stringify(metadata, null, 2)}\n`);
  for (const key of ["name", "version", "tag", "tarball"]) output(key, metadata[key]);
  console.log(`Validated ${metadata.name}@${metadata.version}: ${files.size} packaged files.`);
}

function artifact() {
  const metadata = JSON.parse(readFileSync(join(outputDirectory, "release.json"), "utf8"));
  assert(
    metadata.name === "@cosmemilton/ui" && metadata.tag === releaseTag(metadata.version),
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

function versionParts(version) {
  const [base, prerelease] = version.split("-aurora.");
  const parts = base.split(".").map(Number);
  return prerelease === undefined ? parts : [...parts, Number(prerelease)];
}

function compareVersions(left, right) {
  const a = versionParts(left);
  const b = versionParts(right);
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i];
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
  const current = view(metadata.name, "dist-tags")?.[metadata.tag] ?? null;
  assert(
    current === null ||
      (releaseTag(current) === metadata.tag && compareVersions(metadata.version, current) > 0),
    "The release version must be newer than the current version on its npm tag.",
  );
  output("publish", "true");
  console.log(`${metadata.name}@${metadata.version} is unpublished and ready for publication.`);
}

async function confirm() {
  const metadata = artifact();
  // npm processing and CDN propagation can exceed five minutes after an accepted publication.
  for (let attempt = 1; attempt <= 60; attempt++) {
    const published = view(`${metadata.name}@${metadata.version}`, "version", "dist.integrity");
    const current = published ? view(metadata.name, "dist-tags")?.[metadata.tag] : null;
    if (
      published?.version === metadata.version &&
      published["dist.integrity"] === metadata.integrity &&
      current === metadata.version
    ) {
      console.log(
        `Confirmed ${metadata.name}@${metadata.version}, ${metadata.tag} tag and tarball integrity on npm.`,
      );
      return;
    }
    console.log(`Waiting for npm processing/propagation (${attempt}/60; up to 10 minutes).`);
    if (attempt < 60) await new Promise((resolve) => setTimeout(resolve, 10000));
  }
  throw new Error(
    "npm publication was attempted, but processing/propagation was not confirmed within the 10-minute polling window. Check the registry before retrying.",
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
