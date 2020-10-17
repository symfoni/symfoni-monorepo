import { BuidlerRuntimeEnvironment } from "@nomiclabs/buidler/types";
import { SourceFile, SyntaxKind, VariableDeclarationKind } from "ts-morph";
import path from "path";
import { readdirSync } from "fs-extra";
import { readArtifact } from "@nomiclabs/buidler/plugins";

interface Contract {
  name: string;
  typechainName: string;
  deploymentFile?: string;
  artifactFile: string;
  typechainInstance: string;
  typechainFactory: string;
}

export class BuidlerContextGenerator {
  private sourceFile: SourceFile;
  private args: any;
  private bre: BuidlerRuntimeEnvironment;
  private contracts: Contract[];
  constructor(
    sourceFile: SourceFile,
    args: any,
    bre: BuidlerRuntimeEnvironment
  ) {
    this.bre = bre;
    this.args = args;
    this.sourceFile = sourceFile;
    this.contracts = [];
  }

  async generate() {
    const contracts = await this.get_contracts();
    this.contracts = contracts;
    console.log("contracts", contracts);
    this.imports();
    this.statements();
    this.interfaces();
    this.functions();
  }

  private async getArtifact(contractName: string) {
    let artifact;
    try {
      artifact = await readArtifact(
        this.bre.config.paths.artifacts,
        contractName
      );
    } catch (e) {
      try {
        artifact = await readArtifact(
          this.bre.config.paths.imports ||
            path.join(this.bre.config.paths.root, "imports"),
          contractName
        );
      } catch (ee) {
        throw e;
      }
    }
    return artifact;
  }

  private async get_contracts() {
    const currentNetwork = this.bre.buidlerArguments.network;
    if (!currentNetwork) {
      throw Error("Could not determine current network");
    }
    if (!this.bre.config.paths.deployments) {
      throw Error(
        "You need to configure 'deployments' in buidler config paths."
      );
    }
    if (!this.bre.config.paths.react) {
      throw Error("You need to configure 'react' in buidler config paths.");
    }

    if (!this.bre.config.typechain.outDir) {
      throw Error(
        "You need to configure the typechain output directory in buidler config."
      );
    }

    const relativeDeploymentsPath = path.relative(
      this.bre.config.paths.react,
      this.bre.config.paths.deployments + "/" + currentNetwork
    );
    const relativeTypechainsPath = path.relative(
      this.bre.config.paths.react,
      this.bre.config.typechain.outDir
    );
    const relativeArtifactsPath = path.relative(
      this.bre.config.paths.react,
      this.bre.config.paths.artifacts
    );

    const deploymentFiles = readdirSync(
      this.bre.config.paths.deployments + "/" + currentNetwork
    );

    const artifactFiles = readdirSync(this.bre.config.paths.artifacts);

    const typechainFiles = readdirSync(this.bre.config.typechain.outDir);
    // console.log("deploymentFiles", deploymentFiles);
    // console.log("artifactFiles", artifactFiles);
    // console.log("typechainFiles", typechainFiles);

    let contracts: Contract[] = [];
    await Promise.all(
      artifactFiles.map(async artifactFile => {
        const artifactName = path.basename(artifactFile, ".json");
        const artifactJson = await this.getArtifact(artifactName);
        if (artifactJson.bytecode.length < 3) {
          // TODO handle interface contracts
          return;
        }

        const deploymentFile = deploymentFiles.find(deploymentFile => {
          return path.basename(deploymentFile, ".json") === artifactName;
        });

        const typechainInstanceFile = typechainFiles.find(typechainFile => {
          // Because typechain modifies name to other caseing we need to match on casing
          const hasInstanceFile =
            path.basename(typechainFile, ".d.ts").toLowerCase() ===
            artifactName.toLowerCase();
          return hasInstanceFile;
        });

        const typechainFactoryFile = typechainFiles.find(typechainFile => {
          // Because typechain modifies name to other caseing we need to match on casing
          const hasFactoryFile =
            path.basename(typechainFile, ".ts").toLowerCase() ===
            artifactName.toLowerCase() + "factory";
          return hasFactoryFile;
        });

        if (!typechainInstanceFile || !typechainFactoryFile) {
          return;
          // throw Error("Could not find typechain file for " + artifactName);
        }

        contracts.push({
          name: artifactName,
          typechainName: `${path.basename(typechainInstanceFile, ".d.ts")}`,
          deploymentFile: deploymentFile
            ? `${relativeDeploymentsPath}/${deploymentFile}`
            : undefined,
          artifactFile: `${relativeArtifactsPath}/${artifactFile}`,
          typechainInstance: `${relativeTypechainsPath}/${typechainInstanceFile}`,
          typechainFactory: `${relativeTypechainsPath}/${typechainFactoryFile}`
        });
      })
    );

    return contracts;
  }

