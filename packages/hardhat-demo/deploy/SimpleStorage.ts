import {
  BuidlerRuntimeEnvironment,
  DeployFunction,
} from "@nomiclabs/buidler/types";

const func: DeployFunction = async function(bre: BuidlerRuntimeEnvironment) {
  const { deploy } = bre.deployments;
  const { deployer } = await bre.getNamedAccounts();
  await deploy("SimpleStorage", {
    from: deployer,
    // gas: 4000000,
    args: [],
  });
};
export default func;
