const express = require('express')
const bodyParser = require('body-parser')
const router = express.Router()

const line = require('@line/bot-sdk')
const { touno, opensource } = require('@touno-io/db/mongo')

let client = null

// parse application/json
router.use(bodyParser.json())


const OtaUpdateOshi = async (BnkOta, newMember, source) => {
  let { groupId, roomId, type, userId } = source
  let myMember = await BnkOta.findOne({ roomId: (type === 'group' ? groupId :  type === 'room' ? roomId : userId) })

  if (!myMember) {
    let profile = await client.getProfile(userId)
    let member = {
      ...profile,
      roomId: type === 'group' ? groupId :  type === 'room' ? roomId : userId,
      roomType: type,
      oshi: newMember,
      updated: new Date(),
      created: new Date()
    }
    await new BnkOta(member).save()
    return newMember.length
  } else {
    
    await BnkOta.findOneAndUpdate(myMember._id, { oshi: [ ...new Set(myMember.oshi.concat(newMember)) ], updated: new Date() })
    return newMember.filter(a => myMember.oshi.indexOf(a) === -1).length
  }
}

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

    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        let { text } = event.message
        let oshi = /^-oshi\W(?<name>.*)/ig.exec(text)
        let hen = /^-hen\W(?<name>.*)/ig.exec(text)

        if (oshi) {
          let myOshi = []
          let newOshi = 0

          if (oshi.groups.name === 'all') {
            for (const member of await BnkMember.find({})) myOshi.push(member.id)
            newOshi = await OtaUpdateOshi(BnkOta, myOshi, event.source)
          } else {
            let names = [ ...new Set(oshi.groups.name.split(/\W/ig)) ]
            for (const name of names) {
              let member = await BnkMember.findOne({ $or: [ { nickname_th: name }, { nickname_en: name } ] })
              if (!member || !name) continue
              myOshi.push(member.id)
            }
            newOshi = await OtaUpdateOshi(BnkOta, myOshi, event.source)
          }

          let { groupId, roomId, type, userId } = event.source
          let myMember = await BnkOta.findOne({ roomId: (type === 'group' ? groupId :  type === 'room' ? roomId : userId) })

          let msg = `เมมเบอร์ ${myMember.oshi.length}${newOshi ? ` (+${newOshi})` : ''} คน.`
          await client.replyMessage(event.replyToken, { type: 'text', text: msg })
        } else if (hen) {
          let henOshi = 0
          let myOshi = []
          let { groupId, roomId, type, userId } = event.source
          
          let myMember = await BnkOta.findOne({ roomId: (type === 'group' ? groupId :  type === 'room' ? roomId : userId) })
          if (!myMember) continue

          if (hen.groups.name === 'all') {
            await BnkOta.findOneAndUpdate(myMember._id, { oshi: [], updated: new Date() })
          } else {
            let names = [ ...new Set(hen.groups.name.split(/\W/ig)) ]
            for (const name of names) {
              let member = await BnkMember.findOne({ $or: [ { nickname_th: name }, { nickname_en: name } ] })
              if (!member || !name) continue
              myOshi.push(member.id)
            }

            henOshi = myMember.oshi.filter(a => myOshi.indexOf(a) > -1).length
            myOshi = myMember.oshi.filter(a => myOshi.indexOf(a) === -1)

            await BnkOta.findOneAndUpdate(myMember._id, { oshi: myOshi, updated: new Date() })
          }

          let msg = `เมมเบอร์ ${myOshi.length}${henOshi ? ` (-${henOshi})` : ''} คน.`
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