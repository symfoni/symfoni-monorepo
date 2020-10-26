import { HardhatRuntimeEnvironment } from "hardhat/types";
import { readdirSync } from "fs-extra";
import path from "path";
import {
  CodeBlockWriter,
  SourceFile,
  SyntaxKind,
  VariableDeclarationKind,
} from "ts-morph";
import { ReactComponent } from "./ReactComponent";
import { debug } from "debug";
const log = debug("hardhat:plugin:react");

interface Contract {
  name: string;
  typechainName: string;
  deploymentFile?: string;
  artifactFile: string;
  typechainInstance: string;
  typechainFactory: string;
}

export class ReactContext {
  private sourceFile: SourceFile;
  private args: any;
  private hre: HardhatRuntimeEnvironment;
  private contracts: Contract[];
  private reactComponent?: ReactComponent;
  constructor(
    sourceFile: SourceFile,
    args: any,
    bre: HardhatRuntimeEnvironment
  ) {
    this.hre = bre;
    this.args = args;
    this.sourceFile = sourceFile;
    this.contracts = [];
  }

  async generate() {
    const contracts = await this.get_contracts();
    this.contracts = contracts;
    this.header();
    this.imports();
    this.statements();
    this.interfaces();
    this.functions();
    this.sourceFile.formatText();
  }

  // TODO Move this to an extension of this class inside storage plugin
  async addStorage() {
    log("Running add storage");
    const contracts = await this.get_contracts();
    this.contracts = contracts;
  }

  private async get_contracts() {
    const currentNetwork = this.hre.network.name;

    const relativeDeploymentsPath = path.relative(
      this.hre.config.paths.react,
      this.hre.config.paths.deployments + "/" + currentNetwork
    );
    const relativeTypechainsPath = path.relative(
      this.hre.config.paths.react,
      this.hre.config.typechain.outDir
    );
    const relativeArtifactsPath = path.relative(
      this.hre.config.paths.react,
      this.hre.config.paths.artifacts
    );

    const deploymentFiles = readdirSync(
      this.hre.config.paths.deployments + "/" + currentNetwork
    );
    log("deploymentFiles => " + deploymentFiles.join(","));
    // TODO : Hardhat maybe rewrite later
    // const deploymentFiles = await this.hre.deployments.all();

    const artifactFiles = await this.hre.artifacts.getAllFullyQualifiedNames();
    log("artifactFiles => " + artifactFiles.join(","));

    const typechainFiles = readdirSync(this.hre.config.typechain.outDir);
    log("typechainFiles => " + typechainFiles.join(","));

    let contracts: Contract[] = [];
    await Promise.all(
      artifactFiles.map(async (artifactFile) => {
        // const artifactName = path.basename(artifactFile, ".json");
        // console.log("artifactName", artifactName);
        const artifactJson = await this.hre.artifacts.readArtifact(
          artifactFile
        );
        if (artifactJson.bytecode.length < 3) {
          // TODO handle interface contracts
          return;
        }

        const deploymentFile = deploymentFiles.find((deploymentFile) => {
          return (
            path.basename(deploymentFile, ".json") === artifactJson.contractName
          );
        });
        // TODO : Hardhat maybe rewrite later
        // const hasDeploymentFile = Object.prototype.hasOwnProperty.call(deploymentFiles, artifactName)
        // const deploymentFile = hasDeploymentFile ? deploymentFiles[artifactName] : undefined

        const typechainInstanceFile = typechainFiles.find((typechainFile) => {
          // Because typechain modifies name to other caseing we need to match on casing
          const hasInstanceFile =
            path.basename(typechainFile, ".d.ts").toLowerCase() ===
            artifactJson.contractName.toLowerCase();
          return hasInstanceFile;
        });

        const typechainFactoryFile = typechainFiles.find((typechainFile) => {
          // Because typechain modifies name to other caseing we need to match on casing
          const hasFactoryFile =
            path.basename(typechainFile, ".ts").toLowerCase() ===
            artifactJson.contractName.toLowerCase() + "factory";
          return hasFactoryFile;
        });

        if (!typechainInstanceFile || !typechainFactoryFile) {
          return;
          // throw Error("Could not find typechain file for " + artifactName);
        }

        contracts.push({
          name: artifactJson.contractName,
          typechainName: `${path.basename(typechainInstanceFile, ".d.ts")}`,
          deploymentFile: deploymentFile
            ? `${relativeDeploymentsPath}/${deploymentFile}`
            : undefined,
          artifactFile: `${relativeArtifactsPath}/${artifactJson.sourceName}`,
          typechainInstance: `${relativeTypechainsPath}/${typechainInstanceFile}`,
          typechainFactory: `${relativeTypechainsPath}/${typechainFactoryFile}`,
        });
      })
    );

    return contracts;
  }

