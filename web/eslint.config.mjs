import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import i18next from "eslint-plugin-i18next";

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([
    ".next/**",
    ".next_old/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    "scripts/**",
  ]),
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      i18next,
    },
    rules: {
      // ── Zero Hardcoded Styles Rule (Enforce CSS Modules / Primitives) ──
      "react/forbid-dom-props": ["warn", { forbid: ["style"] }],
      "react/forbid-component-props": ["warn", { forbid: ["style"] }],

      // ── React & Hooks Discipline ──
      "react-hooks/exhaustive-deps": "warn",
      "no-unused-vars": "off",

      // ── Accessibility (A11y) Standards ──
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-has-content": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/heading-has-content": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",
      "jsx-a11y/no-static-element-interactions": "warn",
      "jsx-a11y/click-events-have-key-events": "warn",
    },
  },
]);

export default eslintConfig;
