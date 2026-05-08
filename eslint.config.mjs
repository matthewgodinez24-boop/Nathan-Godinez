import nextConfig from "eslint-config-next";

/**
 * ESLint 9 + Next 16 flat config.
 *
 * Note: `eslint-config-next` v16 already exports a *flat* config array. The
 * earlier scaffold here used `FlatCompat(...).extends(...)`, which is the
 * shim for legacy eslintrc configs — wrapping a flat config in FlatCompat
 * crashes ESLint with a "Converting circular structure to JSON" error. So we
 * spread the array directly instead.
 */
const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "out/**", "next-env.d.ts"],
  },
  ...nextConfig,
];

export default eslintConfig;
