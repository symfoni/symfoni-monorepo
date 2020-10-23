import { HardhatRuntimeEnvironment } from "hardhat/types";
import path from "path";
import {
  Project,
  ScriptTarget,
  ModuleKind,
  ModuleResolutionKind,
} from "ts-morph";
import { JsxEmit } from "typescript";
import { ReactContext } from "./ReactContext";

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
      // REVIEW : tsconfig can depend on frontend project
      compilerOptions: TS_CONFIG,
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
    const reactContext = new ReactContext(
      hardhat_context_file,
      this.args,
      this.hre
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
