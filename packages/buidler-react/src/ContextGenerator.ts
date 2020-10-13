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
  private outdir: string;
  constructor(outdir: string) {
    this.outdir = outdir;
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
    // this.project.addSourceFilesAtPaths(outdir + "/**/*{.d.ts,.ts,.tsx}");
    // this.project.addSourceFileAtPath(this.BUIDLER_CONTEXT_FILE_NAME);
    this.ensure_buidler_context_file();
    this.generate_buidler_context_file();
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

  private generate_buidler_context_file() {
    const buidler_context_file = this.project.getSourceFile(
      this.BUIDLER_CONTEXT_FILE_NAME
    );
    if (!buidler_context_file) {
      throw Error("No buidler context file");
    }
    const buidler_context_generator = new BuidlerContextGenerator(
      buidler_context_file
    );
  }

  emit_console() {
    this.project.save();
    const sourceFile = this.project.getSourceFile(
      this.BUIDLER_CONTEXT_FILE_NAME
    );
    if (!sourceFile) throw Error("No buidler context file");
    const emitOutput = sourceFile.getPreEmitDiagnostics();
    console.log(emitOutput);
  }
}
