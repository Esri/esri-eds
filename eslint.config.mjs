import babelParser from '@babel/eslint-parser';
import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'url';
import globals from 'globals';
import path from 'path';

// Mimic CommonJS variables
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Create a FlatCompat instance
const compat = new FlatCompat({
  baseDirectory: dirname,
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
        sourceType: 'module',
        requireConfigFile: false,
      },
    },
    rules: {
      'import/extensions': ['error', { js: 'always' }], // require js file extensions in imports
      'import/no-extraneous-dependencies': 'off', // allow importing devDependencies
      'linebreak-style': ['error', 'unix'], // enforce unix linebreaks
      'no-param-reassign': [2, { props: false }], // allow modifying properties of param
    },
    ignores: [
      'helix-importer-ui',
      'tools/importer/import.bundle.js',
    ],
  },
];
