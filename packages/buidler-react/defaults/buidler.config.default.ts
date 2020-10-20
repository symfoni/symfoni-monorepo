import { BuidlerConfig, usePlugin } from "@nomiclabs/buidler/config";

usePlugin("buidler-ethers-v5");
usePlugin("buidler-deploy");
usePlugin("@symfoni/buidler-typechain");
usePlugin("@symfoni/buidler-react");

const config: BuidlerConfig = {
  solc: {
    version: "0.6.8",
  },
};

export default config;