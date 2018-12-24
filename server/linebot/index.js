const express = require('express')
const bodyParser = require('body-parser')
const router = express.Router()

const line = require('@line/bot-sdk')
const { touno, opensource } = require('@touno-io/db/mongo')

let client = null

// parse application/json
router.use(bodyParser.json())

router.post('/', async (req, res) => {
  let { events } = req.body
  if (!events || events.length === 0) return res.end()
  try {
    // create LINE SDK client
    if (!client) {
      const { LineBot } = await touno.open()
      const api = await LineBot.findOne({ endpoint: 'BNK_EVENT', active: true })
      if (!api) return res.end()

      client = new line.Client({
        channelAccessToken: api.token,
        channelSecret: api.secret
      })
    }
    const { BnkOta, BnkMember, BnkSchedule } = await opensource.open()

    // function for schedule


    // 

    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        let { groupId, type, userId } = event.source
        let { text } = event.message
        let oshi = /^-oshi\W(?<name>.*)/ig.exec(text)
        let hen = /^-hen\W(?<name>.*)/ig.exec(text)

        if (oshi) {
          let myOshi = []
          let names = [ ...new Set(oshi.groups.name.split(/\W/ig)) ]
          for (const name of names) {
            let member = await BnkMember.findOne({ $or: [ { nickname_th: name }, { nickname_en: name } ] })
            if (!member || !name) continue
            myOshi.push(member.id)
          }
          let myMember = await BnkOta.findOne({ roomId: (type === 'group' ? groupId :  type === 'room' ? roomId : userId) })
          let newOshi = myOshi.length
          if (!myMember) {
            let profile = await client.getProfile(userId)
            myMember = {
              ...profile,
              roomId: type === 'group' ? groupId :  type === 'room' ? roomId : userId,
              roomType: type,
              oshi: myOshi,
              updated: new Date(),
              created: new Date()
            }
          } else {
            newOshi = myOshi.filter(a => myMember.oshi.indexOf(a) === -1).length
            myOshi = [ ...new Set(myMember.oshi.concat(myOshi)) ]
            await BnkOta.updateOneById(myMember._id, { oshi: myOshi, updated: new Date() })
          }
          let msg = `เมมเบอร์ ${myOshi.length}${newOshi ? `*(+${newOshi})*` : ''} คน.`
          await client.replyMessage(event.replyToken, { type: 'text', text: msg })
        } else if (hen) {
          let myOshi = []
          let names = [ ...new Set(hen.groups.name.split(/\W/ig)) ]
          for (const name of names) {
            let member = await BnkMember.findOne({ $or: [ { nickname_th: name }, { nickname_en: name } ] })
            if (!member || !name) continue
            myOshi.push(member.id)
          }

          let myMember = await BnkOta.findOne({ roomId: (type === 'group' ? groupId :  type === 'room' ? roomId : userId) })
          if (!myMember) continue

          let henOshi = myMember.oshi.filter(a => myOshi.indexOf(a) > -1).length
          myOshi = myMember.oshi.filter(a => myOshi.indexOf(a) === -1)

          await BnkOta.updateOneById(myMember._id, { oshi: myOshi, updated: new Date() })

          let msg = `เมมเบอร์ ${myOshi.length}${henOshi ? `*(-${henOshi})*` : ''} คน.`
          await client.replyMessage(event.replyToken, { type: 'text', text: !myOshi.length ? 'ยกเลิกติดตามเมมเบอร์' : msg })
        }
      // } else {
      //   console.log('line-bot:', event)
      }
    }
  } catch (ex) {
    console.log('/bot', ex)
  }
  res.end()
})

module.exports = router