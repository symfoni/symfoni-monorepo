import { SourceFile, SyntaxKind, VariableDeclarationKind } from "ts-morph";
import { ArrowFunction } from "typescript";

export class BuidlerContextGenerator {
  private sourceFile: SourceFile;
  private buidlerContextComponent?: ArrowFunction;
  constructor(sourceFile: SourceFile) {
    this.sourceFile = sourceFile;
    this.buidlerContextComponent = undefined;
    this.imports();
    this.statements();
    this.interfaces();
    this.functions();
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
        declarations: []
      }
    ]);
    reactComponent.addVariableStatements([
      {
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: "const [signer, setSigner]",
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
