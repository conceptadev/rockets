module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.eslint.json'],
  },
  plugins: [
    'import',
    // 'jsdoc',
  ],
  extends: [
    '@concepta/eslint-config/nest',
    // 'plugin:jsdoc/recommended',
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
    // 'jsdoc/require-jsdoc': [
    //   'warn',
    //   {
    //     contexts: ['any', 'PropertyDefinition'],
    //     require: {
    //       ClassDeclaration: true,
    //       ClassExpression: true,
    //       MethodDefinition: true,
    //       FunctionDeclaration: true,
    //       FunctionExpression: true,
    //     },
    //   },
    // ],
    // 'jsdoc/require-description': ['warn', { contexts: ['any'] }],
    // 'jsdoc/require-property-description': ['warn', { contexts: ['any'] }],
    // 'jsdoc/require-param-type': 'off',
    // 'jsdoc/require-returns': 'off',
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
      },
    },
  ],
};
