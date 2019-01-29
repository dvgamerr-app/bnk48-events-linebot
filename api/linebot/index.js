const express = require('express')
const moment = require('moment')
const bodyParser = require('body-parser')
const router = express.Router()

const line = require('@line/bot-sdk')
const { debuger } = require('@touno-io/debuger')
const { touno, opensource } = require('@touno-io/db/mongo')

let client = null
let logger = debuger.scope('bnk48')
// parse application/json
router.use(bodyParser.json())


router.use('/', async (req, res, next) => {
  try {
    // create LINE SDK client
    if (!client) {
      await logger.log(`clients LINE API create...`)
      const { LineBot } = await touno.open()
      const api = await LineBot.findOne({ endpoint: 'BNK_EVENT', active: true })
      if (!api) return res.end()

      client = new line.Client({
        channelAccessToken: api.token,
        channelSecret: api.secret
      })
    }
    // checking connection mongodb. 
    await logger.log(`mongodb checking...`)
    await touno.open()
    await opensource.open()
    await logger.log(`mongodb connected.`)
  } catch (ex) {
    console.log('ERROR-Connection::', ex.message)
    console.log('STACK-Connection::', ex.stack)
  }
  next()
})

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

const handlerCommand = async (cmd, args, event) => {
  args = args.toLowerCase()
  let { source } = event
  let { groupId, roomId, type, userId } = source
  let sender = null
  let myOshi = []
  let myMember = []

  const { BnkMember, BnkOta, BnkSchedule } = await opensource.open()
  switch (cmd) {
    case 'oshi':
      myOshi = []
      let newOshi = 0

      if (args === 'all') {
        for (const member of await BnkMember.find({})) { myOshi.push(member.id) }

        newOshi = await OtaUpdateOshi(BnkOta, myOshi, source)
      } else {
        let names = [ ...new Set(args.split(/\W/ig)) ]
        for (const name of names) {
          let member = await BnkMember.findOne({ $or: [ { nickname_th: name }, { nickname_en: name } ] })
          if (!member || !name) continue
          myOshi.push(member.id)
        }
        newOshi = await OtaUpdateOshi(BnkOta, myOshi, source)
      }

      myMember = await BnkOta.findOne({ roomId: (type === 'group' ? groupId :  type === 'room' ? roomId : userId) })

      sender = { type: 'text', text: `-${cmd} ${args}\nเมมเบอร์ ${myMember.oshi.length}${newOshi ? ` (+${newOshi})` : ''} คน.` }
      break
    case 'hen':
      let henOshi = 0
      myOshi = []
      
      myMember = await BnkOta.findOne({ roomId: (type === 'group' ? groupId :  type === 'room' ? roomId : userId) })
      if (!myMember) break

      if (args === 'all') {
        await BnkOta.findOneAndUpdate(myMember._id, { oshi: [], updated: new Date() })
      } else {
        let names = [ ...new Set(args.split(/\W/ig)) ]
        for (const name of names) {
          let member = await BnkMember.findOne({ $or: [ { nickname_th: name }, { nickname_en: name } ] })
          if (!member || !name) break
          myOshi.push(member.id)
        }

        henOshi = myMember.oshi.filter(a => myOshi.indexOf(a) > -1).length
        myOshi = myMember.oshi.filter(a => myOshi.indexOf(a) === -1)

        await BnkOta.findOneAndUpdate(myMember._id, { oshi: myOshi, updated: new Date() })
      }

      sender = { type: 'text', text: `-${cmd} ${args}\n` + (!myOshi.length ? 'ยกเลิกติดตามเมมเบอร์' : `เมมเบอร์ ${myOshi.length}${henOshi ? ` (-${henOshi})` : ''} คน.`) }
      break
    case 'event':
      let mEvent = await BnkMember.findOne({ $or: [ { nickname_th: args }, { nickname_en: args } ] })
      if (!mEvent) break
      let event = await BnkSchedule.findOne({ $and: [ { oshi: { $in: [ mEvent.id ] } }, { 'date.from': { $gte: new Date() } } ] }, null, { sort: { 'date.from': 1 } })
      
      if (event) {
        sender = {
          type: 'flex',
          altText: `${mEvent.nickname_en.toUpperCase()} next event at ${moment(event.date.from).format('D MMMM YYYY')} ${event.time}.`,
          contents: require('./event')(mEvent, event)
        }
      } else {
        sender = {
          type: 'text',
          text: `${mEvent.nickname_en.toUpperCase()} no event.`
        }
      }
      break
    case 'member':
      let member = await BnkMember.findOne({ $or: [ { nickname_th: args }, { nickname_en: args } ] })
      if (!member) break

      sender = {
        type: 'flex',
        altText: `(${member.nickname_th}) ${member.name_th} - ${moment(member.birthday).format('D MMMM YYYY')}\nhttps://www.bnk48.com/index.php?page=listMembers&memberId=${member.id}`,
        contents: require('./member')(member)
      }
      break
    case 'help':
      sender = { type: 'text', text: `*Command List*
-oshi [member_name] เพิ่มเมมเบอร์เพื่อติดตาม
-hen [member_name] ลบเมมเบอร์ที่ติดตาม
-member [member_name] ดูข้อมูลส่วนตัวของเมมเบอร์
-event [member_name] ดึงข้อมูล event ล่าสุดของเมมมเบอร์นั้นๆ
-help ดูคำสั่งที่มีทั้งหมด` }
      break
  }
  if (sender && event.replyToken) await client.replyMessage(event.replyToken, sender)
}

const cmdLINEHandler = async (req, res) => {
  let { events } = req.body
  if (!events || events.length !== 1) return res.end()

  const cmds = [ 'oshi', 'hen', 'event', 'member', 'help' ]
  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      let { text } = event.message
      for (const cmd of cmds) {
        let command = new RegExp(`^-${cmd}(?<arg>\\W.*|)`, 'ig')
        let exec = command.exec(text)
        if (!exec) continue

        await logger.log(`${event.source.userId}::${cmd}...`)
        handlerCommand(cmd, exec.groups.arg.trim(), event).then(() => {
          return logger.log(`${event.source.userId}::${cmd} (0ms)`)
        }).catch(ex => {
          logger.error(ex)
        })
        break
      }
    }
  }
  res.end()
}

router.post('/', cmdLINEHandler)

module.exports = router
