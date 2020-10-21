import {
  extendConfig,
  extendEnvironment,
  internalTask,
  task,
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
        ...config.react,
        ...{
          providerPriority: ["web3modal"],
        },
      };
    }
    if (userConfig.paths == undefined) {
      config.paths = {
        ...config.paths,
        ...{
          artifacts: "./frontend/src/buidler/artifacts",
          deployments: "./frontend/src/buidler/deployments",
          react: "./frontend/src/buidler",
        },
      };
    }
    if (userConfig.typechain == undefined) {
      config.typechain = {
        ...config.typechain,
        ...{
          outDir: "./frontend/src/buidler/typechain",
          target: "ethers-v5",
        },
      };
    }
    if (userConfig.namedAccounts == undefined) {
      config.namedAccounts = {
        ...config.namedAccounts,
        ...{
          deployer: {
            default: 0,
          },
        },
      };
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
      await bre.run("typechain");
      console.log(chalk.green(`Running React`));
      await bre.run("react:run:before", args);
      const context = new ContextGenerator(args, bre);
      await context.generate();
      await context.save();
      await bre.run("react:run:after", args);
      return;
    }
  );

  internalTask("deploy:watch:after", "").setAction(
    async (args, bre, runSuper) => {
      try {
        await runSuper(args);
        await bre.run("react:run", args);
        return;
      } catch (e) {
        console.error(e);
      }
    }
  );

  internalTask(
    "deploy:runDeploy",
    "Generate react component after deploy"
  ).setAction(async (args, bre, runSuper) => {
    try {
      await runSuper(args);
      await bre.run("react:run", args);
      return;
    } catch (e) {
      console.error(e);
    }
  });

  task("react", "Create React component")
    .addFlag("reset", "whether to delete deployments files first")
    .addFlag("log", "whether to output log")
    .addFlag("watch", "regenerate React component on solidity file change")
    .setAction(async (args, bre) => {
      await bre.run("react:run", args); // TODO Put in internal task for reuseability
    });

  internalTask(
    "react:run:before",
    "Run tasks before react generation has started."
  ).setAction(async (args, bre, runSuper) => {
    try {
      console.log(chalk.green(`Running react:run:before`));
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
      console.log(chalk.green(`Running react:run:after`));
      return;
    } catch (e) {
      throw Error(e);
    }
  });
}
