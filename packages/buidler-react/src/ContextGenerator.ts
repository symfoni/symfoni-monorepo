import { BuidlerRuntimeEnvironment } from "@nomiclabs/buidler/types";
import {
  Project,
  ScriptTarget,
  ModuleKind,
  ModuleResolutionKind,
  SourceFile,
  ThisExpression
} from "ts-morph";
import { JsxEmit } from "typescript";
import { BuidlerContextGenerator } from "./BuidlerContextGenerator";

export class ContextGenerator {
  private project: Project;
  private BUIDLER_CONTEXT_FILE_NAME: string;
  private bre: BuidlerRuntimeEnvironment;
  private args: any;
  private outdir: string;
  constructor(args: any, bre: BuidlerRuntimeEnvironment) {
    this.bre = bre;
    this.args = args;
    // Check for needed config
    if (!this.bre.config.paths.react) {
      throw Error("You need to configure 'react' in buidler config paths.");
    }
    this.outdir = this.bre.config.paths.react;
    this.BUIDLER_CONTEXT_FILE_NAME = "BuidlerContext.tsx";
    this.project = new Project({
      // TODO : tsconfig can depend on frontend project
      compilerOptions: {
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
        jsx: JsxEmit.React
      }
    });
    this.ensure_buidler_context_file();
  }

  private ensure_buidler_context_file() {
    const exist = this.project
      .getSourceFiles()
      .find(file => file.getBaseName() === this.BUIDLER_CONTEXT_FILE_NAME);
    if (!exist) {
      const newFile = this.project.createSourceFile(
        this.outdir + "/" + this.BUIDLER_CONTEXT_FILE_NAME,
        undefined,
        { overwrite: true }
      );
    }
  }

  async generate() {
    const buidler_context_file = this.project.getSourceFile(
      this.BUIDLER_CONTEXT_FILE_NAME
    );
    if (!buidler_context_file) {
      throw Error("No buidler context file");
    }
    const buidler_context_generator = new BuidlerContextGenerator(
      buidler_context_file,
      this.args,
      this.bre
    );
    await buidler_context_generator.generate();
  }

  save() {
    this.project.save();
    console.log("Files saved to disk");
    const sourceFile = this.project.getSourceFile(
      this.BUIDLER_CONTEXT_FILE_NAME
    );
    if (!sourceFile) throw Error("No buidler context file");
    const emitOutput = sourceFile.getPreEmitDiagnostics();
    // console.log(emitOutput);
  }
}
