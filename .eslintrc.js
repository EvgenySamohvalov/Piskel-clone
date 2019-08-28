module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: ['airbnb', 'prettier'],
  parserOptions: {
    ecmaVersion: 2018
  },
  rules: {
    'linebreak-style': 0,
    'no-useless-escape': 'off',
    'no-param-reassign': 'warn',
    'no-console': 'off',
    'class-methods-use-this': 'off',
    'no-use-before-define': ['error', { functions: false, classes: false }],
    quotes: 'off',
    code: 120,
    eqeqeq: 'off'
  }
};
