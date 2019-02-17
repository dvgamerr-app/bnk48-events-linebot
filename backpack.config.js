const { join } = require('path')

module.exports = {
  webpack: (config, options) => {
    config.entry.main = './index.js'
    config.output.path = join(process.cwd(), 'dist')
    if (options.env === 'production') {
      config.devtool = false
      config.plugins.splice(1, 1)
    }
    return config
  }
}
