export default {
  languageOptions: {
    globals: {
      process: "readonly", // Exemple pour Node.js
    },
    parserOptions: {
      ecmaVersion: 2021, // Utilise ECMAScript 2021
      sourceType: "module", // Si tu utilises des modules ES
    },
  },

  rules: {
    semi: ["error", "always"],
    eqeqeq: ["error", "always"],
    "no-unused-vars": ["warn"],
    quotes: ["error", "double"],
    camelcase: ["error", { properties: "always" }],
    "no-trailing-spaces": "error",
    indent: ["error", 2],
    "no-console": ["warn", { allow: ["warn", "error", "log"] }],
    "no-alert": "error",
  },
};
