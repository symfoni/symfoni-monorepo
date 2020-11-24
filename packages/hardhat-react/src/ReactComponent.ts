import { HardhatRuntimeEnvironment, NetworkConfig } from "hardhat/types";

import {
  ArrowFunction,
  CodeBlockWriter,
  SourceFile,
  SyntaxKind,
  VariableDeclarationKind,
  WriterFunction,
} from "ts-morph";
import { ContractContext, contractInterfaceName } from "./TsMorhProject";
import { debug } from "debug";
import { network } from "hardhat";
import { writer } from "repl";
const log = debug("hardhat:plugin:react");
const providersDisallowedInject = ["mainnet"];

export class ReactComponent {
  private sourceFile: SourceFile;
  private readonly args: any;
  private readonly hre: HardhatRuntimeEnvironment;
  private readonly contractContexts: ContractContext[];
  public component: ArrowFunction;
  constructor(
    sourceFile: SourceFile,
    args: any,
    bre: HardhatRuntimeEnvironment,
    contractContexts: ContractContext[],
    component: ArrowFunction
  ) {
    this.hre = bre;
    this.args = args;
    this.sourceFile = sourceFile;
    this.contractContexts = contractContexts;
    this.component = component;
  }

  generate() {
    this.useStateStatements();
    this.consoleLog();
    this.getProvider();
    this.getSigner();
    this.getWeb3ModalProvider();
    this.initSideEffect();
    this.contractInits();
    this.handleInitProvider();
    this.renderFunction();
  }

  useStateStatements() {
    this.insertConstStatement(
      "[initializeCounter, setInitializeCounter]",
      "useState(0)"
    );
    this.insertConstStatement(
      "[currentHardhatProvider, setCurrentHardhatProvider]",
      `useState("")`
    );
    this.insertConstStatement("[loading, setLoading]", "useState(false)");
    this.insertConstStatement(
      "[messages, setMessages]",
      "useState<string[]>([])"
    );
    this.insertConstStatement(
      "[/* providerName */, setProviderName]",
      "useState<string>()"
    );
    this.insertConstStatement(
      "[signer, setSigner]",
      "useState<Signer | undefined>(defaultSigner)"
    );
    this.insertConstStatement(
      "[provider, setProvider]",
      "useState<providers.Provider | undefined>(defaultProvider)"
    );
    this.insertConstStatement(
      "[currentAddress, setCurrentAddress]",
      "useState<string>(defaultCurrentAddress)"
    );
    this.insertConstStatement(
      "[providerPriority, setProviderPriority]",
      `useState<string[]>(${this.toArrayString(
        this.hre.config.react.providerPriority
      )})`
    );
    this.contractContexts.forEach((contract) => {
      this.insertConstStatement(
        `[${contract.name}, set${contract.name}]`,
        `useState<${contractInterfaceName(contract)}>(emptyContract)`
      );
    });
  }

