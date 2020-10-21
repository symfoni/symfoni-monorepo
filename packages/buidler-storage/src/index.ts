import {
  extendConfig,
  extendEnvironment,
  internalTask,
  task,
} from "@nomiclabs/buidler/config";
import { BuidlerRuntimeEnvironment } from "@nomiclabs/buidler/types";
import chalk from "chalk";
import { StorageGenerator } from "./StorageGenerator";

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
      await bre.run("storage:run");
    });

  internalTask("storage:run", "Run react component generation").setAction(
    async (args, bre) => {
      console.log(chalk.blue("Running storage"));
      const context = new StorageGenerator(args, bre);
      await context.generate();
    }
  );

  internalTask("react:run:after", "Run react component generation").setAction(
    async (args, bre, runSuper) => {
      await runSuper(args);
      await bre.run("storage:run");
      return;
    }
  );
}
