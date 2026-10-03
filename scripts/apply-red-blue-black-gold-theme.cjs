/**
 * Applies the client's requested premium Red + Blue + Black + Gold palette
 * to ThemeSettings. Only touches the `colors` sub-object (border radius,
 * button style, heading font are left as whatever the admin already has).
 *
 * Uses the raw collection + updateOne($set) rather than load-mutate-.save(),
 * matching this project's established safe pattern for ThemeSettings (see
 * scripts/update-theme-colors.cjs for the full story on why).
 *
 * Usage:
 *   node scripts/apply-red-blue-black-gold-theme.cjs            # preview only
 *   node scripts/apply-red-blue-black-gold-theme.cjs --apply    # write changes
 */
const path = require("path");
const fs = require("fs");

const envPath = path.resolve(process.cwd(), ".env.local");
const envText = fs.readFileSync(envPath, "utf8");
const match = envText.match(/^MONGODB_URI\s*=\s*(.+)$/m);
let uri = match ? match[1].trim() : null;
if (uri && (uri.startsWith('"') || uri.startsWith("'"))) uri = uri.slice(1, -1);
if (!uri) throw new Error("MONGODB_URI not found in .env.local");

const mongoose = require(path.resolve(process.cwd(), "node_modules/mongoose"));

const NEW_COLORS = {
  primary: "#123B63", // deep blue — main brand color
  secondary: "#0B1F3A", // darkest navy — gradients / premium sections / hover
  accent: "#D4AF37", // gold — premium accent, used sparingly
  highlight: "#B5121B", // strategic red accent
  dark: "#111111", // near-black — footer / premium contrast
  background: "#F7F8FA", // light neutral
  surface: "#ffffff",
  text: "#111111",
  muted: "#5B6472",
};

async function main() {
  const apply = process.argv.includes("--apply");
  await mongoose.connect(uri);
  const col = mongoose.connection.collection("themesettings");
  let doc = await col.findOne({});
  if (!doc) {
    console.log("No ThemeSettings document yet — it will be created with schema defaults (already the new palette) on first admin page load / API call.");
    process.exit(0);
  }

  console.log(apply ? "Applying changes:" : "Preview (pass --apply to write):");
  for (const [key, value] of Object.entries(NEW_COLORS)) {
    const before = doc.colors?.[key];
    console.log(`  ${before === value ? "=" : "*"} colors.${key}: ${JSON.stringify(before)} -> ${JSON.stringify(value)}`);
  }

  if (apply) {
    const $set = {};
    for (const [key, value] of Object.entries(NEW_COLORS)) {
      $set[`colors.${key}`] = value;
    }
    await col.updateOne({ _id: doc._id }, { $set });
    console.log("Applied.");
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
