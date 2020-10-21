import { BuidlerConfig, usePlugin } from "@nomiclabs/buidler/config";
// import { CapTableTasks } from './scripts/tasks';

usePlugin("buidler-ethers-v5");
usePlugin("buidler-deploy");
usePlugin("@symfoni/buidler-typechain");
usePlugin("@symfoni/buidler-react");
usePlugin("@symfoni/buidler-storage");

const config: BuidlerConfig = {
  defaultNetwork: "buidlerevm",
  networks: {
    buidlerevm: {
      accounts: [
        {
          balance: "0x1B1AE4D6E2EF500000", //5000
          privateKey:
            "0x50228cca6dd3264c74713855801d16e63a2b0e42e86fa374562316a629d03a30",
        },
      ],
    },
    localhost: {
      url: "HTTP://127.0.0.1:8545",
    },
  },
  paths: {
    artifacts: "./frontend/src/buidler/artifacts",
    // "cache": "./.dist/.cache/buidler/cache",
    // "sources": "./.symf/",
    // "tests": "./.symf/tests",
    // deploy: "./deploy",
    deployments: "./frontend/src/buidler/deployments",
    react: "./frontend/src/buidler",
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 50,
    },
  },
  typechain: {
    outDir: "./frontend/src/buidler/typechain",
    target: "ethers-v5",
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  react: {
    providerPriority: ["web3modal", "dev", "HTTP://127.0.0.1:8545"],
  },
  // storage: {
  //   patterns: {
  //     SimpleStorage: {
  //       type: "document",
  //     },
  //   },
  //   providers: {
  //     localhost: {
  //       type: "hub",
  //       key: "bdsmrirkgb3n5qndmntxuy4w6jq",
  //     },
  //   },
  // },
};
export default config;
