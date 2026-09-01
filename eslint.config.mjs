import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The admin dashboard's client-side forms intentionally hold loosely
      // typed state (raw fetched JSON edited in a form) — the API routes do
      // the real validation with zod. Not worth fighting the type system for
      // internal admin UI state.
      "@typescript-eslint/no-explicit-any": "off",
      // Common, safe "fetch on mount" pattern used throughout the admin
      // dashboard (useEffect(() => { load() }, [])).
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
