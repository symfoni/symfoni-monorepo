import "@nomiclabs/buidler/types";

interface React {
  providerPriority?: string[];
}
// TODO Fix for typechain config
interface TypechainConfig {
  outDir?: string;
  target?: "ethers-v4" | "ethers-v5" | "truffle" | "web3-v1" | "truffle-v5";
}

declare module "@nomiclabs/buidler/types" {
  export interface BuidlerConfig {
    react?: React;
    typechain: TypechainConfig; // TODO : // Fix for typechain config
  }

  export interface ResolvedBuidlerConfig {
    react: React;
  }

  export interface ProjectPaths {
    react?: string;
  }
  export interface BuidlerRuntimeEnvironment {}
}
