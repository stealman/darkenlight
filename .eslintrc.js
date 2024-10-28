module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  extends: [
    'plugin:vue/vue3-recommended', // Uses the recommended rules from @vue/eslint-config-typescript
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from @typescript-eslint
  ],
  parserOptions: {
    ecmaVersion: 2020, // Allows modern ECMAScript features
    sourceType: 'module', // Allows using imports
  },
  rules: {
    // Place to specify ESLint rules.
    // e.g. "@typescript-eslint/no-explicit-any": "warn",
  },
}
