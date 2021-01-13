import { readdirSync, removeSync } from "fs-extra";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import path from "path";
import {
  Project,
  ScriptTarget,
  ModuleKind,
  ModuleResolutionKind,
} from "ts-morph";
import { ReactContext } from "./ReactContext";
import { debug } from "debug";
import { JsxEmit } from "typescript";
const log = debug("hardhat:plugin:react");

const TS_CONFIG = {
  target: ScriptTarget.ES2018,
  lib: ["dom", "dom.iterable", "esnext"],
  allowJs: true,
  skipLibCheck: true,
  esModuleInterop: true,
  allowSyntheticDefaultImports: true,
  strict: true,
  forceConsistentCasingInFileNames: true,
  module: ModuleKind.CommonJS,
  moduleResolution: ModuleResolutionKind.NodeJs,
  resolveJsonModule: true,
  isolatedModules: true,
  noEmit: true,
  jsx: JsxEmit.React,
};

export interface ContractContext {
  name: string;
  typechainInstanceName: string;
  typechainFactoryName: string;
  deploymentFile?: string;
  artifactFile: string;
  typechainInstance: string;
  typechainFactory: string;
}

export const contractInterfaceName = (contract: ContractContext) => {
  return `Symfoni${contract.typechainInstanceName}`;
};

export class TsMorphProject {
  private readonly project: Project;
  private HARDHAT_CONTEXT_FILE_NAME: string;
  private readonly hre: HardhatRuntimeEnvironment;
  private readonly args: any;
  constructor(args: any, hre: HardhatRuntimeEnvironment) {
    this.hre = hre;
    this.args = args;
    this.HARDHAT_CONTEXT_FILE_NAME = "SymfoniContext.tsx";
    this.project = new Project({
      compilerOptions: TS_CONFIG, // REVIEW : tsconfig can depend on frontend project
    });
    this.ensure_hardhat_context_file();
  }

  async generate() {
    const hardhat_context_file = this.project.getSourceFile(
      this.HARDHAT_CONTEXT_FILE_NAME
    );
    if (!hardhat_context_file) {
      throw Error(
        "After it assured hardhat context file in contruction, it could not resolve hardhat context file in generate."
      );
    }
    const contractContexts = await this.getContractContexts();
    const reactContext = new ReactContext(
      hardhat_context_file,
      this.args,
      this.hre,
      contractContexts
    );
    return reactContext.generate();
  }

  async save() {
    // if (true) {
    //   log("Verbode mode, get ready for Diagnostics");
    //   const sourceFile = this.project.getSourceFile(
    //     this.HARDHAT_CONTEXT_FILE_NAME
    //   );
    //   if (!sourceFile) throw Error("No Hardhat react context file");
    //   const emitOutput = sourceFile.getPreEmitDiagnostics();
    //   log(emitOutput);
    // }
    this.project.saveSync();
    return true;
  }

