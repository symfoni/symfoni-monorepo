Part of contribution to the ETHOnline hackathon
=========================================

# Projects

* [buidler-plugins](https://github.com/symfoni/buidler-plugins) - Lerna repo containing a demo project, buidler-react plugin and buidler-storage plugin. 
* [buidler-react-boilerplate](https://github.com/symfoni/buidler-react-boilerplate) - A boilerplate which contains barebones for a smart-contract and react app project. Where all smart contracts are compiled, deployed and typed out to the react app.
* [fork of buidler-typechain](https://github.com/symfoni/buidler-typechain) - usees latest release of typechain (v3) and removed peer dependencies on web3 packages.

# Buidler-react

Aplha release, interfaces will change. 

A buidler plugin to use in buidler projects.

If you want to quikly get started with with a new buidler project and a react application. Try this [boilerplate](https://github.com/symfoni/buidler-react-boilerplate).

## Install

### Yarn

`yarn add @symfoni/buidler-react`

### NPM

`npm install --save @symfoni/buidler-react `

### Frontend

This plugin makes an assumption that you are building your frontend inside a buidler project (we later want to go away from this assumption). So we recommed you to create a `frontend` folder inside your buidler project where all your frontend code and packages reside. Take a look at https://github.com/symfoni/buidler-plugins/tree/master/packages/buidler-demo for demonstration.

### Configuration

This project applies some opinions on your frontend project. It must use react, typescript, ethers v5 and web3modal (can be removed later).

Run this command in your frontend project root to install those dependencies:

`npm install --save ethers web3modal`
`yarn add ethers web3modal`

There are two buidler configrations.

#### React

Here you can set how the react context should try to connect to a provider. In this config it will first try to connect with a [web3modal](https://github.com/Web3Modal/web3modal) then buidler config network dev and then a custom RPC url. In alpha version, only web3modal is supported.

```javascript
config.react = {
  providerPriority: ["web3modal", "dev", "HTTP://127.0.0.1:8545"] // default ["web3modal"]
};
```

Here you can set where buidler-react should put the react component files that can be consumed by your frontend application.

```javascript
paths: {
    react: "./frontend/src/buidler", // default "./frontend/src/buidler"
  },
```

# Cavats

## Why does not react component get generated when i run `npx buidler node``

We need to hook into buidler-deploy watch process. An issue is filed wiht buidler to open the possiblity for buidler-deploy plugin to do this. https://github.com/nomiclabs/buidler/issues/899

## Why cant the react component be buildt as a package which i can import.

We dont know enough of the react build process to effeciently create a typescript react component which can be consumed by any other React build process. This is something we deffinitiy want to achive!

# Development

If you want to develop in this plugin in any way, we suggest you fork this lerna repo; [buidler-plugins](https://github.com/symfoni/buidler-plugins). There are instructions inside that readme.