  private header() {
    this.sourceFile.addStatements((writer) => {
      writer.write(
        `/* Autogenerated file. Do not edit manually. */
        /* tslint:disable */
        /* eslint-disable */`
      );
    });
  }
  private imports() {
    this.sourceFile.addImportDeclarations([
      {
        namedImports: ["providers", "Signer", "ethers"],
        moduleSpecifier: "ethers",
      },
      {
        namedImports: ["useEffect", "useState"],
        defaultImport: "React",
        moduleSpecifier: "react",
      },
      {
        namedImports: ["IProviderOptions"],
        defaultImport: "Web3Modal",
        moduleSpecifier: "web3modal",
      },
    ]);

    this.contracts.forEach((contract) => {
      if (contract.deploymentFile) {
        this.sourceFile.addImportDeclaration({
          defaultImport: `${contract.name}Deployment`,
          moduleSpecifier: "./" + contract.deploymentFile,
        });
      }
      this.sourceFile.addImportDeclarations([
        {
          namedImports: [`${contract.typechainName}`],
          moduleSpecifier:
            "./" + contract.typechainInstance.replace(".d.ts", ""),
        },
        {
          namedImports: [`${contract.typechainName}Factory`],
          moduleSpecifier: "./" + contract.typechainFactory.replace(".ts", ""),
        },
        // REVIEW : Maybe import artifact files
        // {
        //   namedImports: [`${contract.name}Artifact`],
        //   moduleSpecifier: contract.artifactFile
        // }
      ]);
    });
  }
  private statements() {
    this.sourceFile.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      isExported: true,
      declarations: [
        {
          name: "emptyContract",
          initializer: `{
            instance: undefined,
            factory: undefined
          }`,
        },
      ],
    });

    this.sourceFile.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      isExported: true,
      declarations: [
        {
          name: "defaultProvider",
          type: "providers.Provider",
          initializer: "ethers.providers.getDefaultProvider()",
        },
      ],
    });

    this.sourceFile.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      isExported: true,
      declarations: [
        {
          name: "ProviderContext",
          initializer:
            "React.createContext<[providers.Provider, React.Dispatch<React.SetStateAction<providers.Provider>>]>([defaultProvider, () => { }])",
        },
      ],
    });

    this.sourceFile.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      isExported: false,
      declarations: [
        {
          name: "defaultCurrentAddress",
          type: "string",
          initializer: `""`,
        },
      ],
    });

    this.sourceFile.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      isExported: true,
      declarations: [
        {
          name: "CurrentAddressContext",
          initializer:
            "React.createContext<[string, React.Dispatch<React.SetStateAction<string>>]>([defaultCurrentAddress, () => { }])",
        },
      ],
    });

    this.sourceFile.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      isExported: false,
      declarations: [
        {
          name: "defaultSigner",
          type: "Signer | undefined",
          initializer: "undefined",
        },
      ],
    });

    this.sourceFile.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      isExported: true,
      declarations: [
        {
          name: "SignerContext",
          initializer:
            "React.createContext<[Signer | undefined, React.Dispatch<React.SetStateAction<Signer | undefined>>]>([defaultSigner, () => { }])",
        },
      ],
    });

    this.contracts.forEach((contract) => {
      this.sourceFile.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        isExported: true,
        declarations: [
          {
            name: `${contract.name}Context`,
            initializer: `React.createContext<${this.contractInterfaceName(
              contract
            )}>(emptyContract)`,
          },
        ],
      });
    });
  }

  private interfaces() {
    this.sourceFile.addInterface({
      name: "HardhatSymfoniReactProps",
      isExported: true,
      properties: [],
    });
    this.contracts.forEach((contract) => {
      this.sourceFile.addInterface({
        name: this.contractInterfaceName(contract),
        isExported: true,
        properties: [
          {
            name: "instance",
            type: `${contract.typechainName}`,
            hasQuestionToken: contract.deploymentFile ? true : true, // REVIEW If we can instantiate provider before componentn is generate we can maybe remove this
          },
          {
            name: "factory",
            type: `${contract.typechainName}Factory`,
            hasQuestionToken: true,
          },
        ],
      });
    });
  }
  private functions() {
    this.sourceFile.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      isExported: true,
      declarations: [
        {
          name: "HardhatContext",
          type: "React.FC<HardhatSymfoniReactProps>",
          initializer: "(props) => {}",
        },
      ],
    });
    const hardhatContextComponent = this.sourceFile.getVariableDeclarationOrThrow(
      "HardhatContext"
    );
    const reactComponent = hardhatContextComponent.getInitializerIfKindOrThrow(
      SyntaxKind.ArrowFunction
    );

    this.reactComponent = new ReactComponent(reactComponent);
    // Start geneting react componen body
    this.reactComponent.insertUseState("[ready, setReady]", "useState(false)");
    this.reactComponent.insertUseState(
      "[messages, setMessages]",
      "useState<string[]>([])"
    );
    this.reactComponent.insertUseState(
      "[/* providerName */, setProviderName]",
      "useState<string>()"
    );
    this.reactComponent.insertUseState(
      "[signer, setSigner]",
      "useState<Signer | undefined>(defaultSigner)"
    );
    this.reactComponent.insertUseState(
      "[provider, setProvider]",
      "useState<providers.Provider>(defaultProvider)"
    );
    this.reactComponent.insertUseState(
      "[currentAddress, setCurrentAddress]",
      "useState<string>(defaultCurrentAddress)"
    );
    this.reactComponent.insertUseState(
      "getProvider",
      "async (): Promise<providers.Provider | undefined> => {}"
    );

    this.contracts.forEach((contract) => {
      this.reactComponent?.insertUseState(
        `[${contract.name}, set${contract.name}]`,
        `useState<${this.contractInterfaceName(contract)}>(emptyContract)`
      );
    });

    const getProvider = this.reactComponent.component.getVariableDeclarationOrThrow(
      "getProvider"
    );
    const getProviderFunction = getProvider.getInitializerIfKindOrThrow(
      SyntaxKind.ArrowFunction
    );

    const providerPriority = this.hre.config.react.providerPriority
      ? this.hre.config.react.providerPriority
      : ["web3modal"];

    this.reactComponent.insertUseState(
      "providerPriority",
      this.toArrayString(providerPriority)
    );

    getProviderFunction.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      declarations: [
        {
          name: "provider",
          initializer: (writer) => {
            writer.write(`await providerPriority.reduce(async (maybeProvider: Promise<providers.Provider | undefined>, providerIdentification) => {
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
                        default:
                            return Promise.resolve(undefined)
                    }
                }
            }, Promise.resolve(undefined)) // end reduce
            
            return provider`);
          },
        },
      ],
    });

    this.reactComponent.component.addVariableStatement({
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

    this.reactComponent.component.addStatements(
      `useEffect(() => {
        console.debug(messages.pop())
    }, [messages])`
    );

    this.reactComponent.component.addStatements((writer) => {
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
                let _signer;
                if (_providerName === "Web3Provider") {
                    const web3provider = _provider as ethers.providers.Web3Provider
                    _signer = await web3provider.getSigner()
                    console.debug("_signer", _signer)
                    if (subscribed && _signer) {
                        setSigner(_signer)
                        const address = await _signer.getAddress()
                        if (subscribed && address) {
                            console.debug("address", address)
                            setCurrentAddress(address)
                        }
                    }
                }
                `
      );

      this.contracts.forEach((contract) => {
        writer.writeLine(
          `set${contract.name}(get${contract.name}(_provider, _signer))`
        );
      });

      writer.write(
        `
        setReady(true)
            }
        };
        doAsync();
        return () => { subscribed = false }
      }, [])
    `
      );
    });

    this.contracts.forEach((contract) => {
      reactComponent.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: `get${contract.name}`,
            initializer:
              "(_provider: providers.Provider, _signer?: Signer ) => {}",
          },
        ],
      });

      const getContractName = reactComponent.getVariableDeclarationOrThrow(
        `get${contract.name}`
      );
      const getContractNameBody = getContractName.getInitializerIfKindOrThrow(
        SyntaxKind.ArrowFunction
      );
      getContractNameBody.addStatements((writer) => {
        // ${contract}
        if (contract.deploymentFile) {
          writer.write(`
            const contractAddress = ${contract.name}Deployment.receipt.contractAddress
            const instance = _signer ? ${contract.typechainName}Factory.connect(contractAddress, _signer) : ${contract.typechainName}Factory.connect(contractAddress, _provider)
          `);
        } else {
          writer.writeLine(`let instance = undefined`);
        }

        writer.write(
          `const contract: ${this.contractInterfaceName(contract)} = {
            instance: instance  ,
            factory: _signer ? new ${
              contract.typechainName
            }Factory(_signer) : undefined,
          } 
          return contract`
        );
      });
    }); // end this.contracts.foreach

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
      this.contracts.forEach((contract) => {
        writer.writeLine(
          `<${contract.name}Context.Provider value={${contract.name}}>`
        );
      });
    };
    const closeContext = (writer: CodeBlockWriter) => {
      this.contracts.reverse().forEach((contract) => {
        writer.writeLine(`</${contract.name}Context.Provider >`);
      });
    };

    // this.reactComponent.component.addStatements(writer => {
    //   writer.writeLine("return (<p></p>)");
    // });

    this.reactComponent.component.addStatements((writer) => {
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
  private toArrayString(arr: string[]) {
    return "[" + arr.map((i) => `"` + i + `"`).join(",") + "]";
  }
  private contractInterfaceName(contract: Contract) {
    return `Symfoni${contract.typechainName}`;
  }
}