  private imports() {
    this.sourceFile.addImportDeclarations([
      {
        namedImports: ["providers", "Signer", "ethers"],
        moduleSpecifier: "ethers"
      },
      {
        namedImports: ["useEffect", "useState"],
        defaultImport: "React",
        moduleSpecifier: "react"
      },
      {
        namedImports: ["SpinnerCircular"],
        moduleSpecifier: "spinners-react"
      },
      {
        namedImports: ["IProviderOptions"],
        defaultImport: "Web3Modal",
        moduleSpecifier: "web3modal"
      }
    ]);

    this.contracts.forEach(contract => {
      if (contract.deploymentFile) {
        this.sourceFile.addImportDeclaration({
          defaultImport: `${contract.name}Deployment`,
          moduleSpecifier: "./" + contract.deploymentFile
        });
      }
      this.sourceFile.addImportDeclarations([
        {
          namedImports: [`${contract.typechainName}`],
          moduleSpecifier:
            "./" + contract.typechainInstance.replace(".d.ts", "")
        },
        {
          namedImports: [`${contract.typechainName}Factory`],
          moduleSpecifier: "./" + contract.typechainFactory.replace(".ts", "")
        }
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
          // type: "Contract",
          initializer: `{
            instance: undefined,
            factory: undefined
          }`
        }
      ]
    });
    this.sourceFile.addVariableStatements([
      {
        declarationKind: VariableDeclarationKind.Const,
        isExported: true,
        declarations: [
          {
            name: "defaultProvider",
            type: "providers.Provider",
            initializer: "ethers.providers.getDefaultProvider()"
          },
          {
            name: "ProviderContext",
            initializer:
              "React.createContext<[providers.Provider, React.Dispatch<React.SetStateAction<providers.Provider>>]>([defaultProvider, () => { }])"
          }
        ]
      }
    ]);

    this.sourceFile.addVariableStatements([
      {
        declarationKind: VariableDeclarationKind.Const,
        isExported: true,
        declarations: [
          {
            name: "defaultCurrentAddress",
            type: "string",
            initializer: `""`
          },
          {
            name: "CurrentAddressContext",
            initializer:
              "React.createContext<[string, React.Dispatch<React.SetStateAction<string>>]>([defaultCurrentAddress, () => { }])"
          }
        ]
      }
    ]);

    this.sourceFile.addVariableStatements([
      {
        declarationKind: VariableDeclarationKind.Const,
        isExported: true,
        declarations: [
          {
            name: "defaultSigner",
            type: "Signer | undefined",
            initializer: "undefined"
          },
          {
            name: "SignerContext",
            initializer:
              "React.createContext<[Signer | undefined, React.Dispatch<React.SetStateAction<Signer | undefined>>]>([defaultSigner, () => { }])"
          }
        ]
      }
    ]);
  }
  private interfaces() {
    this.sourceFile.addInterface({
      name: "BuidlerSymfoniReactProps",
      isExported: true,
      properties: []
    });
    this.contracts.forEach(contract => {
      this.sourceFile.addInterface({
        name: this.contractInterfaceName(contract),
        isExported: true,
        properties: [
          {
            name: "instance",
            type: `${contract.typechainName}`,
            hasQuestionToken: contract.deploymentFile ? false : true
          },
          {
            name: "factory",
            type: `${contract.typechainName}Factory`,
            hasQuestionToken: true
          }
        ]
      });
    });
  }
  private functions() {
    this.sourceFile.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      isExported: true,
      declarations: [
        {
          name: "BuidlerContext",
          type: "React.FC<BuidlerSymfoniReactProps>",
          initializer: "(props) => {}"
        }
      ]
    });
    const buidlerContextComponent = this.sourceFile.getVariableDeclarationOrThrow(
      "BuidlerContext"
    );
    const reactComponent = buidlerContextComponent.getInitializerIfKindOrThrow(
      SyntaxKind.ArrowFunction
    );

    // Start geneting react componen body
    reactComponent.addVariableStatements([
      {
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: "[ready, setReady]",
            initializer: "useState(false)"
          }
        ]
      }
    ]);

    reactComponent.addVariableStatements([
      {
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: "[messages, setMessages]",
            initializer: "useState<string[]>([])"
          }
        ]
      }
    ]);
    reactComponent.addVariableStatements([
      {
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: "[/* providerName */, setProviderName]",
            initializer: "useState<string>()"
          }
        ]
      }
    ]);

    reactComponent.addVariableStatements([
      {
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: "[signer, setSigner]",
            initializer: "useState<Signer | undefined>(defaultSigner)"
          }
        ]
      }
    ]);
    reactComponent.addVariableStatements([
      {
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: "[provider, setProvider]",
            initializer: "useState<providers.Provider>(defaultProvider)"
          }
        ]
      }
    ]);
    reactComponent.addVariableStatements([
      {
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: "[currentAddress, setCurrentAddress]",
            initializer: "useState<string>(defaultCurrentAddress)"
          }
        ]
      }
    ]);

    /* get Provider */
    reactComponent.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      declarations: [
        {
          name: "getProvider",
          initializer: "async (): Promise<providers.Provider | undefined> => {}"
        }
      ]
    });

    const getProvider = reactComponent.getVariableDeclarationOrThrow(
      "getProvider"
    );
    const getProviderFunction = getProvider.getInitializerIfKindOrThrow(
      SyntaxKind.ArrowFunction
    );

    const providerPriority = this.bre.config.react.providerPriority
      ? this.bre.config.react.providerPriority
      : ["web3modal"];

    getProviderFunction.addVariableStatements([
      {
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: "providerPriority",
            initializer: this.toArrayString(providerPriority)
          }
        ]
      }
    ]);

    getProviderFunction.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      declarations: [
        {
          name: "provider",
          initializer: writer => {
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
          }
        }
      ]
    });

    reactComponent.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      declarations: [
        {
          name: "getWeb3ModalProvider",
          initializer: writer => {
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
          }
        }
      ]
    });

    reactComponent.addStatements(
      `useEffect(() => {
        console.log(messages.pop())
    }, [messages])`
    );

    reactComponent.addStatements(writer => {
      writer.write(
        `useEffect(() => {
          let subscribed = true
          const doAsync = async () => {
              setMessages(old => [...old, "Initiating Buidler React"])
              const _provider = await getProvider() // getProvider can actually return undefined, see issue https://github.com/microsoft/TypeScript/issues/11094
              if (subscribed && _provider) {
                  setProvider(_provider)
                  setProviderName(_provider.constructor.name)
                  setMessages(old => [...old, "Useing provider: " + _provider.constructor.name])
                  // Web3Provider
                  let _signer;
                  if (_provider.constructor.name === "Web3Provider") {
                      const web3provider = _provider as ethers.providers.Web3Provider
                      _signer = await web3provider.getSigner()
                      console.log("signer", _signer)
                      if (subscribed && _signer) {
                          setSigner(_signer)
                          const address = await _signer.getAddress()
                          if (subscribed && address) {
                              setCurrentAddress(address)
                          }
                      }
                  }
                  `
      );

      this.contracts.forEach(contract => {
        writer.writeLine(`set${contract.name}(get${contract.name}(_signer))`);
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

    this.contracts.forEach(contract => {
      reactComponent.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: `get${contract.name}`,

            initializer: "(_signer?: Signer ) => {}"
          }
        ]
      });

      const getContractName = reactComponent.getVariableDeclarationOrThrow(
        `get${contract.name}`
      );
      const getContractNameBody = getContractName.getInitializerIfKindOrThrow(
        SyntaxKind.ArrowFunction
      );
      getContractNameBody.addStatements(writer => {
        writer.write(
          `
          let instance = undefined
          `
        );
        // ${contract}
        if (contract.deploymentFile) {
          writer.write(`
          if (${contract.name}Deployment) {
            contractAddress = ${contract.name}Deployment.receipt.contractAddress
            instance = _signer ? ${contract.typechainName}Factory.connect(contractAddress, _signer) : ${contract.typechainName}Factory.connect(contractAddress, provider)
          }
          `);
        } else {
          writer.write(`const ${contract.name}Deployment = false`);
        }

        writer.write(
          `
          const contract: ${this.contractInterfaceName(contract)} = {
            instance: instance,
            factory: _signer ? new ${
              contract.typechainName
            }Factory(_signer) : undefined,
          }
  
          return contract
        `
        );
      });
    });

    // const providerFunctionInsideGetProvider = getProviderFunction.getVariableDeclarationOrThrow(
    //   "provider"
    // );
    // const providerFunctionBody = providerFunctionInsideGetProvider.getInitializerIfKindOrThrow(
    //   SyntaxKind.ArrowFunction
    // );

    // Must be handled by contract later
    // reactComponent.addVariableStatements([
    //   {
    //     declarationKind: VariableDeclarationKind.Const,
    //     declarations: [
    //       // {
    //       //   name: "const [SimpleStorage, setSimpleStorage]",
    //       //   initializer: "useState<SimpleStorageBuidler>(SimpleStorageDefault);"
    //       // },
    //     ]
    //   }
    // ]);
  }
  private toArrayString(arr: string[]) {
    return "[" + arr.map(i => `"` + i + `"`).join(",") + "]";
  }

  private contractInterfaceName(contract: Contract) {
    return `Symfoni${contract.typechainName}`;
  }
}
