// @flow strict-local

import {Transformer} from '@parcel/plugin';
// $FlowFixMe
import typescript from 'typescript';

type TypescriptCompilerOptions = {
  module?: mixed,
  jsx?: mixed,
  noEmit?: boolean,
  sourceMap?: boolean
};

type TypescriptTranspilerOptions = {
  compilerOptions: TypescriptCompilerOptions,
  fileName: string
};

export default new Transformer({
  async getConfig({asset}) {
    return asset.getConfig(['tsconfig.json']);
  },

  async transform({asset, config}) {
    asset.type = 'js';

    // require typescript, installed locally in the app
    let transpilerOptions: TypescriptTranspilerOptions = {
      compilerOptions: {
        // Don't compile ES `import`s -- scope hoisting prefers them and they will
        // otherwise compiled to CJS via babel in the js transformer
        module: typescript.ModuleKind.ESNext,

        // React is the default. Users can override this by supplying their own tsconfig,
        // which many TypeScript users will already have for typechecking, etc.
        jsx: 'React'
      },
      fileName: asset.filePath // Should be relativePath?
    };

    // Overwrite default if config is found
    if (config) {
      transpilerOptions.compilerOptions = Object.assign(
        transpilerOptions.compilerOptions,
        config.compilerOptions
      );
    }
    transpilerOptions.compilerOptions.noEmit = false;
    // transpilerOptions.compilerOptions.sourceMap = options.sourceMaps;

    // Transpile Module using TypeScript
    let code = await asset.getCode();
    let transpiled = typescript.transpileModule(code, transpilerOptions);
    // let sourceMap = transpiled.sourceMapText;

    /*if (sourceMap) {
      sourceMap = JSON.parse(sourceMap);
      sourceMap.sources = [asset.relativeName];
      sourceMap.sourcesContent = [asset.code];

      // Remove the source map URL
      let content = transpiled.outputText;
      transpiled.outputText = content.substring(
        0,
        content.lastIndexOf('//# sourceMappingURL')
      );
    }*/

    return [
      {
        type: 'js',
        code: transpiled.outputText
        // map: sourceMap
      }
    ];
  }
});
