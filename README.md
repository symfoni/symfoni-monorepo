### We wish to improve the output of Hardhat, and include Textile out of the box.

This is just a part of our contribution to the Ethonline hackathon.

- [🕶 Check out this repo for an introduction](https://github.com/symfoni/hardhat-react-boilerplate)

## Packages

### [@symfoni/hardhat-demo](https://github.com/symfoni/hardhat-plugins/tree/hardhat/packages/hardhat-demo)

This is a demo project that includes hardhat-react as a plugin to generate the react component that is used to display some example content.

### [@symfoni/hardhat-react](https://github.com/symfoni/hardhat-plugins/tree/hardhat/packages/hardhat-react)

Here is the code for the hardhat react plugin. Lerna will symlink this package to @symfoni/hardhat-demo so we can use it there.

## Developing

1. Install lerna globally `npm i -g lerna`
2. Run `yarn run bootstrap` // This will install all packages and build

You need three processes running for the full development enviroment

1. `yarn run watch` watches changes in hardhat-react plugin. Lerna will then symlink this package to be used in hardhat-demo.
2. `yarn run node` runs up a blockchain node, generate typechain interfaces, compile and deploy smart-contracts then watch for changes in smart contracts and deploy them.
3. `yarn run frontend` runs a dev-server for a create-react-application from packages/hardhat-demo/frontend that is served on http://localhost:3000/ with hot-reloading. This will also reload when you change smart contracts

### Publish a new NPM package

1. `yarn run pubish` builds all packages and published them to npm with version bump.

### Use a browser wallet to interact with Ethereum

1. Use Metamask or some other wallet provider (https://metamask.io/).
2. Use Mnemonic "shrug antique orange tragic direct drop abstract ring carry price anchor train".
3. Set the Network to custom rpc at "http://127.0.0.1:8545/".

Demo should be working!
