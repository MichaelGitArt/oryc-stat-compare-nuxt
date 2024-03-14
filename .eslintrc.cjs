module.exports = {
  extends: [
    '@gitart/eslint-config-vue',
  ],

  ignorePatterns: [
    'typed-router.d.ts',
    '*.yml',
  ],

  rules: {
    'vue/component-name-in-template-casing': [
      'warn',
      'PascalCase',
      {
        registeredComponentsOnly: false,
        ignores: ['/^i18n-/', 'component'],
      },
    ],
  },
}
