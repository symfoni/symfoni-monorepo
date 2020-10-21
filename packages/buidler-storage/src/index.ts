import {
  extendConfig,
  extendEnvironment,
  task,
} from "@nomiclabs/buidler/config";
import { BUIDLEREVM_NETWORK_NAME } from "@nomiclabs/buidler/plugins";
import { BuidlerRuntimeEnvironment } from "@nomiclabs/buidler/types";
import chalk from "chalk";

export default function () {
  /* extend config */
  extendConfig((config, userConfig) => {
    if (userConfig.storage == undefined) {
      config.storage = {
        patterns: {},
        providers: {},
      };
    } else {
      if (userConfig.storage.patterns) {
        // TODO Create default configrations
      }
    }
  });

  extendEnvironment((bre: BuidlerRuntimeEnvironment) => {
    //
  });

  task("storage", "Create React storage component")
    .addParam("provider", "Choose what storage provider to use options: hub")
    .setAction(async (args, bre) => {
      console.log(chalk.blue("Running storage"));
    });
}
