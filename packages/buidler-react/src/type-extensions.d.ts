import "@nomiclabs/buidler/types";

interface React {
  providerPriority?: string[];
}
// TODO Fix for typechain config
interface TypechainConfig {
  outDir?: string;
  target?: "ethers-v4" | "ethers-v5" | "truffle" | "web3-v1" | "truffle-v5";
}

interface Storage {
  patterns: Patterns;
  providers: {
    [network: string]: StorageProviderConfig;
  };
}

interface Patterns {
  [contractName: string]: Pattern;
}

interface Pattern {
  type: "document" | "data";
  target?: "eth" | "storage"; // Defaults to storage
  name?: string;
  save?: string;
  get?: string;
  list?: string;
  check?: string;
}

interface StorageProviderConfig {
  type: "hub" | string;
}

interface Hub extends StorageProviderConfig {
  key: string;
}

declare module "@nomiclabs/buidler/types" {
  export interface BuidlerConfig {
    react?: React;
    typechain: TypechainConfig; // TODO : // Fix for typechain config
    storage?: Storage;
  }

  export interface ResolvedBuidlerConfig {
    react: React;
    storage?: Storage;
  }

  export interface ProjectPaths {
    react?: string;
  }
  export interface BuidlerRuntimeEnvironment {}
}
