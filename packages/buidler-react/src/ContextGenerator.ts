import {
  Project,
  ScriptTarget,
  ModuleKind,
  ModuleResolutionKind,
  SourceFile
} from "ts-morph";
import { JsxEmit } from "typescript";

export class ContextGenerator {
  private project: Project;
  private file: SourceFile;
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
    this.file = this.project.createSourceFile(
      outdir + "/BuidlerContext.tsx",
      "// Start buidler context"
    );
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
