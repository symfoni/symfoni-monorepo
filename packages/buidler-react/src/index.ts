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
      // const getArtifact = async (contractName: string): Promise<any> => {
      //   let artifact;
      //   try {
      //     artifact = await readArtifact(
      //       bre.config.paths.artifacts,
      //       contractName
      //     );
      //   } catch (e) {
      //     try {
      //       artifact = await readArtifact(
      //         bre.config.paths.imports ||
      //           path.join(bre.config.paths.root, "imports"),
      //         contractName
      //       );
      //     } catch (ee) {
      //       throw e;
      //     }
      //   }
      //   return artifact;
      // };

      // get all typechains objects
      // for each typechain object
      // Check if it has deployment, then add code that will connect contract init to that instace

      const context = new ContextGenerator(bre, args);
      // console.log(await bre.deployments.get("SimpleStorage"));
      await bre.run("react:run", args);
    });

  task("storage", "Create React component")
    .addParam("provider", "Choose what storage provider to use options: hub")
    .setAction(async (args, bre) => {
      // const user = new Client()
      // user.create()
    });
}
