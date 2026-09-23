/**
 * Shifts the site's primary/secondary theme colors from the original navy
 * (#0b2545 / #13315c) to a teal/blue-green palette (#0d3d3d / #145c5c),
 * matching the corporate, trust-building tone the client asked for. Accent
 * (gold), background, surface, text, and muted colors are left untouched —
 * only primary/secondary shift.
 *
 * Like scripts/update-content-defaults.cjs, this uses Model.updateOne($set)
 * rather than load-mutate-.save(), because assigning to a field on a bare
 * strict:false schema in this project's Mongoose version does not reliably
 * persist via .save() even with .markModified(). See that script's comment
 * for the full story — this one follows the same proven pattern.
 *
 * Usage:
 *   node scripts/update-theme-colors.cjs            # preview only
 *   node scripts/update-theme-colors.cjs --apply     # write changes
 */
const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") });
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

const mongoose = require("mongoose");

const NEW_PRIMARY = "#0d3d3d";
const NEW_SECONDARY = "#145c5c";

const ThemeSettingsSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const ThemeSettings = mongoose.models.ThemeSettings || mongoose.model("ThemeSettings", ThemeSettingsSchema);

function logChange(label, before, after) {
  if (before === after) {
    console.log(`  = ${label}: unchanged`);
    return false;
  }
  console.log(`  * ${label}: ${JSON.stringify(before)} -> ${JSON.stringify(after)}`);
  return true;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Check your .env.local file.");
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log(`Connected to MongoDB${apply ? "" : " (DRY RUN — pass --apply to write changes)"}.\n`);

  const theme = await ThemeSettings.findOne().lean();
  if (!theme) {
    console.log("ThemeSettings: no document found — nothing to update (a default will be created on first admin save).");
    await mongoose.disconnect();
    process.exit(0);
  }

  const currentPrimary = theme.colors && theme.colors.primary;
  const currentSecondary = theme.colors && theme.colors.secondary;
  const set = {};
  if (logChange("colors.primary", currentPrimary, NEW_PRIMARY)) set["colors.primary"] = NEW_PRIMARY;
  if (logChange("colors.secondary", currentSecondary, NEW_SECONDARY)) set["colors.secondary"] = NEW_SECONDARY;

  if (Object.keys(set).length > 0 && apply) {
    await ThemeSettings.updateOne({ _id: theme._id }, { $set: set });
  }

  console.log(`\n${apply ? "Applied" : "Would apply"} changes to ${Object.keys(set).length > 0 ? 1 : 0} document(s).`);
  if (!apply) console.log("Re-run with --apply to write these changes.");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
