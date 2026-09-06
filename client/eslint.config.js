import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'dist-*']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      // Enables jsx-uses-vars, without which `no-unused-vars` cannot see that a
      // binding is consumed in JSX. Lowercase namespaces such as `motion` were
      // being reported as unused even though `<motion.div>` uses them.
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // `_`-prefixed bindings are the project's convention for "deliberately
      // unused" (unused args and ignored catch bindings included).
      'no-unused-vars': ['error', {
        varsIgnorePattern: '^[A-Z_]',
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      // `catch {}` is a legitimate "best effort, ignore failure" pattern here
      // (clipboard access, storage access, optional cleanup).
      'no-empty': ['error', { allowEmptyCatch: true }],
      // Context files intentionally export a provider plus its hook.
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // The project does not use prop-types; typing is out of scope here.
      'react/prop-types': 'off',
      // Apostrophes and quotes in copy are intentional and readable as-is.
      'react/no-unescaped-entities': 'off',
    },
  },
])
