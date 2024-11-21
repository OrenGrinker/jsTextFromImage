// src/index.js
const openai = require('./openai');
const azureOpenai = require('./azure_openai');
const claude = require('./claude');

module.exports = {
  openai,
  azureOpenai,
  claude,
};
