import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { compileString } from 'sass';
import ts from 'typescript';

for (const page of ['iphone-duo', 'iphone-duo-with-original-theme']) {
  test(`${page} examples compile against the installed release`, () => {
    const markdown = readFileSync(
      resolve(`projects/docs/src/ionic-theme-ios27/docs/ja/${page}.md`),
      'utf8',
    );
    // Keep temporary modules beside node_modules so package exports resolve normally.
    const directory = mkdtempSync(resolve('.iphone-duo-examples-'));
    try {
      let index = 0;
      for (const match of markdown.matchAll(/^```(ts|scss)\n([\s\S]*?)^```/gm)) {
        const [, language, code] = match;
        if (language === 'scss') {
          assert.doesNotThrow(() => compileString(code, { loadPaths: [resolve('node_modules')] }));
          continue;
        }
        const filename = join(directory, `${index++}.mts`);
        writeFileSync(filename, code);
        const program = ts.createProgram([filename], {
          target: ts.ScriptTarget.ES2022,
          module: ts.ModuleKind.NodeNext,
          moduleResolution: ts.ModuleResolutionKind.NodeNext,
          strict: true,
          noEmit: true,
          skipLibCheck: true,
          types: [],
        });
        const diagnostics = ts.getPreEmitDiagnostics(program);
        assert.equal(
          diagnostics.length,
          0,
          ts.formatDiagnosticsWithColorAndContext(diagnostics, {
            getCanonicalFileName: (name) => name,
            getCurrentDirectory: () => process.cwd(),
            getNewLine: () => '\n',
          }),
        );
      }
      assert.ok(index > 0, 'Expected TypeScript examples');
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
}
