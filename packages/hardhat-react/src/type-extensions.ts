import "hardhat/types/config";
import "hardhat/types/runtime";

export interface React {
  providerPriority: string[];
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

  export interface HardhatNetworkHDAccountsUserConfig {
    inject?: boolean;
  }
  export interface HardhatNetworkAccountUserConfig {
    inject?: boolean;
  }
  export interface HardhatNetworkHDAccountsConfig {
    inject?: boolean;
  }
  export interface HardhatNetworkAccountConfig {
    inject?: boolean;
  }
}

declare module "hardhat/types/runtime" {
  export interface HardhatRuntimeEnvironment {
    //
  }
}
