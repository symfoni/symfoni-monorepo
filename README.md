<<<<<<< HEAD
Our Contribution to the ETHOnline hackathon
=========================================

### We wish to improve the output of Buidler, and include Textile out of the box.

There are three Github repositories as part of our project. They are all part of the hackathon:

* [**buidler-symfoni-demo**](https://github.com/symfoni/buidler-symfoni-demo)
* [buidler-react](https://github.com/symfoni/buidler-react)
* buidler-plugins (this project)


## Devloping
=======
## Developing
>>>>>>> b9c4d7d05ab7ceb4011c2bb6c3024dd7b6833386

1. Install lerna globally `npm i -g lerna`
2. Run `yarn run bootstrap` // This will install all packages and build

You need three processes running for the full development enviroment

1. `yarn run watch` watches changes in buidler-react plugin. Lerna will then symlink this package to be used in buidler-demo.
2. `yarn run node` runs up a blockchain node, generate typechain interfaces, compile and deploy smart-contracts then watch for changes in smart contracts and deploy them.
3. `yarn run frontend` runs a dev-server for a create-react-application from packages/buidler-demo/frontend that is served on http://localhost:3000/ with hot-reloading. This will also reload when you change smart contracts

### Use a browser wallet to interact with Ethereum

1. Use Metamask or some other wallet provider (https://metamask.io/).
2. Use Mnemonic "shrug antique orange tragic direct drop abstract ring carry price anchor train".
3. Set the Network to custom rpc at "http://127.0.0.1:8545/".

Demo should be working!

# Packages

## @symfoni/buidler-demo

This is a demo project that includes buidler-react as a plugin to generate the react component that is used to display some example content.

## @symfoni/buidler-react

Here is the code for the buidler plugin. Lerna will symlink this package to @symfoni/buidler-demo so we can use it there.
