import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // React Three Fiber requires mutating three.js objects (controls, materials).
    // The React Compiler purity rules do not understand this idiom.
    files: [
      "src/components/**/{viewer,detail}/**/*.{ts,tsx}",
      "src/components/viewer/**/*.{ts,tsx}",
      "src/components/landing/hero/KeyboardModel.tsx",
      "src/components/landing/hero/HeroCanvas.tsx",
      "src/components/assembly/workspace/scene/**/*.{ts,tsx}",
    ],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
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
