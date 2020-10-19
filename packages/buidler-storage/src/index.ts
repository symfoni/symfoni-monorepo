import {
  extendConfig,
  extendEnvironment,
  task
} from "@nomiclabs/buidler/config";
import { BUIDLEREVM_NETWORK_NAME } from "@nomiclabs/buidler/plugins";
import { BuidlerRuntimeEnvironment } from "@nomiclabs/buidler/types";

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

  task("storage", "Create React storage component")
    .addParam("provider", "Choose what storage provider to use options: hub")
    .setAction(async (args, bre) => {
      // const user = new Client()
      // user.create()
    });
}
