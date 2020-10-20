import {
  extendConfig,
  extendEnvironment,
  internalTask,
  task
} from "@nomiclabs/buidler/config";
import { BUIDLEREVM_NETWORK_NAME } from "@nomiclabs/buidler/plugins";
import { BuidlerRuntimeEnvironment } from "@nomiclabs/buidler/types";
import chalk from "chalk";
import { ContextGenerator } from "./ContextGenerator";

export default function () {
  /* extend config */
  extendConfig((config, userConfig) => {
    if (userConfig.react == undefined) {
      config.react = {
        ...config.react, ...{
          providerPriority: ["web3modal"]
        }
      };
    }
    if (userConfig.paths == undefined) {
      config.paths = {
        ...config.paths, ...{
          artifacts: "./frontend/src/buidler/artifacts",
          deployments: "./frontend/src/buidler/deployments",
          react: "./frontend/src/buidler",
        }
      }
    }
    if (userConfig.typechain == undefined) {
      config.typechain = {
        ...config.typechain, ...{
          outDir: "./frontend/src/buidler/typechain",
          target: "ethers-v5"
        }
      }
    }
    if(userConfig.namedAccounts == undefined){
      config.namedAccounts = {...config.namedAccounts, ...{
        deployer: {
          default: 0,
        },
      }}
    }
    if (userConfig.paths?.react === undefined) {
      config.paths = { ...config.paths, react: "./frontend/src/buidler" };
    }
  });

  extendEnvironment((bre: BuidlerRuntimeEnvironment) => {
    //
  });

  /* Add task */
  internalTask("react:run", "Run react component generation").setAction(
    async (args, bre) => {
      await bre.run("typechain")
      console.log(chalk.green(`Running React`));
      const context = new ContextGenerator(args, bre);
      await context.generate();
      await context.save();
    }
  );

  internalTask("deploy:run", "deploy ").setAction(
    async (args, bre, runSuper) => {
      try {
        await runSuper(args);
        await bre.run("react:run", args);
      } catch (e) {
        console.error(e);
      }
    }
  );

  task("react", "Create React component")
    .addFlag("reset", "whether to delete deployments files first")
    .addFlag("log", "whether to output log")
    .addFlag("watch", "regenerate React component on solidity file change")
    .setAction(async (args, bre) => {
      await bre.run("react:run", args); // TODO Put in internal task for reuseability
    });
}
