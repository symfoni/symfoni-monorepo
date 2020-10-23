import "hardhat/types/config";
import "hardhat/types/runtime";

export interface React {
  providerPriority?: string[];
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
}

declare module "hardhat/types/runtime" {
  export interface HardhatRuntimeEnvironment {
    //
  }
}