  private getProvider() {
    this.component.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      declarations: [
        {
          name: "getProvider",
          initializer: (writer) => {
            writer.write(
              `async (): Promise<{provider: providers.Provider, hardhatProviderName: string } | undefined> => {
                let hardhatProviderName = "Not set";
                  const provider = await providerPriority.reduce(async (maybeProvider: Promise<providers.Provider | undefined>, providerIdentification)=> {
                    let foundProvider = await maybeProvider
                    if (foundProvider) {
                        return Promise.resolve(foundProvider)
                    }
                    else {
                        switch (providerIdentification.toLowerCase()) {
                            case "web3modal":
                                try {
                                    const provider = await getWeb3ModalProvider()
                                    const web3provider = new ethers.providers.Web3Provider(provider);
                                    hardhatProviderName =  "web3modal";
                                    return Promise.resolve(web3provider)
                                } catch (error) {
                                    return Promise.resolve(undefined)
                                }
                            `
            );

            for (let [name, network] of Object.entries(
              this.hre.config.networks
            )) {
              type ProviderConnection = {
                url: string;
                user?: string;
                password?: string;
                providerType?: string;
              };
              // REVIEW Probably not optimal
              if (name === "localhost") {
                name = "hardhat";
                network = {
                  ...network,
                  ...this.hre.config.networks["hardhat"],
                };
              }
              const hasInject = "inject" in network && network.inject;
              if (!hasInject && name !== "hardhat") {
                log(
                  "Provider " +
                    name +
                    " does not have inject property. Not adding to provider list."
                );
                continue;
              }
              let providerConnection: ProviderConnection | undefined =
                "url" in network ? { url: network.url } : undefined;

              if (providerConnection) {
                if ("user" in network) {
                  providerConnection.user = network.user;
                }
                if ("user" in network) {
                  providerConnection.password = network.password;
                }
                if ("providerType" in network) {
                  providerConnection.providerType = network.providerType;
                } else {
                  log("Setting default providerType on " + name);
                  providerConnection.providerType = "JsonRpcProvider";
                }

                writer.write(
                  `case "${name}":
                      try {
                          const provider = new ethers.providers.${providerConnection.providerType}({
                              url: "${providerConnection.url}",`
                );
                if (providerConnection.user) {
                  writer.writeLine(`user: "${providerConnection.user}",`);
                  if (providerConnection.password) {
                    writer.writeLine(
                      `password: "${providerConnection.password}"`
                    );
                  }
                }

                writer.write(
                  `});
                  hardhatProviderName =  "${name}";
                  return Promise.resolve(provider)
              } catch (error) {
                  return Promise.resolve(undefined)
              }`
                );
              }
            }
            writer.write(
              `default:
                                return Promise.resolve(undefined)
                        }
                    }
                }, Promise.resolve(undefined)) // end reduce
                return provider ? { provider, hardhatProviderName } : undefined
                }`
            );
          },
        },
      ],
    });
  }

  private getSigner() {
    const writeSigners = (writer: CodeBlockWriter) => {
      writer.writeLine(
        `case "Web3Provider":
          const web3provider = _provider as ethers.providers.Web3Provider
          return await web3provider.getSigner()`
      );

      const networksByProviderType = Object.entries(
        this.hre.config.networks
      ).reduce(
        (
          acu: { [providerType: string]: { [name: string]: NetworkConfig } },
          [name, network]
        ) => {
          let providerType = "JsonRpcProvider";
          if ("providerType" in network) {
            if (network.providerType) {
              providerType = network.providerType;
            }
          }
          const prev = acu[providerType] ? acu[providerType] : {};
          return { ...acu, [providerType]: { ...prev, [name]: network } };
        },
        {}
      );

      log(
        "Useing this providerTypes: ",
        Object.keys(networksByProviderType).join(" | ")
      );

      for (const [providerType, networks] of Object.entries(
        networksByProviderType
      )) {
        writer.writeLine(`case "${providerType}":`);

        writer.write(`switch(hardhatProviderName) {`);

        for (const [name, network] of Object.entries(networks)) {
          writeProviderSigner(writer, name, network);
        }
        writer.write(`default:
                        return undefined
                }`);
      }
    };

    const writeProviderSigner = (
      writer: CodeBlockWriter,
      name: string,
      network: NetworkConfig
    ) => {
      if (providersDisallowedInject.indexOf(name.toLowerCase()) !== -1) {
        log("Provider " + name + " is hardcoded disallowed injected mnemonic.");
        return;
      }
      if ("live" in network) {
        if (network.live) {
          log("Provider " + name + " is live and therefor disallowing inject.");
          return;
        }
      }
      const hasInject = "inject" in network && network.inject;
      if (!hasInject && name !== "hardhat") {
        log(
          "Provider " +
            name +
            " does not have or have false inject property. Disallowing inject."
        );
        return;
      }
      if (
        typeof network.accounts !== "string" &&
        "mnemonic" in network.accounts
      ) {
        const mnemonic = network.accounts.mnemonic;
        log(`Injecting ${name} into React context`);
        log(`Exposing Mnemonic in you React app : ${mnemonic}`);
        writer.writeLine(`case "${name}":
        return ethers.Wallet.fromMnemonic("${mnemonic}").connect(_provider)`);
      }
    };

    this.component.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      declarations: [
        {
          name: "getSigner",
          initializer: (writer) => {
            writer.write(
              `async ( _provider: providers.Provider, hardhatProviderName: string): Promise<Signer | undefined> => {
                switch (_provider.constructor.name) {`
            );
            writeSigners(writer);
            writer.write(`
                    default:
                        return undefined
                }
            }`);
          },
        },
      ],
    });
  }

  private getWeb3ModalProvider() {
    this.component.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      declarations: [
        {
          name: "getWeb3ModalProvider",
          initializer: (writer) => {
            writer.write(
              `async (): Promise<any> => {
                const providerOptions: IProviderOptions = {};
                const web3Modal = new Web3Modal({
                    // network: "mainnet",
                    cacheProvider: true,
                    providerOptions, // required
                });
                return await web3Modal.connect();
            }`
            );
          },
        },
      ],
    });
  }

  private initSideEffect() {
    this.component.addStatements((writer) => {
      writer.write(`
      useEffect(() => {
          let subscribed = true
          const finish = (text: string) => {
            setLoading(false)
            setMessages(old => [...old, text])
        }
          const doAsync = async () => {
            if (!autoInit && initializeCounter === 0) return finish("Auto init turned off.")
            setLoading(true)
            setMessages(old => [...old, "Initiating Hardhat React"])
            const providerObject = await getProvider() // getProvider can actually return undefined, see issue https://github.com/microsoft/TypeScript/issues/11094

            if (!subscribed || !providerObject) return finish("No provider or signer.")
            const _provider = providerObject.provider
            const _providerName = _provider.constructor.name;
            setProvider(_provider)
            setProviderName(_providerName)
            setMessages(old => [...old, "Useing " + _providerName + " from " + providerObject.hardhatProviderName])
            setCurrentHardhatProvider(providerObject.hardhatProviderName)
            const _signer = await getSigner(_provider, providerObject.hardhatProviderName);

            if (!subscribed || !_signer) return finish("Provider, without signer.")
            setSigner(_signer)
            setMessages(old => [...old, "Useing signer"])
            const address = await _signer.getAddress()

            if (!subscribed || !address) return finish("Provider and signer, without address.")
            setCurrentAddress(address)
            `);

      this.contractContexts.forEach((contract) => {
        writer.writeLine(
          `set${contract.name}(get${contract.name}(_provider, _signer))`
        );
      });

      writer.write(`
      return finish("Completed Hardhat context initialization.")
        };
        doAsync();
        return () => { subscribed = false }
      }, [initializeCounter])`);
    });
  }

  private consoleLog() {
    this.component.addStatements(
      `useEffect(() => {
        if(messages.length > 0)
          console.debug(messages.pop())
    }, [messages])`
    );
  }

  private contractInits() {
    this.contractContexts.forEach((contract) => {
      this.component.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: `get${contract.name}`,
            initializer: (writer) => {
              writer.writeLine(
                `(_provider: providers.Provider, _signer?: Signer ) => {`
              );

              if (contract.deploymentFile) {
                writer.write(`
                  const contractAddress = ${contract.name}Deployment.receipt.contractAddress
                  const instance = _signer ? ${contract.typechainFactoryName}.connect(contractAddress, _signer) : ${contract.typechainFactoryName}.connect(contractAddress, _provider)
                `);
              } else {
                writer.writeLine(`let instance = undefined`);
              }

              writer.write(
                `const contract: ${contractInterfaceName(contract)} = {
                  instance: instance  ,
                  factory: _signer ? new ${
                    contract.typechainFactoryName
                  }(_signer) : undefined,
                } 
                return contract`
              );

              writer.write(`}
              `);
            },
          },
        ],
      });
    });
  }

  private handleInitProvider() {
    this.component.addStatements(`
      const handleInitProvider = (provider?: string) => {
        console.log("running")
        if (provider) {
            setProviderPriority(old => old.sort((a, b) => {
                return a === provider ? -1 : b === provider ? 1 : 0;
            }))
        }
        setInitializeCounter(initializeCounter + 1) 
      }
    `);
  }

  private renderFunction() {
    const body = (writer: CodeBlockWriter) => {
      writer.writeLine(
        `{showLoading && loading ?
          props.loadingComponent
              ? props.loadingComponent
              : <div>
                  {messages.map((msg, i) => (
                      <p key={i}>{msg}</p>
                  ))}
              </div>
          : props.children
      }`
      );
    };

    const openContext = (writer: CodeBlockWriter) => {
      this.contractContexts.forEach((contract) => {
        writer.writeLine(
          `<${contract.name}Context.Provider value={${contract.name}}>`
        );
      });
    };
    const closeContext = (writer: CodeBlockWriter) => {
      this.contractContexts.reverse().forEach((contract) => {
        writer.writeLine(`</${contract.name}Context.Provider >`);
      });
    };

    this.component.addStatements((writer) => {
      writer.write(
        `return (
          <HardhatContext.Provider value={{ init: (provider) => handleInitProvider(provider), providers: providerPriority,currentHardhatProvider, loading, messages }}>
            <ProviderContext.Provider value={[provider, setProvider]}>
                <SignerContext.Provider value={[signer, setSigner]}>
                    <CurrentAddressContext.Provider value={[currentAddress, setCurrentAddress]}>`
      );
      openContext(writer);
      body(writer);
      closeContext(writer);
      writer.write(
        `           </CurrentAddressContext.Provider>
                </SignerContext.Provider>
            </ProviderContext.Provider>
          </HardhatContext.Provider>
        )`
      );
    });
  }

  // Helpers
  private insertConstStatement(name: string, initializer: string) {
    this.component.addVariableStatements([
      {
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name,
            initializer,
          },
        ],
      },
    ]);
  }

  private toArrayString(arr: string[]) {
    return "[" + arr.map((i) => `"` + i + `"`).join(",") + "]";
  }
}
