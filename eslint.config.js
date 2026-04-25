import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";

export default [
  // 1. Global ignores
  {
    ignores: [
      "**/dist/**",
      "**/build/**",
      "**/cdk.out/**",
      "**/node_modules/**",
    ],
  },

  // 2. Base JS rules for all JS/TS files
  js.configs.recommended,

  // 3. TypeScript rules for all TS files
  ...tseslint.configs.recommended,

  // 4. React-specific rules for the web app
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },

  // 5. Node globals for the API and infra
  {
    files: ["apps/api/**/*.ts", "infra/**/*.ts", "packages/**/*.ts"],
    languageOptions: {
      globals: globals.node,
    },
  },

  // 6. Prettier compatibility — must be LAST
  prettierConfig,
];
