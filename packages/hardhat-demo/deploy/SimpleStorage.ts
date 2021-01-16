// module.exports = async ({
//   getNamedAccounts,
//   deployments,
//   getChainId,
//   getUnnamedAccounts,
// }) => {
//   const { deploy } = deployments;
//   const { deployer } = await getNamedAccounts();

//   // the following will only deploy "GenericMetaTxProcessor" if the contract was never deployed or if the code changed since last deployment
//   const deploy1 = await deploy("SimpleStorage", {
//     from: deployer,
//     // gas: 4000000,
//     args: [],
//   });
// };

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  await deploy("SimpleStorageA", {
    from: deployer,
    contract: "SimpleStorage",
    args: [],
    log: true,
  });
  await deploy("SimpleStorageB", {
    from: deployer,
    contract: "SimpleStorage",
    args: [],
    log: true,
  });
};
export default func;
// func.tags = ['SimpleStorage'];
// func.dependencies = ['SimpleStorageA'];
