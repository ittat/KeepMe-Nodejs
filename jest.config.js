const aliases = require('module-alias-jest/register')

module.exports = {
  moduleNameMapper: aliases.jest,
  moduleFileExtensions: [
    "js",
    "jsx"
  ],
  moduleDirectories: [
    "node_modules",
    "bower_components",
    "shared"
  ]
}