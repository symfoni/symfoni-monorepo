#### 👷‍ Join our team to contribute full-time to tools like Hardhat React!

We're hiring. If you're a full-stack dApp developer, we want you! 👈 This is an excellent opportunity to contribute full-time to the Ethereum ecosystem. 

**[Check out our job listing](https://www.notion.so/symfoni/Symfoni-jobs-0c2bdc029d2a4cf7b91864a5e68ed00f)**

# Hardhat Autogeneration All-in-one Suite

* Autogenerate fully typed React hooks integrated into your Hardhat smart contract watch pipeline.
* No need to manually write your own react hooks on top of new Contract(ABI, ...) instances (which aren't function typed anyways)

Suppose you change something in your smart contract. In that case, hardhat will recompile the ABIs hardhat-react (using Typechain) will scan those and generate React context hooks for you! Plus provider, signer, and currentAdd.

**This saves you a lot of time 🕑**

#### Suite includes

* Typechain
* Ethers.js
* React.js
* Hardhat
* Autogeneration plugin

## Getting started 

* Get started by forking 👉 [this repo. Tutorial in the Readme](https://github.com/symfoni/hardhat-react-boilerplate) 👈


# Contribute

## Packages in this repo

### [@symfoni/hardhat-react](https://github.com/symfoni/hardhat-plugins/tree/hardhat/packages/hardhat-react)

Here is the code for the hardhat react plugin. Lerna will symlink this package to @symfoni/hardhat-demo so we can use it there.

### [@symfoni/hardhat-demo](https://github.com/symfoni/hardhat-plugins/tree/hardhat/packages/hardhat-demo)

Test project. It's the boilerplate "SimpleStorage code" using hardhat-react for the frontend.

## Developing

1. Install lerna globally `npm i -g lerna`
2. Run `yarn`
3. Run `yarn run bootstrap` // This will install all packages and build

You need three processes running for the full development environment

1. `yarn run watch` watches changes in hardhat-react plugin. Lerna will then symlink this package to be used in hardhat-demo.
2. `yarn run node` runs up a blockchain node, generate typechain interfaces, compile and deploy smart-contracts then watch for changes in smart contracts and deploy them.
3. `yarn run frontend` runs a dev-server for a create-react-application from packages/hardhat-demo/frontend that is served on http://localhost:3000/ with hot-reloading. This will also reload when you change smart contracts

### Publish a new NPM package

1. `yarn run pubish` builds all packages and published them to npm with version bump.

### Use a browser wallet to interact with Ethereum

1. Use Metamask or some other wallet provider (https://metamask.io/).
2. Use Mnemonic "shrug antique orange tragic direct drop abstract ring carry price anchor train".
3. Set the Network to custom rpc at "http://127.0.0.1:8545/".

The demo should be working! 
