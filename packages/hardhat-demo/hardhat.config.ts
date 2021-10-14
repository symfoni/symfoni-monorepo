import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy-ethers";
import "hardhat-deploy";
import "@typechain/hardhat";
import "@typechain/ethers-v5";
// import "@symfoni/hardhat-react";

const config: HardhatUserConfig = {
  // react: {
  //   providerPriority: ["hardhat", "brreg", "web3modal"],
  //   handle: ["SimpleStorage", "SimpleStorage2", "Greeter"],
  //   fallbackProvider: "brreg",
  //   providerOptions: {
  //     walletconnect: {
  //       options: {
  //         rpc: {
  //           55577: "https://u1qdua80h5:Er0LWdZuKqOza22YNQKhtdFCbqRzhzGCRhuZgrtHZ9s@u1txh1ent0-u1ieecy018-rpc.us1-azure.kaleido.io",
  //         },
  //       },
  //     },
  //   },
  // },
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
    // hardhat: {
    //   accounts: {
    //     mnemonic: "test test test test test test test test test test test junk", // test test test test test test test test test test test junk
    //   },
    // },
  },
};

export default config;
