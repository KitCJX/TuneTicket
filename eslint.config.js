export default [
  {
    files: ['src/**/*.js', 'test/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        Audio: 'readonly',
        ClipboardItem: 'readonly',
        TextEncoder: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        btoa: 'readonly',
        crypto: 'readonly',
        console: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        history: 'readonly',
        navigator: 'readonly',
        requestAnimationFrame: 'readonly',
        sessionStorage: 'readonly',
        setTimeout: 'readonly',
        window: 'readonly'
      }
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  }
];
