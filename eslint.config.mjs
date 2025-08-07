import babelParser from '@babel/eslint-parser';
import globals from 'globals';
import path from 'path';
import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'url';

// Mimic CommonJS variables
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Create a FlatCompat instance
const compat = new FlatCompat({
  BaseDirectory: dirname,
});

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...compat.extends('eslint-config-airbnb-base'),
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
      },
      parser: babelParser,
      parserOptions: {
        allowImportExportEverywhere: true,
        requireConfigFile: false,
        sourceType: 'module',
      },
    },
    rules: {
      'import/extensions': ['error', { js: 'always' }], // Require js file extensions in imports
      'import/no-extraneous-dependencies': 'off', // Allow importing devDependencies
      'linebreak-style': ['error', 'unix'], // Enforce unix linebreaks
      'no-param-reassign': ['error', { props: false }], // Allow modifying properties of param
      'no-unused-vars': 'off', // Allow unused variables
    },
  },
  {
    ignores: [
      'eds/scripts/aem.js',
      'tools/importer/helix-importer-ui',
      'tools/importer/import.bundle.js',
    ],
  },
];
