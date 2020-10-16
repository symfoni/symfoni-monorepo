import { BuidlerRuntimeEnvironment } from "@nomiclabs/buidler/types";
import {
  Expression,
  ExpressionStatement,
  SourceFile,
  SyntaxKind,
  VariableDeclarationKind,
  VariableStatement
} from "ts-morph";
import { ArrowFunction } from "typescript";
import path from "path";
import { readdirSync } from "fs-extra";
import { read } from "fs";

const contracts = [
  {
    name: "SimpleStorage",
    hasDeployment: true
  },
  {
    name: "Erc20",
    hasDeployment: false
  }
];

interface Contract {
  name: string;
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
    artifactFiles.forEach(artifactFile => {
      const artifactName = path.basename(artifactFile, ".json");

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
        deploymentFile: deploymentFile
          ? `${relativeDeploymentsPath}/${deploymentFile}`
          : undefined,
        artifactFile: `${relativeArtifactsPath}/${artifactFile}`,
        typechainInstance: `${relativeTypechainsPath}/${typechainInstanceFile}`,
        typechainFactory: `${relativeTypechainsPath}/${typechainFactoryFile}`
      });
    });

    return contracts;
  }

  private imports() {
    const importDeclaration = this.sourceFile.addImportDeclarations([
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
  }
  private statements() {
    const providerStatement = this.sourceFile.addVariableStatements([
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

    const currentAddressStatement = this.sourceFile.addVariableStatements([
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

    const defaultSignerStatement = this.sourceFile.addVariableStatements([
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
    const interfaceDeclaration = this.sourceFile.addInterface({
      name: "BuidlerSymfoniReactProps",
      isExported: true,
      properties: []
    });
  }
  private functions() {
    const functionDeclaration = this.sourceFile.addVariableStatement({
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
              const provider = await getProvider() // getProvider can actually return undefined, see issue https://github.com/microsoft/TypeScript/issues/11094
              if (subscribed && provider) {
                  setProvider(provider)
                  setProviderName(provider.constructor.name)
                  setMessages(old => [...old, "Useing provider: " + provider.constructor.name])
                  // Web3Provider
                  let signer;
                  if (provider.constructor.name === "Web3Provider") {
                      const web3provider = provider as ethers.providers.Web3Provider
                      signer = await web3provider.getSigner()
                      if (subscribed && signer) {
                          setSigner(signer)
                          const address = await signer.getAddress()
                          if (subscribed && address) {
                              setCurrentAddress(address)
                          }
                      }
                  }
                  `
      );

      contracts.forEach(contract => {
        writer.writeLine(`set${contract.name}(get${contract.name})`);
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

    contracts.forEach(contract => {
      reactComponent.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: `get${contract.name}`,

            initializer: "() => {}"
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
          `let contractAddress = null
          let instance = undefined
          `
        );
        // ${contract}
        if (contract.hasDeployment) {
          writer.write(`
          if (${contract.name}Deployment) {
            contractAddress = ${contract.name}Deployment.receipt.contractAddress
            instance = signer ? ${contract.name}Factory.connect(contractAddress, signer) : ${contract.name}Factory.connect(contractAddress, provider)
          }
          `);
        } else {
          writer.write(`const ${contract.name}Deployment = false`);
        }

        writer.write(
          `
          const contract: ${contract.name}Buidler = {
            storage: null,
            instance: instance,
            factory: signer ? new ${contract.name}Factory(signer) : undefined,
            hasSigner: signer ? true : false,
            hasInstance: ${contract.name}Deployment ? true : false
          }
  
          set${contract.name}(contract)
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
  toArrayString(arr: string[]) {
    return "[" + arr.map(i => `"` + i + `"`).join(",") + "]";
  }
}
