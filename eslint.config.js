import js from '@eslint/js'
import eslintImport from 'eslint-plugin-import'
import prettier from 'eslint-plugin-prettier'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import { globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config([
	globalIgnores(['dist']),
	{
		files: ['**/*.{ts,tsx}'],
		extends: [
			js.configs.recommended,
			tseslint.configs.recommended,
			reactHooks.configs['recommended-latest'],
			reactRefresh.configs.vite
		],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser
		},
		plugins: {
			'@typescript-eslint': tseslint.plugin,
			react,
			'simple-import-sort': simpleImportSort,
			prettier,
			import: eslintImport
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
			'prettier/prettier': 'warn',

			'@typescript-eslint/consistent-type-imports': 'error',

			'simple-import-sort/imports': [
				'error',
				{
					groups: [
						['^node:', '^\\w'],
						['^@?\\w'],
						['^@(/.*|$)'],
						['^\\.\\.'],
						['^\\.'],
						['^.+\\.s?css$']
					]
				}
			],

			'react/jsx-filename-extension': ['warn', { extensions: ['.ts', '.tsx'] }],
			'react/prop-types': 'off',
			'react/require-default-props': 'off',

			'no-param-reassign': [
				'error',
				{ props: true, ignorePropertyModificationsFor: ['state'] }
			],
			'import/no-extraneous-dependencies': 'off'
		}
	}
])
