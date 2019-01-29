const moment = require('moment')

module.exports = member => {
  return {
    type: 'bubble',
    hero: {
      type: 'image',
      url: member.full,
      size: 'full',
      aspectRatio: '9:10',
      aspectMode: 'cover',
      action: {
        type: 'uri',
        uri: `https://www.bnk48.com/index.php?page=listMembers&memberId=${member.id}`
      }
    },
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: member.name_th,
          weight: 'bold',
          color: '#1DB446',
          size: 'sm'
        },
        {
          type: 'text',
          text: member.nickname_en.toUpperCase(),
          weight: 'bold',
          size: 'xxl',
          margin: 'md'
        },
        {
          type: 'text',
          text: member.hobby,
          size: 'xs',
          color: '#aaaaaa',
          wrap: true
        },
        {
          type: 'separator',
          margin: 'xxl'
        },
        {
          type: 'box',
          layout: 'vertical',
          margin: 'lg',
          spacing: 'sm',
          contents: [
            {
              type: 'box',
              layout: 'baseline',
              spacing: 'sm',
              contents: [
                {
                  type: 'text',
                  text: 'Birthday',
                  color: '#aaaaaa',
                  size: 'sm',
                  flex: 2
                },
                {
                  type: 'text',
                  text: moment(member.birthday).format('D MMMM YYYY'),
                  wrap: true,
                  color: '#666666',
                  size: 'sm',
                  flex: 4
                }
              ]
            },
            {
              type: 'box',
              layout: 'baseline',
              spacing: 'sm',
              contents: [
                {
                  type: 'text',
                  text: 'Height',
                  color: '#aaaaaa',
                  size: 'sm',
                  flex: 2
                },
                {
                  type: 'text',
                  text: member.height,
                  wrap: true,
                  size: 'sm',
                  color: '#666666',
                  flex: 3
                },
                {
                  type: 'text',
                  text: 'Blood',
                  color: '#aaaaaa',
                  size: 'sm',
                  flex: 2
                },
                {
                  type: 'text',
                  text: member.blood,
                  wrap: true,
                  color: '#666666',
                  size: 'sm',
                  flex: 3
                }
              ]
            },
            {
              type: 'box',
              layout: 'baseline',
              spacing: 'sm',
              contents: [
                {
                  type: 'text',
                  text: 'Like',
                  color: '#aaaaaa',
                  size: 'sm',
                  flex: 1
                },
                {
                  type: 'text',
                  text: member.like,
                  wrap: true,
                  color: '#666666',
                  size: 'sm',
                  flex: 4
                }
              ]
            }
          ]
        }
      ]
    }
  }
}
