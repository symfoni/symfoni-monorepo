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
    providerPriority: ["brreg", "web3modal", "hardhat"],
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
    ],
  },
  networks: {
    hardhat: {
      inject: true,
      accounts: {
        mnemonic:
          "shrug antique orange tragic direct drop abstract ring carry price anchor train",
      },
    },
    localhost: {
      inject: true,
    },
    brreg: {
      url:
        "https://u1qdua80h5:Er0LWdZuKqOza22YNQKhtdFCbqRzhzGCRhuZgrtHZ9s@u1txh1ent0-u1ieecy018-rpc.us1-azure.kaleido.io",

      gasPrice: 0,
      inject: true,
      user: "u1qdua80h5",
      password: "Er0LWdZuKqOza22YNQKhtdFCbqRzhzGCRhuZgrtHZ9s",
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
      user: "u1qdua80h5",
      password: "Er0LWdZuKqOza22YNQKhtdFCbqRzhzGCRhuZgrtHZ9s",
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
      user: "u1qdua80h5",
      password: "Er0LWdZuKqOza22YNQKhtdFCbqRzhzGCRhuZgrtHZ9s",
      providerType: "JsonRpcProvider",
      accounts: {
        mnemonic:
          "shrug antique orange tragic direct drop abstract ring carry price anchor train",
      },
    },
  },
};

export default config;
