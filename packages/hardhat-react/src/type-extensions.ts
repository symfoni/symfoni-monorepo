import { string } from "hardhat/internal/core/params/argumentTypes";
import "hardhat/types/config";
import "hardhat/types/runtime";

export interface React {
  defaultProvider: string;
  defaultSigner?: string;
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
  }
  export interface HardhatConfig {
    react: React;
  }

  // HTTP Network
  export interface HttpNetworkUserConfig {
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
