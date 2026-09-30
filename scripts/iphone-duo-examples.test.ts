import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { compileString } from 'sass';
import ts from 'typescript';

for (const page of ['iphone-duo', 'iphone-duo-with-original-theme', 'vertical-bars']) {
  test(`${page} examples compile against the installed release`, () => {
    const markdown = readFileSync(
      resolve(`projects/docs/src/ionic-theme-ios27/docs/ja/${page}.md`),
      'utf8',
    );
    // Keep temporary modules beside node_modules so package exports resolve normally.
    const directory = mkdtempSync(resolve('.iphone-duo-examples-'));
    try {
      let index = 0;
      const examples: string[] = [];
      for (const match of markdown.matchAll(/^```(ts|scss)\n([\s\S]*?)^```/gm)) {
        const [, language, code] = match;
        if (language === 'scss') {
          assert.doesNotThrow(() => compileString(code, { loadPaths: [resolve('node_modules')] }));
          continue;
        }
        // Cleanup fences continue the immediately preceding setup example.
        if (code.startsWith('await listener.remove();')) {
          assert.ok(examples.length > 0, 'Cleanup must follow a setup example');
          examples[examples.length - 1] += code;
        } else if (!code.includes('import ') && code.includes('enableVerticalControlArea(')) {
          // Appearance alternatives reuse the entry-point import shown above.
          examples.push(
            "import { enableVerticalControlArea } from '@rdlabo/ionic-theme-ios27/vertical-bars';\n" +
              code,
          );
        } else {
          examples.push(code);
        }
      }
      for (const code of examples) {
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
