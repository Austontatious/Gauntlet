const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const next = require('eslint-config-next');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const nextConfigs = next.map((config) => {
  if (!config.files) {
    return config;
  }

  return {
    ...config,
    files: config.files.map((pattern) => `apps/web/${pattern}`),
  };
});

module.exports = [
  {
    ignores: ['node_modules/**', 'dist/**', '.next/**', 'coverage/**', 'prisma/migrations/**'],
  },
  ...compat.extends('eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'),
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
  },
  ...nextConfigs,
];
