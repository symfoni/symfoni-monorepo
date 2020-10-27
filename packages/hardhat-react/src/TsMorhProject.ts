import {readdirSync} from "fs-extra";
import {HardhatRuntimeEnvironment} from "hardhat/types";
import path from "path";
import {
  Project,
  ScriptTarget,
  ModuleKind,
  ModuleResolutionKind,
} from "ts-morph";
import {JsxEmit} from "typescript";
import {ReactContext} from "./ReactContext";
import {debug} from "debug";
const log = debug("hardhat:plugin:react");

const TS_CONFIG = {
  target: ScriptTarget.ES5,
  lib: ["dom", "dom.iterable", "esnext"],
  allowJs: true,
  skipLibCheck: true,
  esModuleInterop: true,
  allowSyntheticDefaultImports: true,
  strict: true,
  forceConsistentCasingInFileNames: true,
  module: ModuleKind.ESNext,
  moduleResolution: ModuleResolutionKind.NodeJs,
  resolveJsonModule: true,
  isolatedModules: true,
  noEmit: true,
  jsx: JsxEmit.React,
};

export interface ContractContext {
  name: string;
  typechainName: string;
  deploymentFile?: string;
  artifactFile: string;
  typechainInstance: string;
  typechainFactory: string;
}

export const contractInterfaceName = (contract: ContractContext) => {
  return `Symfoni${contract.typechainName}`;
};

export class TsMorphProject {
  private readonly project: Project;
  private HARDHAT_CONTEXT_FILE_NAME: string;
  private readonly hre: HardhatRuntimeEnvironment;
  private readonly args: any;
  constructor(args: any, hre: HardhatRuntimeEnvironment) {
    this.hre = hre;
    this.args = args;
    this.HARDHAT_CONTEXT_FILE_NAME = "HardhatContext.tsx";
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
    this.project.save();
    if (this.args.verbose) {
      const sourceFile = this.project.getSourceFile(
        this.HARDHAT_CONTEXT_FILE_NAME
      );
      if (!sourceFile) throw Error("No Hardhat react context file");
      const emitOutput = sourceFile.getPreEmitDiagnostics();
      console.debug(emitOutput);
    }
    return true;
  }

  private async getContractContexts() {
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

    let contracts: ContractContext[] = [];
    await Promise.all(
      artifactFiles.map(async (artifactFile) => {
        const artifactJson = await this.hre.artifacts.readArtifact(
          artifactFile
        );
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
          // if we dont a typechain file, we cant create anything. So lets just return
          log(
            "Skipping " +
              artifactFile +
              " because we could not find a typechain file for it."
          );
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
        {overwrite: true}
      );
    }
  }
}
