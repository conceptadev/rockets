module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.eslint.json'],
  },
  plugins: [
    'import',
    'tsdoc',
  ],
  extends: [
    '@concepta/eslint-config/nest',
  ],
  ignorePatterns: [
    'packages/*/dist/**',
    '**/node_modules/**',
    '**/.eslintrc.js',
    '**/.eslintrc.spec.js',
    '**/tsconfig.json',
    '**/tsconfig.eslint.json',
    '**/commitlint.config.js',
    'website/*',
  ],
  settings: {
    jsdoc: {
      mode: 'typescript',
    },
  },
  rules: {
    'import/no-extraneous-dependencies': 'error',
    '@darraghor/nestjs-typed/param-decorator-name-matches-route-param': 'off',
    'tsdoc/syntax': 'warn',
  },
  overrides: [
    {
      files: ['*.json'],
      parser: 'jsonc-eslint-parser',
      parserOptions: {
        jsonSyntax: 'JSON',
      },
    },
    {
      files: ['*.spec.ts', '*.fixture.ts'],
      rules: {
        '@darraghor/nestjs-typed/controllers-should-supply-api-tags': 'off',
        '@darraghor/nestjs-typed/api-method-should-specify-api-response': 'off',
        'tsdoc/syntax': 'off',
      },
    },
  ],
};
