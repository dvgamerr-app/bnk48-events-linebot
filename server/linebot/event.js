const moment = require('moment')

module.exports = (member, event) => {
  return {
    type: 'bubble',
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: `${member.nickname_en.toUpperCase()} ${event.type ? event.type : 'EVENT' } NEXT`,
          weight: 'bold',
          color: '#1DB446',
          size: 'sm'
        },
        {
          type: 'text',
          text: event.name,
          weight: 'bold',
          size: 'lg',
          color: '#999999',
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
                  text: 'Date',
                  color: '#aaaaaa',
                  size: 'sm',
                  flex: 1
                },
                {
                  type: 'text',
                  text: `${moment(event.date.from).format('D MMMM YYYY')} (${moment(event.date.from).fromNow()})`,
                  wrap: true,
                  size: 'sm',
                  color: '#666666',
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
                  text: 'Time',
                  color: '#aaaaaa',
                  size: 'sm',
                  flex: 1
                },
                {
                  type: 'text',
                  text: event.time,
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
                  text: 'Place',
                  color: '#aaaaaa',
                  size: 'sm',
                  flex: 1
                },
                {
                  type: 'text',
                  text: event.place || '-',
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
