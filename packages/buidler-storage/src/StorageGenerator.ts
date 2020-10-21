import { BuidlerRuntimeEnvironment } from "@nomiclabs/buidler/types";
import {
  Project,
  ScriptTarget,
  ModuleKind,
  ModuleResolutionKind,
} from "ts-morph";
import { JsxEmit } from "typescript";
import { BuidlerContextGenerator } from "@symfoni/buidler-react/dist/src/BuidlerContextGenerator";

export class StorageGenerator {
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
        jsx: JsxEmit.React,
      },
    });
    this.ensure_buidler_context_file();
  }

  private ensure_buidler_context_file() {
    this.project.addSourceFileAtPath(
      this.outdir + "/" + this.BUIDLER_CONTEXT_FILE_NAME
    );
  }

  async generate() {
    const buidler_context_file = this.project.getSourceFile(
      this.BUIDLER_CONTEXT_FILE_NAME
    );
    if (!buidler_context_file) {
      throw Error(
        "Buidler storage could not find a BuidlerContext.tsx file in your react output path."
      );
    }
    const buidler_context_generator = new BuidlerContextGenerator(
      buidler_context_file,
      this.args,
      this.bre
    );
    await buidler_context_generator.addStorage();
  }

  async save() {
    this.project.save();
    // const sourceFile = this.project.getSourceFile(
    //   this.BUIDLER_CONTEXT_FILE_NAME
    // );
    // if (!sourceFile) throw Error("No buidler context file");
    // const emitOutput = sourceFile.getPreEmitDiagnostics();
    // console.log(emitOutput);
    return true;
  }
}
