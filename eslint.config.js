import { common, jsonc, typescript } from 'eslint-config-jwalker'

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
    ...common,
    ...jsonc,
    ...typescript,
    { ignores: ['tsconfig.json'] },
    {
        rules: {
            'sort-imports': 'off',

            'import/extensions': 'off',

            '@typescript-eslint/no-non-null-assertion': 'off',

            'sonarjs/cognitive-complexity': 'off',
        },
    },
]
