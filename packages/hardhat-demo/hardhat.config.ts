import { task, HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy-ethers";
import "hardhat-deploy";
import "@symfoni/hardhat-react";
import "@symfoni/hardhat-typechain";
import "typechain-target-ethers-v5";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.6.0",
      },
      {
        version: "0.6.2",
        settings: {
          optimizer: {
            enabled: true,
            runs: 50,
          },
        },
      },
    ],
  },
  paths: {
    artifacts: "./frontend/src/hardhat/artifacts",
    deployments: "./frontend/src/hardhat/deployments",
    react: "",
  },
};

export default config;
