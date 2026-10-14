import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { mkdtempSync, realpathSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const require = createRequire(import.meta.url)
const tempRoot = realpathSync(tmpdir())
const output = mkdtempSync(path.join(tempRoot, 'sonar-tests-'))
try {
  execFileSync(process.execPath, [require.resolve('typescript/bin/tsc'),
    '--outDir', output, '--rootDir', 'src', '--module', 'commonjs',
    '--moduleResolution', 'node', '--target', 'ES2022', '--lib', 'ES2022,DOM',
    '--strict', '--skipLibCheck', 'src/lib/demoStorage.ts', 'src/lib/spotify.ts',
  ], { stdio: 'inherit' })
  execFileSync(process.execPath, ['--test', 'tests/phase1.test.cjs'], {
    stdio: 'inherit', env: { ...process.env, SONAR_TEST_BUILD: output },
  })
} catch (error) {
  process.exitCode = error.status || 1
} finally {
  // Only remove the temporary directory created by this invocation.
  if (path.dirname(realpathSync(output)) === tempRoot && path.basename(output).startsWith('sonar-tests-')) {
    rmSync(output, { recursive: true, force: true })
  }
}
