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
      console.log(events)
      if (event.type === 'message' && event.message.type === 'text') {
        let { text } = event.message
        let oshi = /oshi\W(?<name>.*)/ig.exec(text)
        let hen = /hen\W(?<name>.*)/ig.exec(text)
        if (oshi) {
          let names = [ ...new Set(oshi.groups.name.split(/\W/ig)) ]
          console.log('oshi', names)
          await client.replyMessage(event.replyToken, { type: 'text', text: 'กำลังติดตาม ' + names.join(' ') })
        } else if (hen) {
          let names = [ ...new Set(hen.groups.name.split(/\W/ig)) ]
          console.log('hen', names)
          await client.replyMessage(event.replyToken, { type: 'text', text: 'ยกเลิกติดตาม ' + names.join(' ') })
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