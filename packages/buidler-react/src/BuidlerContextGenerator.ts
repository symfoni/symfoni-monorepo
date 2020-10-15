import { BuidlerRuntimeEnvironment } from "@nomiclabs/buidler/types";
import { SourceFile, SyntaxKind, VariableDeclarationKind } from "ts-morph";
import { ArrowFunction } from "typescript";
import { readdirSync } from "fs-extra"
import { error } from "console";

const path = require('path'); 

export class BuidlerContextGenerator {
  private sourceFile: SourceFile;
  private buidlerContextComponent?: ArrowFunction;
  constructor(sourceFile: SourceFile) {
    this.sourceFile = sourceFile;
    this.buidlerContextComponent = undefined;
  }

  public async doGenerate(args: any, bre: BuidlerRuntimeEnvironment) {
    await this.imports(args, bre);
    this.statements();
    this.interfaces();
    this.functions();
  }

  private async imports(args: any, bre: BuidlerRuntimeEnvironment) {
    // importDeclaration
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
      },
    ]);

    // not deleted on special request
/*     const readArtifacts = () => {
      return new Promise<string[]>((resolve, reject) => {
        if (!bre.config.paths.artifacts) {
          return reject(
            "You need to configure artifacts in buidler config paths."
          )
        }
        const files = readdirSync(bre.config.paths.artifacts)
        return resolve(files)
      })
    }
    const artifactFiles: string[] = await readArtifacts().catch( err => {
      throw Error(err);
    }) */
    
    if (!bre.config.paths.deployments) {
      return error(
        "You need to configure 'deployments' in buidler config paths."
      )
    }
    if (!bre.config.paths.react) {
      return error(
        "You need to configure 'react' in buidler config paths."
      )
    }

    if (!bre.config.typechain.outDir) {
      return error(
        "You need to configure the typechain output directory in buidler config."
        )
    }

    const currentNetwork = bre.buidlerArguments.network;
    if (!currentNetwork) {
      return error("Could not determine current network")
    }

    const deployPath = "./" + path.relative(bre.config.paths.react, bre.config.paths.deployments) + "/" + currentNetwork
    const typechainPath = "./" + path.relative(bre.config.paths.react, bre.config.typechain.outDir) + "/"

    const readDeployments = () => {
      return new Promise<string[]>((resolve, reject) => {
        const files = readdirSync(
          bre.config.paths.deployments + "/" + currentNetwork
        );
        return resolve(files)
      })
    }
    const deploymentFiles: string[] = await readDeployments().catch( err => {
      throw Error(err);
    })
    
    for (const file of deploymentFiles) {
      const parts = file.split('.')
      const ext = parts.pop()
      if (ext == "json") {
        this.sourceFile.addImportDeclaration(
          {
            defaultImport: parts[0].concat("Deployment"),
            moduleSpecifier: deployPath + "/" + file
          },
        )
        this.sourceFile.addImportDeclaration(
          {
            namedImports: [parts[0]],
            moduleSpecifier: typechainPath + parts[0]
          },
        )
        this.sourceFile.addImportDeclaration(
          {
            namedImports: [parts[0].concat("Factory")],
            moduleSpecifier: typechainPath + parts[0].concat("Factory")
          },
        )
      }
    }
  }

  private statements() {
    // providerStatement
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

    // currentAddressStatement
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

    // defaultSignerStatement
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
    // interfaceDeclaration
    this.sourceFile.addInterface({
      name: "BuidlerSymfoniReactProps",
      isExported: true,
      properties: []
    });
  }
  private functions() {
    // functionDeclaration
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
    // Start generating react component body
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
}
