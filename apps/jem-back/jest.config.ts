import baseConfig from "../../packages/jest-config/jest.config.base";
import { Config } from "jest";

const config: Config = {
  ...baseConfig,
  rootDir: ".",
  displayName: "jem-back",
};

export default config;
