import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated launch-video tooling (gitignored), not app code
    "brag-output/**",
  ]),
  {
    rules: {
      // `const { password, ...safeUser } = user` deliberately drops a field; that isn't an unused variable
      "@typescript-eslint/no-unused-vars": ["warn", { ignoreRestSiblings: true }],
      // Photos are Cloudinary URLs already resized/compressed by URL transformations (src/lib/images.ts);
      // next/image would re-optimize them through Vercel's metered image optimization for no gain
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
