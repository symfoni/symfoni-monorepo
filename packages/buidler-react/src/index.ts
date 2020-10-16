import {
  extendConfig,
  extendEnvironment,
  internalTask,
  task
} from "@nomiclabs/buidler/config";
// import { lazyObject } from "@nomiclabs/buidler/plugins";
import { readArtifactSync, readArtifact } from "@nomiclabs/buidler/plugins";

import path from "path";
import { ContextGenerator } from "./ContextGenerator";
import { BuidlerRuntimeEnvironment } from "@nomiclabs/buidler/types";

export default function() {
  /* extend config */
  extendConfig((config, userConfig) => {
    if (userConfig.react == undefined) {
      config.react = {};
    }
    if (userConfig.paths?.react === undefined) {
      config.paths = { ...config.paths, react: "./frontend/src/buidler" };
    }
    if (userConfig.storage == undefined) {
      config.storage = {
        patterns: {},
        providers: {}
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

  /* Add task */
  internalTask("react:run", "Run react component generation ")
    .addFlag("reset", "whether to delete deployments files first")
    .addFlag("log", "whether to output log")
    .addFlag("watch", "redeploy on every change of contract or deploy script")
    .setAction(async (args, bre) => {
      console.log("### React started ###");
    });

  task("react", "Create React component")
    .addFlag("reset", "whether to delete deployments files first")
    .addFlag("log", "whether to output log")
    .addFlag("watch", "regenerate React component on solidity file change")
    .setAction(async (args, bre) => {
      const context = new ContextGenerator(args, bre);
      await context.generate();
      // await bre.run("react:run", args); // TODO Put in internal task for reuseability
    });

  task("storage", "Create React component")
    .addParam("provider", "Choose what storage provider to use options: hub")
    .setAction(async (args, bre) => {
      // const user = new Client()
      // user.create()
    });
}
