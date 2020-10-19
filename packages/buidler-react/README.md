# Buidler-react

## Install

### Yarn

`yarn add @symfoni/buidler-react`

### NPM

`npm install @symfoni/buidler-react --save`

### Frontend

This plugin makes an assumption that you are building your frontend inside a buidler project (we later want to go away from this assumption). So we recommed you can a `frontend` folder inside your buidler project where all your frontend code and packages reside. Take a look at https://github.com/symfoni/buidler-plugins/tree/master/packages/buidler-demo for demonstration.

### Configuration

This project applies some opinions on your frontend project. It must use react, typescript, ethers v5 and web3modal (can be removed later).

Run this command in your frontend project root to install those dependencies:

`npm install --save ethers web3modal`
`yarn add ethers web3modal`

There are two buidler configrations

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

## Installation

We recommend developing Buidler plugins using yarn. To start working on your
project, just run

```bash
yarn install
```

# Cavats

## Why does not react component get generated when i run `npx buidler node``

We need to hook into buidler-deploy watch process. An issue is filed wiht buidler to open the possiblity for buidler-deploy plugin to do this. https://github.com/nomiclabs/buidler/issues/899

## Why cant the react component be buildt as a package which i can import.

We dont know enough of the react build process to effeciently create a typescript react component which can be consumed by any other React build process. This is something we deffinitiy want to achive!

## Plugin development

Make sure to read our [Plugin Development Guide](https://buidler.dev/guides/create-plugin.html)
to learn how to build a plugin, and our
[best practices to create high-quality plugins](https://buidler.dev/documentation/#plugin-development-best-practices).

## Testing

Running `npm run test` will run every test located in the `test/` folder. They
use [mocha](https://mochajs.org) and [chai](https://www.chaijs.com/),
but you can customize them.

We recommend creating unit tests for your own modules, and integration tests for
the interaction of the plugin with Buidler and its dependencies.

## Linting and autoformat

All all of Buidler projects use [prettier](https://prettier.io/) and
[tslint](https://palantir.github.io/tslint/).

You can check if your code style is correct by running `npm run lint`, and fix
it with `npm run lint:fix`.

## Building the project

Just run `npm run buidl` ️👷‍

## README file

This README describes this boilerplate project, but won't be very useful to your
plugin users.

Take a look at `README-TEMPLATE.md` for an example of what a Buidler plugin's
README should look like.
