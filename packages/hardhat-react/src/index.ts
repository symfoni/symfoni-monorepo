import { extendConfig, extendEnvironment } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import { HardhatConfig, HardhatUserConfig } from "hardhat/types";
import path from "path";
// This import is needed to let the TypeScript compiler know that it should include your type
// extensions in your npm package's types file.
import "./type-extensions.ts";

extendConfig(
  (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    const userReactPath = userConfig.paths?.react;
    let newReactPath: string;
    if (userReactPath === undefined) {
      newReactPath = path.join(config.paths.root, "./frontend/src/hardhat");
    } else {
      if (path.isAbsolute(userReactPath)) {
        newReactPath = userReactPath;
      } else {
        // We resolve relative paths starting from the project's root.
        // Please keep this convention to avoid confusion.
        newReactPath = path.normalize(
          path.join(config.paths.root, userReactPath)
        );
      }
    }

    config.paths.react = newReactPath;
  }
);

extendEnvironment((hre) => {
  // We add a field to the Hardhat Runtime Environment here.
  // We use lazyObject to avoid initializing things until they are actually
  // needed.
  // hre.example = lazyObject(() => new ExampleHardhatRuntimeEnvironmentField());
});
