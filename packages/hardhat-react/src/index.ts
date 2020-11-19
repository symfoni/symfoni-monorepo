import { extendConfig, extendEnvironment, task, subtask } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import { HardhatConfig, HardhatUserConfig } from "hardhat/types";
import path from "path";
import chalk from "chalk";
import { TsMorphProject } from "./TsMorhProject";
import "hardhat-deploy/dist/src/type-extensions";
import "hardhat-typechain/dist/src/type-extensions";
import "./type-extensions";
import { debug } from "debug";

export const TASK_REACT = "react";
export const TASK_REACT_MAIN = "react:main";
import { TASK_DEPLOY_RUN_DEPLOY } from "hardhat-deploy";

const log = debug("hardhat:plugin:react");
extendConfig(
  (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    // set default config
    if (!userConfig.react) {
      config.react = {
        providerPriority: ["web3modal", "hardhat"],
      };
    } else {
      // if (!userConfig.react.injectWallet) {
      //   config.react.injectWallet = false;
      // }
      if (!userConfig.react.providerPriority) {
        config.react.providerPriority = ["web3modal", "hardhat"];
      }
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

    // Set deployments path default
    const userDeploymentPath = userConfig.paths?.deployments;
    if (userDeploymentPath === undefined) {
      const newDeploymentPath = path.join(
        config.paths.root,
        "./frontend/src/hardhat/deployments"
      );
      config.paths.deployments = newDeploymentPath;
    }

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

subtask(TASK_REACT_MAIN, "Run React context component generation.").setAction(
  async (args, hre) => {
    await hre.run("typechain");
    log("Running Hardhat React");
    const context = new TsMorphProject(args, hre);

    log("START generate context");
    await context.generate();
    log("END generate context");

    log("START save context");
    await context.save();
    log("END save context");
    console.info(chalk.green("Successfully generated React context!"));
    return;
  }
);

subtask(
  TASK_DEPLOY_RUN_DEPLOY,
  "Generate react component after deploy"
).setAction(async (args, hre, runSuper) => {
  try {
    if (!runSuper.isDefined)
      throw Error("runSuper not defined for " + TASK_DEPLOY_RUN_DEPLOY);
    await runSuper(args);
    await hre.run(TASK_REACT_MAIN, args);
    return;
  } catch (e) {
    throw Error(e);
  }
});

task(TASK_REACT, "Create React component")
  .addFlag("noReactOutput", "whether to save react context to disk") // TODO ADD more paramters (path, debug etc)
  .setAction(async (args, hre) => {
    await hre.run(TASK_REACT_MAIN, args);
  });
