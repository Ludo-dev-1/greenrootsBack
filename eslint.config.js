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
    indent: ["error", 2, 4, 8],
    "no-trailing-spaces": "error",
    "no-console": ["warn", { allow: ["warn", "error", "log"] }],
    "no-alert": "error",
  },
};