  private async getContractContexts() {
    let currentNetwork = this.hre.network.name;
    // currentNetwork =
    //   currentNetwork === "hardhat" ? "localhost" : currentNetwork;
    log("Mapping deployments from " + currentNetwork + " to React context");

    const typechainFactoriesPath = path.resolve(
      this.hre.config.typechain.outDir,
      "factories"
    );
    const relativeDeploymentsPath = path.relative(
      this.hre.config.paths.react,
      path.resolve( this.hre.config.paths.deployments,currentNetwork )
    )
    
    const relativeTypechainsInstancePath = path.relative(
      this.hre.config.paths.react,
      this.hre.config.typechain.outDir
    );
    const relativeTypechainsFactoriesPath = path.relative(
      this.hre.config.paths.react,
      typechainFactoriesPath
    );
    const relativeArtifactsPath = path.relative(
      this.hre.config.paths.react,
      this.hre.config.paths.artifacts
    );

    let deploymentFiles: string[] = [];
    try {
      log(
        "Checking deploymentfiles in " +
          path.resolve(this.hre.config.paths.deployments, currentNetwork)
      );
      deploymentFiles = readdirSync(
        path.resolve(this.hre.config.paths.deployments, currentNetwork)
      );
      log("deploymentFiles => " + deploymentFiles.join(" | "));
    } catch (error) {
      log("No deployment folder or files found.");
    }
    // TODO : Hardhat maybe rewrite later
    // const deploymentFiles = await this.hre.deployments.all();
    const artifactFiles = await this.hre.artifacts.getAllFullyQualifiedNames();
    log("artifactFiles => " + artifactFiles.join(","));

    const typechainInstanceFiles = readdirSync(
      this.hre.config.typechain.outDir
    );
    // TODO : Create PR to typechain for optional index file or implciit / explicit generation.
    removeSync(path.resolve(this.hre.config.typechain.outDir, "index.ts"));
    const typechainFactoriesFiles = readdirSync(typechainFactoriesPath);
    log("typechainInstanceFiles => " + typechainInstanceFiles.join(" | "));
    log("typechainFactoriesFiles => " + typechainFactoriesFiles.join(" | "));

    let contracts: ContractContext[] = [];
    await Promise.all(
      artifactFiles.map(async (artifactFile) => {
        const artifactJson = await this.hre.artifacts.readArtifact(
          artifactFile
        );

        // Skip list
        if (this.hre.config.react.skip) {
          if (
            this.hre.config.react.skip.indexOf(artifactJson.contractName) !== -1
          ) {
            log("Skipping " + artifactFile + " because its in skip list.");
            return;
          }
        }
        // Skip list
        if (this.hre.config.react.handle) {
          if (
            this.hre.config.react.handle.indexOf(artifactJson.contractName) ===
            -1
          ) {
            log(
              "Skipping " + artifactFile + " because its NOT in handle list."
            );
            return;
          }
        }
        if (artifactJson.bytecode.length < 3) {
          // TODO handle interface contracts
          log(
            "Skipping " + artifactFile + " because we think its an interface."
          );
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

        const typechainInstanceFile = typechainInstanceFiles.find(
          (typechainFile) => {
            const hasInstanceFile =
              path.basename(typechainFile, ".d.ts") ===
              artifactJson.contractName;
            return hasInstanceFile;
          }
        );

        const typechainFactoryFile = typechainFactoriesFiles.find(
          (typechainFile) => {
            const hasFactoryFile =
              path.basename(typechainFile, ".ts") ===
              artifactJson.contractName + "__factory";
            return hasFactoryFile;
          }
        );

        if (!typechainInstanceFile) {
          // if we dont a typechain file, we cant create anything. So lets just return
          log("No typechain instance for " + artifactJson.contractName);
          return;
        }
        if (!typechainFactoryFile) {
          // if we dont a typechain file, we cant create anything. So lets just return
          log("No typechain factory for " + artifactJson.contractName);
          return;
        }

        log("Creating context for " + artifactJson.contractName);
        contracts.push({
          name: artifactJson.contractName,
          typechainInstanceName: `${path.basename(
            typechainInstanceFile,
            ".d.ts"
          )}`,
          typechainFactoryName: `${path.basename(typechainFactoryFile, ".ts")}`,
          deploymentFile: deploymentFile
            ? `${relativeDeploymentsPath}/${deploymentFile}`
            : undefined,
          artifactFile: `${relativeArtifactsPath}/${artifactJson.sourceName}`,
          typechainInstance: `${relativeTypechainsInstancePath}/${typechainInstanceFile}`,
          typechainFactory: `${relativeTypechainsFactoriesPath}/${typechainFactoryFile}`,
        });
      })
    );
    // Filter out possible duplicates
    contracts = contracts.filter((contract, i, arr) => {
      const duplicate =
        arr.slice(0, i).findIndex((otherContract) => {
          log(
            contract.typechainInstance +
              " === " +
              otherContract.typechainInstance
          );
          return (
            contract.typechainInstance === otherContract.typechainInstance ||
            contract.typechainFactory === otherContract.typechainFactory
          );
        }) !== -1;
      if (duplicate) {
        log(
          `Contract ${contract.name} is a duplicated. Removing the last instance of it from React context generation`
        );
      }
      return !duplicate;
    });
    log(
      contracts.length + " contracts has been set for react context generation"
    );
    log(contracts.map((c) => c.name).join(","));
    return contracts;
  }

  private ensure_hardhat_context_file() {
    const exist = this.project
      .getSourceFiles()
      .find((file) => file.getBaseName() === this.HARDHAT_CONTEXT_FILE_NAME);
    if (!exist) {
      const newFile = this.project.createSourceFile(
        path.resolve(
          this.hre.config.paths.react,
          this.HARDHAT_CONTEXT_FILE_NAME
        ),
        undefined,
        { overwrite: true }
      );
    }
  }
}
