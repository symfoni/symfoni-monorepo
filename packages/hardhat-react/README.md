[![hardhat](https://hardhat.org/assets/img/Hardhat-logo.652a7049.svg?1)](https://hardhat.org)

**Alpha release, interfaces will change.**

#### Part of contribution to the ETHOnline hackathon

# Quik start

If you want to quickly get started with a new hardhat project and a react application. Try this [boilerplate](https://github.com/symfoni/hardhat-react-boilerplate).

# Get started

## Install plugin

**Yarn:** `yarn add --dev @symfoni/hardhat-react`

**NPM:** `npm install --save-dev @symfoni/hardhat-react `

## Install peer dependencies

**Yarn:** `yarn add --dev hardhat hardhat-deploy hardhat-deploy-ethers hardhat-typechain hardhat-typechain ts-morph ts-node typescript ts-generator typechain typechain-target-ethers-v5`

**NPM:** `npm install --save-dev hardhat hardhat-deploy hardhat-deploy-ethers hardhat-typechain hardhat-typechain ts-morph ts-node typescript ts-generator typechain typechain-target-ethers-v5`

## import plugins

To import plugins into your hardhat project.

If javascript project, hardhat.config.js

```js
require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy-ethers");
require("hardhat-deploy");
require("@symfoni/hardhat-react");
require("hardhat-typechain");
require("typechain-target-ethers-v5");
```

if typescript project, hardhat.config.ts

```ts
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy-ethers";
import "hardhat-deploy";
import "@symfoni/hardhat-react";
import "hardhat-typechain";
import "typechain-target-ethers-v5";
```

# Runtime

The plugin will hooks into hardhat-deploy, which hooks into `npx hardhat node --watch`. Therefore, the plugin will run when you are starting up a node or making changes to a solidity file or deploy file.

You can run it manually with `npx hardhat react`. You probably need to run `npx hardhat typechain` and `npx hardhat deploy`first to have artifacts, deployments, and typechain files ready.

The React context uses the output from typechain and deployments. It generates a react context component as a typescript react file (HardhatContext.tsx), which imports both typechain and deployment files. It then uses these files alongside Ethers and Web3Modal to set up a context for your connection and each smart contract (deployed or not deployed).

# Frontend

This plugin assumes that you are building your frontend inside a hardhat project (we later want to go away from this assumption). So we recommend you create a `frontend` folder inside your hardhat project where all your frontend code and packages reside. Take a look at https://github.com/symfoni/hardhat-react-boilerplate for a demonstration.

# Configuration

Our goal with this plugin was to make it easier for new developers to try out smart-contract development. Therefore we default the most needed configuration.

## Provider priority

The React context tries to connect the frontend up with an Ethereum provider. Here you can set that priority. In this scenario, the react context will try to connect with web3modal(Metamask) first, then if that fails. Try to connect with your Hardhat node.

```json
{
  "react": {
    "providerPriority": ["web3modal", "hardhat"]
  }
}
```

`Later, we will add the possibility to set all config networks providers, URLs, etc. as provider priority.`
We stole this concept from [Embark](https://framework.embarklabs.io/docs/overview.html). Props to them.

## Paths React

Where to write the HardhatContext.tsx file.

```json
{
  "paths": {
    "react": "./frontend/src/hardhat"
  }
}
```

## Defaults

If you don't set these configurations yourself, the hardhat-react plugin will default to this.

```json
{
  "react": {
    "providerPriority": ["web3modal", "hardhat"]
  },
  "paths": {
    "react": "./frontend/src/hardhat",
    "deployments": "./frontend/src/hardhat/deployments/"
  },
  "namedAccounts": {
    "deployer": {
      "default": 0
    }
  },
  "typechain": {
    "outDir": "./frontend/src/hardhat/typechain",
    "target": "ethers-v5"
  }
}
```

# Projects

- [hardhat-plugins](https://github.com/symfoni/hardhat-plugins) - Lerna repo containing a demo project and hardhat-react plugin.
- [hardhat-react-boilerplate](https://github.com/symfoni/hardhat-react-boilerplate) - A boilerplate which contains barebones for a smart-contract and react app project. Where all smart contracts are compiled, deployed, and typed out to the react app.

# Caveats

## Users get Metamask up in their faces right after they enter the webpage. BAD UX!

Yea, we know. We have some patterns with a fallback provider that solves this. But for the hackathon, we have not that had time to implement that. Coming

## Can I only use Metemask?

Web3modal supports many wallets. We will soon provide configuration for each of them.

We will also allow you to inject your "whatever" hardhat development node you are using as a fallback provider when developing. We think this is a friendly tool for new Ethereum developers also as then they don't need to wrap their heads around a provider while building a smart-contract and a provider in the frontend.

## Invalid nonce.

```bash
eth_sendRawTransaction
  Invalid nonce. Expected X but got X.
```

Reset your account in Metamask.

## Why cant the react component be built as a package which I can import.

We don't know enough of the react build process to efficiently create a typescript react component which can be consumed by any other React build process. This is something we want to achieve!

## Do I have to create a context of all contracts?

It will do so by default, but we will later provide an option to be explicit about which contracts create a context.

## Will you support other frontend frameworks?

Not planned atm.

# Development

If you want to develop this plugin in any way, we suggest you fork this Lerna repo; [hardhat-plugins](https://github.com/symfoni/hardhat-plugins).
