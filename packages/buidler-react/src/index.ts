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

function isBuidlerEVM(bre: BuidlerRuntimeEnvironment): boolean {
  const { network, buidlerArguments, config } = bre;
  return !(
    network.name !== BUIDLEREVM_NETWORK_NAME &&
    // We normally set the default network as buidlerArguments.network,
    // so this check isn't enough, and we add the next one. This has the
    // effect of `--network <defaultNetwork>` being a false negative, but
    // not a big deal.
    buidlerArguments.network !== undefined &&
    buidlerArguments.network !== config.defaultNetwork
  );
}

export default function() {
  /* extend config */
  extendConfig((config, userConfig) => {
    if (userConfig.react == undefined) {
      config.react = {
        providerPriority: ["web3modal"]
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
      console.log(chalk.red(`Running React`));
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
