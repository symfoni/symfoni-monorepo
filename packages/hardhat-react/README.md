[![hardhat](https://hardhat.org/assets/img/Hardhat-logo.652a7049.svg?1)](https://hardhat.org)

#### Part of contribution to the ETHOnline hackathon

**Alpha release, interfaces will change.**

**This version requires typechain 4.0**

<img src="https://github.com/symfoni/hardhat-plugins/blob/hardhat/packages/hardhat-react/SymfoniHardhatReact.gif" width="400">

# Hardhat React

A Hardhat plugin that generates a React hook component from your smart contracts. Hot reloaded into your React app. Deployed or not deployed. And everything typed and initialized.

- Uses deployments from **hardhat-deploy** to inject the latest instance of your smart contracts into the React app.
- Uses **Typechain** so all your smart contracts are typed.
- Uses **Ethers** so everything else is typed.
- Runs alongside **hardhat-node** or hardhat-deploy --watch so any change you do in a smart contract is immediately injected into React app. Just start the hardhat runtime, and everything should be reflected.
- Provision a connection to your blockchain node. Either with **Web3modal**, which supports many wallets, or directly to your hardhat node through HttpRPC.

# Quik start

If you want to quickly get started with a new hardhat project and a react application. Try this [boilerplate](https://github.com/symfoni/hardhat-react-boilerplate).

# Get started

## Install plugin

**Yarn:** `yarn add --dev @symfoni/hardhat-react`

**NPM:** `npm install --save-dev @symfoni/hardhat-react`

## Install peer dependencies

**Yarn:** `yarn add --dev hardhat hardhat-deploy hardhat-deploy-ethers hardhat-typechain hardhat-typechain ts-morph ts-node typescript ts-generator typechain @typechain/ethers-v5`

**NPM:** `npm install --save-dev hardhat hardhat-deploy hardhat-deploy-ethers hardhat-typechain hardhat-typechain ts-morph ts-node typescript ts-generator typechain @typechain/ethers-v5`

## import plugins

To import plugins into your hardhat project.

If javascript project, hardhat.config.js

```js
require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy-ethers");
require("hardhat-deploy");
require("@symfoni/hardhat-react");
require("hardhat-typechain");
require("@typechain/ethers-v5");
```

if typescript project, hardhat.config.ts

```ts
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy-ethers";
import "hardhat-deploy";
import "@symfoni/hardhat-react";
import "hardhat-typechain";
import "@typechain/ethers-v5";
```

# Runtime

The plugin will hooks into hardhat-deploy, which hooks into `npx hardhat node --watch`. Therefore, the plugin will run when you are starting up a node or making changes to a solidity file or deploy file.

You can run it manually with `npx hardhat react`. You probably need to run `npx hardhat typechain` and `npx hardhat deploy`first to have artifacts, deployments, and typechain files ready.

The React context uses the output from typechain and deployments. It generates a react context component as a typescript react file (SymfoniContext.tsx), which imports both typechain and deployment files. It then uses these files alongside Ethers and Web3Modal to set up a context for your connection and each smart contract (deployed or not deployed).

# Deployment and .gitignore

We are still evaluating how to best handle deployments. For now we suggest to .gitignore the networks you develop on do versioning on deployments to shared networks.

```bash
frontend/src/hardhat/deployments/hardhat
frontend/src/hardhat/deployments/localhost
```

# Frontend

This plugin assumes that you are building your frontend inside a hardhat project (we later want to go away from this assumption). So we recommend you create a `frontend` folder inside your hardhat project where all your frontend code and packages reside. Take a look at https://github.com/symfoni/hardhat-react-boilerplate for a demonstration.

Most frontend projects require all file dependencies to be inside that folder. Therefore we suggest (and default ) your typechain and deployments path to "./frontend/src/hardhat/{deployments | typechain}". The Hardhat context (a react component .tsx) file will also default to this folder. Though you are free to set whatever paths you like, and it should resolve relative to your config.paths.react folder.

## Frontend dependencies

You will need to install these dependencies in your frontend.

**Yarn:** `yarn add ethers web3modal`

**NPM:** `npm install --save ethers web3modal`

## Frontend "framework"

You are free to choose whatever React typescript "framework". We have only tested with Create React App for now.

Create React app can be initialized in your Hardhat root folder with:

**NPX:** `npx create-react-app frontend --template typescript`

## React component

To use the React component in a React application. Import the SymfoniContext.tsx file in your app.

```ts
import { Symfoni } from "./hardhat/SymfoniContext";
```

Then wrap everything or the components in this context as a provider.

```ts
<Symfoni>
  <SomeComponent></SomeComponent>
  <SomeOtherComponent></SomeComponent>
</Symfoni>
```

To use a contract, import that context into the component that needs it.

```ts
import { GreeterContext } from "./../hardhat/SymfoniContext";
```

Then use it as a state in that component.

```ts
const greeter = useContext(GreeterContext);
```

## Contract context

The contract context gives you two properties.

```ts
export interface ContractContext {
  instance?: Contract;
  factory?: ContractFactory;
}
```

If the Hardhat context successfully connected to a provider in your frontend (web3modal or Hardhat node) and

- hardhat-deploy **deployed** an instance of your contract. The **ContractContext.instance** property will be initiated with this deployment address. Here you have access to all functions, events, and so on.
- If an instance was NOT deployed by hardhat-deploy, it will be set to a zero address. This way makes it easier to connect with another contract address in you frontend with for example `erc20.instance?.attach("SOME_ADDRESS")`
- If the provider has sign() functionality. The **ContractContext.factory** will be available, and you can deploy a contract or connect to other instances.

## Component examples

### Symfoni context example

```ts
import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { Hardhat } from "./hardhat/SymfoniContext";
import { Greeter } from "./components/Greeter";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Symfoni>
          <Greeter></Greeter>
        </Symfoni>
      </header>
    </div>
  );
}

export default App;
```

### Contract context example

The contract is named Greeeter.sol

```ts
import React, { useContext, useEffect, useState } from "react";
import { GreeterContext } from "./../hardhat/SymfoniContext";

interface Props {}

export const Greeter: React.FC<Props> = () => {
  const greeter = useContext(GreeterContext);
  const [message, setMessage] = useState("");
  const [inputGreeting, setInputGreeting] = useState("");
  useEffect(() => {
    const doAsync = async () => {
      if (!greeter.instance) return;
      console.log("Greeter is deployed at ", greeter.instance.address);
      setMessage(await greeter.instance.greet());
    };
    doAsync();
  }, [greeter]);

  const handleSetGreeting = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (!greeter.instance) throw Error("Greeter instance not ready");
    if (greeter.instance) {
      const tx = await greeter.instance.setGreeting(inputGreeting);
      console.log("setGreeting tx", tx);
      await tx.wait();
      console.log(
        "New greeting mined, result: ",
        await greeter.instance.greet()
      );
    }
  };
  return (
    <div>
      <p>{message}</p>
      <input onChange={(e) => setInputGreeting(e.target.value)}></input>
      <button onClick={(e) => handleSetGreeting(e)}>Set greeting</button>
    </div>
  );
};
```

### Symfoni Provider

You can control when Hardhat context should try to connect with your providers. By default it will autoInit and show loading. If you dont want to show laoding it will start render all child components. You dont need to provide a loading component, in that case it has a native loading component that renders messages from provider connection.

```ts
import { Symfoni } from "./../hardhat/SymfoniContext";
...
 <Symfoni autoInit={true} loadingComponent={<h1>LOADING...</h1>}>
  // ...<OtherComponents>
</Symfoni>
```

### SymfoniContext

This context can be used down in your componens to trigger Symfoni context.

By contrast to other contexts, SymfoniContext returns an object with properties and functions. So pick whatever you want.

The init function will initate a connection to your provider based on the priority you have set in your Hardhat.config.ts. You can override this by specifying the provider you want to connect with. `init("roptsten")` for example.

```ts
import { SymfoniContext } from './../hardhat/SymfoniContext';
...
 const {  init, messages, currentHardhatProvider, loading, providers  } = useContext(SymfoniContext)
```

### ProviderContext

It gives you a context to your current provider and the ability to change it.

```ts
import { ProviderContext } from "./../hardhat/SymfoniContext";
...
const [provider, setProvider] = useContext(ProviderContext)
```

### SignerContext

It gives you a context to your current signer and the ability to change it.

```ts
import { SignerContext } from "./../hardhat/SymfoniContext";
...
const [signer, setSigner] = useContext(SignerContext)
```

### CurrentAddressContext

It gives you a context to your current address and the ability to change it.

```ts
import { CurrentAddressContext } from "./../hardhat/SymfoniContext";
...
const [currentAddress, setCurrentAddress] = useContext(CurrentAddressContext)
```

# Configuration

Our goal with this plugin was to make it easier for new developers to try out smart-contract development. Therefore we default the most needed configuration.

## Provider priority

The React context tries to connect the frontend up with an Ethereum provider. Here you can set that priority. In this scenario, the react context will try to connect with Web3modal(Metamask) first, then if that fails. Try to connect with your Hardhat node.

If you set a fallbackprovider, it will try to connect to that provider first. But only on first auto init (auto init must be true) and if the user has not connected with web3modal before (that is stored in the cache). If the user does not have any wallets and you try with web3modal first, it will require a click from the user to try another provider. Setting a fallback provider circuments this.

```json
{
  "react": {
    "providerPriority": ["web3modal", "hardhat"],
    "fallbackProvider" : "hardhat",
    ...
  }
}
```

`Later, we will add the possibility to set all config networks providers, URLs, etc. as provider priority.`
We stole this concept from [Embark](https://framework.embarklabs.io/docs/overview.html). Props to them.

## Explicit / Implicit contract generation

If you have many contracts you can choose to be implicit or explicit for what contracts you want to create a context for.

```json
{
  "react": {
    "skip": ["SimpleStorage2"],
    "handle": ["SimpleStorage"]
    ...
  }
}
```

## Paths React

SymfoniContext.tsx (the React component) will be written to this path.

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
