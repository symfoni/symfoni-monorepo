import { task, HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy-ethers";
import "hardhat-deploy";
import "@symfoni/hardhat-react";

const config: HardhatUserConfig = {
  solidity: "0.7.3",
  paths: {
    artifacts: "./frontend/src/buidler/artifacts",
    deployments: "./frontend/src/buidler/deployments",
    react: "./frontend/src/buidler",
  },
};

export default config;
