import { HardhatRuntimeEnvironment, HDAccountsUserConfig } from "hardhat/types";
import { writer } from "repl";
import {
  ArrowFunction,
  CodeBlockWriter,
  SourceFile,
  SyntaxKind,
  VariableDeclarationKind,
} from "ts-morph";
import { ContractContext, contractInterfaceName } from "./TsMorhProject";
import { debug } from "debug";
const log = debug("hardhat:plugin:react");

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
    this.renderFunction();
  }

  useStateStatements() {
    this.insertConstStatement("[ready, setReady]", "useState(false)");
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
      "useState<providers.Provider>(defaultProvider)"
    );
    this.insertConstStatement(
      "[currentAddress, setCurrentAddress]",
      "useState<string>(defaultCurrentAddress)"
    );
    this.insertConstStatement(
      "providerPriority",
      this.toArrayString(this.hre.config.react.providerPriority)
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
              `async (): Promise<providers.Provider | undefined> => {
                  const provider = await providerPriority.reduce(async (maybeProvider: Promise<providers.Provider | undefined>, providerIdentification) => {
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
                                    return Promise.resolve(web3provider)
                                } catch (error) {
                                    return Promise.resolve(undefined)
                                }
                            case "hardhat":
                                try {
                                    const provider = new ethers.providers.JsonRpcProvider({ // TODO make this param
                                        url: "http://localhost:8545"
                                    });
                                    return Promise.resolve(provider)
                                } catch (error) {
                                    return Promise.resolve(undefined)
                                }
                            default:
                                return Promise.resolve(undefined)
                        }
                    }
                }, Promise.resolve(undefined)) // end reduce
                return provider;
              }`
            );
          },
        },
      ],
    });
  }

  private getSigner() {
    // TODO - This could lead to users publishing a mnemonic or private key. Will make it explicit on hardhat account config.
    const signers = this.hre.config.react.providerPriority.reduce(
      (acu: string[], provider) => {
        if (provider.toLowerCase() === "web3modal") {
          return [
            ...acu,
            `case "Web3Provider":
          const web3provider = _provider as ethers.providers.Web3Provider
          return await web3provider.getSigner()`,
          ];
        }
        const providerIsAllowedInject = ["hardhat", "localhost"].find(
          (allowed) => {
            return provider.toLowerCase().includes(allowed);
          }
        );
        if (providerIsAllowedInject) {
          const isProviderConfigured =
            this.hre.config.networks !== undefined &&
            Object.keys(this.hre.config.networks).includes(provider);
          if (isProviderConfigured) {
            const isAccountsConfigured =
              this.hre.config.networks[provider].accounts !== undefined;
            if (isAccountsConfigured) {
              const isHD = Object.keys(
                this.hre.config.networks[provider].accounts
              ).includes("mnemonic");
              if (isHD) {
                log("Injecting mnemonic into React context.");
                const account = this.hre.config.networks[provider]
                  .accounts as HDAccountsUserConfig;

                return [
                  ...acu,
                  `case "JsonRpcProvider":
                    return ethers.Wallet.fromMnemonic("${account.mnemonic}").connect(_provider)`,
                ];
              }
            }
          }
        }

        return acu;
      },
      []
    );
    this.component.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      declarations: [
        {
          name: "getSigner",
          initializer: (writer) => {
            writer.write(
              `async ( _provider: providers.Provider): Promise<Signer | undefined> => {
                switch (_provider.constructor.name) {`
            );
            signers.forEach((walletCase) => writer.writeLine(walletCase));
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
      writer.write(
        `useEffect(() => {
          let subscribed = true
          const doAsync = async () => {
              setMessages(old => [...old, "Initiating Hardhat React"])
              const _provider = await getProvider() // getProvider can actually return undefined, see issue https://github.com/microsoft/TypeScript/issues/11094
              if (subscribed && _provider) {
                const _providerName = _provider.constructor.name;
                console.debug("_providerName", _providerName)
                setProvider(_provider)
                setProviderName(_providerName)
                setMessages(old => [...old, "Useing provider: " + _providerName])
                const _signer = await getSigner(_provider);
                if (subscribed && _signer) {
                    setSigner(_signer)
                    const address = await _signer.getAddress()
                    if (subscribed && address) {
                        console.debug("address", address)
                        setCurrentAddress(address)
                    }
                }
                `
      );

      this.contractContexts.forEach((contract) => {
        writer.writeLine(
          `set${contract.name}(get${contract.name}(_provider, _signer))`
        );
      });

      writer.write(
        `setReady(true)
            }
        };
        doAsync();
        return () => { subscribed = false }
      }, [])`
      );
    });
  }

  private consoleLog() {
    this.component.addStatements(
      `useEffect(() => {
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
              writer.write(
                `(_provider: providers.Provider, _signer?: Signer ) => {

                  
                `
              );

              if (contract.deploymentFile) {
                writer.write(`
                  const contractAddress = ${contract.name}Deployment.receipt.contractAddress
                  const instance = _signer ? ${contract.typechainName}Factory.connect(contractAddress, _signer) : ${contract.typechainName}Factory.connect(contractAddress, _provider)
                `);
              } else {
                writer.writeLine(`let instance = undefined`);
              }

              writer.write(
                `const contract: ${contractInterfaceName(contract)} = {
                  instance: instance  ,
                  factory: _signer ? new ${
                    contract.typechainName
                  }Factory(_signer) : undefined,
                } 
                return contract`
              );

              writer.write(`}`);
            },
          },
        ],
      });
    });
  }

  private renderFunction() {
    const body = (writer: CodeBlockWriter) => {
      writer.writeLine(
        `{ready &&
          (props.children)
      }
      {!ready &&
          <div>
              {messages.map((msg, i) => (
                  <p key={i}>{msg}</p>
              ))}
          </div>
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
