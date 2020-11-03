import { HardhatRuntimeEnvironment, DeployFunction } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  await deploy("SimpleStorage", {
    from: deployer,
    // gas: 4000000,
    args: [],
  });
};
export default func;
