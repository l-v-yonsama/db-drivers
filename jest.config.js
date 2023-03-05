/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // A map from regular expressions to paths to transformers
  transform: {
    '\\.jsx?$': 'babel-jest',
    '\\.tsx?$': 'ts-jest',
  },
  transformIgnorePatterns: ['/node_modules/(?!get-port)'],
  testPathIgnorePatterns: ['/__tests__/data', '/__tests__/setup'],
};
