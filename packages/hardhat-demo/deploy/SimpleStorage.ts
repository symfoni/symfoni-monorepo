import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  await deploy("SimpleStorage", {
    from: deployer,
    contract: "SimpleStorage",
    args: [],
    log: true,
  });

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
