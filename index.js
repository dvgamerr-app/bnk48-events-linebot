import express from 'express'
import consola from 'consola'
import { Nuxt, Builder } from 'nuxt'

import config from './nuxt.config.js'

const app = express()
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3001

// Import and Set Nuxt.js options
config.dev = !(process.env.NODE_ENV === 'production')

app.use('/bot', require('./api/linebot'))

const start = async () => {

  // Build only in dev mode
  if (!config.dev) {
    // Init Nuxt.js
    const nuxt = new Nuxt(config)

    // Give nuxt middleware to express
    app.use(nuxt.render)
  }

  // Listen the server
  app.listen(port, host)
  consola.ready({ message: `Server listening on http://${host}:${port}`, badge: true })
}
start()
