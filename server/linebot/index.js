const express = require('express')
const bodyParser = require('body-parser')
const router = express.Router()
const line = require('@line/bot-sdk')


if (!process.env.CHANNEL_ACCESS_TOKEN || !process.env.CHANNEL_SECRET) {
  throw new Error('LINE API Token is undefined.')
}
// create LINE SDK client
const client = new line.Client({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
})

// parse application/json
router.use(bodyParser.json())

router.post('/', async (req, res) => {
  let { events } = req.body
  if (!events || events.length === 0) return res.end()
  try {
    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        let { userId } = event.source
        let { text } = event.message
        let oshi = /oshi\W(?<name>.*)/ig.exec(text)
        let hen = /hen\W(?<name>.*)/ig.exec(text)
        if (oshi) {
          let names = [ ...new Set(oshi.groups.name.split(/\W/ig)) ]

          let profile = await client.getProfile(userId)
          await client.replyMessage(event.replyToken, { type: 'text', text: `เพิ่มเมมเบอร์ ${names.length} คน` })
        } else if (hen) {
          let names = [ ...new Set(hen.groups.name.split(/\W/ig)) ]


          await client.replyMessage(event.replyToken, { type: 'text', text: `ลบเมมเบอร์ ${names.length} คน` })
        }
        console.log(event.timestamp, event.replyToken, text)
      } else {
        console.log('line-bot:', event)
      }
    }
  } catch (ex) {
    console.log('/bot', ex)
  }
  res.end()
})

module.exports = router