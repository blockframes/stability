const dotEnvResult = require('dotenv').config()

const parsedVariables = dotEnvResult.parsed || {}
const dotEnvVariables = {}

// We always want to use the values from process.env, since dotenv
// has already resolved these correctly in case of overrides
for (const key of Object.keys(parsedVariables)) {
  dotEnvVariables[key] = process.env[key]
}

const withSass = require('@zeit/next-sass')

module.exports = (phase, { defaultConfig }) => {
  return withSass({
    experimental: {
      jsconfigPaths: true // https://github.com/zeit/next.js/pull/11293
    },
    env: {
      ...dotEnvVariables
    }
  })
}
