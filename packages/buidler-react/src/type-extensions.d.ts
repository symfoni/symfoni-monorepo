import "@nomiclabs/buidler/types";

interface React {
  providerPriority?: string[];
}

declare module "@nomiclabs/buidler/types" {
  export interface BuidlerConfig {
    react?: React;
  }

  export interface ResolvedBuidlerConfig {
    react: React;
  }

  export interface ProjectPaths {
    react?: string;
  }
}
