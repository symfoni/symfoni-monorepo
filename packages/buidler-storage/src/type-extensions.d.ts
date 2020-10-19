import "@nomiclabs/buidler/types";

// TODO Fix for typechain config
interface TypechainConfig {
  outDir?: string;
  target?: "ethers-v4" | "ethers-v5" | "truffle" | "web3-v1" | "truffle-v5";
}

interface Storage {
  patterns: Patterns;
  providers: {
    [network: string]: Hub;
  };
}

interface StorageProviderConfig {
  type: "hub" | string;
}

interface Hub extends StorageProviderConfig {
  key: string;
}

interface Patterns {
  [contractName: string]: Pattern;
}

interface Pattern {
  type: "document" | "data";
  target?: "eth" | "storage";
  name?: string;
  save?: string;
  get?: string;
  list?: string;
  check?: string;
}

declare module "@nomiclabs/buidler/types" {
  export interface BuidlerConfig {
    storage?: Storage;
  }

  export interface ResolvedBuidlerConfig {
    storage?: Storage;
  }

  export interface ProjectPaths {}
  export interface BuidlerRuntimeEnvironment {}
}
