import {
  Project,
  ScriptTarget,
  ModuleKind,
  ModuleResolutionKind,
  SourceFile
} from "ts-morph";
import { JsxEmit } from "typescript";

const CONTEXT_FILE_NAME = "BuidlerContext.tsx";

export class ContextGenerator {
  private project: Project;
  private sourceFiles: SourceFile[];
  constructor(outdir: string) {
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
        // outDir: outdir
      }
    });
    this.project.addSourceFilesAtPaths(outdir + "/**/*{.d.ts,.ts,.tsx}");
    this.sourceFiles = this.project.getSourceFiles();
    this.ensure_buidler_context_file();
  }
  private ensure_buidler_context_file() {
    const exist = this.sourceFiles.find(
      file => file.getBaseName() === CONTEXT_FILE_NAME
    );
    if (!exist) {
      const newFile = this.project.createSourceFile(CONTEXT_FILE_NAME);
      this.sourceFiles = [...this.sourceFiles, newFile];
    }
  }

  emit_console() {
    const result = this.project.emitToMemory();
    console.log("Start emit to console");

    // output the emitted files to the console
    for (const file of result.getFiles()) {
      console.log("----");
      console.log(file.filePath);
      console.log("----");
      console.log(file.text);
      console.log("\n");
    }
    this.project.save();
  }
}
