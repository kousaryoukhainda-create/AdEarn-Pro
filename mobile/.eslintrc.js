{
  "extends": "@react-native",
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "root": true,
  "rules": {
    "prettier/prettier": [
      "error",
      {
        "quoteProps": "consistent",
        "singleQuote": true,
        "tabWidth": 2,
        "trailingComma": "es5",
        "useTabs": false
      }
    ],
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-console": ["error", { "allow": ["warn", "error"] }]
  },
  "ignorePatterns": [
    "node_modules/",
    "android/",
    "ios/",
    "babel.config.js",
    "metro.config.js"
  ]
}
