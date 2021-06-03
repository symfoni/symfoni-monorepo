import { TypechainConfig } from "@typechain/hardhat/dist/types";
import "hardhat/types/config";
import "hardhat/types/runtime";

export interface React {
  providerPriority: string[];
  fallbackProvider?: string;
  skip?: string[];
  handle?: string[];
  providerOptions?: {
    [id in "walletconnect"]: {
      options?: any;
    };
  };
}

export interface SymfoniAccount {
  inject?: boolean;
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
    typechain?: TypechainConfig;
  }
  export interface HardhatConfig {
    react: React;
    typechain: TypechainConfig;
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
  }
  export interface HDAccountsUserConfigSymfoni {
    inject?: boolean;
  }
  export interface HttpNetworkUserConfig {
    inject?: boolean;
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
  export interface HardhatRuntimeEnvironment {}
}
