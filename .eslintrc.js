module.exports = {
  root: true,
  env: { node: true, es2022: true },
  extends: ["eslint:recommended"],
  overrides: [
    {
      files: ["*.test.js"],
      env: { "jest/globals": true },
      plugins: ["jest"],
    }
  ]
};
