import { config as baseConfig } from "../../packages/eslint-config/base.js";

const config = [
  ...baseConfig,
  {
    files: ["**/*.js", "**/*.ts", "**/*.tsx"],
  },
];

export default config;
