import process from 'node:process'
import { execFileSync } from 'node:child_process'

const expected = [
    'LICENSE',
    'README.md',
    'dist/timepicker.d.ts',
    'dist/timepicker.iife.js',
    'dist/timepicker.js',
    'package.json',
]

const report = JSON.parse(
    execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], { encoding: 'utf8' }),
)
const [pack] = Array.isArray(report) ? report : Object.values(report)
const actual = pack.files.map((file) => file.path).toSorted()

const missing = expected.filter((path) => !actual.includes(path))
const extra = actual.filter((path) => !expected.includes(path))

if (missing.length > 0 || extra.length > 0) {
    console.error(`Tarball contents differ. Missing: [${missing}]. Unexpected: [${extra}].`)
    process.exit(1)
}

console.log(`Tarball has the ${actual.length} expected files.`)
