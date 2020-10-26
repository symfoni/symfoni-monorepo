import {
  extendConfig,
  extendEnvironment,
  task,
  internalTask,
} from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import { HardhatConfig, HardhatUserConfig } from "hardhat/types";
import path from "path";
import "./type-extensions";
import chalk from "chalk";
import { TsMorphProject } from "./TsMorhProject";
import "hardhat-deploy/dist/src/type-extensions";
import "hardhat-typechain/dist/src/type-extensions";
import { debug } from "debug";

const log = debug("hardhat:plugin:react");
extendConfig(
  (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    // set default config
    if (!userConfig.react) {
      config.react = {
        providerPriority: ["web3modal"],
      };
    }
    // Set react path
    const userReactPath = userConfig.paths?.react;
    let newReactPath: string;
    if (userReactPath === undefined) {
      newReactPath = path.join(config.paths.root, "./frontend/src/hardhat");
    } else {
      if (path.isAbsolute(userReactPath)) {
        newReactPath = userReactPath;
      } else {
        newReactPath = path.normalize(
          path.join(config.paths.root, userReactPath)
        );
      }
    }
    config.paths.react = newReactPath;

    // Set some defaults for other plugins to get fast going.

    // deployer
    if (userConfig.namedAccounts == undefined) {
      config.namedAccounts = {
        deployer: {
          default: 0,
        },
      };
    }

    // typechain
    if (!userConfig.typechain) {
      // defaults
      config.typechain = {
        outDir: path.join(
          config.paths.root,
          "./frontend/src/hardhat/typechain"
        ),
        target: "ethers-v5",
      };
    } else {
      const userTypechainOutdir = userConfig.typechain.outDir;
      let newTypechainPath: string;
      if (!userTypechainOutdir) {
        newTypechainPath = path.join(
          config.paths.root,
          "./frontend/src/hardhat/typechain"
        );
      } else {
        if (path.isAbsolute(userTypechainOutdir)) {
          newTypechainPath = userTypechainOutdir;
        } else {
          newTypechainPath = path.normalize(
            path.join(config.paths.root, userTypechainOutdir)
          );
        }
      }
      config.typechain.outDir = newTypechainPath;
      if (!userConfig.typechain.target) {
        config.typechain.target = "ethers-v5";
      }
    }
  }
);

extendEnvironment((hre) => {
  // We add a field to the Hardhat Runtime Environment here.
  // We use lazyObject to avoid initializing things until they are actually
  // needed.
  // hre.example = lazyObject(() => new ExampleHardhatRuntimeEnvironmentField());
});

internalTask("react:run", "Run React context component generation.").setAction(
  async (args, hre) => {
    await hre.run("typechain");
    log("Running Hardhat React");
    await hre.run("react:run:before", args);
    const context = new TsMorphProject(args, hre);

    log("START generate context");
    await context.generate();
    log("END generate context");

    log("START save context");
    await context.save();
    log("END save context");
    console.info(chalk.green("Successfully generated React context!"));
    await hre.run("react:run:after", args);
    return;
  }
);

internalTask(
  "deploy:runDeploy",
  "Generate react component after deploy"
).setAction(async (args, hre, runSuper) => {
  try {
    await runSuper(args);
    await hre.run("react:run", args);
    return;
  } catch (e) {
    console.error(e);
  }
});

task("react", "Create React component")
  .addFlag("noReactOutput", "whether to save react context to disk") // TODO ADD more paramters (path, debug etc)
  .setAction(async (args, hre) => {
    await hre.run("react:run", args);
  });

internalTask(
  "react:run:before",
  "Run tasks before react generation has started."
).setAction(async (args, hre, runSuper) => {
  try {
    return;
  } catch (e) {
    throw Error(e);
  }
});

internalTask(
  "react:run:after",
  "Run tasks after react generation is complete."
).setAction(async (args, bre, runSuper) => {
  try {
    return;
  } catch (e) {
    throw Error(e);
  }
});
