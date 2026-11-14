import { type OxlintConfig, defineConfig } from 'oxlint'
import { jwalker } from 'oxlint-config-jwalker'

const base = jwalker({ ignores: ['dist/**'] })

const config: OxlintConfig = defineConfig({
    ...base,
    rules: {
        ...base.rules,
        'import/no-unassigned-import': ['error', { allow: ['**/*.scss', '**/*.css'] }],
        'max-statements': 'off',
        'no-undefined': 'off',
    },
    overrides: [
        ...(base.overrides ?? []),
        {
            files: ['scripts/**/*.mjs'],
            rules: {
                'no-console': 'off',
            },
        },
        {
            files: ['tests/**/*.ts', 'lib-testing/**/*.ts'],
            rules: {
                'no-console': 'off',
                'typescript/ban-ts-comment': 'off',
                'typescript/no-unsafe-type-assertion': 'off',
                'unicorn/prefer-global-this': 'off',
            },
        },
        {
            files: ['**/*.d.ts'],
            rules: {
                'typescript/consistent-type-definitions': 'off',
                'unicorn/require-module-specifiers': 'off',
            },
        },
    ],
})

export default config
