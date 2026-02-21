module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    project: ['./tsconfig.json'],
    sourceType: 'module'
  },
  rules: {
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        'checksVoidReturn': true
      }
    ]
  }
};
