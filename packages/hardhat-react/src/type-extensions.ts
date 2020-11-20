import "hardhat/types/config";
import "hardhat/types/runtime";

export interface React {
  providerPriority: string[];
  skip?: string[];
  handle?: string[];
}

export interface SymfoniAccount {
  inject?: boolean;
  user?: string;
  password?: string;
}

declare module "hardhat/types/config" {
  export interface ProjectPathsUserConfig {
    react?: string;
  }
  export interface ProjectPathsConfig {
    react: string;
  }

  export interface HardhatUserConfig {
    react?: React;
  }
  export interface HardhatConfig {
    react: React;
  }

  // HardhatNetwork

  // export interface HardhatNetworkHDAccountsUserConfig {
  //   inject?: boolean;
  // }
  // export interface HardhatNetworkAccountUserConfig {
  //   inject?: boolean;
  // }
  // export interface HardhatNetworkHDAccountsConfig {
  //   inject?: boolean;
  // }
  // export interface HardhatNetworkAccountConfig {
  //   inject?: boolean;
  // }

  export interface HardhatNetworkUserConfig {
    inject?: boolean;
  }
  export interface HardhatNetworkConfig {
    inject?: boolean;
  }

  // HTTP Network
  export interface HttpNetworkHDAccountsConfigSymfoni {
    inject?: boolean;
    user?: string;
    password?: string;
  }
  export interface HDAccountsUserConfigSymfoni {
    inject?: boolean;
    user?: string;
    password?: string;
  }
  export interface HttpNetworkUserConfig {
    inject?: boolean;
    user?: string;
    password?: string;
    providerType?:
      | "UrlJsonRpcProvider"
      | "AlchemyProvider"
      | "AlchemyWebSocketProvider"
      | "CloudflareProvider"
      | "EtherscanProvider"
      | "InfuraProvider"
      | "InfuraWebSocketProvider"
      | "JsonRpcProvider"
      | "NodesmithProvider"
      | "PocketProvider"
      | "StaticJsonRpcProvider"
      | "Web3Provider"
      | "WebSocketProvider"
      | "IpcProvider"
      | "JsonRpcSigner"
      | "ExternalProvider";
  }
  export interface HttpNetworkConfig {
    inject?: boolean;
    user?: string;
    password?: string;
    providerType?:
      | "UrlJsonRpcProvider"
      | "AlchemyProvider"
      | "AlchemyWebSocketProvider"
      | "CloudflareProvider"
      | "EtherscanProvider"
      | "InfuraProvider"
      | "InfuraWebSocketProvider"
      | "JsonRpcProvider"
      | "NodesmithProvider"
      | "PocketProvider"
      | "StaticJsonRpcProvider"
      | "Web3Provider"
      | "WebSocketProvider"
      | "IpcProvider"
      | "JsonRpcSigner"
      | "ExternalProvider";
  }
}

declare module "hardhat/types/runtime" {
  export interface HardhatRuntimeEnvironment {
    //
  }
}
