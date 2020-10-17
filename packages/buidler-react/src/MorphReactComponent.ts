import { ArrowFunction, VariableDeclarationKind } from "ts-morph";

export class MorphReactComponent {
  public component: ArrowFunction;
  constructor(component: ArrowFunction) {
    this.component = component;
  }

  insertUseState(name: string, initializer: string) {
    this.component.addVariableStatements([
      {
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name,
            initializer
          }
        ]
      }
    ]);
  }
}
