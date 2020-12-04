import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy-ethers";
import "hardhat-deploy";
import "@symfoni/hardhat-react";
import "hardhat-typechain";
import "@typechain/ethers-v5";

const config: HardhatUserConfig = {
  react: {
    providerPriority: ["hardhat", "brreg", "web3modal"],
    handle: ["SimpleStorage", "SimpleStorage2"],
    fallbackProvider: "brreg",
  },
  solidity: {
    compilers: [
      {
        version: "0.6.0",
      },
      {
        version: "0.6.2",
        settings: {
          optimizer: {
            enabled: true,
            runs: 50,
          },
        },
      },
      {
        version: "0.4.15",
        settings: {
          optimizer: {
            enabled: true,
            runs: 50,
          },
        },
      },
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 50,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      inject: true,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk", // test test test test test test test test test test test junk
      },
    },
    brreg: {
      url:
        "https://u1qdua80h5:Er0LWdZuKqOza22YNQKhtdFCbqRzhzGCRhuZgrtHZ9s@u1txh1ent0-u1ieecy018-rpc.us1-azure.kaleido.io",

      gasPrice: 0,
      inject: true,
      providerType: "JsonRpcProvider",
      accounts: {
        mnemonic:
          "shrug antique orange tragic direct drop abstract ring carry price anchor train",
      },
    },
    brregStage: {
      url:
        "https://u1qdua80h5:Er0LWdZuKqOza22YNQKhtdFCbqRzhzGCRhuZgrtHZ9s@u1txh1ent0-u1ieecy018-rpc.us1-azure.kaleido.io",
      gasPrice: 0,
      inject: true,
      providerType: "StaticJsonRpcProvider",
      accounts: {
        mnemonic:
          "shrug antique orange tragic direct drop abstract ring carry price anchor train",
      },
    },
    brregProd: {
      url:
        "https://u1qdua80h5:Er0LWdZuKqOza22YNQKhtdFCbqRzhzGCRhuZgrtHZ9s@u1txh1ent0-u1ieecy018-rpc.us1-azure.kaleido.io",

      gasPrice: 0,
      inject: false,
      providerType: "JsonRpcProvider",
      accounts: {
        mnemonic:
          "shrug antique orange tragic direct drop abstract ring carry price anchor train",
      },
    },
  },
};

export default config;
