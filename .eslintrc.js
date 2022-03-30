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
    '@typescript-eslint/eslint-plugin',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    // 'plugin:jsdoc/recommended',
  ],
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [
    'packages/*/dist/**',
    '**/node_modules/**',
    '**/.eslintrc.js',
    '**/.eslintrc.spec.js',
    '**/tsconfig.json',
    '**/tsconfig.eslint.json',
    '**/commitlint.config.js',
  ],
  rules: {
    'no-unused-vars': 'off',
    'import/no-extraneous-dependencies': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-empty-interface': 'off',
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
    'no-console': ['error', { allow: ['warn', 'error'] }],
  },
  settings: {
    jsdoc: {
      mode: 'typescript',
    },
  },
  overrides: [
    {
      files: ['*.json'],
      parser: 'jsonc-eslint-parser',
      parserOptions: {
        jsonSyntax: 'JSON',
      },
    },
  ],
};
